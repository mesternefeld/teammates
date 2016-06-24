var studentEmailToTeamNameMap;
var teamNameToStudentEmailsMap;
var instructorEmails;
var studentEmails;
var teamNames;

$(document).ready(function() {
    initialiseCourseData();
    initialiseFeedbackPathsSpreadsheet();
});

function initialiseCourseData() {    
    studentEmailToTeamNameMap = $('#students-data').data('students');
    teamNameToStudentEmailsMap = [[]];
    studentEmails = [];
    teamNames = [];
    
    for (var studentEmail in studentEmailToTeamNameMap) {
        studentEmails.push(studentEmail);
        
        var teamName = studentEmailToTeamNameMap[studentEmail];
        if (!teamNames.includes(teamName)) {
            teamNames.push(teamName);
        }
        
        var studentEmailsList = teamNameToStudentEmailsMap[teamName];
        if (studentEmailsList == null) {
            studentEmailsList = [];
        }
        studentEmailsList.push(studentEmail);
        teamNameToStudentEmailsMap[teamName] = studentEmailsList;
    }
    
    instructorEmails = $('#instructors-data').data('instructors');
}

function generateFeedbackPathsSpreadsheet(questionNumber) {
    var container = $('#form_editquestion-' + questionNumber + ' .custom-feedback-paths-spreadsheet')[0];
    
    var data = populateFeedbackPathsData(questionNumber);
    var hot = new Handsontable(container, {
        data: data,
        minRows: 10,
        minCols: 4,
        minSpareRows: 1,
        minSpareCols: 1,
        rowHeaders: true,
        colHeaders: true,
        manualColumnResize: true,
        manualRowResize: true,
        stretchH: 'all'
    });
}

function initialiseFeedbackPathsSpreadsheet() {
    var numberOfQuestions = $('.form_question').length;
    for (var i = 1; i < numberOfQuestions; i++) {
        generateFeedbackPathsSpreadsheet(i);
    }
}

function populateFeedbackPathsData(questionNumber) {
    var giverType = $('#' + FEEDBACK_QUESTION_GIVERTYPE + '-' + questionNumber).val();
    var recipientType = $('#' + FEEDBACK_QUESTION_RECIPIENTTYPE + '-' + questionNumber).val();
    var numRecipientsType = $('#form_editquestion-' + questionNumber + ' input[name="' + FEEDBACK_QUESTION_NUMBEROFENTITIESTYPE + '"]:checked').val();
    var numRecipients;
    if (numRecipientsType === 'custom') {
        numRecipients = $('#' + FEEDBACK_QUESTION_NUMBEROFENTITIES + '-' + questionNumber).val();
    }

    var data;
    
    switch (giverType) {
    case 'SELF':
        data = populateFeedbackPathsDataForGiverAsSelf();
        break;
    case 'STUDENTS':
        data = populateFeedbackPathsDataForGiverAsStudents();
        break;
    case 'INSTRUCTORS':
        data = populateFeedbackPathsDataForGiverAsInstructors();
        break;
    case 'TEAMS':
        data = populateFeedbackPathsDataForGiverAsTeams();
        break;
    default:
        data = [[]];
    }
    
    switch (recipientType) {
    case 'SELF':
        data = populateFeedbackPathsDataForRecipientAsSelf(data);
        break;
    case 'STUDENTS':
        data = populateFeedbackPathsDataForRecipientAsStudents(data, parseInt(numRecipients));
        break;
    case 'INSTRUCTORS':
        data = populateFeedbackPathsDataForRecipientAsInstructors(data);
        break;
    case 'TEAMS':
        if (giverType === 'STUDENTS') {
            data = populateFeedbackPathsDataForGiverAsStudentsRecipientAsTeams(data, parseInt(numRecipients));   
        } else {
            data = populateFeedbackPathsDataForRecipientAsTeams(data, parseInt(numRecipients));
        }
        break;
    case 'OWN_TEAM':
        if (giverType === 'SELF' || giverType === 'INSTRUCTORS') {
            data = populateFeedbackPathsDataForGiverAsInstructorsRecipientAsOwnTeam(data);   
        } else if (giverType === 'STUDENTS') {
            data = populateFeedbackPathsDataForGiverAsStudentsRecipientAsOwnTeam(data);
        }
        break;
    case 'OWN_TEAM_MEMBERS':
        if (giverType === 'STUDENTS') {
            data = populateFeedbackPathsDataForGiverAsStudentsRecipientAsOwnTeamMembers(data);
        }
        break;
    case 'OWN_TEAM_MEMBERS_INCLUDING_SELF':
        if (giverType === 'STUDENTS') {
            data = populateFeedbackPathsDataForGiverAsStudentsRecipientAsOwnTeamMembersIncludingSelf(data);
        } else if (giverType === 'TEAMS') {
            data = populateFeedbackPathsDataForGiverAsTeamsRecipientAsOwnTeamMembersIncludingSelf(data);
        }
        break;
    case 'NONE':
        data = populateFeedbackPathsDataForRecipientAsNobodySpecific(data);
        break;
    default:
    }
    return data;
}

