
const HUNGER_DECREASE_PER_HOUR = 1;
const MOOD_DECREASE_PER_HOUR = 1;
const LONGEST_UNATTEND_TIME = 24;
const DAILY_CHECKIN_REWARDS = 5;
const MIN_HUNGER = -20;
const MIN_MOOD = -20;
const SPECTASK1_COUNT = 5;
const SPECTASK2_COUNT = 10;

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
const TOY_PRICE = {
    yarn: 3,
    mouse: 5,
    stuffed_dog: 7,
    stuffed_elephant: 11
};
const TOY_MOOD = {
    yarn: 3,
    mouse: 5,
    stuffed_dog: 7,
    stuffed_elephant: 11
};
const DECOR_PRICE = {
    bell_rope: 17,
    cat_tree: 19
};
const DECOR_MOOD = {
    bell_rope: 17,
    cat_tree: 19
};
const ACTION_OUTCOME = {

    // eat
    dryFood: [0,0,0,0],
    wetFood: [7,5,3,0], 
    specialFood: [13,11,5,2],

    // toy
    yarn: [3,3,1,3],
    mouse: [5,5,3,5],
    stuffed_dog: [7,7,5,7],
    stuffed_elephant: [11,11,7,11],

    // decor
    bell_rope: [17,17,13,17],
    cat_tree: [19,19,17,19],

    // special tasks TODO
    specTask1: [23,23,-23,-23],
    specTask2: [23,23,-23,-23],
    specTask3: [23,23,-23,-23]
};
const AGES = ["0.5","3","15"];
const APPEARANCES = ["siam", "grey","white", "orange", "carey", "black"];
const BACKGROUNDS = ["1","2","3","4","5"];
const SPECIALTASKS = ["specTask1", "specTask2"];

const AGE_OUTCOME = {
    "0.5": [5,3,1,0],
    "3": [3,5,7,1],
    "15": [1,7,1,13]
}
const APPEARANCE_OUTCOME = {
    "carey": [3,11,9,0],
    "black": [1,13,13,0],
    "grey": [13,1,3,0],
    "orange": [7,7,5,0],
    "white": [11,3,3,0],
    "siam": [13,1,3,0]
}
const BACKGROUND_OUTCOME = {
    "1": [5,7,5,13],
    "2": [13,7,3,2],
    "3": [5,7,11,2],
    "4": [5,7,5,2],
    "5": [5,2,13,5]
}
const cors = require('cors')({ origin: true });
const admin = require('firebase-admin');
const functions = require('firebase-functions');
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

exports.updateClub = functions.https.onCall(async (data, context) =>{
    let ref = db.collection("Room").doc("club");
    let snapshot = await ref.get();
    let clubData = snapshot.data();
    let today = new Date().getDate();
    if(today === clubData.date){
        if(data.cans > clubData.cans){
            clubData.cans = data.cans;
            await ref.update({
                cans: data.cans
            });
        }
        return JSON.stringify(clubData);
    }else{
        clubData.date = today;
        clubData.decorateCount = 0;
        clubData.feedSpecialCount = 0;
        clubData.feedWetCount = 0;
        clubData.state = "none";
        clubData.indivState1 = "none";
        clubData.indivState2 = "none";
        clubData.indivState3 = "none";

        await ref.update({
            date: today,
            decorateCount: 0,
            feedWetCount: 0,
            feedSpecialCount: 0,
            state: "none",
            indivState1: "none",
            indivState2: "none",
            indivState3: "none"
        });
        return JSON.stringify(clubData);
    }
});

exports.displayDecor = functions.https.onCall(async (data, context) =>{
    let ref = db.collection("Room").doc("club");
    await ref.update({
        displayDecor: true
    });
});

exports.updateBoxPos = functions.https.onCall(async (data, context) =>{
    let ref = db.collection("Room").doc("club");
    await ref.update({
        boxPosX: data.x,
        boxPosZ: data.z
    });
});

