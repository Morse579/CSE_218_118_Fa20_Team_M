
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
                document.getElementById("continue").hidden = false;
            }else{
                document.getElementById("end").hidden = false;
            }
        }else{
            document.getElementById("start").hidden = false;
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
        showARScene();
    });
}

//TODO
function showARScene(){
    console.log("showing AR scene");
    console.log(userInfo);
    window.location.href = "index.html";
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
    document.getElementById("status").innerText = `Your end status: ${userInfo.cat.status}`;
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
