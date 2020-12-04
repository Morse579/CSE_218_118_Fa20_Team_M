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
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

cat1 = {};
cat1.hunger = 50;

cat2 = {};
cat2.hunger = 20;

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
    const music = new BABYLON.Sound("bgm", "./assets/sounds/bensound-ukulele.mp3", scene, null, { loop: true, autoplay: true });
    const meow = new BABYLON.Sound("meow", "./assets/sounds/cat-meow.mp3", scene);

    var mats = {};
    mats.grey = new BABYLON.StandardMaterial("mat3");
    mats.grey.diffuseTexture = new BABYLON.Texture("assets/color/grey.jpg");

    mats.pink = new BABYLON.StandardMaterial("mat4");
    mats.pink.diffuseTexture = new BABYLON.Texture("assets/color/pink.jpg");

    const env = scene.createDefaultEnvironment();
    const xr = await scene.createDefaultXRExperienceAsync({
        floorMeshes: [env.ground]
    });

    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 1});
    sphere.position.y = 1;
    sphere.setEnabled(false);

    const box = BABYLON.Mesh.CreateBox("box", 1, scene);
    box.rotation = new BABYLON.Vector3(Math.PI/4, Math.PI/4, Math.PI/4);
    box.setEnabled(false);

    var meshStaticCat = BABYLON.SceneLoader.ImportMesh("", "./assets/cat/CatV2glTFSeparated/",
                                "ChibiCatV2_unity_orange.gltf", scene, function (newMeshes1, particleSystems1, skeletons1, animationGroups1) {
        var cat = newMeshes1[0];
        cat.scaling = new BABYLON.Vector3(15, 15, 15);
        cat.rotation = new BABYLON.Vector3(0, Math.PI, 0);
        cat.position = new BABYLON.Vector3(1, 1, 1);
        if (animationGroups1.length > 0) {
            var cat_anim = ['static', 'cat_attack_jump', 'cat_attack_left', 'cat_catch', 'cat_catch_play', 
                            'cat_clean1', 'cat_death_right', 'cat_eat', 'cat_gallop', 'cat_gallop_right', 
                            'cat_HighJump_air', 'cat_HighJump_land', 'cat_HighJump_up', 'cat_hit_right', 
                            'cat_idle', 'cat_jumpDown_air', 'cat_jumpDown_down', 'cat_jumpDown_land', 
                            'cat_LongJump_up', 'cat_rest1', 'cat_rest2', 'cat_resting1', 'cat_sit', 'cat_sitting',
                            'cat_sleeping', 'cat_static0', 'cat_static1', 'cat_trot', 'cat_trot_left', 
                            'cat_walk', 'cat_walk_right']; 
            animationGroups1[5].play(true);
        }

        var meshStaticCat2 = BABYLON.SceneLoader.ImportMesh("", "./assets/cat/CatV2glTFSeparated/",
                                    "ChibiCatV2_unity_white.gltf", scene, function (newMeshes2, particleSystems2, skeletons2, animationGroups2) {
            var cat = newMeshes2[0];
            cat.scaling = new BABYLON.Vector3(15, 15, 15);
            cat.rotation = new BABYLON.Vector3(0, Math.PI, 0);
            cat.position = new BABYLON.Vector3(-1, 1, 1);
            if (animationGroups2.length > 0) {
                animationGroups2[5].play(true);
            }

            var specialFoodMesh = BABYLON.SceneLoader.ImportMesh("", "./assets/food/sardine/", "scene.gltf", scene, function (meshFood, particleSystemsFood, skeletonsFood) {
                var specialFood = meshFood[0];
                specialFood.rotation = new BABYLON.Vector3(0, Math.PI/2, -Math.PI/2);
                specialFood.scaling = new BABYLON.Vector3(40, 40, 40);
                specialFood.position = new BABYLON.Vector3(0, 1, 0);
                specialFood.isVisible = false;
                setTimeout(function(){
                    specialFood.isVisible = true;
                }, 5000);
            });

            // 3D gui - for mesh interaction
            var manager = new BABYLON.GUI.GUI3DManager(scene);
            var bars = addBars(mats);
            var panelBottom = new BABYLON.GUI.StackPanel3D();
            manager.addControl(panelBottom);
            panelBottom.margin = 0.2;
            panelBottom.position.y = sphere.position.y;
            panelBottom.position.z = sphere.position.z - 2;
            var foodButtons = display3DFoodButtons(panelBottom, bars, mats, animationGroups1, animationGroups2);
        });    
    });

    // cat meow
    scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERTAP:
                meow.play();
                break;      
        }
    });

    function getUpdate(){
        console.log("hello");
        const updateClub = functions.httpsCallable('updateClub');
        updateClub({}).then(res => {
            console.log(JSON.parse(res.data));
        });
        setTimeout(getUpdate, interval); 
    }; 
    setTimeout(getUpdate, interval);

    return scene;
}
//////////

