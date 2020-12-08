export{sendUpdateLocal, sendIndivUpdateLocal, sendDisplayTreeUpdate, sendTreePosUpdate,
    sendDisplayBoardUpdate, sendBoardPosUpdate, sendDisplayElephantUpdate, sendElephantPosUpdate,
    sendCansUpdate}

import{functions} from './VRmain.js'

const domain = "http://127.0.0.1:2020";


function sendUpdate(type, catsInfo){
    const changeState = functions.httpsCallable('changeState');
    changeState({state: type, cat1: catsInfo[0].name, cat2: catsInfo[1].name, cat3: catsInfo[2].name})
    .then(res => {
    });
}

function sendUpdateLocal(){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", `${domain}/feedSpecial`, true);
    xhr.send();
}
////////////////////////////////////////////////////////////
function sendIndividualUpdate(num, type, catName){
    const changeIndivState = functions.httpsCallable('changeIndivState');
    changeIndivState({index: num, state: type, name: catName})
    .then(res => {
    });
}

function sendIndivUpdateLocal(index){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", `${domain}/feedWet?index=${index}`, true);
    xhr.send();
}
////////////////////////////////////////////////////////////
function sendDisplayBoxUpdate(){
    const displayDecor = functions.httpsCallable('displayDecor');
    displayDecor({}).then(res => {});
}

function sendDisplayTreeUpdate(){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", `${domain}/displayTree`, true);
    xhr.send();
}
////////////////////////////////////////////////////////////
function sendBoxPosUpdate(position){
    const updateBoxPos = functions.httpsCallable('updateBoxPos');
    updateBoxPos({x: position.x, z: position.z})
    .then(res => {
    });
}
function sendTreePosUpdate(position){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", `${domain}/updateTree?x=${position.x}&z=${position.z}`, true);
    xhr.send();
}

function sendDisplayBoardUpdate(){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", `${domain}/displayBoard`, true);
    xhr.send();
}
function sendBoardPosUpdate(position){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", `${domain}/updateBoard?x=${position.x}&z=${position.z}`, true);
    xhr.send();
}

function sendDisplayElephantUpdate(){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", `${domain}/displayElephant`, true);
    xhr.send();
}
function sendElephantPosUpdate(position){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", `${domain}/updateElephant?x=${position.x}&z=${position.z}`, true);
    xhr.send();
}

function sendCansUpdate(cans){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", `${domain}/updateCans?cans=${cans}`, true);
    xhr.send();
}