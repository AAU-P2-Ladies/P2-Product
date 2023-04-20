let back_btn = document.getElementById("back_btn");let next_btn = document.getElementById("next_btn");
let unlock_btn = document.getElementById("unlock_btn");
let start_new_btn = document.getElementById("new_session_btn");

let nameGroupFormationInput = document.getElementById("name_group_formation");
let studentListInput = document.getElementById("student_list");
let topicsInput = document.getElementById("topics");
let y = document.getElementById("BlockedInput"); 
let blockedUL = document.getElementById("BlockedUL");
let ULItems = blockedUL.getElementsByTagName("li");
//document.getElementById("BlockedUL").onclick=submitForm;





let nameArray = ["Adele","Agnes","Adrian","Adil","Andreas","Anders","Adomas","Billy","Bob","Calvin","Cim","Charlotete","Cello","Cimmy","Clara","Claire","Christina","Cindy"];



for(let i of nameArray){
    document.createElement("li")
}

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


if(next_btn) {
    next_btn.addEventListener("click", function() {
        if(nameGroupFormationInput.value != "" && studentListInput.value != "" && topicsInput.value != "") {

 //           const formData = new FormData();
            //formData.append("nameGroupFormationInput", nameGroupFormationInput.value);
            //formData.append("studentListInput", studentListInput.files[0]);
            //formData.append("topicsInput", topicsInput.files[0]);

 //           formData.append("files", studentListInput.files[0]);
 //           formData.append("files", topicsInput.files[0]);

            /*
            console.log(nameGroupFormationInput.value)
            for (var pair of formData.entries()) {
                console.log(pair[0]+ ', ' + pair[1]); 
            }
            */
/*
            fetch('./fileGroupUpload', {
                method: "POST",
                body: formData,
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })
            .then((res) => console.log(res))
            .catch((err) => ("Error occured", err));
            window.location.href='/coordinator_config';
        } else {
            alert("Mandatory field not filled!")
        }*/
        window.location.href='/coordinator_config';
        }      
    })
}

if(start_new_btn){
    start_new_btn.addEventListener("click", function(){
        console.log('clickededded');
        window.location.href='/coordinator_preconfig';

    })
}


function SearchField(myInputID,myULID) {
    var input, filter, ul, li, a, i, txtValue;
        input = document.getElementById(myInputID); // Her @Skjodt
        filter = input.value.toUpperCase();
        ul = document.getElementById(myULID);
        li = ul.getElementsByTagName('li');
    if(window.event.keyCode=='13'){
        // Declare variables    
        
        ul.hidden = "";
        //Måske optimer koden, så den kun tager 'input' ind som parameter
        let count = 0;
        // Loop through all list items, and hide those who don't match the search query
        for (i = 0; li.length > i;i++) {
        a = li[i].getElementsByTagName("a")[0];
        txtValue = a.textContent || a.innerText;
        if ((txtValue.toUpperCase().indexOf(filter) > -1) && count < 10) {
            li[i].style.display = "";
            count++;
        } else {
            li[i].style.display = "none";
        }
        }
    } else if (input.value == "") {
        ul.hidden = "hidden";
    }
    
  }

  blockedUL.addEventListener('click', function(e) {   // 1.
    let items = blockedUL.getElementsByTagName("li");
    for (let i = 0; i < blockedUL.length; i++)
    {
       console
    }
    if(e.target.tagName === 'LI') {                                      // 2.
      selected= document.querySelector('li.selected');                   // 2a.
      if(selected) selected.className= '';                               // "
      e.target.className= 'selected';                                    // 2b.
    }
  });