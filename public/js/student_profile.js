let topics = ["--","klima", "miljø", "energi", "simons mor"];

let roles = ["Resource Investigator", "Teamworker", "Co-ordinator", 
              "Plant", "Monitor Evaluator", "Specialist", "Shaper", 
                "Implementer", "Completer Finisher"];

let students = ["--","Sina1", "Sina2", "Signe", "Allan", "Alline"];

let nameArray = ["Adele","Agnes","Adrian","Adil","Andreas","Anders",
                "Adomas","Billy","Bob","Calvin","Cim","Charlotete",
                "Cello","Cimmy","Clara","Claire","Christina","Cindy"];


let numberOfStudentPreferences = 3;
const list = document.getElementById("StudentProfile");
let modalDiv = document.getElementById("modalContent");
let roleTable = document.getElementById("rolesTable");
let rolesIncluded = true;

if(rolesIncluded){
  roleTable.style.display = "";
}else{
  roleTable.style.display = "none";
}

/*
if(rolesIncluded){
  createRolesTable();
}

function createRolesTable(){

  let tableRowFirst = document.createElement("tr");
  roleTable.append(tableRowFirst);
  let tableHeading = document.createElement("th");
  tableHeading.innerText = "Belbin Roles";
  tableRowFirst.append(tableHeading);

  for(let i = 1; i <= roles.length; i++){
    let tableRow = document.createElement("tr");
    let tableElement = document.createElement("td");
    tableElement.innerText = roles[i];
    roleTable.append(tableRow);
    tableRow.append(tableElement);

  }
  roleTable.style.display = "";
}
*/

function createDropDown(id, array){
  const selection = document.createElement("select");
  selection.id = id;
  selection.className = "selectt";
  for(let i of array){
    const options = document.createElement("option");
    const text = document.createTextNode(i);
    options.appendChild(text);
    options.value = i;
    selection.append(options);
  }
  return selection;
}

function makeBreaks(element, number){
  let i = 0;
  while(i < number){
    const breaks = document.createElement("br");
    element.after(breaks);
    i++;
  }
}

function topic_choice(number, data, nameId, divName){


  /*let headingE = document.createElement("h1");
  let textz = document.createTextNode(nameId);
  headingE.appendChild(textz);
  divName.prepend(headingE);*/
  
  //document.getElementById(nameId).addEventListener("click",check_topics);*/

  for(let i = number; i > 0; i--){
    let selectionTopics = createDropDown((nameId), data);
    divName.prepend(selectionTopics);
    let currentSelection = document.getElementById(nameId);
    const nameLabel = document.createElement("label");
    const text = document.createTextNode("*");
    nameLabel.appendChild(text);
    divName.prepend(nameLabel);
    //document.getElementById(nameId).addEventListener("click",check_topics);
    makeBreaks(currentSelection, 1);
  }
  
 

  //document.getElementById(nameId).addEventListener("click",check_topics);
}





let newDiv = document.createElement("div");
newDiv.id = "newDivOne";

let headingE = document.createElement("h1");
  let textz = document.createTextNode("Topic");
  headingE.appendChild(textz);
  newDiv.prepend(headingE);

let x= document.createElement("input");
x.type= "checkbox";
x.id= "topics";
newDiv.prepend(x);





list.prepend(newDiv);



document.getElementById("topics").addEventListener("change", (e) => {

  if (!document.getElementById("Topic")) {

    let newNewDiv = document.createElement("div");
    newNewDiv.id = "newNewDivOne";
    newDiv.prepend(newNewDiv);

    topic_choice(numberOfStudentPreferences, topics, "Topic", newNewDiv);

  } else {

    document.getElementById("newNewDivOne").remove();

  }

  

});

//topic_choice(numberOfStudentPreferences, topics, "Topic", newDiv);


/*function check_topics(name_Id,data1){
  /*let x= document.getElementsByTagName("input");
  x.type= "checkbox";
  //x.id= id1;
  let selectionTopics = createDropDown((name_Id), data1);
  let checkBox=document.getElementsByTagName(name_Id);  
  //document.getElementById("newDivOne").addEventListener("click",topic_choice);

  if (checkBox.checked == true){
    document.getElementById(name_Id).style.display = "block";
  } else {
    document.getElementById(name_Id).style.display= "none";

}
}
check_topics("Topic",topics);*/


