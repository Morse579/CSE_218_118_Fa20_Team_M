
const firebaseConfig = {
    apiKey: "AIzaSyCHuFcfj3D2vXpxuJWbJViYa1SJPUkEAZM",
    authDomain: "ar-meowmeow.firebaseapp.com",
    databaseURL: "https://ar-meowmeow.firebaseio.com",
    projectId: "ar-meowmeow",
    storageBucket: "ar-meowmeow.appspot.com",
    messagingSenderId: "426725357319",
    appId: "1:426725357319:web:5c5851563c99b1c282b7a2",
    measurementId: "G-WZ7ZJL7E5V"
  };

firebase.initializeApp(firebaseConfig);
const functions = firebase.functions();
var userInfo = {};

// firebase auth
firebase.auth().onAuthStateChanged( user => {
    if(user){
        user.getIdTokenResult().then(idTokenResult => {
            console.log(idTokenResult.claims);
            initialize(user);
        });
    }else{
        window.location.href = "login.html";
    }
});

function initialize(user){
    const loadUserInfo = functions.httpsCallable('loadUser');
    loadUserInfo({email: user.email, time: Date.now()}).then(res => {
        console.log("finish loading");
        userInfo = JSON.parse(res.data);
        console.log(userInfo);
        userInfo.email = user.email;
        document.getElementById("history").hidden = false;
        if(userInfo.hasCat){
            if(userInfo.cat.status === 0){
                document.getElementById("continue").style.display = "none";
            }else{
                document.getElementById("end").style.display = "none";
            }
        }else{
            document.getElementById("start").style.hidden = "none";
        }
    });
}

document.getElementById("start").addEventListener('click', onStartButtonClick);
document.getElementById("continue").addEventListener('click', showARScene);
document.getElementById("end").addEventListener('click', endStory);
document.getElementById("history").addEventListener('click', showHistory);
document.getElementById("logout").addEventListener('click', e => {firebase.auth().signOut();});

function onStartButtonClick(){
    const dialog = document.getElementById('gameplayDialog');
    dialog.showModal();
    document.getElementById("nextBtn").addEventListener('click', ()=>{
        dialog.close();
        const initDialog = document.getElementById('initCatDialog');
        initDialog.showModal();
        document.getElementById("createBtn").addEventListener('click', initCat);
        document.getElementById("cancelBtn").addEventListener('click', function(){initDialog.close()});

    });
    document.getElementById("cancelGameplay").addEventListener('click', function(){dialog.close()});
}


function initCat(){
    console.log("init cat...");
    let catName = document.getElementById("catName").value;
    document.getElementById('initCatDialog').close();

    const init = functions.httpsCallable('initCat');
    init({email: userInfo.email, time: Date.now(), name: catName, currency: userInfo.currency}).then(res => {
        console.log("finish init cat...");
        userInfo.cat = JSON.parse(res.data);
        userInfo.hasCat = true;
        console.log(userInfo.cat);
        displayCatProfile(userInfo.cat);
    });
}

const spTasks = {
    "specTask1": "I’m really craving some sardine. Could I have five of that?",
    "specTask2": "I’m feeling so lonely. Can you play with me using some toy for 10 times?"
}

const backgrounds = {
    "1": "stray cat",
    "2": "spent their entire life at the pound", 
    "3": "ran away from their home",
    "4": "recently abandoned by owner",
    "5": "traveller cat"
}

function displayCatProfile(cat){
    var msg = spTasks[cat.specialTask];
    var background = backgrounds[cat.background];
    document.querySelector("#catDialog div").innerHTML = `<p>${cat.name}'s age: ${cat.age}</p>
    <p>${cat.name}'s appearance: ${cat.appearance}</p> <p>${cat.name}'s background: ${background}</p>
    <p>${cat.name}'s wish: ${msg}</p>`;
    document.getElementById("catDialog").showModal();
    document.getElementById("enterBtn").addEventListener("click", showARScene);
}
function showARScene(){
    console.log("showing AR scene");
    console.log(userInfo);
    window.location.href = "ARscene.html";
}

//TODO
function showHistory(){
    console.log("showing history");
}

function endStory(){
    const end = functions.httpsCallable('endStory');
    end({email: userInfo.email, name: userInfo.cat.name, status: userInfo.cat.status}).then(res => {
        console.log(res.data);
    });
    const endDialog = document.getElementById("endDialog");
    endDialog.showModal();
    if(userInfo.cat.specialTaskCompleted){
        document.getElementById("spTask").innerHTML = `${userInfo.cat.name}'s message: Thank you for realizing my dream!`;
    }
    document.getElementById("status").innerHTML = `<p>Thank you for taking care of ${userInfo.cat.name}!</p>
    <p>End story ${userInfo.cat.status}: ${userInfo.cat.name} goes back to the shelter and is adopted by a new host later.</p>`;
    document.getElementById("stats").innerHTML = `In the 7 days, <br> You fed ${userInfo.cat.name} N times, <br>
    You bought ${userInfo.cat.name} N toys, <br> You decorate ${userInfo.cat.name}'s living space N times`;
    
    document.getElementById("cancelEnd").addEventListener('click', function(){
        endDialog.close();
        location.reload();
    });
}

document.getElementById("loadCat").addEventListener('click', loadCatInfo);
function loadCatInfo(){
    const load = functions.httpsCallable('loadCat');
    load({email: userInfo.email}).then(res => {
        console.log("finish loading cat...");
        let cat = JSON.parse(res.data);
        console.log(cat);
    });

}
