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

// const testEmail = "alice@218.com";
// const testPassword = "alicealice";

// const testEmail = "bob@218.com";
// const testPassword = "bobbob";

const testEmail = "carol@218.com";
const testPassword = "carolcarol";

const testLogin = document.getElementById("submit");
submit.addEventListener('click', onTestLogin);

firebase.auth().onAuthStateChanged( user => {
    if(user){
        console.log(user);
        window.location.href = "index.html";
    } else{
        console.log('user not logged in');
    }
});

function onTestLogin(e){
    const auth = firebase.auth();
    email = document.getElemenyById("uname").value;
    password = document.getElementById("psw").value;
    //const promise = auth.signInWithEmailAndPassword(testEmail, testPassword);
    const promise = auth.signInWithEmailAndPassword(email, password);
    promise.catch(e => loginErrorMsg.innerText = e.message);
    window.location.href = "index.html";
}

