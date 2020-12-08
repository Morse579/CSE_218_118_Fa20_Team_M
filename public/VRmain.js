import{displayBoard} from './VRboard.js'

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
const interval = 10000;

var canvas = document.getElementById("renderCanvas"); // Get the canvas element
//var canvas = $("#renderCanvas").get(0);
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

const initPos = [new BABYLON.Vector3(0, 0.2, 8), new BABYLON.Vector3(-8, 0.2, 1), new BABYLON.Vector3(8, 0.2, 1)];
const gatherPos = [new BABYLON.Vector3(0, 0.2, 1), new BABYLON.Vector3(-3, 0.2, 0), new BABYLON.Vector3(3, 0.2, 0)];

var updateOn = false;
// Code for AR scene goes here
var createScene = async function () {
    // Set up basic scene with camera, light, sounds, etc.
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // BGM and sound effect
    const music1 = new BABYLON.Sound("bgm", "./assets/sounds/bensound-ukulele.mp3", scene, null, {loop: true, autoplay: false});
    const music2 = new BABYLON.Sound("bgm", "./assets/sounds/bensound-littleidea.mp3", scene, null, {loop: true, autoplay: false});
    const meow = new BABYLON.Sound("meow", "./assets/sounds/cat-meow.mp3", scene);
    const music = [music1, music2];

    // Food/mood bar parent node
    var root1 = new BABYLON.TransformNode("root"); 
    root1.position = initPos[0];
    root1.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

    var root2 = new BABYLON.TransformNode("root");
    root2.position = initPos[1];
    root2.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

    var root3 = new BABYLON.TransformNode("root");
    root3.position = initPos[2];
    root3.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    
    var roots = [root1, root2, root3];

    var mats = {};
    mats.grey = new BABYLON.StandardMaterial("mat3");
    mats.grey.diffuseTexture = new BABYLON.Texture("assets/color/grey.jpg");

    mats.pink = new BABYLON.StandardMaterial("mat4");
    mats.pink.diffuseTexture = new BABYLON.Texture("assets/color/pink.jpg");

    var env =  scene.createDefaultEnvironment({ 
        createSkybox: true,
        skyboxSize: 150,
        enableGroundShadow: true, 
    });

    const xr = await scene.createDefaultXRExperienceAsync({
        floorMeshes: [env.ground]
    });

    displayBoard(1,10,2);

    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 1});
    sphere.position.y = 1;
    sphere.setEnabled(false);

    // Bound to cat tree
    var box = BABYLON.MeshBuilder.CreateBox("box", {height: 1, width: 6, depth: 3});
    var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
    myMaterial.alpha = 0;
    box.material = myMaterial;
    box.position.y = 0.25;
    box.setEnabled(false);
    box.move = false;

    var ground = BABYLON.MeshBuilder.CreateGround("ground", {width:1000, height:1000}, scene, true);
    ground.position.y = 0.2;
    var groundMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
    groundMaterial.alpha = 0;
    ground.material = groundMaterial;
    var prevCanPosY = null;
    // var canPosX = 7;  // right corner
    // var canPosZ = 9;  // right corner
    var canPosX = 2;
    var canPosZ = 3;
    var cans = [];
    var canCount = 5;

    BABYLON.SceneLoader.ImportMesh("", "./assets/space/conference_room1/", "scene.gltf", scene, 
                                    function (roomMeshes, roomParticleSystems, roomSkeletons) {
        // alert("VR room loaded.");
        var room = roomMeshes[0];
        room.rotation = new BABYLON.Vector3(0, Math.PI, 0);
        room.position = new BABYLON.Vector3(0, 0.1, 0);
        room.scaling = new BABYLON.Vector3(0.03, 0.03, 0.03);
        room.isPickable = false;

        for (var i = 0; i < canCount; i++) {
            BABYLON.SceneLoader.ImportMesh("", "./assets/food/capurrrcino/", "scene.gltf", scene, function (newMeshes, particleSystems, skeletons) {
                var can = newMeshes[0];
                cans.push(can);
                can.position.x = canPosX;
                if (!prevCanPosY) {
                    can.position.y = room.position.y + 0.1;
                }
                else {
                    can.position.y = prevCanPosY + 0.2;
                }
                can.position.z = canPosZ;
                can.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
                prevCanPosY = can.position.y;
            });
        }

        var meshStaticCat = BABYLON.SceneLoader.ImportMesh("", "./assets/cat/CatV2glTFSeparated/",
                                    "ChibiCatV2_unity_orange.gltf", scene, function (newMeshes1, particleSystems1, skeletons1, animationGroups1) {
            var cat1 = newMeshes1[0];
            cat1.scaling = new BABYLON.Vector3(15, 15, 15);
            cat1.rotation = new BABYLON.Vector3(0, Math.PI, 0);
            cat1.position = initPos[0];
            cat1.play = false;
            cat1.hunger = 50;
            if (animationGroups1.length > 0) {
                var cat_anim = ['static', 'cat_attack_jump', 'cat_attack_left', 'cat_catch', 'cat_catch_play', 
                                'cat_clean1', 'cat_death_right', 'cat_eat', 'cat_gallop', 'cat_gallop_right', 
                                'cat_HighJump_air', 'cat_HighJump_land', 'cat_HighJump_up', 'cat_hit_right', 
                                'cat_idle', 'cat_jumpDown_air', 'cat_jumpDown_down', 'cat_jumpDown_land', 
                                'cat_LongJump_up', 'cat_rest1', 'cat_rest2', 'cat_resting1', 'cat_sit', 'cat_sitting',
                                'cat_sleeping', 'cat_static0', 'cat_static1', 'cat_trot', 'cat_trot_left', 
                                'cat_walk', 'cat_walk_right']; 
                animationGroups1[20].play(false);
            }

            // bound invisible control to cat 1
            const cat1Control = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 1.8});
            cat1Control.position = new BABYLON.Vector3(0, 0.9, 8)
            var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
            myMaterial.alpha = 0;
            cat1Control.material = myMaterial;

            // Eat wet food upon clicking
            cat1Control.actionManager = new BABYLON.ActionManager(scene);
            cat1Control.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(
                    {
                        trigger: BABYLON.ActionManager.OnPickTrigger,
                    },
                    function () {
                        meow.play();
                        sendIndividualUpdate(0, "feedWet");
                        playCatEatAnimation(scene, animationGroups1, animationGroups1[20], cans, cat1, 1);
                    }
                )
            );

            var meshStaticCat2 = BABYLON.SceneLoader.ImportMesh("", "./assets/cat/CatV2glTFSeparated/",
                                        "ChibiCatV2_unity_white.gltf", scene, function (newMeshes2, particleSystems2, skeletons2, animationGroups2) {
                var cat2 = newMeshes2[0];
                cat2.scaling = new BABYLON.Vector3(15, 15, 15);
                cat2.rotation = new BABYLON.Vector3(0, Math.PI/2, 0);
                cat2.position = initPos[1];
                cat2.play = false;
                cat2.hunger = 20;
                if (animationGroups2.length > 0) {
                    animationGroups2[5].play(false);
                }

                // bound invisible control to cat 2
                const cat2Control = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2});
                cat2Control.position = new BABYLON.Vector3(-8, 0.9, 1)
                var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
                myMaterial.alpha = 0;
                cat2Control.material = myMaterial;

                // Eat wet food upon clicking
                cat2Control.actionManager = new BABYLON.ActionManager(scene);
                cat2Control.actionManager.registerAction(
                    new BABYLON.ExecuteCodeAction(
                        {
                            trigger: BABYLON.ActionManager.OnPickTrigger,
                        },
                        function () {
                            meow.play();
                            sendIndividualUpdate(1, "feedWet");
                            playCatEatAnimation(scene, animationGroups2, animationGroups2[5], cans, cat2, 2);
                        }
                    )
                );

                var meshStaticCat3 = BABYLON.SceneLoader.ImportMesh("", "./assets/cat/CatV2glTFSeparated/",
                                        "ChibiCatV2_unity_siam.gltf", scene, function (newMeshes3, particleSystems3, skeletons3, animationGroups3) {
                    var cat3 = newMeshes3[0];
                    cat3.scaling = new BABYLON.Vector3(15, 15, 15);
                    cat3.rotation = new BABYLON.Vector3(0, -Math.PI/2, 0);
                    cat3.position = initPos[2];
                    cat3.play = false;
                    cat3.hunger = 70;
                    if (animationGroups3.length > 0) {
                        animationGroups3[24].play(false);
                    }

                    // bound invisible control to cat 3
                    const cat3Control = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2});
                    cat3Control.position = new BABYLON.Vector3(9, 0.5, 1)
                    var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
                    myMaterial.alpha = 0;
                    cat3Control.material = myMaterial;

                    // Eat wet food upon clicking
                    cat3Control.actionManager = new BABYLON.ActionManager(scene);
                    cat3Control.actionManager.registerAction(
                        new BABYLON.ExecuteCodeAction(
                            {
                                trigger: BABYLON.ActionManager.OnPickTrigger,
                            },
                            function () {
                                meow.play();
                                sendIndividualUpdate(2, "feedWet");
                                playCatEatAnimation(scene, animationGroups3, animationGroups3[24], cans, cat3, 3);
                            }
                        )
                    );

                    var cats = [cat1, cat2, cat3];
                    var anim = [animationGroups1, animationGroups2, animationGroups3];

                    var specialFoodMesh = BABYLON.SceneLoader.ImportMesh("", "./assets/food/sardine/", "scene.gltf", scene, function (meshFood) {
                        var specialFood = meshFood[0];
                        specialFood.setEnabled(false);
                        
                        specialFood.rotation = new BABYLON.Vector3(0, Math.PI/2, -Math.PI/2);
                        specialFood.scaling = new BABYLON.Vector3(40, 40, 40);
                        specialFood.position = new BABYLON.Vector3(0, 0.2, 0);

                        var catTreeMesh = BABYLON.SceneLoader.ImportMesh("", "./assets/decor/arbre_a_chat_cat_tree/", "scene.gltf", scene, function (meshCatTree) {
                            var catTree = meshCatTree[0];

                            for(var i = 1; i < meshCatTree.length; i++){
                                meshCatTree[i].isPickable = false;
                            }

                            catTree.rotation = new BABYLON.Vector3(0, -Math.PI/2, 0);
                            catTree.scaling = new BABYLON.Vector3(6, 6, 6);
                            catTree.setParent(box);
                            catTree.position.z += 1;

                            // 3D gui - for mesh interaction
                            var manager = new BABYLON.GUI.GUI3DManager(scene);
                            var bars = addBars(mats, cats, roots);
                            var panelBottom = new BABYLON.GUI.StackPanel3D();
                            manager.addControl(panelBottom);
                            panelBottom.margin = 0.2;
                            panelBottom.position.y = sphere.position.y;
                            panelBottom.position.z = sphere.position.z - 2;
                            var foodButtons = display3DInteractionButtons(panelBottom, bars, mats, cats, roots, anim, specialFood, box, music);

                            // cat meow
                            scene.onPointerObservable.add((pointerInfo) => {
                                switch (pointerInfo.type) { 
                                    case BABYLON.PointerEventTypes.POINTERDOWN:
                                        if(pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh != ground 
                                                && pointerInfo.pickInfo.pickedMesh != cat1Control
                                                && pointerInfo.pickInfo.pickedMesh != cat2Control
                                                && pointerInfo.pickInfo.pickedMesh != cat3Control) {
                                            pointerDown(pointerInfo.pickInfo.pickedMesh)
                                        }
                                        break;
                                    case BABYLON.PointerEventTypes.POINTERUP:
                                        pointerUp();
                                        if(box.isEnabled()){
                                            //console.log(box.position);
                                            sendBoxPosUpdate(box.position);
                                            box.move = true;
                                            setTimeout(()=>{box.move = false}, interval);
                                        }
                                        break;
                                    case BABYLON.PointerEventTypes.POINTERMOVE:          
                                        pointerMove();
                                        break;
                                    case BABYLON.PointerEventTypes.POINTERTAP:          
                                        if(pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh == box) {
                                            box.rotation.y += Math.PI/2;
                                        }
                                        break;
                                }
                            });

                            // get updated info
                            function getUpdate(){
                                console.log("update on: "+ updateOn);
                                if(updateOn){
                                    const updateClub = functions.httpsCallable('updateClub');
                                    updateClub({}).then(res => {
                                        console.log(JSON.parse(res.data));
                                        var update = JSON.parse(res.data);
                                        if(update.state === "feedSpecial" && !cat1.play){
                                            playCatEatTogetherAnimation(cats, roots, anim, specialFood);
                                        }
                                        if(update.indivState1 === "feedWet" && !cat1.play){
                                            playCatEatAnimation(scene, animationGroups1, animationGroups1[20], cans, cat1, 1);
                                        }
                                        if(update.indivState2 === "feedWet" && !cat2.play){
                                            playCatEatAnimation(scene, animationGroups2, animationGroups2[5], cans, cat2, 2);
                                        }
                                        if(update.indivState3 === "feedWet" && !cat3.play){
                                            playCatEatAnimation(scene, animationGroups3, animationGroups3[24], cans, cat3, 3);
                                        }
                                        if(update.displayDecor && !box.move){
                                            box.setEnabled(true);
                                            box.position.x = update.boxPosX;
                                            box.position.z = update.boxPosZ;
                                        }
                                    });
                                }
                                setTimeout(getUpdate, interval); 
                            };
                            setTimeout(getUpdate, 0);
                        });     // cat tree
                    });         // special food
                });             // cat3
            });                 // cat2
        });                     // cat1
    });                         // room

    // Control drag movement
    var startingPoint;
    var currentMesh;

    var getGroundPosition = function () {
        var pickinfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) { return mesh == ground; });
        if (pickinfo.hit) {
            return pickinfo.pickedPoint;
        }
        return null;
    }

    var pointerDown = function (mesh) {
            currentMesh = mesh;
            startingPoint = getGroundPosition();
            if (startingPoint) {
                setTimeout(function () {
                    camera.detachControl(canvas);
                }, 0);
            }
    }

    var pointerUp = function () {
        if (startingPoint) {
            camera.attachControl(canvas, true);
            startingPoint = null;
            return;
        }
    }

    var pointerMove = function () {
        if (!startingPoint) {
            return;
        }
        var current = getGroundPosition();
        if (!current) {
            return;
        }
        var diff = current.subtract(startingPoint);
        currentMesh.position.addInPlace(diff);

        startingPoint = current;
    }
    return scene;
}
//////////

