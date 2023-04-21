let back_btn = document.getElementById("back_btn");
let save_btn = document.getElementById("save_btn");
let unlock_btn = document.getElementById("unlock_btn");
let start_new_btn = document.getElementById("new_session_btn");
let stud_keycode_btn = document.getElementById("make_stud_login");
let submitClassbtn = document.getElementById("submit-class")
let amount = document.getElementById("student-amount")
let semester = document.getElementById("group-name")

if(back_btn){
back_btn.addEventListener('click', () => {

    window.location.href='./coordinator_start';

})
}

if(start_new_btn){
start_new_btn.addEventListener("click", () =>{
    console.log('clickededded');
    window.location.href='./coordinator_config';

})
}


const exampleModal = document.getElementById('exampleModal')
if(start_new_btn){
exampleModal.addEventListener('show.bs.modal', event => {
    // Button that triggered the modal
    const button = event.relatedTarget

    // Update the modal's content.
    const modalTitle = exampleModal.querySelector('.modal-title')
    const modalBodyInput = exampleModal.querySelector('.modal-body input')
})
}
if(start_new_btn){
submitClassbtn.addEventListener('click', (e)=>{

    e.preventDefault();

    fetch('/coordinator_studentId').catch((err) => {console.error(err);})

});
}