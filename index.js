// Modules and main variables.

const readlineSync = require('readline-sync');
const fs = require('fs'); // imports the file system module. (built in?)
const dataFilePath = 'localStorage.json'; // Creates variable for the file path.
let savedItems = fs.readFileSync(dataFilePath, 'utf8').length > 0 ? JSON.parse(fs.readFileSync(dataFilePath, 'utf8')) : {"users" : {}};
let currentMode; 
let userStorage; 
let wordToPractice;
let countRequired;

//-----------------------------------------------------------------------------------------------------------------------------------//

// Users ****************************************************************************************************************//
const users = savedItems.users;
let currentUser = undefined;


// Intro screen ********************************************************************************************************//
console.log("Welcome to the vocabulary practice app.\nPlease log in to start improving your vocabulary! ");
let username = readlineSync.question("Username: ");
userCheck(username); // This defines the current user. (after checking the password or if new user needs to be created)

if (currentUser) {
    modeSelector(); // This defines the current mode.
    modeActivator(); // This starts the function that executes each one of the modes.
}

// Addition / Storage code *********************************************************************************************//
function additionMode() {
    const wordTypes = ["Noun", "Verb", "Other"];
    const options = ["Quit", "Back to Home"];
    let newWord = readlineSync.question("What word would you like to add?: ");
    let index = readlineSync.keyInSelect(wordTypes, "What type of word is this?");

    if (index === 0) {
        userStorage[0].push(createNewNoun(newWord));
        let articleToAdd = readlineSync.question("What's the article for this word'?: ");
        let pluralToAdd = readlineSync.question("What's the plural for this word'?: ");
        let translationToAdd = readlineSync.question("How is this word translated in English'?: ");
        userStorage[0][userStorage[0].length-1].art = articleToAdd;
        userStorage[0][userStorage[0].length-1].pll = pluralToAdd;
        userStorage[0][userStorage[0].length-1].tsl = translationToAdd;
    } else if (index === 1 || index === 2) {
        userStorage[1].push(createNewOther(newWord));
        let infoToadd = readlineSync.question("Want to add any additional info for this word?: ");
        let translationToAdd = readlineSync.question("How is this word translated in English'?: ");
        userStorage[1][userStorage[1].length-1].add = infoToadd;
        userStorage[1][userStorage[1].length-1].tsl = translationToAdd;
    }

    clearApp();
    readlineSync.keyInYN('Add another word?') ? additionMode() : console.log(); index = readlineSync.keyInSelect(options, "What would you like to do now?");

    index === 0 ? exitApp() : backToMain();
}

// Practice mode code *************************************************************************************************//

function practiceMode() {

    if (savedItems[currentUser]) {
        wordPicker();
        wordQuestion();

    } else {
        console.log("You have not added any words yet. Please add some to start practicing.");
        modeSelector(); 
        modeActivator();
    }
}

function wordQuestion() {
    if (wordToPractice) {
        console.log(`Your next word is ${wordToPractice.tsl.toUpperCase()}`);
        wordToPractice.ct1 +=1;
        const options = ["Quit", "Back to Home"];
        if (wordToPractice.art) {
            let answer = readlineSync.question("How is this word translated in German?: ");
            let article = readlineSync.question("What is the article for this word?: ");
            let plural = readlineSync.question("What is the plural for this word?: ");
            answer === wordToPractice.wrd && article === wordToPractice.art && plural === wordToPractice.pll ? wordToPractice.ct2 += 1 : 
                  wordToPractice.ct2 > 0 ? wordToPractice.ct2 -= 1 : null;
            clearApp();
            console.log(`You replied: ${article} ${answer}, ${plural}\n`);
            console.log(`Correct answer: ${wordToPractice.art} ${wordToPractice.wrd}, ${wordToPractice.pll}`);
            console.log(`Your answer was ${answer === wordToPractice.wrd && article === wordToPractice.art && plural === wordToPractice.pll}.`);
        } else {
            let answer = readlineSync.question("How is this word translated in German?: ");
            let addInfo = readlineSync.question("Would you like to provide additional info? ");
            clearApp();
            console.log(`You replied: ${answer} and "${addInfo}"`);
            console.log(`Correct answer: ${wordToPractice.wrd}`);
            console.log(`The info you previously provided for this word was ***${wordToPractice.add}***`);
            if (readlineSync.keyInYN('Was your answer correct?'))  {
                if (answer.toLowerCase() === wordToPractice.wrd.toLowerCase()) {
                    wordToPractice.ct2 += 1;
                } else {
                    wordToPractice.ct2 > 0 ? wordToPractice.ct2 -= 1 : null;
                }
            }
        }
    
        if (!readlineSync.keyInYN('Keep on practicing?')) {
            archiveLearned();
            deleteLearned();
            saveDataToFile();
            backToMain();
        } else {
            clearApp();
            practiceMode();
        }
    } else {
        console.log(`You need to practice more words. Please select the "Add Vocabulary" mode`);
        backToMain();
    }
}

