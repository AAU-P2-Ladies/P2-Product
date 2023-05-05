//let startTime = performance.now()
const helper = require('./algHelpers.js');

//Define values that should be given by the website
let min = 0;
let StudentNum = 100;
let groupSize = 7;
const roleNumber = 9
const maxIterations = 1000
//const minDiversity = 0.75

/**
 * Creates the object Student
 * @param {*} first 
 * @param {*} index 
 * @param {*} prefs 
 * @param {*} blocks 
 * @param {*} roles 
 * @param {*} groupNr 
 * @param {*} topics 
 */
function Student(first, index, prefs = [], blocks = [], roles = [], groupNr, topics = []) {
    this.firstName = first;
    this.index = index;
    this.prefs = prefs;
    this.blocks = blocks;
    this.roles = roles;
    this.groupNr = groupNr;
    this.topics = topics;
}

/**
 * Creates the object Group
 * @param {*} students 
 * @param {*} isFull 
 */
  function Group(students = [], isFull) {
    this.students = students;
    this.isFull = isFull;
}

/**
 * Creates a preferenceMatrix consisting of
 * each student's preference for the other students
 * @param {*} students 
 * @returns a 2D-array (effectively a matrix) of the students preferences 
 */
function preferenceMatrix (students) {
//initilize step of the function
const numStudents = students.length;
let preferenceMatrix = new Array(numStudents);
for (let i = 0; i < numStudents; i++) {
    preferenceMatrix[i] = new Array(numStudents);
}

//Loops through all rows in the matrix
rowLoop:
for (let row = 0; row < numStudents; row++) {
    //A students preference to themselves is set to 0
    preferenceMatrix[row][row] = 0;

    //Loops through all columns starting from the
    //calculations that have not been calculated yet 
    columnLoop:
    for (let col = row+1; col < numStudents; col++) {
        let prefScore = 0;
        //Calculate the prefScore, consisting of: 
        //  student A's preference to student B  and 
        //  student B's preference to student A 
        prefScore = helper.prefCheck(students[row], students[col], numStudents) + helper.prefCheck(students[col], students[row], numStudents)
         
        //Check for topics
        let commonTopics = true
        //Loops through student A's topics and checking for a match with student B.
        //If a match occur, they have at least 1 common topic and the loop stops
        if(students[row].topics.length > 0 && students[col].topics.length > 0){
            commonTopics = false;
            for (let topic = 0; topic < students[row].topics.length; topic++) {
                if (students[col].topics.includes(students[row].topics[topic])) {
                    commonTopics = true;
                    break;
                }
            }
        }

        //In case both students does not have any common topics
        //the prefScore will be raised with the number of students
        if (!commonTopics) {
            prefScore += numStudents;
        }

      //The prefScore is assigned to both indexes in the matrix
        preferenceMatrix[row][col] = prefScore;
        preferenceMatrix[col][row] = prefScore;
    }
}
return preferenceMatrix;
}



