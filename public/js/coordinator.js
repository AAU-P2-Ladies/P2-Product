let back_btn = document.getElementById("back_btn");
let next_btn = document.getElementById("next_btn");
let unlock_btn = document.getElementById("unlock_btn");
let start_new_btn = document.getElementById("new_session_btn");
let save_btn = document.getElementById("save_btn");

let nameGroupFormationInput = document.getElementById("name_group_formation");
let studentListInput = document.getElementById("student_list");
let topicsInput = document.getElementById("topics");
let blockedUL = document.getElementById("BlockedUL");

let AmountOfGroupMembers = document.getElementById("amountOfGroupMembers");
let AmountOfStudentPreferences = document.getElementById("studentPreferences");
//let BlockedInput = document.getElementById("BlockedInput");
//let myInput = document.getElementById("myInput");
//let ULItems = blockedUL.getElementsByTagName("li");
//document.getElementById("BlockedUL").onclick=submitForm;



// nameArray = ["Adele Adele Adle","Agnes","Adrian","Adil","Andreas","Anders","Adomas","Billy","Bob","Calvin","Cim","Charlotete","Cello","Cimmy","Clara","Claire","Christina","Cindy"];
//let blocked1 = [["Nadia","Tania"],["Tina","Thomas"],["Adomas","Trine"],["Simon","Tobias"],["Carmen","Daniel"],["Jonas","Nicolaj"],["Cathrine","Kamilla"],["Simon","Allan"],["Andreas","Adomas"],["Sina","Merete"]];
let blocked = [];


function createDynamicList(input) {

    fetch('/../search', {
        method: "POST",
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            className: window.location.pathname.split('/')[1],
            name: input.value
        }),
    })
    .then((response) => response.json())
    .then((data) => {

        let nameArray = data.students;

        if (input.id == 'myInput') {

            let dynalist = document.getElementById("MyDivUL");

            if (dynalist.getElementsByTagName('ul')[0]) {

                dynalist.getElementsByTagName('ul')[0].remove();

            }

            if (input.value != "") {

                let dyn = createElement('ul', { id: 'myUL' });

                for (let i in nameArray) {

                    let li = createElement('li', { class: 'item', innerText: nameArray[i] });

                    dyn.appendChild(li);

                }

                dynalist.appendChild(dyn);

                document.getElementById("myUL").addEventListener("click", function (e) {
                    if (e.target && e.target.matches("li")) {
                        document.getElementById("myInput").value = e.target.innerText; // new class name here
                        document.getElementById("myInput").setAttribute("Placeholder", "Selected")
                        //alert("clicked " + e.target.innerText);
                    }

                });
                
            }

        } else if (input.id == 'BlockedInput') {

            let dynalist2 = document.getElementById("MyDivBlockedUL");

            if (dynalist2.getElementsByTagName('ul')[0]) {

                dynalist2.getElementsByTagName('ul')[0].remove();

            }

            if (input.value != "") {

                let dyn2 = createElement('ul', { id: 'BlockedUL' });

                for (let i in nameArray) {

                    let li2 = createElement('li', { class: 'item', innerText: nameArray[i] });

                    dyn2.appendChild(li2);

                }

                dynalist2.appendChild(dyn2);

                document.getElementById("BlockedUL").addEventListener("click", function (e) {
                    if (e.target && e.target.matches("li")) {
                        document.getElementById("BlockedInput").value = e.target.innerText; // new class name here
                        document.getElementById("BlockedInput").setAttribute("Placeholder", "Selected")
                        //alert("clicked " + e.target.innerText);
                    }
                });

            }

        }
        
    });

}


if (back_btn) {
    back_btn.addEventListener("click", function () {

        window.history.back();

    })
}

if (studentListInput) {
    studentListInput.addEventListener("change", function () {
        FileExtension = studentListInput.value.split(".")
        if (FileExtension[1] != "json") {
            alert("Not Json!")
            studentListInput.value = ""
        }
    })
}


