//let startTime = performance.now()

const role_number = 9
const maxIterations = 100
const minDiversity = 0.75

//Creates the object Student
function Student(first, index, prefs = [], blocks = [], roles = [], groupNr, topics = []) {
    this.firstName = first;
    this.index = index;
    this.prefs = prefs;
    this.blocks = blocks;
    this.roles = roles;
    this.groupNr = groupNr;
    this.topics = topics;
}

//Creates the object Group
  function Group(students = [], isFull) {
    this.students = students;
    this.isFull = isFull;
}

/**
* For debugging
* Only purpose is to randomize the students preference to eachother
* Can be deleted
*/
function getRandomInts(max,block,numbers){
    let array = []
    while (array.length < numbers){
        let a = Math.floor(Math.random() * (max-1))
        if (a >= block){
            a++
        }
        if (array.indexOf(a) == -1){
            array.push(a)
        }
    }
    return array
}
/**
 * 
 */
  
//Define values that should be given by the website
let min = 0;
let StudentNum = 150;
let groupSize = 7;

//Initilize the student arrays with StudentNum amount of students 
let students = [];
for (let s = 0;s<StudentNum;s++) {
    let student0 = new Student(["Student "+s], 0, getRandomInts(StudentNum,s,14), getRandomInts(StudentNum,s,2), getRandomInts(8,-1,3), -1, getRandomInts(9,10,2))
    students.push(student0)
}

//Calculate whether the group member size adds up (groups can be made
// with the group member size but some groups may have one less group member)  
amountOfStudents = students.length;
updatedGroupSize = Math.ceil(amountOfStudents/Math.ceil(amountOfStudents/groupSize));

//If it adds up. updatedGroupSize will be the same as groupSize
if (updatedGroupSize != groupSize) {
    console.log("The group size does not add up. The new size is: ", updatedGroupSize)
}

//Updates the student array so each student have their index
indexStudents(students);

//Returns the preferenceMatrix
let matrix = preferenceMatrix(students);

//Returns the created groups
let groups = prefGroups(students, matrix, updatedGroupSize);

