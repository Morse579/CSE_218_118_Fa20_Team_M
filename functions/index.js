
const HUNGER_DECREASE_PER_HOUR = 1;
const MOOD_DECREASE_PER_HOUR = 1;
const LONGEST_UNATTEND_TIME = 24;
const DAILY_CHECKIN_REWARDS = 5;
const FOOD_CONSUMPTION = 1;
const MIN_HUNGER = -20;
const MIN_MOOD = -20;

const HUNGER_INCREASE = 2;
const FOOD_INCREASE = 1;
const FOOD_PRICE = {
    dry: 1,
    wet: 2,
    special: 5
};
const FOOD_HUNGER = {
    dry: 1,
    wet: 2,
    special: 5
};
const ACTION_OUTCOME = {
    dryFood: [0,0,0,0],
    wetFood: [10,5,3,4],
    specialFood: [20,40, 6,8]
};
const AGES = ["1","3","15"];
const APPEARANCES = ["yellow", "black", "white"];
const BACKGROUNDS = ["1","2","3","4","5"];

const AGE_OUTCOME = {
    "1": [2,3,4,5],
    "3": [6,3,7,2],
    "15": [6,2,6,3]
}
const APPEARANCE_OUTCOME = {
    "yellow": [2,3,4,5],
    "black": [6,3,7,2],
    "white": [6,2,6,3]
}
const BACKGROUND_OUTCOME = {
    "1": [2,3,4,5],
    "2": [6,3,7,2],
    "3": [6,2,6,3],
    "4": [6,8,0,0],
    "5": [7,2,9,9]
}
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');
const functions = require('firebase-functions');
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

///////// deprecated ///////
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
const foodComsumption = admin.firestore.FieldValue.increment((-1)*FOOD_CONSUMPTION);
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

exports.play = functions.https.onCall(async (data, context) =>{
    let ref = db.collection("User").doc(data.email).collection("cat").doc(data.catName);
    await ref.update(
        {
            mood: admin.firestore.FieldValue.increment(MOOD_INCREASE)
        }
    )
    return "success";
});
///////// deprecated ///////

exports.eat = functions.https.onCall(async (data, context) =>{
    let ref = db.collection("User").doc(data.email).collection("cat").doc(data.catName);
    switch(data.type) {
        case "dry":
            await ref.update(
                {
                    dryFood: admin.firestore.FieldValue.increment(-1),
                    feedDryCount : admin.firestore.FieldValue.increment(1),
                    hunger: admin.firestore.FieldValue.increment(FOOD_HUNGER.dry),
                    outcome1: admin.firestore.FieldValue.increment(ACTION_OUTCOME.dryFood[0]),
                    outcome2: admin.firestore.FieldValue.increment(ACTION_OUTCOME.dryFood[1]),
                    outcome3: admin.firestore.FieldValue.increment(ACTION_OUTCOME.dryFood[2]),
                    outcome4: admin.firestore.FieldValue.increment(ACTION_OUTCOME.dryFood[3])
                }
            )
          break;
        case "wet":
            await ref.update(
                {
                    wetFood: admin.firestore.FieldValue.increment(-1),
                    feedWetCount : admin.firestore.FieldValue.increment(1),
                    hunger: admin.firestore.FieldValue.increment(FOOD_HUNGER.wet),
                    outcome1: admin.firestore.FieldValue.increment(ACTION_OUTCOME.wetFood[0]),
                    outcome2: admin.firestore.FieldValue.increment(ACTION_OUTCOME.wetFood[1]),
                    outcome3: admin.firestore.FieldValue.increment(ACTION_OUTCOME.wetFood[2]),
                    outcome4: admin.firestore.FieldValue.increment(ACTION_OUTCOME.wetFood[3])
                }
            )
          break;
        case "special":
            await ref.update(
                {
                    specialFood: admin.firestore.FieldValue.increment(-1),
                    feedSpecialCount : admin.firestore.FieldValue.increment(1),
                    hunger: admin.firestore.FieldValue.increment(FOOD_HUNGER.special),
                    outcome1: admin.firestore.FieldValue.increment(ACTION_OUTCOME.specialFood[0]),
                    outcome2: admin.firestore.FieldValue.increment(ACTION_OUTCOME.specialFood[1]),
                    outcome3: admin.firestore.FieldValue.increment(ACTION_OUTCOME.specialFood[2]),
                    outcome4: admin.firestore.FieldValue.increment(ACTION_OUTCOME.specialFood[3])
                }
            )
      }
    return "eat success";
});