createScene().then(scene => {
    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", function () {
    engine.resize();
    });
});

function addBars(mats, cats, roots){
    var bars = {};
    bars.hungerBar = [];
    bars.hungerBar[0] = [];
    for(var i=0;i<100;i++){
        bars.hungerBar[0][i] = BABYLON.MeshBuilder.CreateBox("box", {height: 0.2, width: 0.02, depth: 0.2});
        bars.hungerBar[0][i].parent = roots[0];
        bars.hungerBar[0][i].position.y = 5;
        bars.hungerBar[0][i].position.x = -1 + i*0.02;
        var hungerValue = cats[0].hunger;
        hungerValue = Math.max(0, hungerValue);
        hungerValue = Math.min(100, hungerValue);
        if(i<hungerValue){
            bars.hungerBar[0][i].material = mats.pink;	
        }
    }

    bars.hungerBar[1] = [];
    for(var i=0;i<100;i++){
        bars.hungerBar[1][i] = BABYLON.MeshBuilder.CreateBox("box", {height: 0.2, width: 0.02, depth: 0.2});
        bars.hungerBar[1][i].parent = roots[1];
        bars.hungerBar[1][i].position.y = 5;
        bars.hungerBar[1][i].position.x = -1 + i*0.02;
        var hungerValue = cats[1].hunger;
        hungerValue = Math.max(0, hungerValue);
        hungerValue = Math.min(100, hungerValue);
        if(i<hungerValue){
            bars.hungerBar[1][i].material = mats.pink;	
        }
    }

    bars.hungerBar[2] = [];
    for(var i=0;i<100;i++){
        bars.hungerBar[2][i] = BABYLON.MeshBuilder.CreateBox("box", {height: 0.2, width: 0.02, depth: 0.2});
        bars.hungerBar[2][i].parent = roots[2];
        bars.hungerBar[2][i].position.y = 5;
        bars.hungerBar[2][i].position.x = -1 + i*0.02;
        var hungerValue = cats[2].hunger;
        hungerValue = Math.max(0, hungerValue);
        hungerValue = Math.min(100, hungerValue);
        if(i<hungerValue){
            bars.hungerBar[2][i].material = mats.pink;	
        }
    }
  
  return bars;
}