createScene().then(scene => {
    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", function () {
    engine.resize();
    });
});

function addBars(mats){
    var bars = {};
    bars.hungerBar = [];
    bars.hungerBar[0] = [];
    for(var i=0;i<100;i++){
        bars.hungerBar[0][i] = BABYLON.MeshBuilder.CreateBox("box", {height: 0.2, width: 0.02, depth: 0.2});
        bars.hungerBar[0][i].position.y = 5;
        bars.hungerBar[0][i].position.x = -1.5 + i*0.02;
        var hungerValue = cat1.hunger;
        if(i<hungerValue){
            bars.hungerBar[0][i].material = mats.pink;	
        }
    }

    bars.hungerBar[1] = [];
    for(var i=0;i<100;i++){
        bars.hungerBar[1][i] = BABYLON.MeshBuilder.CreateBox("box", {height: 0.2, width: 0.02, depth: 0.2});
        bars.hungerBar[1][i].position.y = 5;
        bars.hungerBar[1][i].position.x = 1 + i*0.02;
        var hungerValue = cat2.hunger;
        hungerValue = Math.max(0, hungerValue);
        hungerValue = Math.min(100, hungerValue);
        if(i<hungerValue){
            bars.hungerBar[1][i].material = mats.pink;	
        }
    }
  
  return bars;
}

function display3DFoodButtons(panel, bars, mats, animationGroups1, animationGroups2){
    console.log("display 3d food buttons");

    //sphere1 should be replaced by dry food mesh
    const sphere1 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.5});

    var dryFoodButton = new BABYLON.GUI.MeshButton3D(sphere1, "dryFoodButton");
    dryFoodButton.onPointerUpObservable.add(function(){
        

    });   
    panel.addControl(dryFoodButton);

    const sphere2 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.5});
    var wetFoodButton = new BABYLON.GUI.MeshButton3D(sphere2, "wetFoodButton");
    wetFoodButton.onPointerUpObservable.add(function(){
        
    });   
    panel.addControl(wetFoodButton);

    const sphere3 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.5});
    var specialFoodButton = new BABYLON.GUI.MeshButton3D(sphere3, "dryFoodButton");
    specialFoodButton.onPointerUpObservable.add(function(){
        animationGroups1[7].play(true);
        animationGroups2[7].play(true);
        updateHungerLevel(bars, mats);
        sendUpdate("feedSpecial");
    });   
    panel.addControl(specialFoodButton);

    var foodButtons = {
        dry: dryFoodButton,
        wet: wetFoodButton,
        special: specialFoodButton,
        drySphere: sphere1,
        wetSphere: sphere2,
        specialSphere: sphere3
    };
    return foodButtons;
}
function sendUpdate(type){
    const changeState = functions.httpsCallable('changeState');
    changeState({state: type})
    .then(res => {
    });
    setTimeout(function(){
        console.log("5s later");
        changeState({state: "none"});
    }, interval);

}
function updateHungerLevel(bars, mats){
    cat1.hunger += 10;
    for(var i = cat1.hunger-10;i<cat1.hunger;i++){
        bars.hungerBar[0][i].material = mats.pink;
    }
    cat2.hunger += 10;
    for(var i = cat2.hunger-10;i<cat2.hunger;i++){
        bars.hungerBar[1][i].material = mats.pink;
    }
}