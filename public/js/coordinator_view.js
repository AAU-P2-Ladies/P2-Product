const maxTime = 5;

let groupButton = document.getElementById("createGroups");

function makeStudentTable() {
    fetch('/../getStudents', {
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

groupButton.addEventListener("click", () => {

    groupButton.disabled = "disabled";
    alert('The algorithm is about to start... Please press "Ok" to start the algorithm.');

    fetch('/../makeGroups', {
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

        if (data) {

            alert('The group formation is now done!');

        }

        //console.log(groups);
        /*
        fetch('/../uploadGroups', {
            method: "POST",
            headers: {
                Accept: "application/json, text/plain, *",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                groups: groups
            }),
        })
        .then((response) => response.json())
        .then((data) => {

        })
        */
    })
})


makeStudentTable();