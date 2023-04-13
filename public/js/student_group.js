let group = {groupName: "SW2023-09", members: ["Sina1", "Nikolaj", "Sina2", "Sina3"] , topic: "Miljø"};

function create_table(group){
    let boksenn = document.getElementById("divBoks");

    let groupTable = document.createElement("table");
    groupTable.id = "groupTable";
    boksenn.prepend(groupTable);
    let rowOne = document.createElement("tr");
    groupTable.append(rowOne);
    let tableHeading = document.createElement("th");
    let text = document.createTextNode(group.groupName);
    tableHeading.appendChild(text);
    rowOne.append(tableHeading);

    let rowTwo = document.createElement("tr");
    groupTable.append(rowTwo);
    let tableCell = document.createElement("th");
    text = document.createTextNode("Topic: " + group.topic);
    tableCell.appendChild(text);
    rowTwo.append(tableCell);

    for (let i of group.members){
        let row = document.createElement("tr");
        groupTable.append(row);
        let tableCell = document.createElement("td");
        text = document.createTextNode(i);
        tableCell.appendChild(text);
        row.append(tableCell);

        console.log(i);
    }
}

create_table(group);