function display3DInteractionButtons(panel, bars, mats, cats, roots, anim, food, box, music){
    // console.log("display 3d food buttons");

    // change bgm button
    const sphere1 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.5});

    var musicButton = new BABYLON.GUI.MeshButton3D(sphere1, "musicButton");
    musicButton.onPointerUpObservable.add(function(){
        changeBackgroundMusic(music);
    });   
    panel.addControl(musicButton);

    const sphere2 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.5});
    var decorButton = new BABYLON.GUI.MeshButton3D(sphere2, "wetFoodButton");
    decorButton.onPointerUpObservable.add(function(){
        sendDisplayBoxUpdate();
        box.setEnabled(true);
    });   
    panel.addControl(decorButton);

    const sphere3 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.5});
    var gatherButton = new BABYLON.GUI.MeshButton3D(sphere3, "gatherButton");
    gatherButton.onPointerUpObservable.add(function(){
        playCatEatTogetherAnimation(cats, roots, anim, food);
        updateHungerLevel(bars, cats, mats);
        sendUpdate("feedSpecial");
    });   
    panel.addControl(gatherButton);

    var button = new BABYLON.GUI.Button3D("sync");
    panel.addControl(button);
    button.onPointerUpObservable.add(function(){
        updateOn = !updateOn;
    });   
    
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "SYNC";
    text1.color = "white";
    text1.fontSize = 40;
    button.content = text1;  

    var foodButtons = {
        music: musicButton,
        decor: decorButton,
        gather: gatherButton,
        musicSphere: sphere1,
        decorSphere: sphere2,
        gatherSphere: sphere3
    };
    return foodButtons;
}
function sendUpdate(type){
    const changeState = functions.httpsCallable('changeState');
    changeState({state: type})
    .then(res => {
    });
    // setTimeout(function(){
    //     console.log(`${interval/1000}s later`);
    //     changeState({state: "none"});
    // }, interval);
}

