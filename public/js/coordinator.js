let back_btn = document.getElementById("back_btn");
let next_btn = document.getElementById("next_btn");
let unlock_btn = document.getElementById("unlock_btn");
let start_new_btn = document.getElementById("new_session_btn");

let nameGroupFormationInput = document.getElementById("name_group_formation");
let studentListInput = document.getElementById("student_list");
let topicsInput = document.getElementById("topics");

if(back_btn){
    back_btn.addEventListener("click", function(){

        window.history.back(); 

    })
}

if(studentListInput){
    studentListInput.addEventListener("change", function(){
        FileExtension = studentListInput.value.split(".")
        if(FileExtension[1] != "json"){
            alert("Not Json!")
            studentListInput.value = ""
        }
    })
}   


if(next_btn){
    next_btn.addEventListener("click", function(){
        if(nameGroupFormationInput.value != "" && studentListInput.value != "" && topicsInput.value != ""){
            window.location.href='/coordinator_config';
        }
        else{
            alert("Mandatory field not filled!")
        }      
    })
}

if(start_new_btn){
    start_new_btn.addEventListener("click", function(){
        console.log('clickededded');
        window.location.href='/coordinator_preconfig';

    })
}