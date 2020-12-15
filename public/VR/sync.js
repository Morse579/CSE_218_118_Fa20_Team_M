export { sendUpdateLocal, sendIndivUpdateLocal, sendDisplayTreeUpdate, sendTreePosUpdate,
        sendDisplayBoardUpdate, sendBoardPosUpdate, sendDisplayElephantUpdate, sendElephantPosUpdate,
        sendCansUpdate, sendFishUpdate }

import { domain } from './main.js'

function sendUpdateLocal(){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", `${domain}/feedSpecial`, true);
    xhr.send();
}

function sendIndivUpdateLocal(index){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", `${domain}/feedWet?index=${index}`, true);
    xhr.send();
}

function sendDisplayTreeUpdate(){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", `${domain}/displayTree`, true);
    xhr.send();
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

function sendFishUpdate(fish, fishAvail){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", `${domain}/updateFish?fish=${fish}&fishAvail=${fishAvail}`, true);
    xhr.send();
}