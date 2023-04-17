//let startTime = performance.now()

const role_number = 9

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
let StudentNum = 150;
let group_size = 7;

//Initilize the student arrays with StudentNum amount of students 
let students = [];
for (let s = 0;s<StudentNum;s++) {
    let student0 = new Student(["Student "+s], 0, getRandomInts(StudentNum,s,14), getRandomInts(StudentNum,s,2), getRandomInts(8,-1,3), -1, getRandomInts(9,10,2))
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
let groups = pref_groups(students, matrix, updated_group_size);

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
    for (let col = row; col < numStudents; col++) {
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
function find_pref_sum (student1, student2, matrix) {
    return matrix[student1.index][student2.index];
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

function pref_groups (students, matrix, group_size) {  
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
                studentToGroupsPref[groupNum] += find_pref_sum(students[x], groups[groupNum].students[j], matrix);
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
    for (let i = 0; i < 0; i++) {
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
function group_diversity_check(group, min_diversity){
    if(check_role_diversity(group.students) >= min_diversity){
        return true;
    }
    else{
        return false;
    }
}

//This function takes an array of groups and a minimum diversity
//It returns a new array of groups, including only those that are below the required diversity
function check_min_diversity(groups, min_diversity){
    let homogenous_groups = [];
    for (let group of groups){
        //If the group's diversity is below the minimum, add to homogenous groups
        if (!group_diversity_check(group, min_diversity)){
            homogenous_groups.push(group);
        }
    }
    return homogenous_groups;
}




//This function takes a student and a group as input
//It iterates through the group and sums up the preference numbers between student and 
function group_pref_avg(student, group, matrix){
    pref_sum = 0;
    for (let other_student of group.students){
        pref_sum += find_pref_sum(student, other_student, matrix);
    }
    return pref_sum/group.students.length;
}
//This helper function finds the swap that does not inflict minimum diversity of groups if such a swap exists
//As input, it takes an array and another array containing booleans
//It returns the minimum from the first array, but only if the corresponding booleans is true
function find_min_space(array, boolean){
    let i = 1;
    let key = 0;
    while(key == 0){
        if(boolean[i] == true)
            key = array[i];
        i++;
    }
    for(i in array){
        if(groups[i] < key && boolean[i] == true)
        key = array[i];
    }
    return key;
}

function swap_students(student1, student2){

}


//
function swap_check(origin, students, groups, min_diversity, matrix){

}

function master_algorithm(students, groups, min_diversity, matrix){

}

