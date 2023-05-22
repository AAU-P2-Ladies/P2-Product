let boksenn = document.getElementById("divBoks");

let url = (window.location.pathname.split('/')[1] == 'node0') ? '/node0' : '';

window.onload = fetch(url + '/getGroup', {
    }).then((response) => response.json()).then((data) => {
        console.log(data)
        createTable(data, boksenn)
    })

function createTable(group, existingElement){
    let groupTable = document.createElement("table");
    groupTable.id = "groupTable";
    existingElement.prepend(groupTable);
    let rowOne = document.createElement("tr");
    groupTable.append(rowOne);
    let tableHeading = document.createElement("th");
    let text = document.createTextNode("Your group");
    tableHeading.appendChild(text);
    rowOne.append(tableHeading);

    let rowTwo = document.createElement("tr");
    groupTable.append(rowTwo);
    let tableCell = document.createElement("th");
    let topic = (group.topics) ? group.topics : "Any";
    text = document.createTextNode("Topic: " + topic);
    tableCell.appendChild(text);
    rowTwo.append(tableCell);

    for (let student of group.students){
        let row = document.createElement("tr");
        groupTable.append(row);
        let tableCell = document.createElement("td");
        text = document.createTextNode(student.name);
        tableCell.appendChild(text);
        row.append(tableCell);

        console.log(student.name);
    }
}