function populateFeedbackPathsDataForGiverAsSelf() {
    return [[$('#session-creator-data').data('session-creator')]];
}

function populateFeedbackPathsDataForGiverAsStudents() {
    var data = [[]];    
    for (var i = 0; i < studentEmails.length; i++) {
        data[i] = [];
        data[i][0] = studentEmails[i];
    }
    return data;
}

function populateFeedbackPathsDataForGiverAsInstructors() {
    var data = [[]];
    for (var i = 0; i < instructorEmails.length; i++) {
        data[i] = [];
        data[i][0] = instructorEmails[i];
    }
    return data;
}

function populateFeedbackPathsDataForGiverAsTeams() {
    var data = [[]];
    for (var i = 0; i < teamNames.length; i++) {
        data[i] = [];
        data[i][0] = teamNames[i];
    }
    return data;
}

function populateFeedbackPathsDataForRecipientAsSelf(data) {
    for (var i = 0; i < data.length; i++) {
        data[i].push(data[i][0]);
    }
    return data;
}

function populateFeedbackPathsDataForRecipientAsStudents(data, numRecipients) {
    return generateRandom3(data, studentEmails, numRecipients);
}

function populateFeedbackPathsDataForRecipientAsInstructors(data) {
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < instructorEmails.length; j++) {
            if (data[i][0] !== instructorEmails[j]) {
                data[i].push(instructorEmails[j]);
            }
        }
    }
    return data;
}
/*
function populateFeedbackPathsDataForGiverAsInstructorsRecipientAsTeams(data) {
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < teamNames.length; j++) {
            data[i].push(teamNames[j]);            
        }
    }
    return data;
}

function populateFeedbackPathsDataForGiverAsStudentsRecipientAsTeams(data) {
    for (var i = 0; i < data.length; i++) {
        var giverStudentEmail = data[i][0];
        for (var j = 0; j < teamNames.length; j++) {
            if (teamNames[j] !== studentEmailToTeamNameMap[giverStudentEmail]) {
                data[i].push(teamNames[j]);
            }
        }
    }
    return data;
}

function populateFeedbackPathsDataForGiverAsTeamsRecipientAsTeams(data) {
    for (var i = 0; i < data.length; i++) {
        var giverTeamName = data[i][0];
        for (var j = 0; j < teamNames.length; j++) {
            if (teamNames[j] !== giverTeamName) {
                data[i].push(teamNames[j]);
            }
        }
    }
    return data;
}*/

function populateFeedbackPathsDataForGiverAsStudentsRecipientAsTeams(data, numRecipients) {
    return generateRandom4(data, teamNames, numRecipients);
}

function populateFeedbackPathsDataForRecipientAsTeams(data, numRecipients) {
    return generateRandom3(data, teamNames, numRecipients);
}

function populateFeedbackPathsDataForGiverAsInstructorsRecipientAsOwnTeam(data) {
    for (var i = 0; i < data.length; i++) {
        data[i].push('Instructors');
    }
    return data;
}

