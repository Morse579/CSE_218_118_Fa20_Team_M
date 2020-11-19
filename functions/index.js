const HUNGER_DECREASE_PER_HOUR = 1;
const MOOD_DECREASE_PER_HOUR = 1;
const LONGEST_UNATTEND_TIME = 24;
const DAILY_CHECKIN_REWARDS = 5;
const FOOD_CONSUMPTION = 1;
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
        user.cat = initializeCat(user, data);
        return JSON.stringify(user);
    }
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
    if(update === -1){
        user.cat.status = 1; //bad end
        return JSON.stringify(user);
    }

    // case 4: return user and cat info, continue game
    await catRef.update(user.cat);
    return JSON.stringify(user);
});


//TODO
function initializeCat(user, data){
    //assign cat randomly
    //store default value in db
    //return cat data
}

//TODO
function calculateOutcome(user, data){
    return 1;

}

//TODO
function updateCatData(user, data){
    let hours = Math.floor((data.time - user.cat.lastLogin)/(60*60*1000));
    user.cat.hunger -= HUNGER_DECREASE_PER_HOUR * hours;
    user.cat.mood -= MOOD_DECREASE_PER_HOUR * hours;
    if(user.cat.hunger < HUNGER_DECREASE_PER_HOUR * LONGEST_UNATTEND_TIME ||
        user.cat.mood < MOOD_DECREASE_PER_HOUR * LONGEST_UNATTEND_TIME){
            //TODO: END
            return -1;
        }
    else{
        // if(days > 1){
        //     user.cat.currency += DAILY_CHECKIN_REWARDS;
        //     user.cat.lastLogin = data.time;
        // }
    }
    return 0;
}