//let startTime = performance.now()

//Creates the object Student
function Student(first, index, prefs = [], blocks = [], roles = [], group_nr, topics = []) {
    this.firstName = first;
    this.index = index;
    this.prefs = prefs;
    this.blocks = blocks;
    this.roles = roles;
    this.group_nr = group_nr;
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
let StudentNum = 50;
let group_size = 7;

//Initilize the student arrays with StudentNum amount of students 
let students = [];
for (let s = 0;s<StudentNum;s++) {
    let student0 = new Student(["Student "+s], 0, getRandomInts(StudentNum,s,14), getRandomInts(StudentNum,s,2), [1, 5, 9], -1, getRandomInts(9,10,2))
    students.push(student0)
}

//Calculate whether the group member size adds up (groups can be made
// with the group member size but some groups may have one less group member)  
amountOfStudents = students.length;
updated_group_size = Math.ceil(amountOfStudents/Math.ceil(amountOfStudents/group_size));

//If it adds up. Updated_group_size will be the same as group_size
if (updated_group_size != group_size) {
    console.log("The group size does not add up. The new size is: ", updated_group_size)
}

//Updates the student array so each student have their index
indexStudents(students);

//Returns the preferenceMatrix
let matrix = preferenceMatrix(students);

//Returns the created groups
let groups = prefGroups(students, matrix, updated_group_size);

/**
* Creates a preferenceMatrix consisting of
* Each student's preference for the other students
*/
function preferenceMatrix (students) {
//initilize step of the function
const numStudents = students.length;
let preferenceMatrix = new Array(numStudents);
for (let initialize = 0; initialize < numStudents; initialize++) {
    preferenceMatrix[initialize] = new Array(numStudents);
}

//Loops through all rows in the matrix
row_loop:
for (let row = 0; row < numStudents; row++) {
    //A students preference to theirselves is set to 0
    preferenceMatrix[row][row] = 0;

    //Loops through all colums starting from the
    //calculations that have not been calculated yet 
    column_loop:
    for (let col = row+1; col < numStudents; col++) {
        let pref_score = 0;
        //Calculate the pref_score, consisting of: 
        //  student A's preference to student B  and 
        //  student B's preference to student A 
        pref_score = pref_check(students[row], students[col], numStudents) + pref_check(students[col], students[row], numStudents)
            

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
        //the pref_score will be raised with the number of students
        if (!commonTopics) {
            pref_score += numStudents;
        }

        //The pref_score is assigned to both indexes in the matrix
        preferenceMatrix[row][col] = pref_score;
        preferenceMatrix[col][row] = pref_score;
    }
}
return preferenceMatrix;
}

function indexStudents (students) {
//Loops through all students assigning their index number
for (let indexNum = 1; indexNum < students.length; indexNum++) {
    students[indexNum].index = indexNum;
}
return students
}

//findPrefSum is created to make the code more readable 
//Returns the preference value of Student1 and Student2
function findPrefSum (student1, student2, matrix) {
    return matrix[student1.index][student2.index]
}


function pref_check (student1, student2, student_number) {
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

function prefGroups (students, matrix, group_size) {  
    const group_number = Math.ceil(students.length/group_size);
    
    let smaller_groups = 0;
    if ((students.length % group_size) != 0) {

        smaller_groups = group_size - (students.length % group_size);
        while (smaller_groups > group_number) {
            group_size -= Math.floor(smaller_groups/group_number);
            smaller_groups = group_size - (students.length % group_size);
        }
    }

    let groups = []; 
    for (let initialize = 0; initialize < group_number; initialize++) {
        let group = new Group (new Array(2),false)
        groups.push(group)
    }
    
    let j = 0;
    for (let groupNum = 0; groupNum < group_number; groupNum++) {
        while (students[j].group_nr != -1) {
            j++;
        }
        groups[groupNum].students[0] = students[j];
        students[j].group_nr = groupNum;
        //Creates an array without references in order to sort preference values
        let sorted_studentToStudentsPrefs = matrix[j].slice();
        //Sorts preference values in increasing order
        sorted_studentToStudentsPrefs.sort((a, b) =>(a - b)); 
        
        let a = 1
        let matrixIndex = -1
        do {            
            if (sorted_studentToStudentsPrefs[a] != sorted_studentToStudentsPrefs[a-1]) {
                matrixIndex = -1
            }
            //k gets assigned the indexOf the lowest preference value.
            //If the student is in a group the IndexOf searches for the next value
            //k + 1 allows to find the next student with same preference value in the matrix[j]
            matrixIndex = matrix[j].indexOf(sorted_studentToStudentsPrefs[a], matrixIndex + 1);            
            a++
        } while (students[matrixIndex].group_nr != -1)
        
        groups[groupNum].students[1] = students[matrixIndex]
        students[matrixIndex].group_nr = groupNum
    }

    let studentToGroupsPref = [];
    for (let x = group_number; x < students.length; x++) {
        if (students[x].group_nr != -1) {
            continue;
        }
        let groupNum = 0
        let a = 0
        studentToGroupsPref = new Array(group_number)

        for (groupNum; groupNum < group_number; groupNum++) {
            if (groups[groupNum].isFull) {
                studentToGroupsPref[groupNum] = 0;
                a++
                continue;
            }
            
            studentToGroupsPref[groupNum] = 0;
            let j = 0;

            for (j; j < group_size; j++) {
                if (groups[groupNum].students[j] == undefined) {
                    break;
                }
                studentToGroupsPref[groupNum] += findPrefSum(students[x], groups[groupNum].students[j], matrix);
            }
            studentToGroupsPref[groupNum] /= j;
        } 
        //Creates an array without references in order to sort preference values
        let sorted_studentToGroupsPref = studentToGroupsPref.slice();
        //Sorts preference values in increasing order
        sorted_studentToGroupsPref.sort((a, b) =>(a - b)); 
        groupNum = studentToGroupsPref.indexOf(sorted_studentToGroupsPref[a]);

        groups[groupNum].students.push(students[x]);
        students[x].group_nr = groupNum;
        if (groups[groupNum].students.length == group_size || (groupNum >= group_number - smaller_groups && groups[groupNum].students.length == group_size - 1)) {
            groups[groupNum].isFull = true;
        }
    }


    /**
     * Only purpose is to print the groups for debugging.
     * Can be deleted
     */
    for (let i = 0; i < group_number; i++) {
        console.log("Group:",i)
        for (let j = 0; j < group_size; j++) {
            if (groups[i].students[j] != undefined) {
                console.log(groups[i].students[j].firstName,groups[i].students[j].group_nr)
            }
        }    
    }
     /**
     * 
     */

    return groups
}


//let endTime = performance.now()