exports.changeState = functions.https.onCall(async (data, context) =>{
    let ref = db.collection("Room").doc("club");

    await ref.update({
        feedSpecialCount: admin.firestore.FieldValue.increment(1),
        state : data.state
    });

    setTimeout(async () => {
        let ref = db.collection("Room").doc("club");
        await ref.update({
            state : "none"
        });

        let cat1Ref = db.collection("User").doc("david@218.com").collection("cat").doc(data.cat1);
        await cat1Ref.update({
            hunger: admin.firestore.FieldValue.increment(FOOD_HUNGER.special*2)
        })

        let cat2Ref = db.collection("User").doc("bob@218.com").collection("cat").doc(data.cat2);
        await cat2Ref.update({
            hunger: admin.firestore.FieldValue.increment(FOOD_HUNGER.special*2)
        })

        let cat3Ref = db.collection("User").doc("carol@218.com").collection("cat").doc(data.cat3);
        await cat3Ref.update({
            hunger: admin.firestore.FieldValue.increment(FOOD_HUNGER.special*2)
        })
    }, 10000);
});

exports.changeIndivState = functions.https.onCall(async (data, context) =>{
    let ref = db.collection("Room").doc("club");
    const interval = 10000;

    if(data.index === 0){
        await ref.update({
            feedWetCount: admin.firestore.FieldValue.increment(1),
            indivState1 : data.state
        });
        setTimeout(async () => {
            await ref.update({
                indivState1 : "none"
            });
            let catRef = db.collection("User").doc("david@218.com").collection("cat").doc(data.name);
            await catRef.update({
                hunger: admin.firestore.FieldValue.increment(FOOD_HUNGER.wet*2)
            });
        }, interval);
    }else if(data.index === 1){
        await ref.update({
            feedWetCount: admin.firestore.FieldValue.increment(1),
            indivState2 : data.state
        });
        setTimeout(async () => {
            await ref.update({
                indivState2 : "none"
            });
            let catRef = db.collection("User").doc("bob@218.com").collection("cat").doc(data.name);
            await catRef.update({
                hunger: admin.firestore.FieldValue.increment(FOOD_HUNGER.wet*2)
            });
        }, interval);
    }else if(data.index === 2){
        await ref.update({
            feedWetCount: admin.firestore.FieldValue.increment(1),
            indivState3 : data.state
        });
        setTimeout(async () => {
            await ref.update({
                indivState3 : "none"
            });
            let catRef = db.collection("User").doc("carol@218.com").collection("cat").doc(data.name);
            await catRef.update({
                hunger: admin.firestore.FieldValue.increment(FOOD_HUNGER.wet*2)
            });
        }, interval);
    }
});

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

