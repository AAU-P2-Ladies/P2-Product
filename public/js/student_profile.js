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

let prefDiv = document.getElementById("divPref");

function SearchField(myInputID,myULID) {
  console.log("heeeeeeeeeeeeeeeeej");
  console.log(myInputID);
  var input, filter, ul, li, i, txtValue;
      input = document.getElementById(myInputID); // Her @Skjodt
      console.log(input);
      console.log("yoy");
      filter = input.value.toUpperCase();
      console.log(filter);
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

function createSearchPref(number, studentList){

  for(let currentNumber = 1; currentNumber <= number; currentNumber++){

    let inputText = document.createElement("input");
    inputText.setAttribute("id", currentNumber + "prio");
    let inputTextID = inputText.id;
    inputText.setAttribute("type", "text");
    inputText.setAttribute("placeholder", "Search");
    //inputText.setAttribute("value", "");
    
  
    let priorityText = currentNumber + ". Priority";
    let label = document.createElement("label");
    label.innerText = priorityText;
    label.setAttribute("for", currentNumber + "prio");  

    prefDiv.append(label);
    prefDiv.append(inputText);
    makeBreaks(inputText, 1);

    let test = document.getElementById(inputTextID);

    test.onkeyup = SearchField(inputTextID,'myUL');
    

    prefDiv.addEventListener("load", createDynamicList());
  }

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