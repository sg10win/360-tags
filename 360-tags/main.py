import uvicorn
from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import pandas as pd

app = FastAPI()

templates = Jinja2Templates(directory="templates/")

# origins = [
#     'file:///C:/Users/USER/PycharmProjects/fastapione/templates/green.html',
#     'http://localhost:63342/Flaskone/templates/green.html?_ijt=mpl1cn381hrgsqss2dn3vrjl7f',
#     'http://127.0.0.1:5000/tag'
# ]
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods = ['*'],
#     allow_headers= ['*']
# )


def to_cube_figure(df, path='externals/to_cube_figure.xlsx'):
    interface_output = df.copy()
    if len(interface_output) == 0:
        empty = pd.DataFrame(columns=['id_1', 'id_2', 'id_3', 'id_4', 'up', 'sub'])
        empty.to_excel(path, index=False)
        return empty
    interface_output['is_up'] = interface_output['select'].isin(up_list)
    interface_output['concat'] = interface_output['select'] + ' ' + interface_output['percent']
    after_concat = interface_output.groupby(['id_1', 'is_up'])['concat'].apply(
        lambda x: ', '.join(x)).to_frame().reset_index()
    interface_output.drop(['concat', 'percent', 'select'], axis=1, inplace=True)
    new_df = pd.merge(after_concat, interface_output, how='left', on=['id_1', 'is_up']).drop_duplicates(
        subset=['id_1', 'is_up'])
    up_df = new_df[new_df['is_up']][['id_1', 'concat']]
    sub_df = new_df[new_df['is_up'] == False][['id_1', 'concat']]
    with_split = pd.merge(up_df, sub_df, how='left', on='id_1').rename(columns={'concat_x': 'up', 'concat_y': 'sub'})
    to_export = pd.merge(with_split, new_df, how='left', on='id_1')[['id_1', 'id_2', 'id_3', 'id_4', 'up', 'sub']]\
        .drop_duplicates()
    to_export.to_excel(path, index=False)
    return to_export


app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/scripts", StaticFiles(directory="scripts"), name="scripts")

sp_list = ['sp_1', 'sp_2', 'sp_3', 'sp_4', 'sp_5']
sub_list = ['sub_1', 'sub_2', 'sub_3', 'sub_4', 'sub_5']
up_list = ['up_1', 'up_2', 'up_3', 'up_4', 'up_5']

db = pd.read_excel('externals/basic_tags.xlsx', dtype=str)
cube_configure_db = to_cube_figure(db)  # deletes the data and fills with the current "db" state (return df and export)

#  db = pd.DataFrame(columns=['id_1', 'id_2', 'id_3', 'id_4', 'percent', 'select'])

# some fake data
# db = pd.DataFrame({'id_1': ['1111','2222','3333','1111'],
#                    'id_2': ['12','asda2223sd','89372jk','t'],
#                    'id_3': ['ddd','ggg','89372jk','t'],
#                    'id_4': ['sp_1','sp_2','sp_3','sp_1'],
#                    'percent': ['10','20','30','40'],
#                    'select': ['up_1','sec_2','up_3','up_2']})


@app.get('/home')
@app.get('/')
async def home(request: Request):
    data = db[['id_1', 'id_4']].drop_duplicates()
    data_id_1 = list(data['id_1'].tolist())
    data_id_4 = list(data['id_4'].tolist())
    print(data)
    return templates.TemplateResponse('home.html', context={'request': request, 'data_id_1': data_id_1,
                                                            'data_id_4': data_id_4,
                                                            'length': len(data_id_1)})


@app.get('/tag')
async def tags(request: Request):
    return templates.TemplateResponse('green.html', context={'request': request})


@app.get('/tag{id_1}')
async def edit(id_1: int, request: Request):
    data = db[db['id_1'] == str(id_1)].drop_duplicates()
    data_id_1 = list(data['id_1'].tolist())
    data_id_2 = list(data['id_2'].tolist())
    data_id_3 = list(data['id_3'].tolist())
    data_id_4 = list(data['id_4'].tolist())
    data_percent = list(data['percent'].tolist())
    data_select = list(data['select'].tolist())
    return templates.TemplateResponse('green.html', context={'request': request,
                                                             'data_id_1': data_id_1,
                                                             'data_id_2': data_id_2,
                                                             'data_id_3': data_id_3,
                                                             'data_id_4': data_id_4,
                                                             'data_percent': data_percent,
                                                             'data_select': data_select,
                                                             'length': len(data_id_1) })


@app.post('/tag')
async def upload(posted_tags: dict, request: Request):
    out = save(posted_tags)
    return {'data': f'{out[1]}', 'info': f'{out[0]}'}


@app.get('/about')
def about():
    return {'data': 'about page'}


def save(data: dict):
    global db, cube_configure_db
    print('here -- >', data)
    try:

        if (data['0']['id_1'] in list(db['id_1'].tolist())) and (data['0']['id_4'] == '-'):
            db = db[db['id_1'] != data['0']['id_1']]
            db.to_excel('externals/basic_tags.xlsx', index=False)
            cube_configure_db = to_cube_figure(db)
            return f"item {data['0']['id_1']} deleted !", 'deleted'
        elif data['0']['id_1'] in list(db['id_1'].tolist()):
            df_of_data = pd.DataFrame.from_dict(data, orient="index")
            db = db[db['id_1'] != data['0']['id_1']]
            db = pd.concat([df_of_data, db])
            print(db)
            db.to_excel('externals/basic_tags.xlsx', index=False)
            cube_configure_db = to_cube_figure(db)
            return f"item {data['0']['id_1']} replaced !", 'replaced'
        else:
            try:
                df_of_data = pd.DataFrame.from_dict(data, orient="index")
                db = pd.concat([db, df_of_data])
                print(db)
                db.to_excel('externals/basic_tags.xlsx', index=False)
                cube_configure_db = to_cube_figure(db)
                return f'item {data["0"]["id_1"]} saved', 'saved'
            except:
                return f'item {data["0"]["id_1"]} unsaved', 'failed'
    except:
        return f'item unsaved', 'failed'


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=5000, log_level="info")