/**
* Creates a preferenceMatrix consisting of
* Each student's preference for the other students
*/
function preferenceMatrix (students) {
//initilize step of the function
const numStudents = students.length;
let preferenceMatrix = new Array(numStudents);
for (let i = 0; i < numStudents; i++) {
    preferenceMatrix[i] = new Array(numStudents);
}

//Loops through all rows in the matrix
row_loop:
for (let row = 0; row < numStudents; row++) {
    //A students preference to theirselves is set to 0
    preferenceMatrix[row][row] = 0;

    //Loops through all colums starting from the
    //calculations that have not been calculated yet 
    column_loop:
    for (let col = row; col < numStudents; col++) {
        let prefScore = 0;
        //Calculate the prefScore, consisting of: 
        //  student A's preference to student B  and 
        //  student B's preference to student A 
        prefScore = prefCheck(students[row], students[col], numStudents) + prefCheck(students[col], students[row], numStudents)
            

/**
 * Check for topics
 */


        let commonTopics = false;
        //Loops through student A's topics and checking for a match with student B.
        //If a match occur, they have at least 1 common topic and the loop stops
        for (let topic = 0; topic < students[row].topics.length; topic++) {
            if (students[col].topics.includes(students[row].topics[topic])) {
                commonTopics = true;
                break;
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

function indexStudents (students) {
//Loops through all students assigning their index number
for (let indexNum = 1; indexNum < students.length; indexNum++) {
    students[indexNum].index = indexNum;
}
return students;
}

//findPrefSum is created to make the code more readable 
//Returns the preference value of Student1 and Student2
function findPrefSum (student1, student2, matrix) {
    return matrix[student1.index][student2.index];
}


function prefCheck (student1, student2, student_number) {
    let preferenceIndex = student1.prefs.indexOf(student2.index);
    if (preferenceIndex >= 0) {
        return preferenceIndex + 1;
    }

    let blockIndex = student1.blocks.indexOf(student2.index);
    if (blockIndex >= 0) {
        return student_number
    } else {
        return Math.ceil((student1.prefs.length+student_number-student1.blocks.length)/2)
    }
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
        //Creates an array without references in order to sort preference values
        let sortedStudentToStudentsPrefs = matrix[j].slice();
        //Sorts preference values in increasing order
        sortedStudentToStudentsPrefs.sort((a, b) =>(a - b)); 
        
        let a = 1
        let matrixIndex = -1
        do {            
            if (sortedStudentToStudentsPrefs[a] != sortedStudentToStudentsPrefs[a-1]) {
                matrixIndex = -1
            }
            //k gets assigned the indexOf the lowest preference value.
            //If the student is in a group the IndexOf searches for the next value
            //k + 1 allows to find the next student with same preference value in the matrix[j]
            matrixIndex = matrix[j].indexOf(sortedStudentToStudentsPrefs[a], matrixIndex + 1);            
            a++
        } while (students[matrixIndex].groupNr != -1)
        
        groups[groupNum].students[1] = students[matrixIndex]
        students[matrixIndex].groupNr = groupNum
    }

    let studentToGroupsPref = [];
    for (let x = groupNumber; x < students.length; x++) {
        if (students[x].groupNr != -1) {
            continue;
        }
        let groupNum = 0
        let a = 0
        studentToGroupsPref = new Array(groupNumber)

        for (groupNum; groupNum < groupNumber; groupNum++) {
            if (groups[groupNum].isFull) {
                studentToGroupsPref[groupNum] = 0;
                a++
                continue;
            }
            
            studentToGroupsPref[groupNum] = 0;
            let j = 0;

            for (j; j < groupSize; j++) {
                if (groups[groupNum].students[j] == undefined) {
                    break;
                }
                studentToGroupsPref[groupNum] += findPrefSum(students[x], groups[groupNum].students[j], matrix);
            }
            studentToGroupsPref[groupNum] /= j;
        } 
        //Creates an array without references in order to sort preference values
        let sortedStudentToGroupsPref = studentToGroupsPref.slice();
        //Sorts preference values in increasing order
        sortedStudentToGroupsPref.sort((a, b) =>(a - b)); 
        groupNum = studentToGroupsPref.indexOf(sortedStudentToGroupsPref[a]);

        groups[groupNum].students.push(students[x]);
        students[x].groupNr = groupNum;
        if (groups[groupNum].students.length == groupSize || (groupNum >= groupNumber - smallerGroups && groups[groupNum].students.length == groupSize - 1)) {
            groups[groupNum].isFull = true;
        }
    }


    /**
     * Only purpose is to print the groups for debugging.
     * Can be deleted
     */
    for (let i = 0; i < 1; i++) {
        console.log(" Initial group:",i)
        for (let j = 0; j < groupSize; j++) {
            if (groups[i].students[j] != undefined) {
                console.log(groups[i].students[j].firstName,groups[i].students[j].groupNr)
            }
        }    
    }
     /**
     * 
     */

    return groups
}




//let endTime = performance.now()

//This function takes an array of students (preferably from a group)
//It returns the fraction of roles that are unique
function check_role_diversity(students){
    let unique_roles = [];
    let total_roles = 0;
    //Going through every student
    for(let student of students){
        //For each student, going through their roles
        for(let i in student.roles){
        //If the role is not in unique roles, add it to unique roles
            if(unique_roles.indexOf(student.roles[i]) == -1){
                unique_roles.push(student.roles[i]);
            }
            //cap number of total roles at max amount of roles available
            if(total_roles < role_number){
                total_roles++;
            }
            }
    }
    return unique_roles.length/total_roles;
}

//This function takes a group and a minimum diversity
//It returns true if the group's diversity is above or equal to the minimum
//False otherwise
function groupDiversityCheck(group, minDiversity){
    if(check_role_diversity(group.students) >= minDiversity){
        return true;
    }
    else{
        return false;
    }
}

//This function takes an array of groups and a minimum diversity
//It returns a new array of groups, including only those that are below the required diversity
function checkMinDiversity(groups, minDiversity){
    let homogenousGroups = [];
    for (let group of groups){
        //If the group's diversity is below the minimum, add to homogenous groups
        if (!groupDiversityCheck(group, minDiversity)){
            homogenousGroups.push(group);
        }
    }
    return homogenousGroups;
}




//This function takes a student and a group as input
//It iterates through the group and sums up the preference numbers between student and 
function groupPrefAvg(student, group, matrix){
    pref_sum = 0;
    for (let other_student of group.students){
        pref_sum += findPrefSum(student, other_student, matrix);
    }
    return pref_sum/group.students.length;
}
//This helper function finds the swap that does not inflict minimum diversity of groups if such a swap exists
//As input, it takes an array and another array containing booleans
//It returns the minimum from the first array, but only if the corresponding booleans is true
function findMinSpace(array, boolean){
    let i = 1;
    let key = -1;
    while(key == -1){
        if(boolean[i] == true)
            key = i;
        i++;
    }
    for(i in array){
        if(groups[i] < array[key] && boolean[i] == true)
        key = i;
    }
    return key;
}
//Finds minimum value and returns index of it
function findMin(array){
    let key = 0;
    for(let i in array){
        if(array[i] < array[key]){
            key = i;
        }
    }
    return key;
}


//This helper function swaps two students in two groups
//Parameters are the groups and the indeces of the students to be swapped
//The function updates the group arrays with the swapped students and updates the swapped students groupNum attribute
function swapStudents(group1, student1, group2, student2){
    let temp = group1.students[student1].groupNr;
    group1.students[student1].groupNr = group2.students[student2].groupNr;
    group2.students[student2].groupNr = temp
    temp = group1.students[student1];
    group1.students[student1] = group2.students[student2];
    group2.students[student2] = temp;
}

//This function takes a student (the origin) and finds the best possible swap between a set of groups
//It compares the student to every other student in every other group
//If certain swaps make the number of groups above minimum diversity bigger, make one of those swaps
//Else, make the swap that doesn't decrease the diversity while still lowering the pref number as much as possible
//Returns the group and index of the person that should be swapped
function swapCheck(origin, groups, minDiversity, matrix){
    let originGroup = groups[origin.groupNr];
    let originIndex = originGroup.students.indexOf(origin);
    let prefDelta = new Array(students.length);
    prefDelta[origin.index] = 1
    let divImprovements = new Array(students.length).fill(false);
    //Initialize some 2-element arrays.
    //The first element is for the origin group and the second element is for the new group.
    let diverseOld = [false, false];
    let diverseNew = [false, false];
    diverseOld[0] = groupDiversityCheck(originGroup, minDiversity);
    let prefAvgOld = [0, 0];
    let prefAvgNew = [0, 0];
    prefAvgOld[0] += groupPrefAvg(origin, originGroup, matrix);
    //This loop goes through every group
    for(let i in groups){
        diverseOld[1] = groupDiversityCheck(groups[i], minDiversity)
        //If this is the origin's group, no swaps need to be checked
        if(originGroup == groups[i]){
            continue;
        }
        //Now to through all students to check what a swap would do
        for(j in groups[i].students){
            let target = groups[i].students[j]
            prefAvgOld[1] = groupPrefAvg(target, groups[i], matrix)
            swapStudents(originGroup, originIndex, groups[i], j);
            diverseNew[0] = groupDiversityCheck(originGroup, minDiversity)
            diverseNew[1] = groupDiversityCheck(groups[i], minDiversity)
            //If the number of diverse groups is not decreased by the swap, calculate the preference delta
            let diversityDelta = diverseNew[0] + diverseNew[1] - diverseOld[0] - diverseOld[1];
            if(diversityDelta > 0){
                divImprovements[target.index] = true
            }
            if(diversityDelta >= 0){
                //The preference delta is simply the difference in average preference for the two groups
                prefAvgNew[0] = groupPrefAvg(target, originGroup, matrix);
                prefAvgNew[1] = groupPrefAvg(origin, groups[i], matrix);
                prefDelta[target.index] = prefAvgNew[0] + prefAvgNew[1] - prefAvgOld[0] - prefAvgOld[1];
            }
            //If the diversity will get worse from this swap, set prefDelta to 0, indicating no swap
            else{
                prefDelta[target.index] = 0;
            }
            swapStudents(originGroup, originIndex, groups[i], j);
        }
    }
    //If no swaps can increase the number of diverse groups, simply return the best swap
    if(divImprovements.indexOf(true) == -1){
        let bestSwap = findMin(prefDelta);
        //If the best swap does not improve the pref satisfaction (ie. is not negative), return 0
        if(prefDelta[bestSwap] >= 0)
            return -1;
        else 
            return bestSwap;
    }
    //If there exist swaps that increase the number of diverse groups, find the best of these swaps and return it
    else{
        return findMinSpace(prefDelta, divImprovements);
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
function masterAlgorithm(students, groups, minDiversity, matrix, maxIterations){
    let homogenousGroups = checkMinDiversity(groups, minDiversity);
    //If there exist groups that do not fulfill min diversity, start with those
    if (homogenousGroups.length > 0){
        //Call swapCheck on each student in these groups
        for(let i in homogenousGroups){
            for(let j in homogenousGroups[i].students){
                let targetIndex = swapCheck(homogenousGroups[i].students[j], groups, minDiversity, matrix);
                //Only swap if there is a valid target
                if(targetIndex > 0){
                    let originGroup = groups[groups.indexOf(homogenousGroups[i])]
                    let target = students[targetIndex]
                    let targetGroup = groups[target.groupNr];
                    console.log("div swap: swapped student " + groups[i].students[j].index + " with " + target.index)
                    swapStudents(originGroup, j, targetGroup, targetGroup.students.indexOf(target));
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
        console.log("entered while loop")
        swapped = false;
        iterations++;
        for(let i in groups){
            for(let j in groups[i].students){
                let targetIndex = swapCheck(groups[i].students[j], groups, minDiversity, matrix)
                if(targetIndex > 0){
                    let target = students[targetIndex]
                    let targetGroup = groups[target.groupNr];
                    console.log("normal swap: swapped student " + groups[i].students[j].index + " with " + target.index)
                    swapStudents(groups[i], j, targetGroup, targetGroup.students.indexOf(target));
                    swapped = true;
                }
            }
        }
    }
    if(iterations == maxIterations){
        console.log("Reached max iterations, terminating")
    }
    else{
        console.log("No more swaps can be made, terminating")
    }
    return groups
}


//Below here is only for testing
console.log(masterAlgorithm(students, groups, minDiversity, matrix, maxIterations))

for (let i = 0; i < 1; i++) {
    console.log("groups after hill climbing:",i)
    for (let j = 0; j < groupSize; j++) {
        if (groups[i].students[j] != undefined) {
            console.log(groups[i].students[j].firstName,groups[i].students[j].groupNr)
        }
    }    
}