exports.play = functions.https.onCall(async (data, context) =>{
    let ref = db.collection("User").doc(data.email).collection("cat").doc(data.catName);
    switch(data.type) {
        case "yarn":
            await ref.update(
                {
                    playYarnCount : admin.firestore.FieldValue.increment(1),
                    mood: admin.firestore.FieldValue.increment(TOY_MOOD.yarn),
                    outcome1: admin.firestore.FieldValue.increment(ACTION_OUTCOME.yarn[0]),
                    outcome2: admin.firestore.FieldValue.increment(ACTION_OUTCOME.yarn[1]),
                    outcome3: admin.firestore.FieldValue.increment(ACTION_OUTCOME.yarn[2]),
                    outcome4: admin.firestore.FieldValue.increment(ACTION_OUTCOME.yarn[3])
                }
            )
          break;
        case "mouse":
            await ref.update(
                {
                    playMouseCount : admin.firestore.FieldValue.increment(1),
                    mood: admin.firestore.FieldValue.increment(TOY_MOOD.mouse),
                    outcome1: admin.firestore.FieldValue.increment(ACTION_OUTCOME.mouse[0]),
                    outcome2: admin.firestore.FieldValue.increment(ACTION_OUTCOME.mouse[1]),
                    outcome3: admin.firestore.FieldValue.increment(ACTION_OUTCOME.mouse[2]),
                    outcome4: admin.firestore.FieldValue.increment(ACTION_OUTCOME.mouse[3])
                }
            )
          break;
        case "stuffed_dog":
            await ref.update(
                {
                    playDogCount : admin.firestore.FieldValue.increment(1),
                    mood: admin.firestore.FieldValue.increment(TOY_MOOD.stuffed_dog),
                    outcome1: admin.firestore.FieldValue.increment(ACTION_OUTCOME.stuffed_dog[0]),
                    outcome2: admin.firestore.FieldValue.increment(ACTION_OUTCOME.stuffed_dog[1]),
                    outcome3: admin.firestore.FieldValue.increment(ACTION_OUTCOME.stuffed_dog[2]),
                    outcome4: admin.firestore.FieldValue.increment(ACTION_OUTCOME.stuffed_dog[3])
                }
            )
          break;
        case "stuffed_elephant":
            await ref.update(
                {
                    playElephantCount : admin.firestore.FieldValue.increment(1),
                    mood: admin.firestore.FieldValue.increment(TOY_MOOD.stuffed_elephant),
                    outcome1: admin.firestore.FieldValue.increment(ACTION_OUTCOME.stuffed_elephant[0]),
                    outcome2: admin.firestore.FieldValue.increment(ACTION_OUTCOME.stuffed_elephant[1]),
                    outcome3: admin.firestore.FieldValue.increment(ACTION_OUTCOME.stuffed_elephant[2]),
                    outcome4: admin.firestore.FieldValue.increment(ACTION_OUTCOME.stuffed_elephant[3])
                }
            )
      }
    return "play success";
});

