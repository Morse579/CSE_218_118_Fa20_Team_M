const admin = require('firebase-admin');
const functions = require('firebase-functions');
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});


exports.userInfo = functions.https.onCall((data, context) =>{
    let result = db.collection("User").doc(data.email);
    return result.get().then(user => {
        return JSON.stringify(user.data());
    })
    .catch(err => {
        console.log('Error getting documents', err);
        return { error : "DB Error"}
    });
});

exports.feed = functions.https.onCall((data, context) =>{
    let result = db.collection("User").doc(data.email);
    result.update({food: foodComsumption})
    .then(()=>{
        return "success";
    })
    .catch(err => {
        console.log('Error getting documents', err);
        return { error : "Update Error"}
    });
});

const increment = admin.firestore.FieldValue.increment(1);
const foodComsumption = admin.firestore.FieldValue.increment(-1);


