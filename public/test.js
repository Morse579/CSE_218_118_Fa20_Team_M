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

const logout = document.getElementById("logout");
logout.addEventListener('click', e => {firebase.auth().signOut();});

var userInfo = {};
function initialize(user){
    const loadUserInfo = functions.httpsCallable('loadUser');
    loadUserInfo({email: user.email, time: Date.now()}).then(res => {
        console.log("finish loading");
        userInfo = JSON.parse(res.data);
        userInfo.email = user.email;
        document.getElementById("json").textContent = JSON.stringify(userInfo, undefined, 2);
    });
}

document.getElementById("buyDryFood").addEventListener('click', ()=>{
    //TODO: check there is enough money
    const buyFood = functions.httpsCallable('buyFood');
    buyFood({email: userInfo.email, catName: userInfo.cat.name, type: "dry"})
    .then(res => {
        console.log(res.data);
    })
});
document.getElementById("buyWetFood").addEventListener('click', ()=>{
    const buyFood = functions.httpsCallable('buyFood');
    buyFood({email: userInfo.email, catName: userInfo.cat.name, type: "wet"})
    .then(res => {
        console.log(res.data);
    })
});

document.getElementById("buySpFood").addEventListener('click', ()=>{
    const buyFood = functions.httpsCallable('buyFood');
    buyFood({email: userInfo.email, catName: userInfo.cat.name, type: "special"})
    .then(res => {
        console.log(res.data);
    })
});

document.getElementById("feedDryFood").addEventListener('click', ()=>{
    //TODO: check there is dry food left
    const feed = functions.httpsCallable('eat');
    feed({email: userInfo.email, catName: userInfo.cat.name, type: "dry"})
    .then(res => {
        console.log(res.data);
    })
});

document.getElementById("feedWetFood").addEventListener('click', ()=>{
    const feed = functions.httpsCallable('eat');
    feed({email: userInfo.email, catName: userInfo.cat.name, type: "wet"})
    .then(res => {
        console.log(res.data);
    })
});

document.getElementById("feedSpFood").addEventListener('click', ()=>{
    const feed = functions.httpsCallable('eat');
    feed({email: userInfo.email, catName: userInfo.cat.name, type: "special"})
    .then(res => {
        console.log(res.data);
    })
});


