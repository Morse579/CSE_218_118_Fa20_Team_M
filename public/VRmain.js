import{displayTaskBoard} from './VRboard.js'
import{sendUpdateLocal, sendIndivUpdateLocal, sendDisplayTreeUpdate, sendTreePosUpdate,
    sendDisplayBoardUpdate, sendBoardPosUpdate, sendDisplayElephantUpdate, sendElephantPosUpdate,
    sendCansUpdate} 
    from './sync.js'

const FEED_WET_HUNGER = 4;
const FEED_SP_HUNGER = 10;
const FEED_WET_MOOD = 4;
const FEED_SP_MOOD = -5;

const interval = 2000;

// function initVRscene(roomInfo){
var cat1 = {
    hunger: 50,
    mood: 20,
    name: "Java",
    appearance: "black"
};
var cat2 = {
    hunger: 50,
    mood: 20,
    name: "C++",
    appearance: "siam"
};
var cat3 = {
    hunger: 60,
    mood: 10,
    name: "Python",
    appearance: "white"
};
let catsInfo = [cat1, cat2, cat3];
var canvas = document.getElementById("renderCanvas"); // Get the canvas element
//var canvas = $("#renderCanvas").get(0);
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

const initPos = [new BABYLON.Vector3(0, 0.2, 8), new BABYLON.Vector3(-8, 0.2, 1), new BABYLON.Vector3(8, 0.2, 1)];
const gatherPos = [new BABYLON.Vector3(0, 0.2, 1), new BABYLON.Vector3(-3, 0.2, 0), new BABYLON.Vector3(3, 0.2, 0)];

var numBGM = 2;
var currBGM = -1;
var clickNames = 0;

// food stack position
var canCount = 2;
var prevCanPosY = null;
var prevFishPosX = null;
var roomPosY = null;

// music task
var rewardMusicIsPlaying = false;
var musicTaskRewarded = false;

// feed wet task
var wetCountForReward = 2;  // need to feed such amount of wet food for a special food reward
var feedWetCount = 0;
var fishMaxCount = 4;
var lastOwnedFishIndex = -1;

var updateOn = true;
var bars = {};

