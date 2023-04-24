let topics = ["--","klima", "miljø", "energi", "simons mor"];
let students = ["--","Sina1", "Sina2", "Signe", "Allan", "Alline"];
let nameArray = ["Adele","Agnes","Adrian","Adil","Andreas","Anders",
                "Adomas","Billy","Bob","Calvin","Cim","Charlotete",
                "Cello","Cimmy","Clara","Claire","Christina","Cindy"];

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
    console.log(i);
  }
  let headingE = document.createElement("h1");
  let textz = document.createTextNode(name_id + " Preferences");
  headingE.appendChild(textz);
  div_name.prepend(headingE);
}

let newDiv = document.createElement("div");
newDiv.id = "newDivOne";
list.prepend(newDiv);
priorities(3, topics, "Topic", newDiv);

/*
let newDiv2 = document.createElement("div");
newDiv2.id = "newDivTwo";
list.prepend(newDiv2);
priorities(5, students, "Student", newDiv2);
*/

let btn = document.getElementById("addPref");
let modal = document.getElementById("prefModal");
let span = document.getElementsByClassName("close")[0];

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
}

function fufufu(name){

  console.log("yooyoyoy" + name);
}

function createNameElement(name){
  let theForm = document.getElementById("modalContent");
  let navn = document.createElement("a");
  navn.id = "thisOneYes";
  navn.href="#"
  navn.onclick = function() {fufufu(name)};
  let text = document.createTextNode(name);
  navn.appendChild(text);
  theForm.append(navn);
}

function nameSearch(filter){

  for(let currentName of students){
    if(currentName.indexOf(filter) > -1){
      createNameElement(currentName);
    }
  }
}

function searchPrefFunction(e){
  e.preventDefault();

  let theSearchedName = document.getElementById("namePreference").value;
  console.log(theSearchedName);
  nameSearch(theSearchedName);
}

let prefForm = document.getElementById("prefForm");

function createSearchPref(number, studentList){
  let inputText = document.createElement("")

}

createSearchPref(3, nameArray);

let override_textbox = document.getElementById("override");
makeBreaks(override_textbox, 2);

/*
<label> eller placeholder
<input type="text" id="namePreference" name="namePreference" placeholder="Search Name"><br>



<button id="searchPref" onclick="searchPrefFunction(event)">Search</button>


søgefelt for pref for hvert anatal coordinator indtaster.
skriv præferencerne ud

*/