let roles = ["Resource Investigator", "Teamworker", "Co-ordinator", 
              "Plant", "Monitor Evaluator", "Specialist", "Shaper", 
                "Implementer", "Completer Finisher"];

let blocked=[];
let preferences=[];
let numberOfStudentPreferences = 3;
let rolesIncluded = true;

//ændre navn af variabel list til form eller noget
const list = document.getElementById("StudentProfile");
let modalDiv = document.getElementById("modalContent");
let roleTable = document.getElementById("rolesTable");
let button = document.getElementById("addPref");
let addPrefDiv = document.getElementById("addPrefDiv");
let error = document.getElementById("error");
let modal = document.getElementById("prefModal");
let submit = document.getElementById("submitProfile");

let checkboxes = document.getElementsByClassName("checkboxrole");
let span = document.getElementsByClassName("close")[0];

submit.addEventListener('click', () => {
  sendProfile(getPriorities(),getBlockedStudents(),getIndexOfChecked("Topic"),getIndexOfChecked("role"))
})


function getBlockedStudents () {
  blocked = [];
  let blockedCheckboxData = document.getElementsByClassName("checkboxBlock");
  let blockedData= document.getElementById('studentBlockTableID').getElementsByTagName('tbody')[0];
  for (let i = 0; i<blockedCheckboxData.length; i++){
    if(blockedCheckboxData[i].checked){
      blocked.push(blockedData.children[i].children[0].innerText)
    }
  } 
  console.log(blocked)
  return blocked
}

function createDynamicBlockList(input) {

  fetch('/../search', {
      method: "POST",
      headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
      },
      body: JSON.stringify({
          className: "",
          name: input.value
      }),
  })
  .then((response) => response.json())
  .then((data) => {

    let nameArray2 = data.students;
    console.log(nameArray2);
    console.log(input.id);
      if (input.id == 'addBlock') {

          let dynalist = document.getElementById("blockTableDivID");

          if (dynalist.getElementsByTagName('ul')[0]) {

              dynalist.getElementsByTagName('ul')[0].remove();

          }

          if (input.value != "") {

              let dyn = createElement('ul', { id: 'myUL' });

              for (let i in nameArray2) {

                  let li = createElement('li', { class: 'item', innerText: nameArray2[i] });

                  dyn.appendChild(li);

              }

              dynalist.prepend(dyn);

              document.getElementById("myUL").addEventListener("click", function (e) {
                if (e.target && e.target.matches("li")) {
                    document.getElementById("addBlock").value = e.target.innerText; // new class name here
                    //alert("clicked " + e.target.innerText);
                }

              });
              
          } 
          
      } 

      for (let i = 1; i <= numberOfStudentPreferences; i++){

      
      if (input.id == (i + 'prio')) {

        let dynalist = document.getElementById("prefDiv" + i);

        if (dynalist.getElementsByTagName('ul')[0]) {

            dynalist.getElementsByTagName('ul')[0].remove();

        }

        if (input.value != "") {

            let dyn = createElement('ul', { id: 'myUL' + i });

            for (let j in nameArray2) {

                let li = createElement('li', { class: 'item', innerText: nameArray2[j] });

                dyn.appendChild(li);

            }

            dynalist.append(dyn);

            document.getElementById("myUL" + i).addEventListener("click", function(e) {

              if (e.target && e.target.matches("li")) {
                document.getElementById(i + "prio").value = e.target.innerText;
                document.getElementById("myUL" + i).hidden = "hidden";

              }
      
            });
            
        }

    }


  }

  });

} 

if (rolesIncluded) {

  roleTable.style.display = "";

} else {

  roleTable.style.display = "none";

}

/**
 * CheckboxControl checks if more than three boxes have been checked, 
 * and will in that case uncheck the latest box.
 * @param {the index of the clicked role box} clickedCheckBox 
 * @returns false if the user has clicked more than three boxes.
 */
function checkboxControl(clickedCheckBox) {

  let total = 0;

  for (var checkbox = 0; checkbox < checkboxes.length; checkbox++) {

      if (checkboxes[checkbox].checked == true) {
        
        total = total + 1;

      }

      if (total > 3) {

        error.textContent = "You Can only Select Three Roles";
        error.style.color = "red";
        checkboxes[clickedCheckBox].checked = false;
        return false;

      }

  }

}