function prefGroups (students, matrix, groupSize) {  
    const groupNumber = Math.ceil(students.length/groupSize);
    
    let smallerGroups = 0;
    if ((students.length % groupSize) != 0) {

        smallerGroups = groupSize - (students.length % groupSize);
        while (smallerGroups > groupNumber) {
            groupSize -= Math.floor(smallerGroups/groupNumber);
            smallerGroups = groupSize - (students.length % groupSize);
        }
    }

    let groups = []; 
    for (let i = 0; i < groupNumber; i++) {
        let group = new Group (new Array(2),false)
        groups.push(group)
    }
    
    let j = 0;
    for (let groupNum = 0; groupNum < groupNumber; groupNum++) {
        while (students[j].groupNr != -1) {
            j++;
        }
        groups[groupNum].students[0] = students[j];
        students[j].groupNr = groupNum;
        //Clones the array instead of creating a reference
        let sortedStudentToStudentsPrefs = matrix[j].slice();
        //Sorts preference values in increasing order
        sortedStudentToStudentsPrefs.sort((a, b) =>(a - b)); 
        
        let a = 1;
        let matrixIndex = -1;
        do {            
            if (sortedStudentToStudentsPrefs[a] != sortedStudentToStudentsPrefs[a-1]) {
                matrixIndex = -1;
            }
            //a gets assigned the indexOf the lowest preference value.
            //If the student is in a group the IndexOf searches for the next value
            //a + 1 allows to find the next student with same preference value in the matrix[j]
            matrixIndex = matrix[j].indexOf(sortedStudentToStudentsPrefs[a], matrixIndex + 1);            
            a++;
        } while (students[matrixIndex].groupNr != -1)
        
        groups[groupNum].students[1] = students[matrixIndex];
        students[matrixIndex].groupNr = groupNum;
    }

    let studentToGroupsPref = [];
    for (let x = groupNumber; x < students.length; x++) {
        if (students[x].groupNr != -1) {
            continue;
        }
        let groupNum = 0;
        //variable a is used to keep track of number of full groups encountered during loop and
        //finally to find the index of the group with the lowest preference score among the groups that are not full
        let a = 0;

        //initialize studentToGroupsPref to keep track of currents students preference score to the current group
        studentToGroupsPref = new Array(groupNumber);

        for (groupNum; groupNum < groupNumber; groupNum++) {
            if (groups[groupNum].isFull) {
                studentToGroupsPref[groupNum] = 0;
                a++;
                continue;
            }
            
            studentToGroupsPref[groupNum] = 0;
            let j = 0;

            for (j; j < groupSize; j++) {
                if (groups[groupNum].students[j] == undefined) {
                    break;
                }
                studentToGroupsPref[groupNum] += helper.findPrefSum(students[x], groups[groupNum].students[j], matrix);
            }
            //divide by number of students in order to calculate the average preference score
            studentToGroupsPref[groupNum] /= j;
        } 
        //Creates an array without references in order to sort preference values
        let sortedStudentToGroupsPref = studentToGroupsPref.slice();
        //Sorts preference values in increasing order
        sortedStudentToGroupsPref.sort((a, b) =>(a - b)); 
        //sets the desired groupNum for the current student to the group with least preference score
        //meaning this group is the one for this student where they have better preference for each other
        groupNum = studentToGroupsPref.indexOf(sortedStudentToGroupsPref[a]);

        groups[groupNum].students.push(students[x]);
        students[x].groupNr = groupNum;
        if (groups[groupNum].students.length == groupSize || (groupNum >= groupNumber - smallerGroups && groups[groupNum].students.length == groupSize - 1)) {
            groups[groupNum].isFull = true;
        }
    }
    return groups;
}

/**
 * This function takes a student (the origin) and finds the best possible swap between a set of groups
 * It compares the student to every other student in every other group
 * If certain swaps make the number of groups above minimum diversity bigger, make one of those swaps
 * If certain swaps make the number of groups above minimum diversity bigger, make one of those swaps
 * Else, make the swap that doesn't decrease the diversity while still lowering the pref number as much as possible
 * @param {*} origin 
 * @param {*} groups 
 * @param {*} minDiversity 
 * @param {*} students 
 * @param {*} matrix 
 * @returns the group and index of the person that should be swapped
 */
function swapCheck(origin, groups, minDiversity, students, matrix){
    let originGroup = groups[origin.groupNr];
    let originIndex = originGroup.students.indexOf(origin);
    let prefDelta = new Array(students.length);
    prefDelta[origin.index] = 1
    let divImprovements = new Array(students.length).fill(false);
    //Initialize some 2-element arrays.
    //The first element is for the origin group and the second element is for the new group.
    let diverseOld = [false, false];
    let diverseNew = [false, false];
    diverseOld[0] = helper.groupDiversityCheck(originGroup, minDiversity);
    let prefAvgOld = [0, 0];
    let prefAvgNew = [0, 0];
    prefAvgOld[0] += helper.groupPrefAvg(origin, originGroup, matrix);
    //This loop goes through every group
    for(let i in groups){
        diverseOld[1] = helper.groupDiversityCheck(groups[i], minDiversity)
        //If this is the origin's group, no swaps need to be checked
        if(originGroup == groups[i]){
            continue;
        }
        //Now to through all students to check what a swap would do
        for(j in groups[i].students){
            let target = groups[i].students[j]
            prefAvgOld[1] = helper.groupPrefAvg(target, groups[i], matrix)
            helper.swapStudents(originGroup, originIndex, groups[i], j);
            diverseNew[0] = helper.groupDiversityCheck(originGroup, minDiversity)
            diverseNew[1] = helper.groupDiversityCheck(groups[i], minDiversity)
            //If the number of diverse groups is not decreased by the swap, calculate the preference delta
            let diversityDelta = diverseNew[0] + diverseNew[1] - diverseOld[0] - diverseOld[1];
            if(diversityDelta > 0){
                divImprovements[target.index] = true
            }
            if(diversityDelta >= 0){
                //The preference delta is simply the difference in average preference for the two groups
                prefAvgNew[0] = helper.groupPrefAvg(target, originGroup, matrix);
                prefAvgNew[1] = helper.groupPrefAvg(origin, groups[i], matrix);
                prefDelta[target.index] = prefAvgNew[0] + prefAvgNew[1] - prefAvgOld[0] - prefAvgOld[1];
            }
            //If the diversity will get worse from this swap, set prefDelta to 0, indicating no swap
            else{
                prefDelta[target.index] = 0;
            }
            helper.swapStudents(originGroup, originIndex, groups[i], j);
        }
    }
    //If no swaps can increase the number of diverse groups, simply return the best swap
    if(divImprovements.indexOf(true) == -1){
        let bestSwap = helper.findMin(prefDelta);
        //If the best swap does not improve the pref satisfaction (ie. is not negative), return 0
        if(prefDelta[bestSwap] >= 0)
            return -1;
        else 
            return bestSwap;
    }
    //If there exist swaps that increase the number of diverse groups, find the best of these swaps and return it
    else{
        return helper.findMinSpace(prefDelta, divImprovements);
    }
}


