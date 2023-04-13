let knaps = document.getElementById("knapidd");
knaps.addEventListener("click", function(){
  console.log('clickededded');
  knaps.style.display = "none";
})

let create_knap = true;
let feedback_knap = true;
let done_knap = true;
let knaps1 = document.getElementById("anchor1");
let knaps2 = document.getElementById("anchor2");
let knaps3 = document.getElementById("anchor3");

if (create_knap === false){
  knaps1.style.display = "none";
} else {
  knaps1.style.display = "block";
}

if (feedback_knap === false){
  knaps2.style.display = "none";
} else {
  knaps2.style.display = "block";
}

if (done_knap === false){
  knaps3.style.display = "none";
} else {
  knaps3.style.display = "block";
}