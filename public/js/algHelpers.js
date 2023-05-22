function indexStudents (students) {
    //Loops through all students assigning their index number
    for (let indexNum = 0; indexNum < students.length; indexNum++) {
        students[indexNum].index = indexNum;
        students[indexNum].groupNr = -1;
    }
    return students;
}



function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


//findPrefSum is created to make the code more readable 
//Returns the preference value of Student1 and Student2
function findPrefSum (student1, student2, matrix) {
    return matrix[student1.index][student2.index];
}


//This function checks two students preference for each other, if not blocked and no preference for each other it sets it to number of students divided by 2
function prefCheck (student1, student2, studentNumber) {
    let preferenceIndex = student1.prefs.indexOf(student2.name);
    if (preferenceIndex >= 0) {
        return preferenceIndex + 1;
    }
    
    let blockIndex = student1.blocks.indexOf(student2.name);
    if(blockIndex >= 0) {
        return studentNumber;
    } else {
        return Math.ceil((studentNumber)/2);
    }
}


//This function takes an array of students and a preference matrix
//It returns the sum of each students' preference for each other, with no overlap
function groupPrefSum(students, matrix){
    let prefSum = 0
    for(let i = 0; i < students.length; i++){
        for(let j = i; j < students.length; j++){
            prefSum += findPrefSum(students[i], students[j], matrix)
        }
    }
    return prefSum;
}


//This function takes a group and a minimum diversity
//It returns true if the group's diversity is above or equal to the minimum
//False otherwise
function groupDiversityCheck(group, minDiversity){
    if(checkRoleDiversity(group.students) >= minDiversity){
        return true;
    }
    else{
        return false;
    }
}


//This function loops through each role a student has
//Maximum for loop iterations would be the number of roles squared
//In the case of Belbin roles, this means an absolute maximum of 36 iterations
function roleCheck(student1, student2){
    //If one "student" is an empty space, no overlap
    if(student1 == undefined || student2 == undefined){
        return 0;
    }
    sum = 0;
    for(i in student1.roles){
        for(j in student2.roles)
            if(student1.roles[i] == student2.roles[j]){
                sum += 1;
            }
        }
    return sum;

}

//This function takes an array of groups and a minimum diversity
//It returns a new array of groups, including only those that are below the required diversity
function checkMinDiversity(groups, minDiversity){
    let homogenousGroups = [];
    for (let group of groups){
        //If the group's diversity is below the minimum, add to homogenous groups
        if(!groupDiversityCheck(group, minDiversity)){
            homogenousGroups.push(group);
        }
    }
    return homogenousGroups;
}



//This function takes an array of students (preferably from a group)
//It returns the fraction of roles that are unique
function checkRoleDiversity(students, roleNumber){
    let uniqueRoles = [];
    let totalRoles = 0;
    //Going through every student
    for(let student of students){
        //For each student, going through their roles
        for(let i in student.roles){
            //If the role is not in unique roles, add it to unique roles
            if(uniqueRoles.indexOf(student.roles[i]) == -1){
                uniqueRoles.push(student.roles[i]);
            }
            //cap number of total roles at max amount of roles available
            if(totalRoles < roleNumber){
                totalRoles++;
            }
            }
    }
    if (totalRoles == 0){
        return 1
    }
    else {
        return uniqueRoles.length/totalRoles;
    }
}


//This function takes a student and a group as input
//It iterates through the group and sums up the preference numbers between student and 
function groupPrefAvg(student, group, matrix){
    let prefSum = 0;
    for (let otherStudent of group.students){
        prefSum += findPrefSum(student, otherStudent, matrix);
    }
    return prefSum/group.students.length;
}


//This helper function returns the factorial of a number
function fact(n){
    if(n <= 1){
        return 1
    }
    else{
        return fact(n-1)*n
    }
}


//This helper function returns the binomial coefficient of two numbers
//It is used to calculate the possible combinations when drawing an amount of numbers out of a total amount of numbers
function binomial(total, drawn){
    return fact(total)/(fact(drawn)*fact(total-drawn));
}

//This function takes a group's preferenceSum, size and amount of students
//It returns a percentage showing how close the group is to the minimum prefSum from the maximum prefSum
function prefSatisfactionPercent(prefSum, studentNum, size){
    let worst = binomial(size, 2)*studentNum;
    let best = size*(size-1)*(size-1);
    let percentage = (worst - prefSum)/(worst - best);
    return percentage;
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

//This function finds the minimum in an array while excluding certain indexes
//As input, it takes an array and another array containing booleans
//It excludes every index in the array where the boolean is false
//It returns the minimum from the first array, but only if the corresponding booleans is true
//It can be used to find the swap that does not inflict minimum diversity of groups if such a swap exists
function findMinSpace(array, boolean){
    let i = 0;
    let key = -1;
    while(key == -1){
        if(boolean[i] == true)
            key = i;
        i++;
    }
    for(i in array){
        if(array[i] < array[key] && boolean[i] == true)
        key = i;
    }
    return key;
}

//This function finds the minimum positive element in an array
//If there are no positive elements, returns -1
function findMinPos(array){
    let i = 0;
    let key = -1;
    while (key == -1){
        if (array[i] > 0){
            key = i;
        }
        i++;
    }
    while(i <= array.length){
        if (array[i] < array[key] && array[i] > 0){
            key = i;
        }
        i++;
    }
    return key;
    }

/**
 * This function finds the element with most occurences in an array
 * and count the amount of occurences
 * @param {arr} - It takes any array that can be sorted as input
 * @returns - It returns the element with most occurences
 */
function findMostOccuring(arr){
    //Sort the array with the compare function checking the amount of occurences of each element
    //Pop and return the last element, which will be (one of) the elements with the most occurences
    return arr.sort((a,b) =>
            arr.filter(v => v===a).length
            - arr.filter(v => v===b).length)
            .pop();
}

function findCommonTopic(group){
    let topics = [];
    for(let i in group.students){
        for(let j in group.students[i].topics){
            topics.push(group.students[i].topics[j]);
        }
    }
    console.log(topics)
    if(topics){
        return findMostOccuring(topics);
    }
    else{
        return "Any"
    }
}


module.exports = {indexStudents, shuffleArray, findPrefSum, prefCheck, groupPrefSum, groupDiversityCheck, roleCheck, checkMinDiversity, checkRoleDiversity, groupPrefAvg, prefSatisfactionPercent, swapStudents, findMin, findMinPos, findMinSpace, findCommonTopic}