//This hill climbing algorithm takes the following input
//An array of students
//An array of groups containing only these students
//A minimum diversity as a fraction
//A preference matrix
//First, it calls checkMinDiversity to find how many groups are below it
//Then, it continuously calls swapCheck to ensure minDiversity is reached as far as possible
//Then, it continues to call swapCheck until no improving swaps can be made
//It also terminates after a large number of iterations
/**
 * This hill climbing algorithm takes the following input
 * @param {*} students 
 * @param {*} groups 
 * @param {*} minDiversity 
 * @param {*} matrix 
 * @param {*} maxIterations 
 * @returns 
 */
function hillClimb(students, groups, minDiversity, matrix, maxIterations){
    let homogenousGroups = helper.checkMinDiversity(groups, minDiversity);
    //If there exist groups that do not fulfill min diversity, start with those
    if (homogenousGroups.length > 0){
        //Call swapCheck on each student in these groups
        for(let i in homogenousGroups){
            for(let j in homogenousGroups[i].students){
                let targetPosition = swapCheck(homogenousGroups[i].students[j], groups, minDiversity, students, matrix);
                //Only swap if there is a valid target
                if(targetPosition >= 0){
                    let originGroup = groups[groups.indexOf(homogenousGroups[i])]
                    let target = students[targetPosition]
                    let targetGroup = groups[target.groupNr];
                    helper.swapStudents(originGroup, j, targetGroup, targetGroup.students.indexOf(target));
                }
            }
        }
    }                
    let swapped = true
    let iterations = 0
    //Now loop through all the students, calling swapCheck
    //Keep looping until not a single improving swap can be made
    //max iterations will be some variable that makes the program terminate in case it runs too long
    while(swapped == true && iterations <= maxIterations){
        swapped = false;
        iterations++;
        for(let i in groups){
            for(let j in groups[i].students){
                let targetIndex = swapCheck(groups[i].students[j], groups, minDiversity, students, matrix)
                if(targetIndex >= 0){
                    let target = students[targetIndex]
                    let targetGroup = groups[target.groupNr];
                    helper.swapStudents(groups[i], j, targetGroup, targetGroup.students.indexOf(target));
                    swapped = true;
                }
            }
        }
    }
    return groups
}

/**
 * This function will return a float representing the minimum diversity for this group formation
 * @param {students } 
 * @param {groupSize } 
 * @returns diversityMin
 */