if (next_btn) {
    next_btn.addEventListener("click", function (e) {

        e.preventDefault();

        if (nameGroupFormationInput.value != "" && studentListInput.value != "" && topicsInput.value != "") {

            const formData = new FormData();
            formData.append("nameGroupFormationInput", nameGroupFormationInput.value);
            formData.append("studentListInput", studentListInput.files[0]);
            formData.append("topicsInput", topicsInput.files[0]);

            fetch('./fileGroupUpload', {
                method: "POST",
                body: formData
            })
            .then((response) => response.json())
            .then((data) => {

                if (data.error && !data.groupFormationName) {

                    alert('The inputted group formation name already exists!');

                } else if (data.error && !data.studentList) {

                    alert('The uploaded student list is not a valid JSON-file!');

                } else if (data.error && !data.topicsList) {

                    alert('The uploaded topics list is not a valid JSON-file!');

                } else if (data.error && !data.studentListJSON) {

                    alert('The student list is not the right format!');

                } else if (data.error && !data.topicsListJSON) {

                    alert('The topics list is not the right format!');

                } else {

                    window.location.href = `./${nameGroupFormationInput.value}/coordinator_config/`;

                }

            })
            .catch((err) => ("Error occured", err));

        } else {

            alert("Mandatory field(s) not filled!")

        }
    })
}

if (start_new_btn) {
    start_new_btn.addEventListener("click", function () {
        console.log('clickededded');
        window.location.href = '/coordinator_preconfig';

    })
}


function SearchField(myInputID, myULID) {
    let input, filter, ul, li, a, i, txtValue;
    input = document.getElementById(myInputID); // Her @Skjodt
    filter = input.value.toUpperCase();
    ul = document.getElementById(myULID);
    li = ul.getElementsByTagName('li');
    // Declare variables    
    input.setAttribute("Placeholder", "Search for names..")
    ul.hidden = "";
    //Måske optimer koden, så den kun tager 'input' ind som parameter
    let count = 0;
    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; li.length > i; i++) {
        txtValue = li[i].textContent || li[i].innerText;
        console.log(txtValue)
        if ((txtValue.toUpperCase().indexOf(filter) > -1) && count < 10) {
            li[i].style.display = "";
            count++;
        } else {
            li[i].style.display = "none";
        }
    }
    if (input.value == "") {
        ul.hidden = "hidden";
    }

}

if ((window.location.pathname).includes("coordinator_config")) {

    document.querySelectorAll("#myInput, #BlockedInput").forEach(function (element) {

        element.addEventListener("input", function () {

            createDynamicList(this);

        });

    });
    /*
        if(document.getElementById("myInput").innerHTML != "")
        {
        document.getElementById("proeveDiv").addEventListener("load",createDynamicList());
        //document.getElementById("TableDivId").addEventListener("load",createDynamicList2());
        }
      */

}

/*
function addPrefFunction(e){
    e.preventDefault();
  
    console.log("bib");
    modal.style.display = "block";


    onclick="myFunction(event)"
}

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}*/
function BlockedList(StudentA, StudentB) {
    let blockedPair = [];
    blockedPair = new Array(2);
    blockedPair[0] = document.getElementById(StudentA).value;
    blockedPair[1] = document.getElementById(StudentB).value;
    console.log(document.getElementById(StudentA).ariaPlaceholder)

    if (document.getElementById(StudentA).placeholder != "Selected" || document.getElementById(StudentB).placeholder != "Selected") {
        return (alert("You have to choose 2 Students!"))
    }

    if (blockedPair[0] == blockedPair[1]) {
        return (alert("You cannot block the same student"))
    }

    for (let i = 0; blocked.length > i; i++) {
        if (blockedPair[0] == blocked[i][0] || blockedPair[0] == blocked[i][1]) {
            if (blockedPair[1] == blocked[i][0] || blockedPair[1] == blocked[i][1]) {
                return (alert("Pair already exists"))
            }
        }
    }







    blocked.push(blockedPair)
    createDynamicList2(blockedPair)
}