var randAnim = [1, 2, 6, 19, 20, 22];

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
    const rewardMusic = new BABYLON.Sound("bgm", "./assets/sounds/bensound-ukulele-clip-3s.mp3", scene, null, {loop: false, autoplay: false});
    const music1 = new BABYLON.Sound("bgm", "./assets/sounds/bensound-ukulele.mp3", scene, null, {loop: false, autoplay: false});
    const music2 = new BABYLON.Sound("bgm", "./assets/sounds/bensound-littleidea.mp3", scene, null, {loop: false, autoplay: false});
    const music3 = new BABYLON.Sound("bgm", "./assets/sounds/bensound-smile.mp3", scene, null, {loop: false, autoplay: false});
    const music4 = new BABYLON.Sound("bgm", "./assets/sounds/bensound-cute.mp3", scene, null, {loop: false, autoplay: false});
    const meow = new BABYLON.Sound("meow", "./assets/sounds/cat-meow.mp3", scene);
    const music = [music1, music2, music3, music4];

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
    
    mats.orange = new BABYLON.StandardMaterial("mat4");
    mats.orange.diffuseTexture = new BABYLON.Texture("assets/color/orange.jpg");

    var env =  scene.createDefaultEnvironment({ 
        createSkybox: true,
        skyboxSize: 150,
        enableGroundShadow: true, 
    });

    const xr = await scene.createDefaultXRExperienceAsync({
        floorMeshes: [env.ground]
    });

    //var board = {};
    var board = displayTaskBoard(1,10,2);

    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 1});
    sphere.position.z = -3;
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

    var catTreeMesh = BABYLON.SceneLoader.ImportMesh("", "./assets/decor/arbre_a_chat_cat_tree/", "scene.gltf", scene, function (meshCatTree) {
        var catTree = meshCatTree[0];

        for(var i = 1; i < meshCatTree.length; i++){
            meshCatTree[i].isPickable = false;
        }
        catTree.rotation = new BABYLON.Vector3(0, -Math.PI/2, 0);
        catTree.scaling = new BABYLON.Vector3(6, 6, 6);
        catTree.setParent(box);
        catTree.position.z += 1;
    });

    // Bound to cardboard
    var box2 = BABYLON.MeshBuilder.CreateBox("box", {height: 3, width: 2, depth: 2});
    var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
    myMaterial.alpha = 0;
    box2.material = myMaterial;
    box2.position.y = 0.25;
    box2.setEnabled(false);
    box2.move = false;

    var cardBoardMesh = BABYLON.SceneLoader.ImportMesh("", "./assets/decor/cardboard_box/", "scene.gltf", scene, function (meshCardBoard) {
        var cardBoard = meshCardBoard[0];
        cardBoard.isPickable = false;

        for(var i = 1; i < meshCardBoard.length; i++){
            meshCardBoard[i].isPickable = false;
        }
        cardBoard.rotation = new BABYLON.Vector3(0, 0, 0);
        cardBoard.scaling = new BABYLON.Vector3(1, 1, 1);
        cardBoard.setParent(box2);
        cardBoard.position.y += 1;
    });

    // Bound to toy
    var box3 = BABYLON.MeshBuilder.CreateBox("box", {height: 6, width: 1.5, depth: 1.5});
    var myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
    myMaterial.alpha = 0;
    box3.material = myMaterial;
    box3.position.y = 0.25;
    box3.setEnabled(false);
    box3.move = false;

    var toyMesh = BABYLON.SceneLoader.ImportMesh("", "./assets/toy/stuffed1/", "scene.gltf", scene, function (meshToy) {
        var toy = meshToy[0];
        toy.isPickable = false;

        for(var i = 1; i < meshToy.length; i++){
            meshToy[i].isPickable = false;
        }
        toy.rotation = new BABYLON.Vector3(0, Math.PI, 0);
        toy.scaling = new BABYLON.Vector3(0.02, 0.02, 0.02);
        toy.setParent(box3);
        toy.position.y += 2.2;
        toy.position.z += 1;
    });

    var boxes = [box, box2, box3];

    var ground = BABYLON.MeshBuilder.CreateGround("ground", {width:1000, height:1000}, scene, true);
    ground.position.y = 0.2;
    var groundMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
    groundMaterial.alpha = 0;
    ground.material = groundMaterial;

    // can
    var canPosX = 2;
    var canPosZ = 3;
    var cans = [];

    // fish
    var fishPosX = 10;
    var fishPosZ = 13;
    var allFish = [];
    var fishCount = 2;

    BABYLON.SceneLoader.ImportMesh("", "./assets/space/conference_room1/", "scene.gltf", scene, 
                                    function (roomMeshes, roomParticleSystems, roomSkeletons) {
        // alert("VR room loaded.");
        var room = roomMeshes[0];
        room.rotation = new BABYLON.Vector3(0, Math.PI, 0);
        room.position = new BABYLON.Vector3(0, 0.1, 0);
        room.scaling = new BABYLON.Vector3(0.03, 0.03, 0.03);
        room.isPickable = false;
        roomPosY = room.position.y;

        // load can
        for (var i = 0; i < canCount; i++) {
            BABYLON.SceneLoader.ImportMesh("", "./assets/food/capurrrcino/", "scene.gltf", scene, function (newMeshes, particleSystems, skeletons) {
                var can = newMeshes[0];
                cans.push(can);
                can.position.x = canPosX;
                if (!prevCanPosY) {
                    can.position.y = roomPosY + 0.15;
                }
                else {
                    can.position.y = prevCanPosY + 0.2;
                }
                can.position.z = canPosZ;
                can.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
                prevCanPosY = can.position.y;
            });
        }

        // load owned fish
        for (var i = 0; i < fishCount; i++) {
            BABYLON.SceneLoader.ImportMesh("", "./assets/food/sardine/", "scene.gltf", scene, function (newMeshes, particleSystems, skeletons) {
                var fish = newMeshes[0];
                allFish.push(fish);
                lastOwnedFishIndex += 1;
                console.log("loaded owned fish, index = ", lastOwnedFishIndex);
                fish.position.y = roomPosY + 0.3;
                fish.position.z = fishPosZ;
                if (!prevFishPosX) {
                    fish.position.x = fishPosX;
                }
                else {
                    fish.position.x = prevFishPosX - 1.5;
                }
                fish.scaling = new BABYLON.Vector3(40, 40, 40);
                fish.rotation = new BABYLON.Vector3(0, 0, -Math.PI/2);
                prevFishPosX = fish.position.x;
            });
        }

        // load more fish for possible later use
        for (var i = 0; i < fishMaxCount - fishCount; i++) {
            BABYLON.SceneLoader.ImportMesh("", "./assets/food/sardine/", "scene.gltf", scene, function (newMeshes, particleSystems, skeletons) {
                var fish = newMeshes[0];
                allFish.push(fish);
                fish.setEnabled(false);
                console.log("loaded nonexistent fish");
            });
        }

        var meshStaticCat = BABYLON.SceneLoader.ImportMesh("", "./assets/cat/CatV2glTFSeparated/",
                                    getCatColorFile(catsInfo[0].appearance), scene, 
                                    function (newMeshes1, particleSystems1, skeletons1, animationGroups1) {
            var cat1 = newMeshes1[0];
            cat1.scaling = new BABYLON.Vector3(15, 15, 15);
            cat1.rotation = new BABYLON.Vector3(0, Math.PI, 0);
            cat1.position = initPos[0];
            cat1.play = false;
            cat1.hunger = catsInfo[0].hunger;
            cat1.mood = catsInfo[0].mood;
            cat1.name = catsInfo[0].name;
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
                        if(updateOn){
                            //sendIndividualUpdate(0, "feedWet", catsInfo[0].name);
                            sendIndivUpdateLocal(1);
                        }
                        playCatEatAnimation(scene, animationGroups1, animationGroups1[20], cans, cat1, 1, bars, mats, fishPosX, allFish, fishPosZ);
                    }
                )
            );

            var meshStaticCat2 = BABYLON.SceneLoader.ImportMesh("", "./assets/cat/CatV2glTFSeparated/",
                                        getCatColorFile(catsInfo[1].appearance), scene, 
                                        function (newMeshes2, particleSystems2, skeletons2, animationGroups2) {
                var cat2 = newMeshes2[0];
                cat2.scaling = new BABYLON.Vector3(15, 15, 15);
                cat2.rotation = new BABYLON.Vector3(0, Math.PI/2, 0);
                cat2.position = initPos[1];
                cat2.play = false;
                cat2.hunger = catsInfo[1].hunger;
                cat2.mood = catsInfo[1].mood;
                cat2.name = catsInfo[1].name;
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
                            if(updateOn){
                                //sendIndividualUpdate(1, "feedWet", catsInfo[1].name);
                                sendIndivUpdateLocal(2);
                            }
                            playCatEatAnimation(scene, animationGroups2, animationGroups2[5], cans, cat2, 2, bars, mats, fishPosX, allFish, fishPosZ);
                        }
                    )
                );

                var meshStaticCat3 = BABYLON.SceneLoader.ImportMesh("", "./assets/cat/CatV2glTFSeparated/",
                                            getCatColorFile(catsInfo[2].appearance), scene, 
                                            function (newMeshes3, particleSystems3, skeletons3, animationGroups3) {
                    var cat3 = newMeshes3[0];
                    cat3.scaling = new BABYLON.Vector3(15, 15, 15);
                    cat3.rotation = new BABYLON.Vector3(0, -Math.PI/2, 0);
                    cat3.position = initPos[2];
                    cat3.play = false;
                    cat3.hunger = catsInfo[2].hunger;
                    cat3.mood = catsInfo[2].mood;
                    cat3.name = catsInfo[2].name;
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
                                if(updateOn){
                                    //sendIndividualUpdate(2, "feedWet", catsInfo[2].name);
                                    sendIndivUpdateLocal(3);
                                }
                                playCatEatAnimation(scene, animationGroups3, animationGroups3[24], cans, cat3, 3, bars, mats, fishPosX, allFish, fishPosZ);
                            }
                        )
                    );

                    var cats = [cat1, cat2, cat3];
                    var anim = [animationGroups1, animationGroups2, animationGroups3];

                    // 3D gui - for mesh interaction
                    var manager = new BABYLON.GUI.GUI3DManager(scene);
                    bars = addNamesAndBars(mats, cats, anim, roots);
                    var panelBottom = new BABYLON.GUI.StackPanel3D();
                    manager.addControl(panelBottom);
                    panelBottom.margin = 0.2;
                    panelBottom.position.y = sphere.position.y;
                    panelBottom.position.z = sphere.position.z - 2;
                    var interactButtons = display3DInteractionButtons(panelBottom, bars, mats, cats, roots, anim, allFish, boxes, music, 
                                                                    rewardMusic, scene, cans, canPosX, canPosZ, fishPosX, board);

                    // cat meow
                    scene.onPointerObservable.add((pointerInfo) => {
                        switch (pointerInfo.type) { 
                            case BABYLON.PointerEventTypes.POINTERDOWN:
                                if(pointerInfo.pickInfo.hit && (pointerInfo.pickInfo.pickedMesh == box 
                                                            || pointerInfo.pickInfo.pickedMesh == box2
                                                            || pointerInfo.pickInfo.pickedMesh == box3)) {
                                    pointerDown(pointerInfo.pickInfo.pickedMesh)
                                }
                                break;
                            case BABYLON.PointerEventTypes.POINTERUP:
                                pointerUp();
                                if(box.isEnabled() && pointerInfo.pickInfo.pickedMesh == box){
                                    if(updateOn){
                                        //sendBoxPosUpdate(box.position);
                                        sendTreePosUpdate(box.position);
                                    }
                                    box.move = true;
                                    setTimeout(()=>{box.move = false}, interval);
                                }
                                if(box2.isEnabled() && pointerInfo.pickInfo.pickedMesh == box2){
                                    if(updateOn){
                                        sendBoardPosUpdate(box2.position);
                                    }
                                    box2.move = true;
                                    setTimeout(()=>{box2.move = false}, interval);
                                }
                                if(box3.isEnabled() && pointerInfo.pickInfo.pickedMesh == box3){
                                    if(updateOn){
                                        sendElephantPosUpdate(box3.position);
                                    }
                                    box3.move = true;
                                    setTimeout(()=>{box3.move = false}, interval);
                                }
                            
                                break;
                            case BABYLON.PointerEventTypes.POINTERMOVE:          
                                pointerMove();
                                break;
                            case BABYLON.PointerEventTypes.POINTERTAP:          
                                if(pointerInfo.pickInfo.hit) {
                                    if(pointerInfo.pickInfo.pickedMesh == box){
                                        box.rotation.y += Math.PI/2;
                                    }
                                    else if(pointerInfo.pickInfo.pickedMesh == box2){
                                        box2.rotation.y += Math.PI/2;
                                    }
                                    else if(pointerInfo.pickInfo.pickedMesh == box3){
                                        box3.rotation.y += Math.PI/2;
                                    }
                                }
                                break;
                        }
                    });

                    // get updated info
                    function getUpdate(){
                        if(updateOn){
                            // console.log("canCount: ", canCount);
                            var xhttp = new XMLHttpRequest();
                            xhttp.onreadystatechange = function() {
                                if (this.readyState == 4 && this.status == 200) {
                                    var update = JSON.parse(xhttp.responseText);
                                    // console.log(update);
                                    if(update.state === "feedSpecial" && !cat1.play){
                                        playCatEatTogetherAnimation(cats, roots, anim, allFish, bars, mats, fishPosX, roomPosY);
                                    }
                                    if(update.indivState1 === "feedWet" && !cat1.play){
                                        playCatEatAnimation(scene, animationGroups1, animationGroups1[20], cans, cat1, 1, bars, mats, fishPosX, allFish, fishPosZ);
                                    }
                                    if(update.indivState2 === "feedWet" && !cat2.play){
                                        playCatEatAnimation(scene, animationGroups2, animationGroups2[5], cans, cat2, 2, bars, mats, fishPosX, allFish, fishPosZ);
                                    }
                                    if(update.indivState3 === "feedWet" && !cat3.play){
                                        playCatEatAnimation(scene, animationGroups3, animationGroups3[24], cans, cat3, 3, bars, mats, fishPosX, allFish, fishPosZ);
                                    }
                                    if(update.displayTree && !box.move){
                                        box.setEnabled(true);
                                        box.position.x = update.treePosX;
                                        box.position.z = update.treePosZ;
                                    }
                                    if(update.displayBoard && !box2.move){
                                        box2.setEnabled(true);
                                        box2.position.x = update.boardPosX;
                                        box2.position.z = update.boardPosZ;
                                    }
                                    if(update.displayElephant && !box3.move){
                                        box3.setEnabled(true);
                                        box3.position.x = update.elephantPosX;
                                        box3.position.z = update.elephantPosZ;
                                    }
                                    if(update.feedSpecialCount >= 1){
                                        interactButtons.board.isVisible = true;
                                    }
                                    if(update.feedSpecialCount >= 2){
                                        interactButtons.tree.isVisible = true;
                                    }
                                    if(update.feedSpecialCount >= 3){
                                        interactButtons.elephant.isVisible = true;
                                    }
                                    if(update.cans !== canCount){
                                        var diff = update.cans - canCount;
                                        for(var d = 0;d < diff;d++){
                                            canCount += 1;
                                            // add more cans
                                            BABYLON.SceneLoader.ImportMesh("", "./assets/food/capurrrcino/", "scene.gltf", scene, function (newMeshes, particleSystems, skeletons) {
                                                // console.log("in getUpdate, diff = ", diff);
                                                var can = newMeshes[0];
                                                cans.push(can);
                                                can.position.x = canPosX;
                                                if (!prevCanPosY) {
                                                    can.position.y = roomPosY + 0.15;
                                                }
                                                else {
                                                    can.position.y = prevCanPosY + 0.2;
                                                }
                                                can.position.z = canPosZ;
                                                can.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
                                                prevCanPosY = can.position.y;
                                            });
                                        }
                                    }
                                }
                            }
                            xhttp.open("GET", "http://127.0.0.1:2020/update", true);
                            xhttp.send();
                        }
                        setTimeout(getUpdate, interval); 
                    };
                    setTimeout(getUpdate, 0);
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

