var canvas = document.getElementById("renderCanvas"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

cat = {};
cat.hunger = 50;

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
                                "ChibiCatV2_unity_orange.gltf", scene, function (newMeshes, particleSystems, skeletons, animationGroups) {
        var cat = newMeshes[0];
        cat.scaling = new BABYLON.Vector3(15, 15, 15);
        cat.rotation = new BABYLON.Vector3(0, Math.PI, 0);
        cat.position = new BABYLON.Vector3(1, 1, 1);
        if (animationGroups.length > 0) {
            var cat_anim = ['static', 'cat_attack_jump', 'cat_attack_left', 'cat_catch', 'cat_catch_play', 
                            'cat_clean1', 'cat_death_right', 'cat_eat', 'cat_gallop', 'cat_gallop_right', 
                            'cat_HighJump_air', 'cat_HighJump_land', 'cat_HighJump_up', 'cat_hit_right', 
                            'cat_idle', 'cat_jumpDown_air', 'cat_jumpDown_down', 'cat_jumpDown_land', 
                            'cat_LongJump_up', 'cat_rest1', 'cat_rest2', 'cat_resting1', 'cat_sit', 'cat_sitting',
                            'cat_sleeping', 'cat_static0', 'cat_static1', 'cat_trot', 'cat_trot_left', 
                            'cat_walk', 'cat_walk_right']; 
            animationGroups[7].play(true);
        }
    });

    var meshStaticCat2 = BABYLON.SceneLoader.ImportMesh("", "./assets/cat/CatV2glTFSeparated/",
                                "ChibiCatV2_unity_white.gltf", scene, function (newMeshes, particleSystems, skeletons, animationGroups) {
        var cat = newMeshes[0];
        cat.scaling = new BABYLON.Vector3(15, 15, 15);
        cat.rotation = new BABYLON.Vector3(0, Math.PI, 0);
        cat.position = new BABYLON.Vector3(-1, 1, 1);
        if (animationGroups.length > 0) {
            animationGroups[7].play(true);
        }
    });

    var specialFoodMesh = BABYLON.SceneLoader.ImportMesh("", "./assets/food/sardine/", "scene.gltf", scene, function (mesh, particleSystems, skeletons) {
        var specialFood = mesh[0];
        specialFood.rotation = new BABYLON.Vector3(0, Math.PI/2, -Math.PI/2);
        specialFood.scaling = new BABYLON.Vector3(40, 40, 40);
        specialFood.position = new BABYLON.Vector3(0, 1, 0);
        specialFood.isVisible = false;
        setTimeout(function(){
            specialFood.isVisible = true;
        }, 5000);
    });

    // cat meow
    scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERTAP:
                meow.play();
                break;      
        }
    });

    // 3D gui - for mesh interaction
    var manager = new BABYLON.GUI.GUI3DManager(scene);
    var panel3D = new BABYLON.GUI.StackPanel3D();
    panel3D.margin = 0.2;
    manager.addControl(panel3D);
    panel3D.position.y = sphere.position.y + 3;
    // add3DButtonsOnPanel(panel3D);

    var bars = addBars(cat, mats);
    var panelBottom = new BABYLON.GUI.StackPanel3D();
    manager.addControl(panelBottom);
    panelBottom.margin = 0.2;
    panelBottom.position.y = sphere.position.y;
    panelBottom.position.z = sphere.position.z - 2;
    var foodButtons = display3DFoodButtons(panelBottom, bars, mats);

    return scene;
}
//////////

createScene().then(scene => {
    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", function () {
    engine.resize();
    });
});

function addBars(cat, mats){
    var bars = {};
    bars.hungerBar = [];
    bars.hungerBar[0] = [];
    for(var i=0;i<100;i++){
        bars.hungerBar[0][i] = BABYLON.MeshBuilder.CreateBox("box", {height: 0.2, width: 0.02, depth: 0.2});
        bars.hungerBar[0][i].position.y = 5;
        bars.hungerBar[0][i].position.x = - 0.5 + i*0.02;
        var hungerValue = cat.hunger;
        hungerValue = Math.max(0, hungerValue);
        hungerValue = Math.min(100, hungerValue);
        if(i<hungerValue){
            bars.hungerBar[0][i].material = mats.pink;	
        }
    }

    bars.hungerBar[1] = [];
    for(var i=0;i<100;i++){
        bars.hungerBar[1][i] = BABYLON.MeshBuilder.CreateBox("box", {height: 0.2, width: 0.02, depth: 0.2});
        bars.hungerBar[1][i].position.y = 5;
        bars.hungerBar[1][i].position.x = 2 + i*0.02;
        var hungerValue = cat2.hunger;
        hungerValue = Math.max(0, hungerValue);
        hungerValue = Math.min(100, hungerValue);
        if(i<hungerValue){
            bars.hungerBar[1][i].material = mats.pink;	
        }
    }
  
  return bars;
}

function display3DFoodButtons(panel, bars, mats){
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
        updateHungerLevel(bars, mats);
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

function updateHungerLevel(bars, mats){
    cat.hunger += 10;
    for(var i = cat.hunger-10;i<cat.hunger;i++){
        bars.hungerBar[0][i].material = mats.pink;
    }
    cat2.hunger += 10;
    for(var i = cat2.hunger-10;i<cat2.hunger;i++){
        bars.hungerBar[1][i].material = mats.pink;
    }
}