/**
 * addPrefFunction will display a modal when the Add-student-preference button is clicked.
 * @param {event} e 
 */
function addPrefFunction(event){
  
  event.preventDefault();
  modal.style.display = "block";

}

document.getElementById("addPref").addEventListener("click", addPrefFunction);

/**
 * The modal will not be displayed when the span X is clicked.
 */
span.onclick = function() {

  modal.style.display = "none";

}

/**
 * createDivs create a certain number of divs for each preference for other student that the coordinator allows.
 * The function also calls another function: createDynamicList for each created div.
 * @param {The number of divs for the number of preferences for other students} numberOfDivs 
 */
function createDivs(numberOfDivs) {

  for (let divNumber = 1; divNumber <= numberOfDivs; divNumber++) {

    let divElement = document.createElement("div");
    divElement.id = "prefDiv" + divNumber;
    modalDiv.append(divElement);
   
  }
  
}

/**
 * Creates an unordered list with all students for each call. Also hides the list.
 * @param {The id of the current div which the list will be created in} id 
 * @param {The number of the current div} divNumber 
 */

function createDynamicList(id, divNumber) {   

  let divForList = document.getElementById(id);
  let list = document.createElement("ul");
  
  for (let i in nameArray ) {

    let li = document.createElement('li');
    li.innerText = nameArray[i];
    li.className = "item";
    list.appendChild(li);

  }

  list.hidden = "";
  list.id = "myUL" + divNumber; 
  divForList.append(list);

}

/**
 * createSearchPref creates a number of input text elements for searching for student names.
 * @param {The number of searchfields that have to be created} number 
 */
function createSearchPref(number) {

  for (let currentNumber = 1; currentNumber <= number; currentNumber++) {

    let inputText = document.createElement("input");
    inputText.setAttribute("type", "text");
    inputText.id = currentNumber + "prio";
    inputText.className = "prioClass" 
    inputText.setAttribute("placeholder", "Search");
    inputText.addEventListener("keyup", () => SearchField(inputText.id, "myUL" + currentNumber)); 
  
    let priorityText = currentNumber + ". Priority";
    let label = document.createElement("label");
    label.innerText = priorityText;
    label.setAttribute("for", inputText.id); 

    let divForSeacrh = document.getElementById("prefDiv" + currentNumber);

    divForSeacrh.prepend(inputText);
    divForSeacrh.prepend(label);

    let element = document.getElementById(currentNumber + "prio");
    console.log(element);
    element.addEventListener("input", () => {
    
      createDynamicBlockList(inputText);
    
    });

  }
  

}

/**
 * SearchField uses the value from the input text to search through the students in the unordered list.
 * The students that matches the input text will be shown. The rest will be hidden.
 * At most 10 results can shown to the user.
 * @param {id for the input text searchfield} myInputID 
 * @param {id for the unordered list under the searchfield} myULID 
 */
function SearchField(myInputID, myULID) {

  let input, filter, ul, li, txtValue;
  input = document.getElementById(myInputID);
  filter = input.value.toUpperCase();
  ul = document.getElementById(myULID);

  if (ul != undefined) {
    
    li = ul.getElementsByTagName('li');
    ul.hidden = "";
    let count = 0;
    
    for (let i = 0; li.length > i; i++) {

      txtValue = li[i].innerText;
        
      if ((txtValue.toUpperCase().indexOf(filter) > -1) && count < 10) {

        li[i].style.display = "block";
        count++;

      } else {

          li[i].style.display = "none";

      }
      
    }
      
    if (input.value == "") {

      ul.hidden = "hidden";

    }
    
  }

}

/**
 * createSaveButton creates a button with an eventlistener. 
 * The function saveStudentPreferences is called when the button is clicked.
 */
function createSaveButton() {

  let saveButton = document.createElement("button");
  saveButton.id = "SaveStudentPreferencesButton";
  saveButton.innerText = "Save";
  modalDiv.append(saveButton);

  saveButton.addEventListener("click", (e) => saveStudentPreferences(e)); 
  
}