// Statistics ************************************************************************************************************//

function statisticsMode() {
    console.log("Below you will find all the words you have already successfully learned:");
    let orderedArr = userStorage[3].sort(compare);

    for (word of orderedArr) {
        console.log(`You have practiced ** ${word.wrd} ** ${word.ct1} times`);
    }

    console.log(`\nIn total you have successfully learned ${orderedArr.length} words.`);
    console.log(`You are currently practising another ${userStorage[0].length + userStorage[1].length} words.`);
    setTimeout(backToMain, 10000);
}


// Settings *************************************************************************************************************//

function settingsMode() {
    const options = ["Change practice settings", "Delete all saved words", "Delete user", "Reset app", "Log-out / Change User"];
    let index = readlineSync.keyInSelect(options, "Please select settings option? ");
    if (index === 3) {
        if(readlineSync.keyInYN("Are you sure you want to delete all the App's data?")) {
            clearApp();
            savedItems = {"users" : {}};
            saveDataToFile();
            setTimeout(clearApp(), 2000);
        } else {clearApp(); settingsMode();}
    } else if (index === 2) {
        clearApp();
        if(readlineSync.keyInYN("Are you sure you want to delete your account?\n(This will also remove all of your saved Vocabulary)")) {
            delete savedItems.users[currentUser];
            delete savedItems[currentUser];
            saveDataToFile();
            clearApp();
            console.log("Your account and all vocabulary data have now been deleted.");
        } else {clearApp(); settingsMode();}
    } else if (index === 1) {
        clearApp();
        if(readlineSync.keyInYN("Are you sure you want to delete all added words?")) {
            delete savedItems[currentUser];
            saveDataToFile();
            clearApp();
            console.log("Your vocabulary data has now been deleted.");
            backToMain();
        } else {clearApp(); settingsMode();}
    } else if (index === 4) {
        changeUser();
    } else if (index === 0) {
        clearApp();
        countRequired = userStorage[2] || 5;
        newCount = readlineSync.question(`After how many succesfull answer should a word be archived?\nCurrently this is set at ${countRequired}\nPlease provide a number between 5 and 10: `);
        countRequired = newCount;
        userStorage[2] = newCount;
        saveDataToFile();
        clearApp();
        settingsMode();
    } else if (index === -1) {clearApp();backToMain();}
}


//---------------------------------------FUNCTIONS--------------------------------------------------------------------//
//-----------------------------------log-in related functions--------------------------------------------//


function userCheck (string) {
    let user = string.replace(" ", "").toLowerCase();
    if (users[user]) {
        const password = readlineSync.question("Password: ", {hideEchoBack: true});
        if (password === users[user]) {
            console.clear();
            currentUser = user;
            console.log(`Welcome back, ${string}!`);
            !savedItems[currentUser]? savedItems[currentUser] = [[],[], 5, []] : null;
            userStorage = savedItems[currentUser];
            countRequired = userStorage[2];
        } else {
            console.log("Password is incorrect. Please try again");
            currentUser = undefined;
            return userCheck(string);
        }
    } else {
        console.log("Username does not exist");
        if (readlineSync.keyInYN('Would you like to create a new user? Pressing N will close the app.')) {
            return createNewUser();
          } else {
            clearApp();
            console.log("Sorry to see you go so soon!");
            setTimeout(clearApp, 2000);
          }
    }
}