exports.buyFood = functions.https.onCall(async (data, context) =>{
    let ref = db.collection("User").doc(data.email).collection("cat").doc(data.catName);
    switch(data.type) {
        case "dry":
            await ref.update(
                {
                    dryFood: admin.firestore.FieldValue.increment(1),
                    currency: admin.firestore.FieldValue.increment(-FOOD_PRICE.dry)
                }
            )
          break;
        case "wet":
            await ref.update(
                {
                    wetFood: admin.firestore.FieldValue.increment(1),
                    currency: admin.firestore.FieldValue.increment(-FOOD_PRICE.wet)
                }
            )
          break;
        case "special":
            await ref.update(
                {
                    specialFood: admin.firestore.FieldValue.increment(1),
                    currency: admin.firestore.FieldValue.increment(-FOOD_PRICE.special)
                }
            )
      }
    return "buy food success";
});

exports.loadUser = functions.https.onCall(async (data, context) =>{
    let user = {};

    // load user info and current cat info
    let ref = db.collection("User").doc(data.email);
    let snapshot = await ref.get();
    user = snapshot.data();
    let catRef = db.collection("User").doc(data.email).collection("cat");
    snapshot = await catRef.where('status', '==', 0).get(); 

    // case 1: no cat in progress, client side should be prompted to initialize a cat
    if (snapshot.empty) {
        user.hasCat = false;
        return JSON.stringify(user);
    }
    user.hasCat = true;
    snapshot.forEach(doc => {
        user.cat = doc.data();
    });
    catRef = db.collection("User").doc(data.email).collection("cat").doc(user.cat.name);
    let days = Math.floor((data.time - user.cat.startTime)/(24*60*60*1000));

    // case 2: 7 days after starting the story, end game 
    if(days > 7){
        user.cat.status = calculateOutcome(user, data);
        return JSON.stringify(user);
    }
    let update = updateCatData(user, data);

    // case 3: hunger < 0 or mood < 0 for 24 hrs, end game(BE)
    if(update === false){
        user.cat.status = 4; //bad end
        return JSON.stringify(user);
    }

    // case 4: return user and cat info, continue game
    await catRef.update(user.cat);
    return JSON.stringify(user);
});


//TODO
exports.initCat = functions.https.onCall(async (data, context) =>{
    // set cat attributes randomly
    let randomAge = getRandomItem(AGES);
    let randomApperance = getRandomItem(APPEARANCES);
    let randomBackground = getRandomItem(BACKGROUNDS);

    let cat = {
        name: data.name,
        status: 0,
        age: randomAge,
        appearance: randomApperance,
        background: randomBackground,
        currency: 100,
        startTime: data.time,
        lastLogin: data.time,
        hunger: 100,
        mood: 100,
        outcome1: AGE_OUTCOME[randomAge][0] + APPEARANCE_OUTCOME[randomApperance][0] + BACKGROUND_OUTCOME[randomBackground][0],
        outcome2: AGE_OUTCOME[randomAge][1] + APPEARANCE_OUTCOME[randomApperance][1] + BACKGROUND_OUTCOME[randomBackground][1],
        outcome3: AGE_OUTCOME[randomAge][2] + APPEARANCE_OUTCOME[randomApperance][2] + BACKGROUND_OUTCOME[randomBackground][2],
        outcome4: AGE_OUTCOME[randomAge][3] + APPEARANCE_OUTCOME[randomApperance][3] + BACKGROUND_OUTCOME[randomBackground][3],
        dryFood: 10,
        wetFood: 0,
        specialFood: 0,
        feedDryCount: 0,
        feedWetCount: 0,
        feedSpecialCount: 0
    }
    const res = await db.collection("User").doc(data.email).collection("cat").doc(data.name).set(cat);
    return JSON.stringify(cat);
});

//TODO
function calculateOutcome(user){
    return 1;

}

//TODO: hunger and mood should be updated according to time
function updateCatData(user, data){
    user.cat.hunger -= 5;
    user.cat.mood -= 5;
    if(user.cat.hunger < MIN_HUNGER|| user.cat.mood < MIN_MOOD){
        return false;
    }
    else{
        user.cat.currency += DAILY_CHECKIN_REWARDS;
        user.cat.lastLogin = data.time;
    }
    return true;
}

function getRandomItem(array) {
    var index = Math.floor(Math.random() * Math.floor(array.length));
    return array[index];
}