exports.placeDecor = functions.https.onCall(async (data, context) =>{
    let ref = db.collection("User").doc(data.email).collection("cat").doc(data.catName);
    switch(data.type) {
        case "bell_rope":
            await ref.update(
                {
                    mood: admin.firestore.FieldValue.increment(DECOR_MOOD.bell_rope),
                    outcome1: admin.firestore.FieldValue.increment(ACTION_OUTCOME.bell_rope[0]),
                    outcome2: admin.firestore.FieldValue.increment(ACTION_OUTCOME.bell_rope[1]),
                    outcome3: admin.firestore.FieldValue.increment(ACTION_OUTCOME.bell_rope[2]),
                    outcome4: admin.firestore.FieldValue.increment(ACTION_OUTCOME.bell_rope[3])
                }
            )
          break;
        case "cat_tree":
            await ref.update(
                {
                    mood: admin.firestore.FieldValue.increment(DECOR_MOOD.cat_tree),
                    outcome1: admin.firestore.FieldValue.increment(ACTION_OUTCOME.cat_tree[0]),
                    outcome2: admin.firestore.FieldValue.increment(ACTION_OUTCOME.cat_tree[1]),
                    outcome3: admin.firestore.FieldValue.increment(ACTION_OUTCOME.cat_tree[2]),
                    outcome4: admin.firestore.FieldValue.increment(ACTION_OUTCOME.cat_tree[3])
                }
            )
      }
    return "place decor success";
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

exports.buyToy = functions.https.onCall(async (data, context) =>{
    let ref = db.collection("User").doc(data.email).collection("cat").doc(data.catName);
    switch(data.type) {
        case "yarn":
            await ref.update({
                yarn: true,
                currency: admin.firestore.FieldValue.increment(-TOY_PRICE.yarn)
            })
          break;
        case "mouse":
            await ref.update({
                mouse: true,
                currency: admin.firestore.FieldValue.increment(-TOY_PRICE.mouse)
            })
          break;
        case "stuffed_dog":
            await ref.update({
                stuffed_dog: true,
                currency: admin.firestore.FieldValue.increment(-TOY_PRICE.stuffed_dog)
            })
          break;
        case "stuffed_elephant":
            await ref.update({
                stuffed_elephant: true,
                currency: admin.firestore.FieldValue.increment(-TOY_PRICE.stuffed_elephant)
            })
      }
    return "buy toy success";
});

exports.buyDecor = functions.https.onCall(async (data, context) =>{
    let ref = db.collection("User").doc(data.email).collection("cat").doc(data.catName);
    switch(data.type) {
        case "bell_rope":
            await ref.update({
                bell_rope: admin.firestore.FieldValue.increment(1),
                currency: admin.firestore.FieldValue.increment(-DECOR_PRICE.bell_rope)
            })
          break;
        case "cat_tree":
            await ref.update({
                cat_tree: admin.firestore.FieldValue.increment(1),
                currency: admin.firestore.FieldValue.increment(-DECOR_PRICE.cat_tree)
            })
      }
    return "buy decor success";
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
        let totalPlayCount = user.cat.playDogCount + user.cat.playElephantCount + user.cat.playMouseCount + user.cat.playYarnCount;
        switch(user.cat.specialTask){
            case "specTask1":
                if (user.cat.feedSpecialCount >= SPECTASK1_COUNT) {
                    await catRef.update(
                        {
                            specialTaskCompleted: true,
                            outcome1: admin.firestore.FieldValue.increment(ACTION_OUTCOME.specTask1[0]),
                            outcome2: admin.firestore.FieldValue.increment(ACTION_OUTCOME.specTask1[1]),
                            outcome3: admin.firestore.FieldValue.increment(ACTION_OUTCOME.specTask1[2]),
                            outcome4: admin.firestore.FieldValue.increment(ACTION_OUTCOME.specTask1[3])
                        }
                    );
                    user.cat.outcome1 += ACTION_OUTCOME.specTask1[0];
                    user.cat.outcome2 += ACTION_OUTCOME.specTask1[1];
                    user.cat.outcome3 += ACTION_OUTCOME.specTask1[2];
                    user.cat.outcome4 += ACTION_OUTCOME.specTask1[3];
                    user.specialTaskCompleted = true;
                }
                break;
            case "specTask2":
                if (totalPlayCount >= SPECTASK2_COUNT) {
                    await catRef.update(
                        {
                            specialTaskCompleted: true,
                            outcome1: admin.firestore.FieldValue.increment(ACTION_OUTCOME.specTask2[0]),
                            outcome2: admin.firestore.FieldValue.increment(ACTION_OUTCOME.specTask2[1]),
                            outcome3: admin.firestore.FieldValue.increment(ACTION_OUTCOME.specTask2[2]),
                            outcome4: admin.firestore.FieldValue.increment(ACTION_OUTCOME.specTask2[3])
                        }
                    );
                    user.cat.outcome1 += ACTION_OUTCOME.specTask2[0];
                    user.cat.outcome2 += ACTION_OUTCOME.specTask2[1];
                    user.cat.outcome3 += ACTION_OUTCOME.specTask2[2];
                    user.cat.outcome4 += ACTION_OUTCOME.specTask2[3];
                    user.specialTaskCompleted = true;
                }
                break;
        }
        user.cat.status = calculateOutcome(user.cat);
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

exports.loadCat = functions.https.onCall(async (data, context) =>{
    let cat = {};

    let catRef = db.collection("User").doc(data.email).collection("cat");
    let snapshot = await catRef.where('status', '==', 0).get();

    // no cat error
    if (snapshot.empty) {
        return "No cat, error!";
    }
    snapshot.forEach(doc => {
        cat = doc.data();
    });
    return JSON.stringify(cat);
});

exports.loadClubRoom = functions.https.onCall(async(data, context) => {
    let ref = db.collection("Room").doc("club");
    let snapshot1 = await ref.get();
    let roomInfo = snapshot1.data();

    let cats = [];
    let catRef = db.collection("User").doc("david@218.com").collection("cat");
    let snapshot = await catRef.where('status', '==', 0).get();
    if (!snapshot.empty) {
        snapshot.forEach(doc => {
            cats.push(doc.data());
        });
    }

    catRef = db.collection("User").doc("bob@218.com").collection("cat");
    snapshot = await catRef.where('status', '==', 0).get();
    if (!snapshot.empty) {
        snapshot.forEach(doc => {
            cats.push(doc.data());
        });
    }

    catRef = db.collection("User").doc("carol@218.com").collection("cat");
    snapshot = await catRef.where('status', '==', 0).get();
    if (!snapshot.empty) {
        snapshot.forEach(doc => {
            cats.push(doc.data());
        });
    }
    
    for(var j=0;j<cats.length;j++){
        let temp = {};
        temp.hunger = cats[j].hunger;
        temp.mood = cats[j].mood;
        temp.appearance = cats[j].appearance;
        temp.name = cats[j].name;
        cats[j] = temp;
    }
    roomInfo.cats = cats;

    return JSON.stringify(roomInfo);
});
exports.initCat = functions.https.onCall(async (data, context) =>{
    // set cat attributes randomly
    let randomAge = getRandomItem(AGES);
    let randomApperance = getRandomItem(APPEARANCES);
    let randomBackground = getRandomItem(BACKGROUNDS);
    let randomSpecTask = getRandomItem(SPECIALTASKS);

    let cat = {
        name: data.name,
        status: 0,
        age: randomAge,
        appearance: randomApperance,
        background: randomBackground,
        specialTask: randomSpecTask,
        currency: data.currency,
        startTime: data.time,
        lastLogin: data.time,
        hunger: 60,
        mood: 60,
        outcome1: AGE_OUTCOME[randomAge][0] + APPEARANCE_OUTCOME[randomApperance][0] + BACKGROUND_OUTCOME[randomBackground][0],
        outcome2: AGE_OUTCOME[randomAge][1] + APPEARANCE_OUTCOME[randomApperance][1] + BACKGROUND_OUTCOME[randomBackground][1],
        outcome3: AGE_OUTCOME[randomAge][2] + APPEARANCE_OUTCOME[randomApperance][2] + BACKGROUND_OUTCOME[randomBackground][2],
        outcome4: AGE_OUTCOME[randomAge][3] + APPEARANCE_OUTCOME[randomApperance][3] + BACKGROUND_OUTCOME[randomBackground][3],
        dryFood: 0,
        wetFood: 0,
        specialFood: 0,
        yarn: false,
        mouse: false,
        stuffed_dog: false,
        stuffed_elephant: false,
        bell_rope: 1,
        cat_tree: 1,
        feedDryCount: 0,
        feedWetCount: 0,
        feedSpecialCount: 0,
        playYarnCount: 0,
        playMouseCount: 0,
        playDogCount: 0,
        playElephantCount: 0,
        specialTaskCompleted: false
    }
    const res = await db.collection("User").doc(data.email).collection("cat").doc(data.name).set(cat);
    return JSON.stringify(cat);
});

exports.endStory = functions.https.onCall(async (data, context) =>{
    let catRef = db.collection("User").doc(data.email).collection("cat").doc(data.name);
    let snapshot = await catRef.get();
    let cat = snapshot.data();

    let ref = db.collection("User").doc(data.email);
    await ref.update({
        storyCount: admin.firestore.FieldValue.increment(1),
        currency: cat.currency,
    });
    await catRef.update({
        status: data.status
    });
    return "end success";
});


function calculateOutcome(cat){
    let max = Math.max(cat.outcome1, cat.outcome2, cat.outcome3, cat.outcome4);
    switch(max){
        case cat.outcome1:
            return 1;
        case cat.outcome2:
            return 2;
        case cat.outcome3:
            return 3;
        case cat.outcome4:
            return 4;
    }
    return 0;
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