function addNamesAndBars(mats, cats, anim, roots){
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
        checkBGMRewards();
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
        checkBGMRewards();
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
        checkBGMRewards();
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

function display3DInteractionButtons(panel, bars, mats, cats, roots, anim, allFish, boxes, music, rewardMusic, 
                                     scene, cans, canPosX, canPosZ, fishPosX, taskBoard){

    // change bgm button
    var musicButton = new BABYLON.GUI.Button3D("musicButton");
    musicButton.onPointerUpObservable.add(function(){
        changeBackgroundMusic(music); 
    });   
    panel.addControl(musicButton);
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "change bgm";
    text1.color = "white";
    text1.fontSize = 40;
    musicButton.content = text1; 

    // Music Task button
    var musicTaskButton = new BABYLON.GUI.Button3D("musicTaskButton");
    musicTaskButton.onPointerUpObservable.add(function(){
        musicTask(scene, rewardMusic, cans, canPosX, canPosZ, musicTaskButton);
    });   
    panel.addControl(musicTaskButton);
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Ads\nfor reward";
    text1.color = "white";
    text1.fontSize = 35;
    musicTaskButton.content = text1; 

    // Feed together button
    var gatherButton = new BABYLON.GUI.Button3D("gatherButton");
    gatherButton.onPointerUpObservable.add(function(){
        playCatEatTogetherAnimation(cats, roots, anim, allFish, bars, mats, fishPosX, roomPosY);
        if(updateOn){
            //sendUpdate("feedSpecial", catsInfo);
            sendUpdateLocal();
        }
        
    });   
    panel.addControl(gatherButton);
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Feed Together";
    text1.color = "white";
    text1.fontSize = 40;
    gatherButton.content = text1; 

    // Sync button
    // var button = new BABYLON.GUI.Button3D("sync");
    // panel.addControl(button);
    // button.onPointerUpObservable.add(function(){
    //     updateOn = !updateOn;
    // });   
    
    // var text1 = new BABYLON.GUI.TextBlock();
    // text1.text = "SYNC";
    // text1.color = "white";
    // text1.fontSize = 40;
    // button.content = text1;  

    // cardboard button

    var boardButton = new BABYLON.GUI.Button3D("TaskBoard");
    panel.addControl(boardButton);
    boardButton.onPointerUpObservable.add(function(){
        //taskBoard.isVisible = !taskBoard.isVisible;
        taskBoard.displayed = !taskBoard.displayed;
        taskBoard.setEnabled(taskBoard.displayed);
    });   
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Task\nBoard";
    text1.color = "white";
    text1.fontSize = 40;
    boardButton.content = text1;  

    var cardBoardButton = new BABYLON.GUI.Button3D("decorButton");
    cardBoardButton.onPointerUpObservable.add(function(){
        if(updateOn){
            sendDisplayBoardUpdate();
        }
        boxes[1].setEnabled(true);
    });   
    panel.addControl(cardBoardButton);
    cardBoardButton.isVisible = false;
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "cardboard";
    text1.color = "white";
    text1.fontSize = 40;
    cardBoardButton.content = text1; 

    // cat tree button
    var decorButton = new BABYLON.GUI.Button3D("decorButton");
    decorButton.onPointerUpObservable.add(function(){
        if(updateOn){
            sendDisplayTreeUpdate();
        }
        boxes[0].setEnabled(true);
    });   
    panel.addControl(decorButton);
    decorButton.isVisible = false;
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Cat tree";
    text1.color = "white";
    text1.fontSize = 40;
    decorButton.content = text1; 

    // elephant button
    var elephantButton = new BABYLON.GUI.Button3D("decorButton");
    elephantButton.onPointerUpObservable.add(function(){
        if(updateOn){
            sendDisplayElephantUpdate();
        }
        boxes[2].setEnabled(true);
    });   
    panel.addControl(elephantButton);
    elephantButton.isVisible = false;
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "elephant";
    text1.color = "white";
    text1.fontSize = 40;
    elephantButton.content = text1; 

    var foodButtons = {
        music: musicButton,
        gather: gatherButton,
        tree: decorButton,
        board: cardBoardButton,
        elephant: elephantButton
    };
    return foodButtons;
}

function checkBGMRewards(){
    clickNames++;
    if(clickNames === 3){
        numBGM++;

        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        var grid = new BABYLON.GUI.Grid(); 
        advancedTexture.addControl(grid); 
        grid.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;   
        grid.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        
        grid.widthInPixels = 800;
        grid.heightInPixels = 400;

        var rect= new BABYLON.GUI.Rectangle();
        rect.cornerRadius = 100;
        rect.background =  "#6B899E";
        rect.alpha = 0.8;
        rect.thickness = 20;
        grid.addControl(rect, 0, 0);
    
        var unlockText = new BABYLON.GUI.TextBlock();
        unlockText.text = "Unlock New BGM!";
        unlockText.heightInPixels = 200;
        unlockText.color = "#E5A33F";
        unlockText.fontSize = 80;
        grid.addControl(unlockText, 0, 0);
        setTimeout(()=>{
            advancedTexture.removeControl(grid);
            advancedTexture.removeControl(rect);
            //grid.background = "transparent";
        }, 800);
        
    }else if(clickNames === 10){
        numBGM++;
        //TODO
    }
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

function changeBackgroundMusic(music){
    if(currBGM == -1){
        currBGM = 0;
        music[0].play();
    }
    else{
        music[currBGM].stop();
        currBGM = (currBGM + 1) % numBGM;
        music[currBGM].play();
    }
}

function getCatColorFile(color){
    var fileToLoad;
    switch(color) {
        case "siam":
            fileToLoad = "ChibiCatV2_unity_siam.gltf";
            break;
        case "grey":
            fileToLoad = "ChibiCatV2_unity_grey.gltf";
            break;
        case "carey":
            fileToLoad = "ChibiCatV2_unity_carey.gltf";
            break;
        case "orange":
            fileToLoad = "ChibiCatV2_unity_orange.gltf";
            break;
        case "black":
            fileToLoad = "ChibiCatV2_unity_black.gltf";
            break;
        case "white":
            fileToLoad = "ChibiCatV2_unity_white.gltf";
            break;
        default:
            fileToLoad = "ChibiCatV2_unity_white2.gltf"
    }
    return fileToLoad;
  }

function musicTask(scene, musicToPlay, cans, canPosX, canPosZ, musicTaskButton, bars, mats) {
    var text1 = new BABYLON.GUI.TextBlock();
    text1.color = "white";
    text1.fontSize = 35;

    if (rewardMusicIsPlaying) {
        musicToPlay.stop();
        musicTaskRewarded = true;
        text1.text = "music\nfor reward";
        musicTaskButton.content = text1;
        rewardMusicIsPlaying = false;
        // console.log("pressed on button while playing");

        return;
    }
    else {
        musicToPlay.play();
        musicTaskRewarded = false;
        rewardMusicIsPlaying = true;
        text1.text = "stop Ads\nno reward";
        musicTaskButton.content = text1;
        // console.log("playing the music")

        musicToPlay.onEndedObservable.addOnce(() => {
            if (!musicTaskRewarded) {
                rewardMusicIsPlaying = false;
                text1.text = "music\nfor reward";
                musicTaskButton.content = text1;
                // console.log("finished listening to the reward music!");
                canCount += 1;
                sendCansUpdate(canCount);
                BABYLON.SceneLoader.ImportMesh("", "./assets/food/capurrrcino/", "scene.gltf", scene, function (newMeshes, particleSystems, skeletons) {
                    // console.log("musicTask reward loaded");
                    var can = newMeshes[0];
                    cans.push(can);
                    can.position.x = canPosX;
                    if (!prevCanPosY) {
                        can.position.y = roomPosY + 0.15;
                    }
                    else {
                        can.position.y = prevCanPosY + 0.2;
                    }
                    can.position.z = canPosZ;
                    can.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
                    prevCanPosY = can.position.y;
                });
                musicTaskRewarded = true;
            }
        });
    }
}

function feedWetTask(fishPosX, allFish, fishPosZ) {
    feedWetCount += 1;
    console.log("feedWetCount incremented :: ", feedWetCount);

    if (feedWetCount === wetCountForReward) {
        feedWetCount = 0;
        lastOwnedFishIndex += 1;
        console.log("in feedWetTask, lastOwnedFishIndex = ", lastOwnedFishIndex);
        var fish = allFish[lastOwnedFishIndex];
        fish.position.y = roomPosY + 0.3;
        fish.position.z = fishPosZ;
        if (!prevFishPosX) {
            fish.position.x = fishPosX;
        }
        else {
            fish.position.x = prevFishPosX - 1.5;
        }
        fish.scaling = new BABYLON.Vector3(40, 40, 40);
        fish.rotation = new BABYLON.Vector3(0, 0, -Math.PI/2);
        fish.setEnabled(true);
        prevFishPosX = fish.position.x;
    }
}

function playCatEatAnimation(scene, animationGroups, afterEatingAnim, cans, cat, index, bars, mats, fishPosX, allFish, fishPosZ){
    cat.play = true;
    var can_eaten = cans[canCount - 1];
    cans.pop();
    canCount -= 1;
    feedWetTask(fishPosX, allFish, fishPosZ);
    if (prevCanPosY - roomPosY <= 0.1) {
        prevCanPosY = null;
    }
    else {
        prevCanPosY = prevCanPosY - 0.2;
    }

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
    
    animationGroups[7].play(false);

    setTimeout(function(){
        afterEatingAnim.play(false);
        can_eaten.setEnabled(false);
        updateIndivHungerLevel(bars, cat, mats, index-1, FEED_WET_HUNGER);
        updateIndivMoodLevel(bars, cat, mats, index-1, FEED_WET_MOOD);
    }, 4000);
    setTimeout(()=>{
        cat.play = false;
        console.log("not play");
    }, interval);
}

function playCatEatTogetherAnimation(cats, roots, anim, allFish, bars, mats, fishPosX, roomPosY){
    cats[0].play = true;
    cats[1].play = true;
    cats[2].play = true;

    var fish_eaten = allFish[lastOwnedFishIndex];
    // allFish.pop();
    lastOwnedFishIndex -= 1;
    console.log("In playCatEatTogetherAnim, lastOwnedFishIndex = ", lastOwnedFishIndex);
    if (prevFishPosX === fishPosX) {
        prevFishPosX = null;
    }
    else {
        prevFishPosX = prevFishPosX + 1.5;
    }

    fish_eaten.rotation = new BABYLON.Vector3(0, Math.PI/2, 0);
    fish_eaten.position = new BABYLON.Vector3(0, roomPosY + 0.3, 0);

    // food appear and disappear
    setTimeout(function(){
        fish_eaten.setEnabled(false);
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

        updateHungerLevel(bars, cats, mats, FEED_SP_HUNGER);
        updateMoodLevel(bars, cats, mats, FEED_SP_MOOD);
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

//} // init VR scene end