function findMinDiversity(students, groupSize){
    let groupNumber = Math.ceil(students.length/groupSize);
    //If the students cannot be evenly divided, there have to be a number of smaller groups
    let smallerGroups = 0;
    if(students.length % groupSize != 0){
        smallerGroups = groupSize - (students.length % groupSize)
     }
    //smallGroupSize = ceiling(smallerGroups/groupNumber)
        while(smallerGroups > groupNumber){
            groupSize -= Math.floor(smallerGroups/groupNumber)
            smallerGroups = groupSize - (students.length % groupSize)
        }
    let groups = [];
    for(let i = 0; i < groupNumber; i++){
        let newGroup = new Group (new Array(),false);
        groups.push(newGroup);
    }
    let overlap = new Array(groupNumber);
    //The first student in the first group, since order does not matter
    groups[0].students[0] = students[0];
    //Looping through each student to put them into groups, labelling loops to be able to break loops properly
    studentLoop: for(let student = 1; student < students.length; student++){
        //Looping through the groups to compare to current student 
        groupLoop: for(let i in groups){
            if(groups[i].students.length == 0){
                groups[i].students.push(students[student]);
                continue studentLoop;
            }
            if(groups[i].isFull == true){
                overlap[i] = -1;
                continue;
            }
            overlap[i] = 0;
            compareLoop: for(let j in groups[i].students){
                //Calculate the overlap between current student and group until a space is empty
                overlap[i] += helper.roleCheck(students[student], groups[i].students[j])
                    if(groups[i].students.length < j){
                        //If overlap is 0, student is placed into group
                        //If student is placed into a group, break so that the student loop continues
                        //Else, break so that the next loop is checked
                        if(overlap[i] == 0){
                            groups[i].push(students[student]);
                            break groupLoop;
                        }
                        break;
                    }
            }
        }
        let i = helper.findMinPos(overlap);
        groups[i].students.push(students[student]);
        //If the number of students in the group is equal to the group size, or 1 smaller if the group is part of the last smaller groups, it becomes full
        if(groups[i].students.length >= groupSize ||
          (i > groupNumber - smallerGroups && groups[i].students.length == groupSize - 1))
            groups[i].isFull = true
    }
    //Finding the minimum diversity, meaning the number of unique roles in a group divided by the total number of roles
    let diversityMin = helper.checkRoleDiversity(groups[0].students, roleNumber)
    for(i = 1; i < groups.length; i++){
        let diversity = helper.checkRoleDiversity(groups[i].students, roleNumber)
        if(diversity < diversityMin){
            diversityMin = diversity
        }
    }
    return diversityMin;
}


//This function calls the parts of the algorithm in the correct order to generate groups from students
//It takes an array of student objects and a desired group size
//It loops through the algorithm until max seconds has been reached
//Meanwhile, it compares each result and in the end returns the one with the highest diversity and satisfaction percentage
/**
 * This function calls the parts of the algorithm in the correct order to generate groups from students
 * @param {*} students 
 * @param {*} groupSize 
 * @param {*} maxSeconds 
 * @returns 
 */
function masterAlgorithm(students, groupSize, maxSeconds){
    helper.indexStudents(students);
    let matrix = preferenceMatrix(students);
    let minDiversity = findMinDiversity(students, groupSize);
    /*if(roleNumber > 0){
        minDiversity = findMinDiversity(students, groupSize);
    }
    else{
         minDiversity = 0;
    }*/
    let time = Date.now();
    let bestAvgPref = 0;
    let bestAvgDiversity = 0;
    let finalGroups = [];
    while(Date.now() - time < maxSeconds * 1000){
        //Each students groupNr has to be reset for each new group formation since prefGroups assumes students are not in a group
        for(let student of students){
            student.groupNr = -1;
        }
        helper.shuffleArray(students);
        students = helper.indexStudents(students);
        let matrix = preferenceMatrix(students);
        let groups = prefGroups(students, matrix, groupSize);
        groups = hillClimb(students, groups, minDiversity, matrix, maxIterations)
        //Loops through the groups and finds their total preference percentage and diversity percentage
        let totalDiverse = 0
        let totalPercent = 0
        //This loop computes the variables to be compared in order to find the optimal values for this run
        for(let i in groups){
            let prefSum = helper.groupPrefSum(groups[i].students, matrix);
            let percent = helper.prefSatisfactionPercent(prefSum, StudentNum, groups[i].students.length);
            totalDiverse += helper.groupDiversityCheck(groups[i],minDiversity)
            totalPercent += percent;
        }
        let avgPref = totalPercent/Math.ceil(StudentNum/groupSize);
        let avgDiversity = totalDiverse/Math.ceil(StudentNum/groupSize);
        if(avgDiversity >= bestAvgDiversity && avgPref >= bestAvgPref){
            finalGroups = groups;
            bestAvgDiversity = avgDiversity;
            bestAvgPref = avgPref;
        }
    }
    return finalGroups
}


module.exports = {Student, Group, preferenceMatrix, prefGroups, hillClimb}