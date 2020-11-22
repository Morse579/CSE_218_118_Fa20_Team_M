

        // <!------------------------------------>
        // <pre id="json"></pre>
        // <button id="buyDryFood">Buy Dry Food</button>
        // <button id="buyWetFood">Buy Wet Food</button>
        // <button id="buySpFood">Buy Special Food</button><br><br>

        // <button id="feedDryFood">Feed Dry Food</button>
        // <button id="feedWetFood">Feed Wet Food</button>
        // <button id="feedSpFood">Feed Special Food</button><br><br>
        // <!------------------------------------></br>
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