function populateFeedbackPathsDataForGiverAsStudentsRecipientAsOwnTeam(data) {
    for (var i = 0; i < data.length; i++) {
        var giverStudentEmail = data[i][0];
        data[i].push(studentEmailToTeamNameMap[giverStudentEmail]);
    }
    return data;
}

function populateFeedbackPathsDataForGiverAsStudentsRecipientAsOwnTeamMembers(data) {
    for (var i = 0; i < data.length; i++) {
        var giverStudentEmail = data[i][0];
        var giverTeamName = studentEmailToTeamNameMap[giverStudentEmail]
        var giverTeamMembers = teamNameToStudentEmailsMap[giverTeamName];
        for (var j = 0; j < giverTeamMembers.length; j++) {
            if (giverTeamMembers[j] !== giverStudentEmail) {
                data[i].push(giverTeamMembers[j]);
            }
        }
    }
    return data;
}

function populateFeedbackPathsDataForGiverAsStudentsRecipientAsOwnTeamMembersIncludingSelf(data) {
    for (var i = 0; i < data.length; i++) {
        var giverStudentEmail = data[i][0];
        var giverTeamName = studentEmailToTeamNameMap[giverStudentEmail]
        var giverTeamMembers = teamNameToStudentEmailsMap[giverTeamName];
        data[i] = data[i].concat(giverTeamMembers);
    }
    return data;
}

function populateFeedbackPathsDataForGiverAsTeamsRecipientAsOwnTeamMembersIncludingSelf(data) {
    for (var i = 0; i < data.length; i++) {
        var giverTeamName = data[i][0];
        var giverTeamMembers = teamNameToStudentEmailsMap[giverTeamName];
        data[i] = data[i].concat(giverTeamMembers);
    }
    return data;
}

function populateFeedbackPathsDataForRecipientAsNobodySpecific(data) {
    for (var i = 0; i < data.length; i++) {
        data[i].push('%GENERAL%');
    }
    return data;
}

function generateRandom3(data, recipientList, numRecipientsPerGiver) {
    var recipientOrder = [];
    var recipientIndices = generateArray(recipientList.length);
    var totalNumRecipients = data.length * numRecipientsPerGiver;
    for (var i = 0; i < data.length; i++) {
        shuffle(recipientIndices);
        recipientOrder = recipientOrder.concat(recipientIndices);
    }
    var count = 0;
    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < numRecipientsPerGiver; j++) {
            var recipientIndex = recipientOrder.shift();
            var recipient = recipientList[recipientIndex];
            var temp = [];
            while (data[i].includes(recipient)) {
                temp.push(recipientIndex);
                recipientIndex = recipientOrder.shift();
                recipient = recipientList[recipientIndex];
                
            }
            data[i].push(recipient);            
            count++;
            recipientOrder = temp.concat(recipientOrder);
        }
    }    
    return data;
}

function generateRandom4(data, recipientList, numRecipientsPerGiver) {
    var recipientOrder = [];
    var recipientIndices = generateArray(recipientList.length);
    var totalNumRecipients = data.length * numRecipientsPerGiver;
    for (var i = 0; i < data.length; i++) {
        shuffle(recipientIndices);
        recipientOrder = recipientOrder.concat(recipientIndices);
    }
    var count = 0;
    for (var i = 0; i < data.length; i++) {
        var giver = data[i][0];
        for (var j = 0; j < numRecipientsPerGiver; j++) {
            var recipientIndex = recipientOrder.shift();
            var recipient = recipientList[recipientIndex];
            var temp = [];
            while (studentEmailToTeamNameMap[giver] === recipient || data[i].includes(recipient)) {
                temp.push(recipientIndex);
                recipientIndex = recipientOrder.shift();
                recipient = recipientList[recipientIndex];
                
            }
            data[i].push(recipient);            
            count++;
            recipientOrder = temp.concat(recipientOrder);
        }
    }    
    return data;
}

function generateArray(n) {
    var arr = [];
    for (var i = 0; i < n; i++) {
        arr.push(i);
    }
    return arr;
}

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
}