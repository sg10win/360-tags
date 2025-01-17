let up_array = ['Select', 'up_1', 'up_2', 'up_3', 'up_4', 'up_5'];
let sec_array = ['Select', 'sec_1', 'sec_2', 'sec_3', 'sec_4', 'sec_5'];
let sp_list = ['Select', 'sp_1', 'sp_2', 'sp_3', 'sp_4', 'sp_5'];

let counter = 0;
let tags = new Object();
let last_id


//TO RUN AT START
fillSelect();
fillSpSelect();

const addButton = document.getElementById("add-btn");
const uploadButton = document.getElementById('upload-btn');
addButton.addEventListener('click', add);
uploadButton.addEventListener('click', upload);



function editTime(id_1, id_2, id_3, id_4, percent, select){


    tags[counter.toString()] = 
    {
        'id_1': id_1,
        'id_2': id_2,
        'id_3': id_3, 
        'id_4': id_4,
        'percent': percent,
        'select': select
    };
    const flexdiv = document.getElementById("fixing-flex-div");
    flexdiv.innerHTML += `<article class='media content-section', id="a-x-${counter}">
    <div class='media-body'>
      <div class='article-metadata-side-boxes'>
            
                    <button class='x-btn' type='submit' value='${counter}' id="x-${counter}" onClick="deleteTag(this.id)" name='pressed_btn'>x</button>
            
            <a class='mr-2'>${ tags[counter]['id_1'] }</a>
            <small class='text-muted'>${ tags[counter]['id_2'] }  |  ${ tags[counter]['id_3'] } </small>
      </div>
      <h2 class='article-title'>${tags[counter]['select']} - ${tags[counter]['percent']} % </h2>
      <p class='article-content'>${tags[counter]['id_4']}</p>
    </div>
  </article>`
  console.log(tags);
  last_id = tags[counter]['id_1']
counter = counter+1;
     
};



function add(event){
    event.preventDefault();
    const inputId1 = document.getElementById('id_1')
    const inputId2 = document.getElementById('id_2')
    const inputId3 = document.getElementById('id_3')
    const inputId4 = document.getElementById('id_4')
    const percent = document.getElementById('percent')
    const select = document.getElementById('select')


    tags[counter.toString()] = 
    {
        'id_1': inputId1.value,
        'id_2': inputId2.value,
        'id_3': inputId3.value, 
        'id_4': inputId4.value,
        'percent': percent.value,
        'select': select.value
    };

    const flexdiv = document.getElementById("fixing-flex-div");
    flexdiv.innerHTML += `<article class='media content-section', id="a-x-${counter}">
    <div class='media-body'>
      <div class='article-metadata-side-boxes'>
            
                    <button class='x-btn' type='submit' value='${counter}' id="x-${counter}" onClick="deleteTag(this.id)" name='pressed_btn'>x</button>
            
            <a class='mr-2' href='#'>${ tags[counter]['id_4'] }</a>
            <small class='text-muted'>${ tags[counter]['percent'] }</small>
      </div>
      <h2 class='article-title'>${tags[counter]['select']} - ${tags[counter]['percent']} % </h2>
      <p class='article-content'>content...</p>
    </div>
  </article>`

    counter = counter + 1;
    console.log(tags);
}


function upload(event){
    event.preventDefault();
    //SEND TO FastAPI SERVER
    if (JSON.stringify(tags) == JSON.stringify(new Object())){
        tags = {'0':{
            'id_1': last_id,
            'id_2': '-',
            'id_3': '-', 
            'id_4': '-',
            'percent': '-',
            'select': '-'
        }
    }
}
    fetch("http://127.0.0.1:5000/tag"
    , {
        method: "POST",
        body: JSON.stringify(tags),
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        }
    })
    .then(response => response.json())

    .then(data => {
        console.log('success', data);
        if (data['data'] == 'saved' || data['data'] == 'replaced'||data['data'] == 'deleted'){
            const articls = document.getElementsByClassName('media content-section');
            while(articls[0]){
                articls[0].parentNode.removeChild(articls[0]);
            }
            //Resets the dict and counter
            tags = new Object();
            counter = 0;
            alert(data['info']);
        }else{
            console.log('unsaved');
            alert(data['info']);
        }
        window.location.href = "http://127.0.0.1:5000/home"
    })

        
    // .then(function(data){
    //     console.log(data)
    //     const articls = document.getElementsByClassName('media content-section');
    //     while(articls[0]){
    //         articls[0].parentNode.removeChild(articls[0])
    //     }

    // });
            //Resets the dict and counter
            // tags = new Object();
            // counter = 0;
    
    };

// this function activates 
function deleteTag (btnId){
    const xBtn = document.getElementById(btnId);
    const xBtnCoutnerValue = parseInt(xBtn.value);
    // Remove from the json
    last_id = tags[xBtnCoutnerValue]['id_1'];
    delete tags[xBtnCoutnerValue];
    // remove the elements
    const article = document.getElementById('a-'.concat(btnId));
    article.classList.add('fall');
    article.addEventListener('transitionend', function(){
        article.remove()
    });

}
function fillSpSelect(){
    const spSelect = document.getElementById('id_4');
    for (let i=0; i<sp_list.length; i++){
            var x = document.createElement("option");
            if (i==0){x.disabled=true;
                x.selected=true;
            }
            x.value = sp_list[i];
            x.text = sp_list[i];
            spSelect.appendChild(x);
        }
}

// makes some promblems... have to solve 
function upload_validation(){
    if (JSON.stringify(tags) == '{}'){
        return true;
    }
    for (var key in tags){
        var value = tags[key];
        var isId_1NotInt = isNaN(value['id_1']);
        var id_4 = value['id_4'];
        var select = value['select'];

        if ( isId_1NotInt ) {
            alert('Insert valid id_1');
            return false;
        }
        if ( id_4 == 'Select' || select == 'Select' ){
            alert('Insert valid select');
            return false;
        }
    }
    return true;
}


function myFunction() {
    var checkBox = document.getElementById("switch");
    var combobox = document.getElementById("select");

    while (combobox.firstChild) {
    combobox.removeChild(combobox.firstChild);
    }

    if (checkBox.checked == true){
        for (let i=0; i<sec_array.length; i++){
            var x = document.createElement("option");
            if (i==0){
                x.disabled=true;
                x.selected=true;
            }
            x.value = sec_array[i];
            x.text = sec_array[i];
            combobox.appendChild(x);
            }
        } else {
            for (let i=0; i<up_array.length; i++){
            var x = document.createElement("option");
            if (i==0){x.disabled=true;
                x.selected=true;
            }
            x.value = up_array[i];
            x.text = up_array[i];
            combobox.appendChild(x);
        }
    }
}

function fillSelect(){
    const combo = document.getElementById('select')
    for (let i=0; i<up_array.length; i++){
            const x = document.createElement("option");
            if (i==0){x.disabled=true;
                x.selected=true;
            }
            x.value = up_array[i];
            x.text = up_array[i];
            combo.appendChild(x);
        }
}

