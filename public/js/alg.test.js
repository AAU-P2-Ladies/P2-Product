
const helper = require('./algHelpers.js');
const main = require('./algorithm.js');
//student: name, index, prefs, blocks, roles, groupNr, topics
let student0 = new main.Student("Kamilla", 0, [3,4,2], [5], [2,4,0], 0, []);
let student1 = new main.Student("Sina",    1, [2,0,5], [2], [1,2],   0, [0,5]);
let student2 = new main.Student("Allan",   2, [1,3,4], [],  [8,3,1], 1, [4,5]);
let student3 = new main.Student("Carmen",  3, [5,4],   [],  [2,4,5], 1, []);
let student4 = new main.Student("Mere Te", 4, [0,1,2], [],  [4,6,8], 2, [2,4]);
let student5 = new main.Student("Nicolaj", 5, [4,3],   [0], [1,0,3], 2, []);
let students = [student0, student1, student2, student3, student4, student5];
let groups = [];
for (let i = 0; i < 3; i++) {
    let group = new main.Group (new Array(2),false);
    groups.push(group);
}
groups[0].students[0] = student0;
groups[0].students[1] = student1;
groups[1].students[0] = student2;
groups[1].students[1] = student3;
groups[2].students[0] = student4;
groups[2].students[1] = student5;

describe('indexStudents', () => {
    test('should give index to students object', () => {

        expect(helper.indexStudents(students)[0].index).toEqual(0);
        expect(helper.indexStudents(students)[1].index).toEqual(1);
        expect(helper.indexStudents(students)[2].index).toEqual(2);
        expect(helper.indexStudents(students)[3].index).toEqual(3);
        expect(helper.indexStudents(students)[4].index).toEqual(4);
        expect(helper.indexStudents(students)[5].index).toEqual(5);

    })
})

describe('swapStudents', () => {
    test('the objects should have all their values except for the group value swapped', () => {
        let oldStudent1 = groups[0].students[1];
        let group1 = 0;

        helper.swapStudents(groups[0], 1, groups[2], 1);

        let newStudent1 = groups[0].students[1];
        let newStudent5 = groups[2].students[1];

        expect(oldStudent1.firstName).toEqual(newStudent5.firstName);
        expect(newStudent1.groupNr).toEqual(group1);
        helper.swapStudents(groups[0], 1, groups[2], 1);
    })
})

describe('prefCheck', () => {
    test('It has to return the position of student2 in student1s preferences', () => {
        expect(helper.prefCheck(student0, student3, students.length)).toEqual(1);
    })
    test('If student2 is not in student1s preferences, return the number of students divided by 2', () => {
        expect(helper.prefCheck(student3, student0, students.length)).toEqual(3);
    })
    test('If student2 is in student1s blocks, return the number of students', () => {
        expect(helper.prefCheck(student0, student5, students.length)).toEqual(6);
    })
})



describe('preferenceMatrix', () => {
    test('Each student has to be 0 with themselves', () => {
        let matrix = main.preferenceMatrix(students);
        for(let i in students){
            expect(matrix[i][i]).toEqual(0);
        }
    })
    test('The matrix has to be symmetrical', () => {
        let matrix = main.preferenceMatrix(students);
        for(let i in students){
            for(let j = i; j < students.length; j++){
                expect(matrix[i][j]).toEqual(matrix[j][i]);
            }
        }
    })
    test('An entry in the matrix has to correspond to the preference number of two students', () => {
        let matrix = main.preferenceMatrix(students);
        expect(matrix[0][3]).toEqual(3 + 1);
        expect(matrix[2][4]).toEqual(3 + 3);
    })
})


describe('checkRoleDiversity', () => {
    test('should output the percentage of role in group that is unique', () => {
        expect(helper.checkRoleDiversity(groups[0].students, 9)).toEqual(4/5);
        expect(helper.checkRoleDiversity(groups[1].students, 9)).toEqual(6/6);
        expect(helper.checkRoleDiversity(groups[2].students, 9)).toEqual(6/6);
    })
})

describe('findCommonTopic', () => {
    test('should return one of the topics with most occurences in a group', () =>{
        expect(helper.findCommonTopic(groups[0])).toEqual(5);
    })
})

