const maxTime = 5;

let groupButton = document.getElementById("createGroups");
let keycodeTable = document.getElementById("keycodeTable");

let url = (window.location.pathname.split('/')[1] == 'node0') ? '/node0' : '';
let className = (window.location.pathname.split('/')[1] != 'node0') ? window.location.pathname.split('/')[1] : window.location.pathname.split('/')[2];

window.onload = fetch(url + '/getGroups', {
}).then((response) => response.json()).then((data) => {
    //if groups are not yet generated create the student and keycode table
    if(data.error == true){
        makeStudentTable();
    }
    //else generate table displaying the groups
    else{
        groupButton.style.display = 'none';
        keycodeTable.style.display = 'none';
        makeGroupsTable(data);
    }
})

function makeGroupsTable(groups) {
    //find the table in HTML and adress the body of the table at index 0
    let table = document.getElementById('groupsTable').getElementsByTagName('tbody')[0];
    
    //create  new row for new student/keycode pair and new cells 
    for (let i in groups) {
        
        let row = table.insertRow();
        let cell = row.insertCell(0);
        cell.innerHTML = "Group " + (i/1 + 1);
        
        for(let j in groups[i].students) {
            let cell = row.insertCell(1);
            cell.innerHTML = groups[i].students[j].name;
        }
        
    }
}

function makeStudentTable() {
    fetch(url + '/getStudents', {
        method: "POST",
        headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            className: className
        }),
    })
    .then((response) => response.json())
    .then((data) => {
        
        //find the table in HTML and adress the body of the table at index 0
        let table = document.getElementById('keycodeTable').getElementsByTagName('tbody')[0];

        //console.log(namesArray);
        
        //create  new row for new student/keycode pair and new cells 

        for (let i in data) {

            let row = table.insertRow(0);
            let cell1 = row.insertCell(0);
            let cell2 = row.insertCell(1);
            let cell3 = row.insertCell(2);
            
            
            cell1.innerHTML = data[i].name;
            cell2.innerHTML = data[i].keycode;
            cell3.innerHTML = (data[i].isRegistered) ? "Yes" : "No";

        }

        
            

    })
};

if(groupButton){
    groupButton.addEventListener("click", () => {

        groupButton.disabled = "disabled";
        alert('The algorithm is about to start... Please press "Ok" to start the algorithm.');
    
        fetch(url + '/makeGroups', {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                className: className
            }),
        })
        .then((response) => response.json())
        .then((data) => {
    
            if (data) {
    
                alert('The group formation is now done!');
                location.reload();
            }
        })
    })    
}