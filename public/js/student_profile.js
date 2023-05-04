let topics = ["klima", "miljø", "energi", "simons mor",
              "klima", "miljø", "energi", "simons mor",
              "klima", "miljø", "energi", "simons mor"];

let roles = ["Resource Investigator", "Teamworker", "Co-ordinator", 
              "Plant", "Monitor Evaluator", "Specialist", "Shaper", 
                "Implementer", "Completer Finisher"];

let nameArray = ["Adele","Agnes","Adrian","Adil","Andreas","Anders",
                "Adomas","Billy","Bob","Calvin","Cim","Charlotete",
                "Cello","Cimmy","Clara","Claire","Christina","Cindy"];

                
let numberOfStudentPreferences = 3;
let rolesIncluded = true;

const list = document.getElementById("StudentProfile");
let modalDiv = document.getElementById("modalContent");
let roleTable = document.getElementById("rolesTable");
let button = document.getElementById("addPref");
let error = document.getElementById("error");
let modal = document.getElementById("prefModal");
let overrideTextbox = document.getElementById("override");

let checkboxes = document.getElementsByClassName("checkbox");
let span = document.getElementsByClassName("close")[0];


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
function addPrefFunction(e){
  e.preventDefault();

  modal.style.display = "block";

}

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

  for (let div = 1; div <= numberOfDivs; div++) {

    let divElement = document.createElement("div");
    divElement.id = "prefDiv" + div;
    modalDiv.append(divElement);
    divElement.addEventListener("load", createDynamicList(divElement.id, div));

  }
  
}

/**
 * Creates an unordered list with all students for each call. Also hides the list.
 * @param {The id of the current div which the list will be created in} id 
 * @param {The number of the current div} div 
 */
function createDynamicList(id, div) {   

  let divForList = document.getElementById(id);
  let list = document.createElement("ul");
  
  for (let i in nameArray) {

    let li = document.createElement('li');
    li.innerText = nameArray[i];
    li.className = "item";
    list.appendChild(li);

  }
  console.log(div);

  list.hidden = "";
  list.id = "myUL" + div; 
  divForList.append(list);

}

/**
 * createSearchPref creates a number of input text elements for seaching for student names.
 * @param {The number of searchfields that have to be created} number 
 */
function createSearchPref(number) {

  for (let currentNumber = 1; currentNumber <= number; currentNumber++) {

    let inputText = document.createElement("input");
    inputText.setAttribute("type", "text");
    inputText.id = currentNumber + "prio";
    
    inputText.setAttribute("placeholder", "Search");
    inputText.setAttribute("onkeyup","SearchField('"+inputText.id+"','myUL"+currentNumber+"')") 
  
    let priorityText = currentNumber + ". Priority";
    let label = document.createElement("label");
    label.innerText = priorityText;
    label.setAttribute("for", inputText.id); 

    let hey = document.getElementById("prefDiv" + currentNumber);
    hey.prepend(inputText);
    hey.prepend(label);

  }

}

/**
 * SearchField uses the value from the input text to search through the students in the unordered list.
 * The students that matches the input text will be shown. The rest will be hidden.
 * At most 10 results can shown to the user.
 * @param {id for the input text seachfield} myInputID 
 * @param {id for the unordered list under the searchfield} myULID 
 */