function createDynamicList2(blockedArray) {
    let table = document.getElementById('MyBlockedTable').getElementsByTagName('tbody')[0]

    /*
        let tr = document.createElement('tr'); //column
        let th1 = document.createElement('th');
        let th2 = document.createElement("th");
        let th3 = document.createElement('th');
        th1.innerText = "Student A"
        th2.innerText = "Student B"
        th3.innerText = "Blocked"
        tr.appendChild(th1)
        tr.appendChild(th2)
        tr.appendChild(th3)
        table.appendChild(tr)
    */

    console.log(blockedArray);

    let row = table.insertRow(0);
    let cell1 = row.insertCell(0)
    let cell2 = row.insertCell(1)
    let cell3 = row.insertCell(2)
    checkbox = document.createElement("input")
    checkbox.type = "checkbox";
    checkbox.id = "blocked_pairs";
    checkbox.name = "blocked_pairs";
    checkbox.checked = true;
    cell1.innerHTML = blockedArray[0]
    cell2.innerHTML = blockedArray[1]
    cell3.append(checkbox)

}

if (save_btn) {

    save_btn.addEventListener("click", function () {

        let amountOfGroupMembers = document.getElementById("amountOfGroupMembers");
        let studentPreferences = document.getElementById("studentPreferences");
        //let previousMembers = document.getElementById("previousMembers");

        let blockedPairArray = tableToArray(document.querySelector("table > tbody"));

        fetch('/../updateClassConfig', {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                className: window.location.pathname.split('/')[1],
                amountOfGroupMembers: amountOfGroupMembers.value,
                studentPreferences: studentPreferences.value,
                //previousMembers: previousMembers.value,
                blockedPairArray: blockedPairArray
            }),
        })
            .then((response) => response.json())
            .then((data) => {

                console.log(data);

            });

    });

}

if (unlock_btn) {

    unlock_btn.addEventListener("click", function () {

        fetch('/../unlockClass', {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                className: window.location.pathname.split('/')[1]
            }),
        })
            .then((response) => response.json())
            .then((data) => {

                console.log(data);

            });

    });

}

function addelement() {
    // let counter=["Ana","Camelia","fish"] ;
    let checkBox = document.getElementById("include_roles");
    let completelist = document.getElementById("thelist");
    completelist.innerHTML = "";
    for (let i = 0; i < roles.length; i++) {
        completelist.innerHTML += "<li>" + roles[i] + "</li>";
    }
    if (checkBox.checked == true) {
        document.getElementById("thelist").style.display = "block";
    } else {
        document.getElementById("thelist").style.display = "none";

    }
}

function createElement(type, props) {

    let element = document.createElement(type);

    for (let prop in props) {

        switch (prop) {

            case 'innerText':
                element.innerText = props[prop];
                break;
            case 'innerHTML':
                element.innerHTML = props[prop];
                break;
            default:
                element.setAttribute(prop, props[prop]);

        }

    }

    return element;

}

function tableToArray(table) { // https://stackoverflow.com/a/34349548

    let array = [];

    let rows = table.children;

    for (let i = 0; i < rows.length; i++) {

        if (rows[i].children[2].getElementsByTagName('input')[0].checked == "0") {

            continue;

        }

        let fields = rows[i].children;

        let firstBlock = fields[0].innerText;
        let secondBlock = fields[1].innerText;

        let object = {};

        let firstBlockFound = array.some((element) => {

            if (element.name === firstBlock) {

                element.blocks.push(secondBlock);

                return true;

            } else {

                return false;

            }
    
        });

        if (!firstBlockFound) {

            object.name = firstBlock;

            object.blocks = [];

            object.blocks.push(secondBlock);

        }

        if (Object.keys(object).length !== 0) {

            array.push(object);

        }

        object = {};

        let secondBlockFound = array.some((element) => {

            if (element.name === secondBlock) {

                element.blocks.push(firstBlock);

                return true;

            } else {

                return false;

            }
    
        });

        if (!secondBlockFound) {

            object.name = secondBlock;

            object.blocks = [];

            object.blocks.push(firstBlock);

        }

        if (Object.keys(object).length !== 0) {

            array.push(object);

        }

    }

    return array;

}