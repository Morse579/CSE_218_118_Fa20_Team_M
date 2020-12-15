export { addNamesAndBars, updateHungerLevel, updateMoodLevel, updateIndivHungerLevel, updateIndivMoodLevel }

var clickNames = 0;
var randAnim = [1, 2, 6, 19, 20, 22];

function addNamesAndBars(mats, cats, anim, roots, clubroom){
    var bars = {};
    bars.hungerBar = [];
    bars.moodBar = [];

    // Add name
    var plane1 = BABYLON.Mesh.CreatePlane("plane", 2.2);
    var plane2 = BABYLON.Mesh.CreatePlane("plane", 2.2);
    var plane3 = BABYLON.Mesh.CreatePlane("plane", 2.2);

    plane1.parent = roots[0];
    plane2.parent = roots[1];
    plane3.parent = roots[2];
    plane1.position.y = 3;
    plane2.position.y = 3;
    plane3.position.y = 3;

    var advancedTexture1 = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane1);
    var advancedTexture2 = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane2);
    var advancedTexture3 = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane3);

    var button1 = BABYLON.GUI.Button.CreateSimpleButton("but", cats[0].name);
    var button2 = BABYLON.GUI.Button.CreateSimpleButton("but", cats[1].name);
    var button3 = BABYLON.GUI.Button.CreateSimpleButton("but", cats[2].name);

    button1.width = 1;
    button1.height = 0.3;
    button1.color = "white";
    button1.fontSize = 180;
    button1.cornerRadius = 40;
    button1.background = "green";
    button1.onPointerUpObservable.add(function() {
        var rand = Math.floor(Math.random() * randAnim.length);
        anim[0][randAnim[rand]].play(false);
        checkBGMRewards(clubroom);
    });
    advancedTexture1.addControl(button1);

    button2.width = 1;
    button2.height = 0.3;
    button2.color = "white";
    button2.fontSize = 200;
    button2.cornerRadius = 40;
    button2.background = "green";
    button2.onPointerUpObservable.add(function() {
        var rand = Math.floor(Math.random() * randAnim.length);
        anim[1][randAnim[rand]].play(false);
        checkBGMRewards(clubroom);
    });
    advancedTexture2.addControl(button2);

    button3.width = 1;
    button3.height = 0.3;
    button3.color = "white";
    button3.fontSize = 200;
    button3.cornerRadius = 40;
    button3.background = "green";
    button3.onPointerUpObservable.add(function() {
        var rand = Math.floor(Math.random() * randAnim.length);
        anim[2][randAnim[rand]].play(false);
        checkBGMRewards(clubroom);
    });
    advancedTexture3.addControl(button3);
    
    for(var j=0;j<3;j++){
        // Add bars
        bars.hungerBar[j] = [];
        for(var i=0;i<100;i++){
            bars.hungerBar[j][i] = BABYLON.MeshBuilder.CreateBox("box", {height: 0.2, width: 0.02, depth: 0.2});
            bars.hungerBar[j][i].parent = roots[j];
            bars.hungerBar[j][i].position.y = 4.5;
            bars.hungerBar[j][i].position.x = -1 + i*0.02;
            var hungerValue = cats[j].hunger;
            hungerValue = Math.max(0, hungerValue);
            hungerValue = Math.min(100, hungerValue);
            if(i<hungerValue){
                bars.hungerBar[j][i].material = mats.pink;	
            }
        }
        bars.moodBar[j] = [];
        for(var i=0;i<100;i++){
            bars.moodBar[j][i] = BABYLON.MeshBuilder.CreateBox("box", {height: 0.2, width: 0.02, depth: 0.2});
            bars.moodBar[j][i].parent = roots[j];
            bars.moodBar[j][i].position.y = 4;
            bars.moodBar[j][i].position.x = -1 + i*0.02;
            var moodValue = cats[j].mood;
            moodValue = Math.max(0, moodValue);
            moodValue = Math.min(100, moodValue);
            if(i<moodValue){
                bars.moodBar[j][i].material = mats.orange;	
            }
        }
    }
  return bars;
}

function checkBGMRewards(clubroom){
    clickNames++;
    if(clickNames === 3){
        clubroom.numBGM++;
        displayUnlockBGM();

        
    }else if(clickNames === 6){
        clubroom.numBGM++;
        displayUnlockBGM();
    }
}

function displayUnlockBGM(){
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    var grid = new BABYLON.GUI.Grid(); 
    advancedTexture.addControl(grid); 
    grid.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;   
    grid.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    
    grid.widthInPixels = 400;
    grid.heightInPixels = 200;

    var rect= new BABYLON.GUI.Rectangle();
    rect.cornerRadius = 100;
    rect.background =  "#6B899E";
    rect.alpha = 0.8;
    rect.thickness = 10;
    grid.addControl(rect, 0, 0);

    var unlockText = new BABYLON.GUI.TextBlock();
    unlockText.text = "Unlock New BGM!";
    unlockText.heightInPixels = 100;
    unlockText.color = "#E5A33F";
    unlockText.fontSize = 40;
    grid.addControl(unlockText, 0, 0);
    setTimeout(()=>{
        advancedTexture.removeControl(grid);
        advancedTexture.removeControl(rect);
    }, 1500);
}

function updateHungerLevel(bars, cats, mats, val){
    cats[0].hunger += val;
    for(var i = Math.max(cats[0].hunger-val,0);i<Math.min(cats[0].hunger,100);i++){
        bars.hungerBar[0][i].material = mats.pink;
    }
    cats[1].hunger += val;
    for(var i = Math.max(cats[1].hunger-val,0);i<Math.min(cats[1].hunger,100);i++){
        bars.hungerBar[1][i].material = mats.pink;
    }
    cats[2].hunger += val;
    for(var i = Math.max(cats[2].hunger-val,0);i<Math.min(cats[2].hunger,100);i++){
        bars.hungerBar[2][i].material = mats.pink;
    }
}
function updateMoodLevel(bars, cats, mats, val){
    cats[0].mood += val;
    for(var i = Math.max(cats[0].mood,0);i<Math.min(cats[0].mood-val,100);i++){
        bars.moodBar[0][i].material = null;
    }
    cats[1].mood += val;
    for(var i = Math.max(cats[1].mood,0);i<Math.min(cats[1].mood-val,100);i++){
        bars.moodBar[1][i].material = null;
    }
    cats[2].mood += val;
    for(var i = Math.max(cats[2].mood,0);i<Math.min(cats[2].mood-val,100);i++){
        bars.moodBar[2][i].material = null;
    }
}

function updateIndivHungerLevel(bars, cat, mats, index, val){
    cat.hunger += val;
    for(var i = Math.max(cat.hunger-val,0);i<Math.min(cat.hunger,100);i++){
        bars.hungerBar[index][i].material = mats.pink;
    }
}
function updateIndivMoodLevel(bars, cat, mats, index, val){
    cat.mood += val;
    console.log(index, cat.mood);
    for(var i = Math.max(cat.mood-val,0);i<Math.min(cat.mood,100);i++){
        bars.moodBar[index][i].material = mats.orange;
    }
}