function SearchField(myInputID, myULID) {

  let input, filter, ul, li, txtValue;
  input = document.getElementById(myInputID);
  filter = input.value.toUpperCase();
  ul = document.getElementById(myULID);
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

/**
 * createSaveButton creates a button with an eventlistener. 
 * The function saveStudentPreferences is called when the button is clicked.
 */
function createSaveButton() {

  let saveButton = document.createElement("button");
  saveButton.id = "SaveStudentPreferencesButton";
  saveButton.innerText = "Save";
  modalDiv.append(saveButton);

  saveButton.setAttribute("onclick","saveStudentPreferences(event)"); 
  
}

/**
 * saveStudentPreferences writes out the selected preferences for other students to the website.
 * @param {event} e 
 */
function saveStudentPreferences(e) {

  e.preventDefault();

    for (let priority = numberOfStudentPreferences; priority > 0; priority--) {
    
      if (document.getElementById("p" + priority) === null) {

        let text = document.createElement("p");
        text.id = "p" + priority;
        let name = document.getElementById(priority + "prio");
        text.innerText = priority + ". Priority: " + name.value;
        button.after(text);

        button.innerText = "Change student preference";
        modal.style.display = "none";

      } else {

        let text = document.getElementById("p" + priority);

        let name = document.getElementById(priority + "prio");
        console.log(name.value);
        text.innerText = priority + ". Priority: " + name.value;
        
        button.innerText = "Change student preference";
        modal.style.display = "none";

      }

    }

}

/*
/**
 * createDropDown takes two input parameters: 
 * @param {An id for the select element.} id 
 * @param {An array with a list of names for each element in the drop down menu.} array 
 * @returns the select element
 */
/*function createDropDown(id, array) {

  const selection = document.createElement("select");
  selection.id = id;
  selection.className = "selectt";

  for (let i of array) {

    const options = document.createElement("option");
    const text = document.createTextNode(i);
    options.appendChild(text);
    options.value = i;
    selection.append(options);

  }

  return selection;

}
*/


/*function topic_choice(number, data, nameId, divName){//This function creates multiple select elements,depend on the number of topics.

  for(let i = number; i > 0; i--){//This line will loop throough all topic,number variable represents the number of topics
    let selectionTopics = createDropDown((nameId), data);//This will call function above"createdropDown" which create an elem  
    divName.prepend(selectionTopics);
    let currentSelection = document.getElementById(nameId);
    const nameLabel = document.createElement("label");
    const text = document.createTextNode("*");
    nameLabel.appendChild(text);
    divName.prepend(nameLabel);
    makeBreaks(currentSelection, 1);

  }
  
}*/

/*
let newDivv = document.createElement("div");
newDivv.id = "newDivOne";

let headingE = document.createElement("h1");
  let textz = document.createTextNode("Topic");
  headingE.appendChild(textz);
  newDivv.prepend(headingE);

let x= document.createElement("input");
x.type= "checkbox";
x.id= "topics";
newDivv.prepend(x);

list.prepend(newDivv);
*/


/*document.getElementById("topics").addEventListener("change", (e) => {

  if (!document.getElementById("Topic")) {

    let newNewDiv = document.createElement("div");
    newNewDiv.id = "newNewDivOne";
    list.prepend(newNewDiv);
    let numberOfTopics = topics.length - 1;
    topic_choice(numberOfTopics, topics, "Topic", newNewDiv);

  } else {

    document.getElementById("newNewDivOne").remove();

  }

  

});
*/


//KALDE FUNKTIONER

createDivs(numberOfStudentPreferences);

createSearchPref(numberOfStudentPreferences);


for (let i = 1; i <= numberOfStudentPreferences; i++) {

  let test = document.getElementById(i + "prio");
  test.addEventListener("keyup", SearchField(test.id, "myUL" + i));

}


for (let input = 1; input <= numberOfStudentPreferences; input++) {

  document.getElementById("myUL" + input).addEventListener("click", function(e) {

    if (e.target && e.target.matches("li")) {

      let myInput = document.getElementById(input + "prio");
      myInput.value = e.target.innerText;
      document.getElementById("myUL" + input).hidden = "hidden";

    }
  
  });

}

createSaveButton();


/*

fjerne students fra listen hvis de er valgt

*/


function createDynamicList2(blockedArray) {
  let table = document.getElementById('MyTopicTable').getElementsByTagName('tbody')[0]

  for (let i in blockedArray){
    let row = table.insertRow(0);
    let cell1 = row.insertCell(0)
    let cell2 = row.insertCell(1)
    cell1.innerText = topics[i];
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "topic"+i;
    checkbox.name = "topic"+i;
    checkbox.checked = false;
    cell2.append(checkbox);
  }
  
}

function ShowTopicTable(){
  if (document.getElementById("DoesTopicMatterID").checked)
  {

      document.getElementById("MyTopicTable").style.display = "";

  } else {
    
      document.getElementById("MyTopicTable").style.display = "none";
    
    }
}

document.getElementById("topicDiv").addEventListener("load",createDynamicList2(topics));
document.getElementById('DoesTopicMatterID').addEventListener('click', ShowTopicTable())