function sendIndividualUpdate(num, type){
    const changeIndivState = functions.httpsCallable('changeIndivState');
    changeIndivState({index: num, state: type})
    .then(res => {
    });
    // setTimeout(function(){
    //     console.log(`${interval/1000}s later`);
    //     changeIndivState({index: num, state: "none"});
    // }, interval);
}

function sendDisplayBoxUpdate(){
    const displayDecor = functions.httpsCallable('displayDecor');
    displayDecor({}).then(res => {});
}

function sendBoxPosUpdate(position){
    const updateBoxPos = functions.httpsCallable('updateBoxPos');
    updateBoxPos({x: position.x, z: position.z})
    .then(res => {
    });
}
function updateHungerLevel(bars, cats, mats){
    cats[0].hunger += 10;
    for(var i = cats[0].hunger-10;i<cats[0].hunger;i++){
        bars.hungerBar[0][i].material = mats.pink;
    }
    cats[1].hunger += 10;
    for(var i = cats[1].hunger-10;i<cats[1].hunger;i++){
        bars.hungerBar[1][i].material = mats.pink;
    }
    cats[2].hunger += 10;
    for(var i = cats[2].hunger-10;i<cats[2].hunger;i++){
        bars.hungerBar[2][i].material = mats.pink;
    }
}

