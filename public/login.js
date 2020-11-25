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

const testEmail = "alice@218.com";
const testPassword = "alicealice";

const testLogin = document.getElementById("testLogin");
testLogin.addEventListener('click', onTestLogin);

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
    const promise = auth.signInWithEmailAndPassword(testEmail, testPassword);
    promise.catch(e => loginErrorMsg.innerText = e.message);
}
