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

/*
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
*/



function createDivs(numberOfDivs){

  for(div = 1; div <= numberOfDivs; div++){
    let divElement = document.createElement("div");
    divElement.id = "prefDiv" + div;
    modalDiv.append(divElement);
    divElement.addEventListener("load", createDynamicList(divElement.id, div));
  }
  
}

function SearchField(myInputID, myULID) {
  //console.log("heeeeeeeeeeeeeeeeej");
  //console.log(myInputID);
  let input, filter, ul, li, i, txtValue;
  input = document.getElementById(myInputID); // Her @Skjodt
  //console.log(input);
  //console.log("yoy");
  filter = input.value.toUpperCase();
  console.log(filter + "yo");
  ul = document.getElementById(myULID);
  //console.log(ul);
  li = ul.getElementsByTagName('li');

  if(window.event.keyCode=='13'){
    // Declare variables    
      
    ul.hidden = "";
    //Måske optimer koden, så den kun tager 'input' ind som parameter
    let count = 0;
    // Loop through all list items, and hide those who don't match the search query
    for (let i = 0; li.length > i; i++) {
      console.log(i);
      txtValue = li[i].innerText;
      //console.log(txtValue)
      if ((txtValue.toUpperCase().indexOf(filter) > -1) && count < 10) {
        console.log(count + "vist");
        li[i].style.display = "block";
        count++;
      } else {
          console.log(count + "IKKE");
          li[i].style.display = "none";
      }
    }
    
  } /*else if (input.value == "") {
      ul.hidden = "hidden";
  }
  */
}

function createDynamicList(id){   
  let divForList = document.getElementById(id);
  let list = document.createElement("ul");
  
  for (let i in nameArray)
  {
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
    //let inputTextID = inputText.id;
    inputText.setAttribute("placeholder", "Search");
    //inputText.setAttribute("value", "");
    
  
    let priorityText = currentNumber + ". Priority";
    let label = document.createElement("label");
    label.innerText = priorityText;
    label.setAttribute("for", inputText.id);  

    let hey = document.getElementById("prefDiv" + currentNumber);
    //console.log(hey);
    hey.prepend(inputText);
    hey.prepend(label);
    makeBreaks(inputText, 1);

    //let test = document.getElementById(inputText.id);
    //console.log(test);
    //let searchId = currentNumber + "prio";
    //test.onkeyup = SearchField(searchId, "myUL");
    //console.log(test);
    //hey.append(test);
  
  }

}

let modalDiv = document.getElementById("modalContent");

createDivs(3);

createSearchPref(3);

for(let i = 1; i <= 3; i++){
  let test = document.getElementById(i + "prio");
  test.addEventListener("keyup", SearchField(test.id, "myUL" + i));
}





let override_textbox = document.getElementById("override");
makeBreaks(override_textbox, 2);



/*
<label> eller placeholder
<input type="text" id="namePreference" name="namePreference" placeholder="Search Name"><br>



<button id="searchPref" onclick="searchPrefFunction(event)">Search</button>


søgefelt for pref for hvert anatal coordinator indtaster.
skriv præferencerne ud

*/