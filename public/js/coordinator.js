let back_btn = document.getElementById("back_btn");
let save_btn = document.getElementById("save_btn");
let unlock_btn = document.getElementById("unlock_btn");
let start_new_btn = document.getElementById("new_session_btn")

if(back_btn){
back_btn.addEventListener("click", function(){

    window.location.href='/coordinator_start';

})
}

if(start_new_btn){
start_new_btn.addEventListener("click", function(){
    console.log('clickededded');
    window.location.href='/coordinator_preconfig';

})
}