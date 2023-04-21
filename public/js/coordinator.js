let back_btn = document.getElementById("back_btn");
let save_btn = document.getElementById("save_btn");
let unlock_btn = document.getElementById("unlock_btn");
let start_new_btn = document.getElementById("new_session_btn");
let stud_keycode_btn = document.getElementById("make_stud_login");
let submitClassbtn = document.getElementById("submit-class")
let amount = document.getElementById("student-amount")
let semester = document.getElementById("group-name")


back_btn.addEventListener("click", () => {

    window.location.href='./coordinator_start';

})


start_new_btn.addEventListener("click", () =>{
    console.log('clickededded');
    window.location.href='./coordinator_config';

})



const exampleModal = document.getElementById('exampleModal')

exampleModal.addEventListener('show.bs.modal', event => {
    // Button that triggered the modal
    const button = event.relatedTarget

    // Update the modal's content.
    const modalTitle = exampleModal.querySelector('.modal-title')
    const modalBodyInput = exampleModal.querySelector('.modal-body input')
})

submitClassbtn.addEventListener('click', (e)=>{

    e.preventDefault();

    fetch('/coordinator_studentId').catch((err) => {console.error(err);})

});