/**
 * saveStudentPreferences writes out the selected preferences for other students to the website.
 * It also checks if the user inputs the same student for more than one preference.
 * @param {event} e 
 */
function saveStudentPreferences(e) {

  e.preventDefault();

  let arrayPrefStudents = [];

  let preferenceFields = document.getElementsByClassName("prioClass")
  for (let i = 0;i<preferenceFields.length;i++){
    console.log(i + "debug")
    let currentField = document.getElementById(preferenceFields[i].id)

    for (let j = i/1 + 1; j < preferenceFields.length; j++){
      let nextField = document.getElementById(preferenceFields[j].id)
      if (currentField.value == nextField.value){
        if(currentField.value != ""){
          return alert("Student " + currentField.value + " cannot be added as preference twice")
        }
      }
    }

    let blockedDataHead = document.getElementById("blockTableDivID").getElementsByTagName('thead')[0];
  for (let i = 1; i<blockedDataHead.children.length; i++){
    console.log(i)
    if (currentField.value == blockedDataHead.children[i].innerText){
      return alert("Student "+ blockedDataHead.children[i].innerText+ " is blocked")
    }
  }

  let blockedDataBody = document.getElementById("blockTableDivID").getElementsByTagName('tbody')[0];
  for (let i = 0; i<blockedDataBody.children.length; i++){
    if (currentField.value == blockedDataBody.children[i].children[0].innerText){
      return alert("Student "+ blockedDataBody.children[i].children[0].innerText+ " is blocked")
    }
  }
  }

  for (let priority = 1; priority <= numberOfStudentPreferences; priority++) {

    let currentStudent = document.getElementById(priority + "prio");
    currentStudent.style.background = "white";



      if (document.getElementById("p" + priority) === null) {

        let text = document.createElement("p");
        let prioriText = document.createElement("p");
        prioriText.innerText = priority + " . Priority";
        prioriText.id = "heading" + priority;
        text.id = "p" + priority;
        text.className = "priorities"
        let name = document.getElementById(priority + "prio");
        text.innerText = name.value;
        addPrefDiv.append(prioriText);
        addPrefDiv.append(text);
  
        button.innerText = "Change student preference";
        modal.style.display = "none";
  
      } else {
  
        let text = document.getElementById("p" + priority);
        let name = document.getElementById(priority + "prio");
        let prioriText = document.getElementById("heading" + priority);
        prioriText.innerText = priority + " . priority";
        text.innerText = name.value;
          
        button.innerText = "Change student preference";
        modal.style.display = "none";
  
      }
    
    arrayPrefStudents.push(currentStudent.value);

  }
  
}
//KALDE FUNKTIONER

createDivs(numberOfStudentPreferences);

createSearchPref(numberOfStudentPreferences);


for (let i = 1; i <= numberOfStudentPreferences; i++) {

  let test = document.getElementById(i + "prio");
  test.addEventListener("keyup", SearchField(test.id, "myUL" + i));

}
createSaveButton();


/*
fjerne students fra listen hvis de er valgt
*/


function createDynamicList2(TableID, SubjectArray, Subject) {
console.log(SubjectArray)
  let table = document.getElementById(TableID).getElementsByTagName('tbody')[0];

  if (Subject == "Topic") {

    document.getElementById(TableID).style.display = "none";

  }
 
  for(let i = 0; i < SubjectArray.length; i++ ) {
    let row = table.insertRow(i);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    cell1.innerText = SubjectArray[i];
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "checkbox" + Subject;
    checkbox.id = Subject + i;
    checkbox.name = Subject + i;
    checkbox.checked = false;
    if (Subject == "Block"){
      checkbox.checked = true;  
    }
    cell2.append(checkbox);
    console.log(i);
  }
  
}

function ShowTopicTable() {

  if (document.getElementById("DoesTopicMatterID").checked) {

      document.getElementById("MyTopicTable").style.display = "";

  } else {
    
      document.getElementById("MyTopicTable").style.display = "none";
    
    }

}

document.getElementById("topicDiv").addEventListener("load",
  fetch("./getTopics").then((response) => response.json()).then((data) => {
    console.log(data);
    createDynamicList2("MyTopicTable", data, "Topic")
  })
);

