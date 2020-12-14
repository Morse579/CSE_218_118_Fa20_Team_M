import { initializeScene } from './scene.js'
export { functions }

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
            init(user);
        });  
    }else{
        window.location.href = "../login.html";
    }
  });
  
  //load user information
  function init(user){
    const getCatInfo = functions.httpsCallable('loadCat');
    getCatInfo({email: user.email}).then(res => {
        let userInfo = {};
        userInfo.email = user.email;
        userInfo.cat = JSON.parse(res.data);
        console.log(userInfo.cat);
        initializeScene(userInfo);
    });
  }