function createNewUser() {
    clearApp();
    username = readlineSync.question("Please provide the USERNAME you would like to use for login: "); 
    passwordToBeSaved = readlineSync.question("Please provide the PASSWORD you would like to use for login: ", {hideEchoBack: true});
    clearApp();
    users[username.replace(" ", "").toLowerCase().toString()] = passwordToBeSaved.toString();
    saveDataToFile();
    clearApp();
    console.log("Please repeat your password:");
    return userCheck(username);
}


//----------------------------functions that set the correct mode -----------------------------------------//

function modeSelector() {
    const modes = ["Add Vocabulary", "Practice", "Statistics", "Settings"];
    let index = readlineSync.keyInSelect(modes, "What would you like to do?");
    currentMode = modes[index];
    currentMode = currentMode === undefined? undefined : modes[index].replace(" ", "").toLowerCase();

    if (currentMode === undefined) {
        clearApp();
        console.log("Sorry to see you go so soon!");
        saveDataToFile();
        setTimeout(clearApp, 3000);
    } else {
        clearApp();
        console.log(`<== You are now in "${modes[index]}" mode ==> \n`);
    }
}

// ------------------------------other functions-------------------------------------------------------------//

function modeActivator() {
    if (currentMode === "addvocabulary") {additionMode();}
    else if (currentMode === "practice") {practiceMode();}
    else if (currentMode === "statistics") {statisticsMode();}
    else if (currentMode === "settings") {settingsMode();}
}

function backToMain() {clearApp(); modeSelector(); modeActivator();}
function clearApp() {console.clear()};

function saveDataToFile() {
    fs.writeFileSync(dataFilePath, JSON.stringify(savedItems)); 
    console.log("Data saved successfully");
}

function createNewNoun (newWord) {
    return {
        "wrd": newWord,
        "art": "tbd",
        "pll": "tbd",
        "tsl": "tbd",
        "ct1" : 0,
        "ct2" : 0,
    }
}

function createNewOther (newWord) {
    return {
        "wrd": newWord,
        "add": "tbd",
        "tsl": "tbd",
        "ct1" : 0,
        "ct2" : 0,
    }
}

function exitApp () {
    clearApp();
    currentUser = undefined;
    console.log("You have been correctly logged out.");
    console.log("Come back soon to learn more words!");
    saveDataToFile();
    console.log("Have a great day!");
    setTimeout(clearApp, 4000);
}

function changeUser() {
    saveDataToFile();
    currentUser = undefined;
    console.log("You have been correctly logged out.");
    setTimeout(clearApp, 2000);
    username = readlineSync.question("Username: ");
    userCheck(username);
    modeSelector();
    modeActivator();
}

function wordPicker() {
    let wordType = Math.floor(Math.random() * 2);
    let wordObj = Math.floor(Math.random() * savedItems[currentUser][wordType].length);
    wordToPractice = savedItems[currentUser][wordType][wordObj];
}

function compare(a,b) {
    if (a.ct2 < b.ct2) {
        return -1;
    } else if (a.ct2 > b.ct2) {
        return 1;
    } else {return 0;}
}

function archiveLearned() {
    countRequired = userStorage[2];
    for (i = 0; i < 2; i++) {
        for (word of userStorage[i]) {
            if (word.ct2 >= countRequired) {
                userStorage[3].push({...word});
            }
        }        
    }
}

function deleteLearned() {
    saveDataToFile();
    clearApp();
    let orderedArr1 = userStorage[0].sort(compare);
    let orderedArr2 = userStorage[1].sort(compare);

    while (orderedArr1[orderedArr1.length-1].ct2 >= countRequired) {
        orderedArr1.pop()
    }
    while (orderedArr2[orderedArr2.length-1].ct2 >= countRequired) {
        orderedArr2.pop()
    }
    saveDataToFile();
    clearApp();
}