
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
        document.getElementById("vr").style.display = "block";
        if(userInfo.hasCat){
            document.getElementById("start").style.display = "none";
            if(userInfo.cat.status === 0){
                document.getElementById("continue").style.display = "block";
                document.getElementById("end").style.display = "none";

            }else{
                document.getElementById("continue").style.display = "none";
                document.getElementById("end").style.display = "block";
            }
        }else{
            document.getElementById("start").style.display = "block";
            document.getElementById("continue").style.display = "none";
            document.getElementById("end").style.display = "none";
        }
    });
}

document.getElementById("start").addEventListener('click', onStartButtonClick);
document.getElementById("continue").addEventListener('click', showARScene);
document.getElementById("end").addEventListener('click', endStory);
document.getElementById("vr").addEventListener("click", function(){
    window.location.href = "VR/VRscene.html";
});
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
    "specTask1": "i’m really craving some sardine. could i have five of that?",
    "specTask2": "i’m feeling so lonely. can you play with me using some toy for 10 times?"
}

const backgrounds = {
    "1": "i was born and raised on and by the streets.\n\nplease excuse my terrible health conditions.",
    "2": "the cARe centre has been my home for a lifetime.\n\ni really hope to have my own home.",
    "3": "here is the secret: i actually ran away from my previous owner.\n\nwhat could be better than freedom and fresh air?",
    "4": "one day i woke up and found myself in a box in front of the cARe centre.\n\nhere went all memories of my ex-owner.\n\nwill you promise never to leave me?",
    "5": "first thing first, i am a natural traveller.\n\nthe goal is to meet every cat and human alive, virtual or real."
}

const outcome = {
    "1": "i finally found myself a cozy and loving home.\n\nmy new family is so kind and everyone absolutely adores me!!\n\nthank you so much for prepping me for a new life.",
    "2": "i guess i'll keep waiting for my future at the cARe centre.\n\npeople who came here for adoption probably didn't truly see me.\n\ni hope to see you if you come by again!",
    "3": "i hope my secretary successfully delivered this message.\n\ndo feel honored to hear from me though, as i am usually very busy with my daily routines as\n\nthe president of the United Streets of stray Animals.\n\nyou were a big part of my success.",
    "4": "please excuse my handwriting as i write this message with\n\na very weak body and some messy, lingering thoughts.\n\ni appreciate your effort for trying to take care of me in my final days.\n\nsee you in the after life..."
}

function displayCatProfile(cat){
    var msg = spTasks[cat.specialTask];
    var background = backgrounds[cat.background];
    document.querySelector("#catDialog div").innerHTML = `<p>${userInfo.username}, thank you for being there for me!<br><br></p>
    <p>my name is ${userInfo.cat.name} and i am a ${userInfo.cat.age} year old ${userInfo.cat.appearance} cat.<br><br></p>
    <p>${background}<br><br></p>
    <p>i do have a special wish though.<br><br></p>
    <p>${msg}<br><br></p>`;
    document.getElementById("catDialog").showModal();
    document.getElementById("enterBtn").addEventListener("click", showARScene);
}
function showARScene(){
    console.log("showing AR scene");
    console.log(userInfo);
    window.location.href = "AR/ARscene.html";
}

//TODO
function showHistory(){
    console.log("showing history");
}

function endStory(){
    const end = functions.httpsCallable('endStory');
    let catName = userInfo.cat.name
    end({email: userInfo.email, name: catName, status: userInfo.cat.status}).then(res => {
        console.log(res.data);
    });
    const endDialog = document.getElementById("endDialog");
    endDialog.showModal();
    var msg = outcome[userInfo.cat.status];
    document.getElementById("cat message").innerHTML = `hello ${userInfo.username}! this is ${userInfo.cat.name}! it's been a while!`;
    document.getElementById("cat outcome").innerHTML = `${msg}`; 
    
    document.getElementById("cancelEnd").addEventListener('click', function(){
        endDialog.close();
        location.reload();
    });
}