let btn = document.getElementById("addPref");
let modal = document.getElementById("prefModal");
let span = document.getElementsByClassName("close")[0];

function addPrefFunction(e){
  e.preventDefault();

  modal.style.display = "block";
  onclick="myFunction(event)";
}

span.onclick = function(){
  modal.style.display = "none";
}
//den her virker ikke
/*window.onclick = function(event){
  if(event.target == modal){
    modal.style.display = "none";
  }
}*/

function saveStudentPreferences(e){
  e.preventDefault();

    for(let priority = numberOfStudentPreferences; priority > 0; priority--){
    
      if(document.getElementById("p" + priority) === null){
        let text = document.createElement("p");
        text.id = "p" + priority;
        let name = document.getElementById(priority + "prio");
        text.innerText = priority + ". Priority: " + name.value;
        let button = document.getElementById("addPref");
        button.after(text);

        btn.innerText = "Change student preference";
        modal.style.display = "none";

      }else{
        let text = document.getElementById("p" + priority);

        let name = document.getElementById(priority + "prio");
        console.log(name.value);
        text.innerText = priority + ". Priority: " + name.value;
        
        btn.innerText = "Change student preference";
        modal.style.display = "none";
      }
    }
}

function createSaveButton(){
  let saveButton = document.createElement("button");
  saveButton.id = "SaveStudentPreferencesButton";
  saveButton.innerText = "Save";
  modalDiv.append(saveButton);

  saveButton.setAttribute("onclick","saveStudentPreferences(event)"); 
  
}

function createDivs(numberOfDivs){

  for(div = 1; div <= numberOfDivs; div++){
    let divElement = document.createElement("div");
    divElement.id = "prefDiv" + div;
    modalDiv.append(divElement);
    divElement.addEventListener("load", createDynamicList(divElement.id, div));
  }
  
}

function SearchField(myInputID, myULID){
  let input, filter, ul, li, txtValue;
  input = document.getElementById(myInputID);
  filter = input.value.toUpperCase();
  ul = document.getElementById(myULID);
  li = ul.getElementsByTagName('li');
  ul.hidden = "";
  
  let count = 0;
    
  for(let i = 0; li.length > i; i++){
    txtValue = li[i].innerText;
      
    if((txtValue.toUpperCase().indexOf(filter) > -1) && count < 10){
      li[i].style.display = "block";
      count++;
    }else{
        li[i].style.display = "none";
    }
  }
   
  if(input.value == ""){
    ul.hidden = "hidden";
  }
}

function createDynamicList(id){   
  let divForList = document.getElementById(id);
  let list = document.createElement("ul");
  
  for(let i in nameArray){
    let li = document.createElement('li');
    li.innerText = nameArray[i];
    li.className = "item";
    list.appendChild(li);
  }

  list.hidden = "";
  list.id = "myUL" + div; 
  divForList.append(list);

}

function createSearchPref(number){

  for(let currentNumber = 1; currentNumber <= number; currentNumber++){

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
    makeBreaks(inputText, 1);

  }

}

createDivs(numberOfStudentPreferences);
createSearchPref(numberOfStudentPreferences);

for(let i = 1; i <= numberOfStudentPreferences; i++){
  let test = document.getElementById(i + "prio");
  test.addEventListener("keyup", SearchField(test.id, "myUL" + i));
}

for(let input = 1; input <= numberOfStudentPreferences; input++){
  document.getElementById("myUL" + input).addEventListener("click", function(e) {
    if (e.target && e.target.matches("li")) {
      let myInput = document.getElementById(input + "prio");
      myInput.value = e.target.innerText;
      document.getElementById("myUL" + input).hidden = "hidden";
    }
  
  });
}

createSaveButton();


let overrideTextbox = document.getElementById("override");
makeBreaks(overrideTextbox, 2);



/*

roller i tabel. krydse af. - maks 3. 

hidden hvis coordinator ikke har krydset af.

*/