document.getElementById('DoesTopicMatterID').addEventListener('click', ShowTopicTable);

roleTable.addEventListener("load", createDynamicList2("rolesTable", roles, "role"));
document.getElementById("role0").addEventListener("click",() =>checkboxControl(0));
document.getElementById("role1").addEventListener("click",() =>checkboxControl(1));
document.getElementById("role2").addEventListener("click",() =>checkboxControl(2)); 
document.getElementById("role3").addEventListener("click",() =>checkboxControl(3));
document.getElementById("role4").addEventListener("click",() =>checkboxControl(4));
document.getElementById("role5").addEventListener("click",() =>checkboxControl(5));
document.getElementById("role6").addEventListener("click",() =>checkboxControl(6));
document.getElementById("role7").addEventListener("click",() =>checkboxControl(7));
document.getElementById("role8").addEventListener("click",() =>checkboxControl(8));
document.getElementById("addBlock").addEventListener("keyup", () => SearchField('addBlock', 'myUL'))

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


function BlockedList(Student) {
  let blockedPair = [document.getElementById(Student).value];

  if (blockedPair == "") {
    return alert("You have to input a student to block")
  }

  let studentPreferences = document.getElementsByClassName("priorities")
  for (let i in studentPreferences){
  if (blockedPair == studentPreferences[i].innerText){
    return alert("Student "+studentPreferences[i].innerText+ " is added as a preference")
  } 
  }

  let blockedDataHead = document.getElementById("blockTableDivID").getElementsByTagName('thead')[0];
  for (let i = 1; i<blockedDataHead.children.length; i++){
    if (blockedPair == blockedDataHead.children[i].innerText){
      return alert("Student "+ blockedDataHead.children[i].innerText+ " is already blocked")
    }
  }

  let blockedDataBody = document.getElementById("blockTableDivID").getElementsByTagName('tbody')[0];
  for (let i = 0; i<blockedDataBody.children.length; i++){
    if (blockedPair == blockedDataBody.children[i].children[0].innerText){
      return alert("Student "+ blockedDataBody.children[i].children[0].innerText+ " is already blocked")
    }
  }
    console.log(document.getElementById(Student).ariaPlaceholder)
    createDynamicList2("studentBlockTableID", blockedPair, "Block")
    

  
}

function sendProfile(pref, blocked, topics, roles) {

  fetch('/saveProfile', {
      method:"POST",
      headers: {
        Accept:"application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prefs: pref,
        blocks: blocked,
        topics: topics,
        roles: roles,
      })

  }).then((response) => response.json()).then((data) =>{
    if(data.error){
      if (data.blocks)
      {
        alert("Invalid blocks")
        console.log(1);
      } 
      if (data.prefs)
      {
        alert("Invalid prefs")
        console.log(2);
      } 
      if (data.roles)
      {
        alert("Invalid roles")
        console.log(3);
      } 
      if (data.topics)
      {
        alert("Invalid topics")
        console.log(4);
      } 
    } else {
      location.href = './student_start';
    }
  })
  
}



document.querySelectorAll("#addBlock").forEach(function (element) {

  element.addEventListener("input", function () {

    createDynamicBlockList(this);

  });

});

fetch('/getBlockedPair').then((response) => response.json()).then((data) => {
let Blocktable = document.getElementById("blockTableDivID").getElementsByTagName('thead')[0];
for (let i in data.blocked) {

  let row = Blocktable.insertRow(1);
  let cell1 = row.insertCell(0);
  cell1.innerText = data.blocked[i];
  cell1.setAttribute("disabled", true)
}
})

function getPriorities(){
  if(document.getElementsByClassName('priorities')){
    let array=[]
    for(i in document.getElementsByClassName('priorities')){
      if(!document.getElementsByClassName('priorities')[i].innerHTML == "")
        array.push(document.getElementsByClassName('priorities')[i].innerHTML);
    }
    return array;

  }else{console.log("fejl");}
}

function getIndexOfChecked(subject){
  let checkedboxes = [];
  subject = "checkbox"+subject

  data = document.getElementsByClassName(subject)

  for (i in data){
    if(data[i].checked)
    checkedboxes.push(i) 
  }
  
  return checkedboxes
}