function changeBackgroundMusic(music){
    if(music[0].isPlaying){
        music[0].stop();
        music[1].play();
    }
    else{
        music[1].stop();
        music[0].play();
    }
}

function playCatEatAnimation(scene, animationGroups, afterEatingAnim, cans, cat, index){
    cat.play = true;
    var can_eaten = cans[cans.length - 1];
    cans.pop();

    if(index === 1){
        can_eaten.position.x = cat.position.x;
        can_eaten.position.y = cat.position.y;
        can_eaten.position.z = cat.position.z - 1.3;
    }else if(index === 2){
        can_eaten.position.x = cat.position.x + 1.3;
        can_eaten.position.y = cat.position.y;
        can_eaten.position.z = cat.position.z;
    }else if(index === 3){
        can_eaten.position.x = cat.position.x - 1.3;
        can_eaten.position.y = cat.position.y;
        can_eaten.position.z = cat.position.z;
    }
    //console.log("after move");
    
    animationGroups[7].play(false);

    setTimeout(function(){
        afterEatingAnim.play(false);
        can_eaten.setEnabled(false);
    }, 4000);
    setTimeout(()=>{
        cat.play = false;
    }, interval);
}

function playCatEatTogetherAnimation(cats, roots, anim, food){
    cats[0].play = true;
    cats[1].play = true;
    cats[2].play = true;

    // food appear and disappear
    food.setEnabled(true);
    setTimeout(function(){
        food.setEnabled(false);
    }, 8000);

    // cat1 move and eat
    cats[0].rotation = new BABYLON.Vector3(0, Math.PI, 0);
    anim[0][27].play(true);
    BABYLON.Animation.CreateAndStartAnimation("anim", cats[0], "position", 30, 
                        60, initPos[0], gatherPos[0], BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    BABYLON.Animation.CreateAndStartAnimation("anim", roots[0], "position", 30, 
                        60, initPos[0], gatherPos[0], BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    setTimeout(function(){
        anim[0][7].play(true);
    }, 2000);

    // cat1 finish eating and go back to original position
    setTimeout(function(){
        cats[0].rotation = new BABYLON.Vector3(0, 0, 0);
        anim[0][7].stop();
        anim[0][27].play(true);
        BABYLON.Animation.CreateAndStartAnimation("anim", cats[0], "position", 30, 
                        60, gatherPos[0], initPos[0], BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        BABYLON.Animation.CreateAndStartAnimation("anim", roots[0], "position", 30, 
                        60, gatherPos[0], initPos[0], BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    }, 8000);

    setTimeout(function(){
        cats[0].rotation = new BABYLON.Vector3(0, Math.PI, 0);
        anim[0][27].stop();
        anim[0][20].play(false);

        // cat finish animation
        cats[0].play = false;
        cats[1].play = false;
        cats[2].play = false;
    }, 10000);

    // cat2 move and eat
    cats[1].rotation = new BABYLON.Vector3(0, Math.PI/2, 0);
    anim[1][5].stop();
    anim[1][27].play(true);
    BABYLON.Animation.CreateAndStartAnimation("anim", cats[1], "position", 30, 
                        40, initPos[1], gatherPos[1], BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    BABYLON.Animation.CreateAndStartAnimation("anim", roots[1], "position", 30, 
                        40, initPos[1], gatherPos[1], BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    setTimeout(function(){
        anim[1][7].play(true);
    }, 1333);

    // cat2 finish eating and go back to original position
    setTimeout(function(){
        cats[1].rotation = new BABYLON.Vector3(0, -Math.PI/2, 0);
        anim[1][7].stop();
        anim[1][27].play(true);
        BABYLON.Animation.CreateAndStartAnimation("anim", cats[1], "position", 30, 
                        40, gatherPos[1], initPos[1], BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        BABYLON.Animation.CreateAndStartAnimation("anim", roots[1], "position", 30, 
                        40, gatherPos[1], initPos[1], BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    }, 8000);

    setTimeout(function(){
        cats[1].rotation = new BABYLON.Vector3(0, Math.PI/2, 0);
        anim[1][27].stop();
        anim[1][5].play(false);
    }, 9333);

    // cat3 move and eat
    cats[2].rotation = new BABYLON.Vector3(0, -Math.PI/2, 0);
    anim[2][27].play(true);
    BABYLON.Animation.CreateAndStartAnimation("anim", cats[2], "position", 30, 
                        40, initPos[2], gatherPos[2], BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    BABYLON.Animation.CreateAndStartAnimation("anim", roots[2], "position", 30, 
                        40, initPos[2], gatherPos[2], BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    setTimeout(function(){
        anim[2][7].play(true);
    }, 1333);

    // cat3 finish eating and go back to original position
    setTimeout(function(){
        cats[2].rotation = new BABYLON.Vector3(0, Math.PI/2, 0);
        anim[2][7].stop();
        anim[2][27].play(true);
        BABYLON.Animation.CreateAndStartAnimation("anim", cats[2], "position", 30, 
                        40, gatherPos[2], initPos[2], BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        BABYLON.Animation.CreateAndStartAnimation("anim", roots[2], "position", 30, 
                        40, gatherPos[2], initPos[2], BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
    }, 8000);

    setTimeout(function(){
        cats[2].rotation = new BABYLON.Vector3(0, -Math.PI/2, 0);
        anim[2][27].stop();
        anim[2][24].play(false);
    }, 9333);
}