let back_btn = document.getElementById("back_btn");
let next_btn = document.getElementById("next_btn");
let unlock_btn = document.getElementById("unlock_btn");
let start_new_btn = document.getElementById("new_session_btn");

let nameGroupFormationInput = document.getElementById("name_group_formation");
let studentListInput = document.getElementById("student_list");
let topicsInput = document.getElementById("topics");
let blockedUL = document.getElementById("BlockedUL");
let BlockedInput = document.getElementById("BlockedInput");
let myInput = document.getElementById("myInput");
//let ULItems = blockedUL.getElementsByTagName("li");
//document.getElementById("BlockedUL").onclick=submitForm;





let nameArray = ["Adele","Agnes","Adrian","Adil","Andreas","Anders","Adomas","Billy","Bob","Calvin","Cim","Charlotete","Cello","Cimmy","Clara","Claire","Christina","Cindy"];


function createDynamicList(){   
    let dynalist = document.getElementById("MyDivUL")
    let dynalist2 = document.getElementById("MyDivBlockedUL")
    let dyn = document.createElement("ul")
    let dyn2 = document.createElement("ul")
    
    for (let i in nameArray)
    {
        let li = document.createElement('li')
        li.innerText = nameArray[i]
        li.className = "item"
        let li2 = document.createElement('li')
        li2.innerText = nameArray[i]
        li2.className = "item"
        dyn.appendChild(li)
        dyn2.appendChild(li2)
        
    }
    dyn.hidden = "hidden"
    dyn.id = "myUL" 
    dyn2.hidden = "hidden"
    dyn2.id = "BlockedUL"

    dynalist2.appendChild(dyn2)
    dynalist.appendChild(dyn)
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
    next_btn.addEventListener("click", function(e) {
        
        e.preventDefault();

        if(nameGroupFormationInput.value != "" && studentListInput.value != "" && topicsInput.value != "") {

            const formData = new FormData();
            formData.append("nameGroupFormationInput", nameGroupFormationInput.value);
            formData.append("studentListInput", studentListInput.files[0]);
            formData.append("topicsInput", topicsInput.files[0]);

            //formData.append("files", studentListInput.files[0]);
            //formData.append("files", topicsInput.files[0]);
            
            console.log(nameGroupFormationInput.value)
            for (var pair of formData.entries()) {
                console.log(pair[0]+ ', ' + pair[1]); 
            }

            fetch('./fileGroupUpload', {
                method: "POST",
                body: formData
            })
            .then((response) => response.json())
            .then((data) => {

                console.log(data);
                window.location.href='./coordinator_config';

            })
            .catch((err) => ("Error occured", err));
            
        } else {
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
        txtValue = li[i].textContent || li[i].innerText;
        console.log(txtValue)
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

if(window.location.pathname == "/coordinator_config"){
  
document.getElementById("proeveDiv").addEventListener("load",createDynamicList())

  document.getElementById("myUL").addEventListener("click", function(e) {
    if (e.target && e.target.matches("li")) {
      myInput.value = e.target.innerText; // new class name here
      //alert("clicked " + e.target.innerText);
    }

  });

document.getElementById("BlockedUL").addEventListener("click", function(e) {
    if (e.target && e.target.matches("li")) {
      BlockedInput.value = e.target.innerText; // new class name here
      //alert("clicked " + e.target.innerText);
    }
  });
  
}
