let topics = ["--","klima", "miljø", "energi", "simons mor"];
let students = ["--","Sina1", "Sina2", "Signe", "Allan", "Alline"];
let nameArray = ["Adele","Agnes","Adrian","Adil","Andreas","Anders",
                "Adomas","Billy","Bob","Calvin","Cim","Charlotete",
                "Cello","Cimmy","Clara","Claire","Christina","Cindy"];


let numberOfStudentPreferences = 3;
const list = document.getElementById("StudentProfile");

function createDropDown (id, array){
    const selection = document.createElement("select");
    selection.id = id;
    selection.className = "selectt";
    for (let i of array){
      const options = document.createElement("option");
      const text = document.createTextNode(i);
      options.appendChild(text);
      options.value = i;
      selection.append(options);
    }
    return selection;
}

function makeBreaks (element, number){
  let i = 0;
  while (i < number){
    const breaks = document.createElement("br");
    element.after(breaks);
    i++;
  }
}

function priorities (number, data, name_id, div_name){
  for (let i = number; i > 0; i--){
    let selectionTopics = createDropDown((name_id+"Priority"+i), data);
    div_name.prepend(selectionTopics);
    let current_selection = document.getElementById(name_id+"Priority"+i);
    const nameLabel = document.createElement("label");
    let prio = "Priority";
    const text = document.createTextNode(i + ". " + prio);
    nameLabel.appendChild(text);
    div_name.prepend(nameLabel);
    makeBreaks(current_selection, 1);
  }
  let headingE = document.createElement("h1");
  let textz = document.createTextNode(name_id + " Preferences");
  headingE.appendChild(textz);
  div_name.prepend(headingE);
}

let newDiv = document.createElement("div");
newDiv.id = "newDivOne";
list.prepend(newDiv);
priorities(numberOfStudentPreferences, topics, "Topic", newDiv);

let btn = document.getElementById("addPref");
let modal = document.getElementById("prefModal");
let span = document.getElementsByClassName("close")[0];

function addPrefFunction(e){
    e.preventDefault();

    modal.style.display = "block";
    onclick="myFunction(event)";
}

span.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

function saveStudentPreferences(e){
  e.preventDefault();

    for (let priority = numberOfStudentPreferences; priority > 0; priority--){
    
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

function createDynamicList(id){   
  let divForList = document.getElementById(id);
  let list = document.createElement("ul");
  
  for (let i in nameArray){
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

let modalDiv = document.getElementById("modalContent");

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


let override_textbox = document.getElementById("override");
makeBreaks(override_textbox, 2);



/*

søgefelt for pref for hvert anatal coordinator indtaster.
skriv præferencerne ud

*/