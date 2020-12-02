export{initializeScene}
//import{onFeedClicked} from './update.js'
import{functions} from './ARmain.js'

function initializeScene(user){
    var canvas = document.getElementById("renderCanvas"); // Get the canvas element
    var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
    var markerOn = true;

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

        const xr = await scene.createDefaultXRExperienceAsync({
            uiOptions: {
                sessionMode: 'immersive-ar'
            },
            optionalFeatures: true,
        });

        const fm = xr.baseExperience.featuresManager;
        const xrTest = fm.enableFeature(BABYLON.WebXRHitTest, "latest");

        // Initialize a marker to show hit test result 
        const marker = BABYLON.MeshBuilder.CreateTorus('marker', { diameter: 0.12, thickness: 0.02 });
        marker.isVisible = false;
        marker.rotationQuaternion = new BABYLON.Quaternion();

        // Initialize hit test to detect position and place cat
        var hitTest;
        xrTest.onHitTestResultObservable.add((results) => {
            if (results.length) {
                if(markerOn){
                    marker.isVisible = true;
                }
                hitTest = results[0];
                hitTest.transformationMatrix.decompose(marker.scaling, marker.rotationQuaternion, marker.position);
            } else {
                marker.isVisible = false;
            }
        });

        // Get cat information from firebase
        var cat = null;
        var catFile = getCatColorFile(user.cat.appearance);

        // Display 2D GUI: food, currency, shop and exit icon
        var textUI = displayProperties(user);
        textUI.coin =  displayTopUI(user);

        var mats = createMats();

        // 3D gui - for mesh interaction
        var manager = new BABYLON.GUI.GUI3DManager(scene);
        var panel3D = new BABYLON.GUI.StackPanel3D();
        panel3D.margin = 0.2;
        manager.addControl(panel3D);

        var panelFood = new BABYLON.GUI.StackPanel3D();
        manager.addControl(panelFood);
        panelFood.margin = 0.07;

        var panelToys = new BABYLON.GUI.StackPanel3D();
        manager.addControl(panelToys);
        panelToys.margin = 0.07;
    
        var panelDecor = new BABYLON.GUI.StackPanel3D();
        manager.addControl(panelDecor);
        panelDecor.margin = 0.07;
        
        scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERTAP:
                    if(cat == null){
                        if(marker.isVisible){
                            markerOn = false;
                            marker.isVisible = false;
                            var meshStaticCat = BABYLON.SceneLoader.ImportMesh("", "./assets/cat/CatV2glTFSeparated/", catFile, scene, function (newMeshes, particleSystems, skeletons) {
                                cat = newMeshes[0];
                                // cat.scaling = new BABYLON.Vector3(0.009, 0.009, 0.009);
                                // cat.rotation = new BABYLON.Vector3(0, -Math.PI/2, 0);
                                cat.rotation = new BABYLON.Vector3(0, 0, 0);
                                if (scene.animationGroups.length > 0) {
                                    var cat_anim = ['static', 'cat_attack_jump', 'cat_attack_left', 'cat_catch', 'cat_catch_play', 
                                                    'cat_clean1', 'cat_death_right', 'cat_eat', 'cat_gallop', 'cat_gallop_right', 
                                                    'cat_HighJump_air', 'cat_HighJump_land', 'cat_HighJump_up', 'cat_hit_right', 
                                                    'cat_idle', 'cat_jumpDown_air', 'cat_jumpDown_down', 'cat_jumpDown_land', 
                                                    'cat_LongJump_up', 'cat_rest1', 'cat_rest2', 'cat_resting1', 'cat_sit', 'cat_sitting',
                                                    'cat_sleeping', 'cat_static0', 'cat_static1', 'cat_trot', 'cat_trot_left', 
                                                    'cat_walk', 'cat_walk_right']; 
                                    // alert("Cat animation: " + cat_anim[1]);
                                    scene.animationGroups[11].play(false);
                                }
                                hitTest.transformationMatrix.decompose(null, cat.rotationQuaternion, cat.position);
                                meow.play();

                                // Link 3D GUI panel with cat position
                                hitTest.transformationMatrix.decompose(null, panel3D.rotationQuaternion, panel3D.position);
                                hitTest.transformationMatrix.decompose(null, panelFood.rotationQuaternion, panelFood.position);
                                hitTest.transformationMatrix.decompose(null, panelToys.rotationQuaternion, panelToys.position);
                                hitTest.transformationMatrix.decompose(null, panelDecor.rotationQuaternion, panelDecor.position);

                                panelFood.position.z = cat.position.z;
                                panelToys.position.z = cat.position.z;
                                panelDecor.position.z = cat.position.z;

                                var bars = addBars(user, cat.position, mats);
                                //add3DButtonsOnPanel(panel3D, scene, cat);
                                var foodButtons = display3DFoodButtons(panelFood, user, textUI, scene, cat, bars, mats);
                                var toyButtons = display3DToyButtons(panelToys, user, textUI, scene, cat, bars, mats);
                                var decorButtons = display3DDecorButtons(panelDecor, user, textUI, scene, cat, bars, mats);

                                displayActions(foodButtons, toyButtons, decorButtons, scene, mats, user);
                            });
                        }
                    }
                    else{
                        // alert("You are tapping after cat is set up");
                        meow.play();
                        scene.animationGroups[1].play(false);                 
                    }
                    break;      
            }
        });
        return scene;
    }

    createScene().then(scene => {
        engine.runRenderLoop(() => scene.render());
        window.addEventListener("resize", function () {
        engine.resize();
        });
    });
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

  function exitAR(){
    window.location.href = "index.html";
  }
  ////////////////////////// 3D GUI //////////////////////////
  function createMats(){
    var mats = {};
    mats.red = new BABYLON.StandardMaterial("mat");
    mats.red.diffuseTexture = new BABYLON.Texture("assets/color/red.jpg");

    mats.orange = new BABYLON.StandardMaterial("mat2");
    mats.orange.diffuseTexture = new BABYLON.Texture("assets/color/orange.jpg");

    mats.grey = new BABYLON.StandardMaterial("mat3");
    mats.grey.diffuseTexture = new BABYLON.Texture("assets/color/grey.jpg");

    mats.pink = new BABYLON.StandardMaterial("mat4");
    mats.pink.diffuseTexture = new BABYLON.Texture("assets/color/pink.jpg");

    return mats;
  }

  function addBars(user, catPos, mats){
      var bars = {};
      bars.hungerBar = [];
    for(var i=0;i<100;i++){
        bars.hungerBar[i] = BABYLON.MeshBuilder.CreateBox("box", {height: 0.1, width: 0.01, depth: 0.1});
        bars.hungerBar[i].position.z = catPos.z + 2;
        bars.hungerBar[i].position.y = catPos.y + 0.3;
        bars.hungerBar[i].position.x = catPos.x - 0.5 + i*0.01;
        var hungerValue = user.cat.hunger;
        hungerValue = Math.max(0, hungerValue);
        hungerValue = Math.min(100, hungerValue);
        if(i<hungerValue){
            bars.hungerBar[i].material = mats.red;	
        }
    }
    bars.moodBar = [];
    for(var i=0;i<100;i++){
        bars.moodBar[i] = BABYLON.MeshBuilder.CreateBox("box", {height: 0.1, width: 0.01, depth: 0.1});
        bars.moodBar[i].position.z = catPos.z + 2;
        bars.moodBar[i].position.y = catPos.y + 0.15;
        bars.moodBar[i].position.x = catPos.x - 0.5 + i*0.01;
        var moodValue = user.cat.mood;
        moodValue = Math.max(0, moodValue);
        moodValue = Math.min(100, moodValue);
        if(i<moodValue){
            bars.moodBar[i].material = mats.orange;	
        }
    }
    return bars;
  }
  function display3DFoodButtons(panel, user, textUI, scene, cat, bars, mats){
    panel.position.z = cat.position.z - 0.12;
    
    //sphere1 should be replaced by dry food mesh
    var sphere1 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.05});
    var dryFoodButton = new BABYLON.GUI.MeshButton3D(sphere1, "dryFoodButton");
    dryFoodButton.onPointerUpObservable.add(function(){
        dryFoodButton.isVisible = false;
        wetFoodButton.isVisible = false;
        specialFoodButton.isVisible = false;
        onFeedClicked(user, "dry", textUI, bars, mats);
    });   
    panel.addControl(dryFoodButton);
    dryFoodButton.isVisible = false;

    var sphere2 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.05});
    var wetFoodButton = new BABYLON.GUI.MeshButton3D(sphere2, "wetFoodButton");
    wetFoodButton.onPointerUpObservable.add(function(){
        dryFoodButton.isVisible = false;
        wetFoodButton.isVisible = false;
        specialFoodButton.isVisible = false;
        var wetFoodMesh = BABYLON.SceneLoader.ImportMesh("", "./assets/food/capurrrcino/", "scene.gltf", scene, function (mesh, particleSystems, skeletons) {
            var wetFood = mesh[0];
            wetFood.rotation = new BABYLON.Vector3(0, Math.PI, 0);
            wetFood.scaling = new BABYLON.Vector3(0.035, 0.035, 0.035);
            wetFood.position.x = cat.position.x;
            wetFood.position.y = cat.position.y;
            wetFood.position.z = cat.position.z - 0.075;

            setTimeout(function(){
                wetFood.setEnabled(false);
                onFeedClicked(user, "wet", textUI, bars, mats);
            }, 5000);
        });
        setTimeout(function(){
            scene.animationGroups[7].play(false);
        }, 3000);
    });   
    panel.addControl(wetFoodButton);
    wetFoodButton.isVisible = false;

    var sphere3 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.05});
    var specialFoodButton = new BABYLON.GUI.MeshButton3D(sphere3, "dryFoodButton");
    specialFoodButton.onPointerUpObservable.add(function(){
        dryFoodButton.isVisible = false;
        wetFoodButton.isVisible = false;
        specialFoodButton.isVisible = false;
        var specialFoodMesh = BABYLON.SceneLoader.ImportMesh("", "./assets/food/sardine/", "scene.gltf", scene, function (mesh, particleSystems, skeletons) {
            var specialFood = mesh[0];
            specialFood.rotation = new BABYLON.Vector3(0, Math.PI/2, Math.PI/2);
            //specialFood.scaling = new BABYLON.Vector3(0.035, 0.035, 0.035);
            specialFood.position.x = cat.position.x;
            specialFood.position.y = cat.position.y;
            specialFood.position.z = cat.position.z - 0.07;

            setTimeout(function(){
                specialFood.setEnabled(false);
                onFeedClicked(user, "special", textUI, bars, mats);
            }, 4000);
        });
        setTimeout(function(){
            scene.animationGroups[7].play(false);
        }, 2000);
    });   
    panel.addControl(specialFoodButton);
    specialFoodButton.isVisible = false;

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

function display3DToyButtons(panel, user, textUI, scene, cat, bars, mats){
    panel.position.z = cat.position.z - 0.12;

    var sphere1 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.05});
    var mouseButton = new BABYLON.GUI.MeshButton3D(sphere1, "mouseButton");
    mouseButton.onPointerUpObservable.add(function(){
        hideToyButtons();
        var mouseMesh = BABYLON.SceneLoader.ImportMesh("", "./assets/toy/mouse/", "scene.gltf", scene, function (mesh) {
            var mouse = mesh[0];
            mouse.rotation = new BABYLON.Vector3(0, -Math.PI/2, 0);
            mouse.scaling = new BABYLON.Vector3(0.007, 0.007, 0.007);
            mouse.position.x = cat.position.x;
            mouse.position.y = cat.position.y;
            mouse.position.z = cat.position.z - 0.13;

            setTimeout(function(){
                mouse.setEnabled(false);
                onPlayClicked(user, "mouse", textUI, bars, mats);
            }, 3500);
        });
        setTimeout(function(){
            scene.animationGroups[3].play(false);
        }, 1500);

        setTimeout(function(){
            scene.animationGroups[4].play(true);
        }, 2000);

        setTimeout(function(){
            scene.animationGroups[4].pause();
            scene.animationGroups[22].play(false);
        }, 4500);
    });   
    panel.addControl(mouseButton);
    mouseButton.isVisible = false;

    var sphere2 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.05});
    var yarnButton = new BABYLON.GUI.MeshButton3D(sphere2, "yarnButton");
    yarnButton.onPointerUpObservable.add(function(){
        hideToyButtons();
        var yarnMesh = BABYLON.SceneLoader.ImportMesh("", "./assets/toy/yarn/", "yarn.obj", scene, function (mesh) {
            var yarn = mesh[0];
            yarn.rotation = new BABYLON.Vector3(0, -Math.PI/2, 0);
            yarn.scaling = new BABYLON.Vector3(0.018, 0.018, 0.018);
            yarn.position.x = cat.position.x + 0.03;
            yarn.position.y = cat.position.y;
            yarn.position.z = cat.position.z - 0.13;

            setTimeout(function(){
                yarn.setEnabled(false);
                onPlayClicked(user, "yarn", textUI, bars, mats);
            }, 3500);
        });
        setTimeout(function(){
            scene.animationGroups[3].play(false);
        }, 1500);

        setTimeout(function(){
            scene.animationGroups[4].play(true);
        }, 2000);

        setTimeout(function(){
            scene.animationGroups[4].pause();
            scene.animationGroups[22].play(false);
        }, 4500);
    });   
    panel.addControl(yarnButton);
    yarnButton.isVisible = false;

    var sphere3 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.05});
    var dogButton = new BABYLON.GUI.MeshButton3D(sphere3, "dogButton");
    dogButton.onPointerUpObservable.add(function(){
        hideToyButtons();
        var dogMesh = BABYLON.SceneLoader.ImportMesh("", "./assets/toy/stuffed2/", "scene.gltf", scene, function (mesh) {
            var dog = mesh[0];
            dog.rotation = new BABYLON.Vector3(0, Math.PI, 0);
            dog.scaling = new BABYLON.Vector3(0.002, 0.002, 0.002);
            dog.position.x = cat.position.x;
            dog.position.y = cat.position.y;
            dog.position.z = cat.position.z - 0.18;

            setTimeout(function(){
                dog.setEnabled(false);
                onPlayClicked(user, "stuffed_dog", textUI, bars, mats);
            }, 5500);
        });
        setTimeout(function(){
            scene.animationGroups[3].play(false);
        }, 4500);

        setTimeout(function(){
            scene.animationGroups[4].play(true);
        }, 5000);

        setTimeout(function(){
            scene.animationGroups[4].pause();
            scene.animationGroups[22].play(false);
        }, 7500);
    });   
    panel.addControl(dogButton);
    dogButton.isVisible = false;

    var sphere4 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.05});
    var elephantButton = new BABYLON.GUI.MeshButton3D(sphere4, "elephantButton");
    elephantButton.onPointerUpObservable.add(function(){
        hideToyButtons();
        var elephantMesh = BABYLON.SceneLoader.ImportMesh("", "./assets/toy/stuffed1/", "scene.gltf", scene, function (mesh) {
            var elephant = mesh[0];
            elephant.rotation = new BABYLON.Vector3(0, Math.PI, 0);
            elephant.scaling = new BABYLON.Vector3(0.0005, 0.0005, 0.0005);
            elephant.position.x = cat.position.x;
            elephant.position.y = cat.position.y;
            elephant.position.z = cat.position.z - 0.1;

            setTimeout(function(){
                elephant.setEnabled(false);
                onPlayClicked(user, "stuffed_elephant", textUI, bars, mats);
            }, 3500);
        });
        setTimeout(function(){
            scene.animationGroups[3].play(false);
        }, 1500);

        setTimeout(function(){
            scene.animationGroups[4].play(true);
        }, 2000);

        setTimeout(function(){
            scene.animationGroups[4].pause();
            scene.animationGroups[22].play(false);
        }, 4500);
    });   
    panel.addControl(elephantButton);
    elephantButton.isVisible = false;

    var toyButtons = {
        mouse: mouseButton,
        yarn: yarnButton,
        dog: dogButton,
        elephant: elephantButton,
        mouseSphere: sphere1,
        yarnSphere: sphere2,
        dogSphere: sphere3,
        elephantSphere: sphere4
    };

    function hideToyButtons(){
        mouseButton.isVisible = false;
        yarnButton.isVisible = false;
        dogButton.isVisible = false;
        elephantButton.isVisible = false;
    }
    return toyButtons;
}

function display3DDecorButtons(panel, user, textUI, scene, cat, bars, mats){
    panel.position.z = cat.position.z - 0.12;

    var sphere1 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.05});
    var catTreeButton = new BABYLON.GUI.MeshButton3D(sphere1, "catTreeButton");
    catTreeButton.onPointerUpObservable.add(function(){
        hideDecorButtons();
        var catTreeMesh = BABYLON.SceneLoader.ImportMesh("", "./assets/decor/arbre_a_chat_cat_tree/", "scene.gltf", scene, function (mesh) {
            var catTree = mesh[0];
            catTree.rotation = new BABYLON.Vector3(0, Math.PI/5, 0);
            catTree.scaling = new BABYLON.Vector3(0.35, 0.35, 0.35);
            catTree.position.x = cat.position.x - 0.22;
            catTree.position.y = cat.position.y;
            catTree.position.z = cat.position.z + 0.25;
        });
        setTimeout(function(){
            scene.animationGroups[19].play(false);
            onDecorClicked(user, "cat_tree", textUI, bars, mats);
        }, 2500);
    });   
    panel.addControl(catTreeButton);
    catTreeButton.isVisible = false;

    var sphere2 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.05});
    var bellRopeButton = new BABYLON.GUI.MeshButton3D(sphere2, "bellRopeButton");
    bellRopeButton.onPointerUpObservable.add(function(){
        hideDecorButtons();
        var bellRopeMesh = BABYLON.SceneLoader.ImportMesh("", "./assets/decor/bell_rope/", "scene.gltf", scene, function (mesh) {
            var bellRope = mesh[0];
            bellRope.rotation = new BABYLON.Vector3(0, 0, 0);
            bellRope.scaling = new BABYLON.Vector3(0.0012, 0.0012, 0.0012);
            bellRope.position.x = cat.position.x + 0.5;
            bellRope.position.y = cat.position.y + 0.6;
            bellRope.position.z = cat.position.z + 1.2;
        });
        setTimeout(function(){
            scene.animationGroups[5].play(false);
            onDecorClicked(user, "bell_rope", textUI, bars, mats);
        }, 3500);
    });   
    panel.addControl(bellRopeButton);
    bellRopeButton.isVisible = false;

    var decorButtons = {
        catTree: catTreeButton,
        bellRope: bellRopeButton,
        catTreeSphere: sphere1,
        bellRopeSphere: sphere2
    };

    function hideDecorButtons(){
        catTreeButton.isVisible = false;
        bellRopeButton.isVisible = false;
    }
    return decorButtons;
}

  var clicks = 0;
  function add3DButtonsOnPanel(panel, scene, cat){
    ////////////// test 3d button only /////////////////////////
    panel.position.z = cat.position.z + 3;
    panel.blockLayout = true;

    var count = new BABYLON.GUI.Button3D("count");
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "0";
    text1.color = "white";
    text1.fontSize = 48;
    count.content = text1; 
    panel.addControl(count);
    ///////////////////////////////////////
    const sphere1 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.05});
    var button1 = new BABYLON.GUI.MeshButton3D(sphere1, "pushButton");
    button1.onPointerUpObservable.add(function(){
        clicks++;
        text1.text = `${clicks}`;
        //play animations here
    });   
    panel.addControl(button1);

    const sphere2 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.05});
    var button2 = new BABYLON.GUI.MeshButton3D(sphere2, "pushButton");
    button2.onPointerUpObservable.add(function(){
        clicks++;
        text1.text = `${clicks}`;
        //play animations here
    });   
    panel.addControl(button2);
    
    panel.blockLayout = false;
  }
  
  //////////////////// 2D GUI  //////////////////// 
  function displayProperties(user){
    const size = 120;
    const textSize = 60;

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    var grid = new BABYLON.GUI.Grid(); 
    advancedTexture.addControl(grid); 
    grid.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;   
    grid.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    
    grid.widthInPixels = size*2;
    grid.heightInPixels = size*3;

    grid.addColumnDefinition(0.5);
    grid.addColumnDefinition(0.5);
    grid.addRowDefinition(1/3);
    grid.addRowDefinition(1/3);
    grid.addRowDefinition(1/3);

    var dryFoodIcon = new BABYLON.GUI.Image("dry", "assets/icon/dry_food.png");
    dryFoodIcon.widthInPixels = size;
    dryFoodIcon.heightInPixels = size;
    grid.addControl(dryFoodIcon, 0, 0);

    var wetFoodIcon = new BABYLON.GUI.Image("wet", "assets/icon/wet_food.png");
    wetFoodIcon.widthInPixels = size;
    wetFoodIcon.heightInPixels = size;
    grid.addControl(wetFoodIcon, 1, 0);

    var spFoodIcon = new BABYLON.GUI.Image("special", "assets/icon/salmon.png");
    spFoodIcon.widthInPixels = 0.9*size;
    spFoodIcon.heightInPixels = 0.9*size;
    grid.addControl(spFoodIcon, 2, 0);

    var dryCountText = new BABYLON.GUI.TextBlock();
    dryCountText.text = `${user.cat.dryFood}`;
    dryCountText.heightInPixels = size;
    dryCountText.color = "white";
    dryCountText.fontSize = textSize;
    grid.addControl(dryCountText, 0, 1);

    var wetCountText = new BABYLON.GUI.TextBlock();
    wetCountText.text = `${user.cat.wetFood}`;
    wetCountText.heightInPixels = size;
    wetCountText.color = "white";
    wetCountText.fontSize = textSize;
    grid.addControl(wetCountText, 1, 1);

    var spCountText = new BABYLON.GUI.TextBlock();
    spCountText.text = `${user.cat.specialFood}`;
    spCountText.heightInPixels = size;
    spCountText.color = "white";
    spCountText.fontSize = textSize;
    grid.addControl(spCountText, 2, 1);

    var textUI = {
        dry: dryCountText,
        wet: wetCountText,
        special: spCountText
    }
    return textUI;
  }
  function displayTopUI(user){
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ActionUI");
    var grid = new BABYLON.GUI.Grid(); 
    advancedTexture.addControl(grid); 
    grid.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;   
    grid.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    grid.paddingTopInPixels = 30;
    grid.paddingRightInPixels = 30;
    
    grid.widthInPixels = 450 + grid.paddingRightInPixels;
    grid.heightInPixels = 150 + grid.paddingTopInPixels;

    grid.addColumnDefinition(120, true);
    grid.addColumnDefinition(180, true);
    grid.addColumnDefinition(150, true);

    var coinIcon = new BABYLON.GUI.Image("coin", "assets/icon/coin.png");
    coinIcon.widthInPixels = 120;
    coinIcon.heightInPixels = 120;
    grid.addControl(coinIcon, 0, 0);

    var coinText = new BABYLON.GUI.TextBlock();
    coinText.text = `${user.cat.currency}`;
    coinText.heightInPixels = 120;
    coinText.color = "white";
    coinText.fontSize = 60;
    coinText.fontFamily = "Comic Sans MS";
    grid.addControl(coinText, 0, 1);

    var shopButton = BABYLON.GUI.Button.CreateImageOnlyButton("but", "assets/icon/shop.png");
    shopButton.widthInPixels = 150;
    shopButton.heightInPixels = 150;
    shopButton.cornerRadius = 30;
    shopButton.thickness = 5;
    shopButton.children[0].widthInPixels = 120;
    shopButton.children[0].heightInPixels = 120;
    shopButton.children[0].paddingLeftInPixels = 15;
    shopButton.color = "#FF7979";
    shopButton.background = "#EB4D4B";
    shopButton.onPointerClickObservable.add(function () {
        //displayShop(advancedTexture);
           // SHOP UI START
    // shop constants
    let subBackgroundColor = "#ACC7DB";
    let butBackgroundColor = "#EB4D4B";
    let shopItemHeight = 220;
    let shopItemPaddingH = 60;
    let itemTextColor = "#2A3741";
    let itemTextFont = "Comic Sans MS";
    let itemTextFontSize = 60;
    let price_size = 120;
    let foodItemCount = 3;
    let toyItemCount = 4;
    let decorItemCount = 2;

    // Create shopGrid
    var shopGrid = new BABYLON.GUI.Grid();   
    shopGrid.background = "#6B899E";
    shopGrid.widthInPixels = 1080;
    shopGrid.heightInPixels= 2800;//test
    let shopItemWidth = shopGrid.widthInPixels - 60*2;
    advancedTexture.addControl(shopGrid); 

    var shopGrid_rows = [210, 170, shopItemHeight*foodItemCount, 170, shopItemHeight*toyItemCount, 170, shopItemHeight*decorItemCount];
    for(var i=0; i<shopGrid_rows.length; i++){
        shopGrid.addRowDefinition(shopGrid_rows[i], true);
    }

    // exit button
    var exitShopButton = BABYLON.GUI.Button.CreateImageOnlyButton("but", "assets/icon/exit.png");
    exitShopButton.widthInPixels = 180;
    exitShopButton.heightInPixels = 180;
    exitShopButton.cornerRadius = 30;
    exitShopButton.thickness = 0;
    exitShopButton.paddingTopInPixels = 30;
    exitShopButton.paddingLeftInPixels = 30;
    exitShopButton.onPointerUpObservable.add(function(){
        console.log("exit");
        advancedTexture.removeControl(shopGrid); 
    });

    // coin icon and text
    var coinShopIcon = new BABYLON.GUI.Image("coin", "assets/icon/coin.png");
    coinShopIcon.widthInPixels = 120;
    coinShopIcon.heightInPixels = 120;
    coinShopIcon.paddingRightInPixels = 10;

    var coinShopText = new BABYLON.GUI.TextBlock();
    coinShopText.text = `500`;
    coinShopText.heightInPixels = 120;
    coinShopText.color = "#E5A33F";
    coinShopText.fontSize = 60;
    coinShopText.paddingRightInPixels = 30;

    // top bar label
    var grid_topShopBar = new BABYLON.GUI.Grid();  
    grid_topShopBar.addRowDefinition(1);
    grid_topShopBar.addColumnDefinition(exitShopButton.widthInPixels, true);
    let remaining = shopGrid.widthInPixels - exitShopButton.widthInPixels - coinShopIcon.widthInPixels - 150;
    grid_topShopBar.addColumnDefinition(remaining, true);
    grid_topShopBar.addColumnDefinition(coinShopIcon.heightInPixels, true);
    grid_topShopBar.addColumnDefinition(150, true);

    grid_topShopBar.addControl(exitShopButton, 0, 0); 
    grid_topShopBar.addControl(coinShopIcon, 0, 2);
    grid_topShopBar.addControl(coinShopText, 0, 3);

    // add grid_topShopBar to shopGrid
    shopGrid.addControl(grid_topShopBar, 0, 0); 

    // food text
    var text_food = new BABYLON.GUI.TextBlock();
    text_food.text = "FOOD";
    text_food.color = itemTextColor;
    text_food.fontSize = 80;
    text_food.fontFamily = itemTextFont;

    var grid_foodText = new BABYLON.GUI.Grid(); 
    grid_foodText.paddingTopInPixels = 30;
    grid_foodText.paddingRightInPixels = shopItemPaddingH;
    grid_foodText.paddingLeftInPixels = shopItemPaddingH;
    grid_foodText.background = subBackgroundColor;
    grid_foodText.addRowDefinition(1);
    grid_foodText.addControl(text_food, 0, 0); 

    // add grid_foodText to shopGrid
    shopGrid.addControl(grid_foodText, 1, 0); 

    // foodInfo
    var grid_foodInfo = new BABYLON.GUI.Grid(); 
    grid_foodInfo.addColumnDefinition(180, true);
    grid_foodInfo.addColumnDefinition(shopItemWidth - 180 - 180)
    grid_foodInfo.addRowDefinition(shopItemHeight, true);
    grid_foodInfo.addRowDefinition(shopItemHeight, true);
    grid_foodInfo.addRowDefinition(shopItemHeight, true);
    
    //food images
    var Image_food = ["assets/icon/dry_food.png", "assets/icon/wet_food.png", "assets/icon/salmon.png"];
    for(var i=0; i<Image_food.length; i++){
        var each_Image_food = new BABYLON.GUI.Image("image", Image_food[i]);
        grid_foodInfo.addControl(each_Image_food, i, 0);  
    }
    //food names
    var text_foodName = ["dry food", "wet food", "sardine"];
    for(var i=0; i<text_foodName.length; i++){
        var each_text_foodName = new BABYLON.GUI.TextBlock();
        each_text_foodName.text = text_foodName[i];
        each_text_foodName.color = itemTextColor;
        each_text_foodName.fontSize = itemTextFontSize;
        grid_foodInfo.addControl(each_text_foodName, i, 1);
    }

    // foodBuy
    var grid_foodBuy = new BABYLON.GUI.Grid();
    grid_foodBuy.addRowDefinition(shopItemHeight, true);
    grid_foodBuy.addRowDefinition(shopItemHeight, true);
    grid_foodBuy.addRowDefinition(shopItemHeight, true);
    //food buttons
    var button_buyDryFood = BABYLON.GUI.Button.CreateImageButton("but", "1","assets/icon/coin.png");
    var button_buyWetFood = BABYLON.GUI.Button.CreateImageButton("but", "2","assets/icon/coin.png");
    var button_buySpecFood = BABYLON.GUI.Button.CreateImageButton("but", "5","assets/icon/coin.png");
    grid_foodBuy.addControl(button_buyDryFood, 0, 0);
    grid_foodBuy.addControl(button_buyWetFood, 1, 0);
    grid_foodBuy.addControl(button_buySpecFood, 2, 0);

    // grid food
    var grid_food = new BABYLON.GUI.Grid();
    grid_food.addColumnDefinition(shopItemWidth - 180);
    grid_food.addColumnDefinition(180);
    grid_food.addControl(grid_foodInfo, 0, 0);
    grid_food.addControl(grid_foodBuy, 0, 1);
    grid_food.paddingLeftInPixels = shopItemPaddingH;
    grid_food.paddingRightInPixels = shopItemPaddingH;

    // add grid_food to shopGrid
    shopGrid.addControl(grid_food, 2, 0); 
    //END OF FOOD PART

    //START: TOY PART
    // toy names in display order: ball of yarn, mouse, stuffed dog, stuffed elephant
    // toy picture names in display order: yarn.png, toy.png, dog.png, elephant.png
    // toy prices in display order: 3, 5, 7, 11
    // toy text
    var text_toy = new BABYLON.GUI.TextBlock();
    text_toy.text = "TOY";
    text_toy.color = itemTextColor;
    text_toy.fontSize = 80;
    text_toy.fontFamily = itemTextFont;

    var grid_toyText = new BABYLON.GUI.Grid(); 
    grid_toyText.paddingTopInPixels = 30;
    grid_toyText.paddingRightInPixels = shopItemPaddingH;
    grid_toyText.paddingLeftInPixels = shopItemPaddingH;
    grid_toyText.background = subBackgroundColor;
    grid_toyText.addRowDefinition(1);
    grid_toyText.addControl(text_toy, 0, 0); 

    // add grid_toyText to shopGrid
    shopGrid.addControl(grid_toyText, 3, 0);

    // toyInfo
    var grid_toyInfo = new BABYLON.GUI.Grid(); 
    grid_toyInfo.addColumnDefinition(180, true);
    grid_toyInfo.addColumnDefinition(shopItemWidth - 180 - 180)
    grid_toyInfo.addRowDefinition(shopItemHeight, true);
    grid_toyInfo.addRowDefinition(shopItemHeight, true);
    grid_toyInfo.addRowDefinition(shopItemHeight, true);
    grid_toyInfo.addRowDefinition(shopItemHeight, true);


    //toy images import
    var Image_toy = ["assets/icon/yarn.png", "assets/icon/play.png", "assets/icon/dog.png", "assets/icon/elephant.png"];
    for(var i=0; i<Image_toy.length; i++){
        var each_Image_toy = new BABYLON.GUI.Image("image", Image_toy[i]);
        each_Image_toy.paddingBottomInPixels = 20;
        each_Image_toy.paddingTopInPixels = 20;
        grid_toyInfo.addControl(each_Image_toy, i, 0);  
    }
    //toy names text import
    var text_toyName = ["ball of yarn", "mouse", "stuffed dog", "stuffed elephant"];
    for(var i=0; i<text_toyName.length; i++){
        var each_text_toyName = new BABYLON.GUI.TextBlock();
        each_text_toyName.text = text_toyName[i];
        each_text_toyName.color = itemTextColor;
        each_text_toyName.fontSize = itemTextFontSize;
        grid_toyInfo.addControl(each_text_toyName, i, 1);
    }

    // toyBuy
    var grid_toyBuy = new BABYLON.GUI.Grid();
    grid_toyBuy.addRowDefinition(shopItemHeight, true);
    grid_toyBuy.addRowDefinition(shopItemHeight, true);
    grid_toyBuy.addRowDefinition(shopItemHeight, true);
    grid_toyBuy.addRowDefinition(shopItemHeight, true);
    //toy buttons
    var button_buyYarn = BABYLON.GUI.Button.CreateImageButton("but", "3","assets/icon/coin.png");
    var button_buyMouse = BABYLON.GUI.Button.CreateImageButton("but", "5","assets/icon/coin.png");
    var button_buyDog = BABYLON.GUI.Button.CreateImageButton("but", "7","assets/icon/coin.png");
    var button_buyElephant = BABYLON.GUI.Button.CreateImageButton("but", "11","assets/icon/coin.png");
    grid_toyBuy.addControl(button_buyYarn, 0, 0);
    grid_toyBuy.addControl(button_buyMouse, 1, 0);
    grid_toyBuy.addControl(button_buyDog, 2, 0);
    grid_toyBuy.addControl(button_buyElephant, 3, 0);
    
    // grid toy
    var grid_toy = new BABYLON.GUI.Grid();
    grid_toy.addColumnDefinition(shopItemWidth - 180);
    grid_toy.addColumnDefinition(180);
    grid_toy.addControl(grid_toyInfo, 0, 0);
    grid_toy.addControl(grid_toyBuy, 0, 1);
    grid_toy.paddingLeftInPixels = shopItemPaddingH;
    grid_toy.paddingRightInPixels = shopItemPaddingH;

    // add grid_toy to shopGrid
    shopGrid.addControl(grid_toy, 4, 0);
    //END OF TOY PART

    //START: DECOR PART
    // decor names in display order: bell rope, cat tree
    // decor picture names in display order: rope.png, decoration.png
    // decor prices in display order: 17, 19
    // decor text
    var text_decor = new BABYLON.GUI.TextBlock();
    text_decor.text = "DECOR";
    text_decor.color = itemTextColor;
    text_decor.fontSize = 80;
    text_decor.fontFamily = itemTextFont;

    var grid_decorText = new BABYLON.GUI.Grid(); 
    grid_decorText.paddingTopInPixels = 30;
    grid_decorText.paddingRightInPixels = shopItemPaddingH;
    grid_decorText.paddingLeftInPixels = shopItemPaddingH;
    grid_decorText.background = subBackgroundColor;
    grid_decorText.addRowDefinition(1);
    grid_decorText.addControl(text_decor, 0, 0); 

    // add grid_decorText to shopGrid
    shopGrid.addControl(grid_decorText, 5, 0); 

    // decorInfo
    var grid_decorInfo = new BABYLON.GUI.Grid(); 
    grid_decorInfo.addColumnDefinition(180, true);
    grid_decorInfo.addColumnDefinition(shopItemWidth - 180 - 180)
    grid_decorInfo.addRowDefinition(shopItemHeight, true);
    grid_decorInfo.addRowDefinition(shopItemHeight, true);
    grid_decorInfo.addRowDefinition(shopItemHeight, true);

    //decor images 
    var Image_decor = ["assets/icon/rope.png", "assets/icon/decorate.png"];
    for(var i=0; i<Image_decor.length; i++){
        var each_Image_decor = new BABYLON.GUI.Image("image", Image_decor[i]);
        each_Image_decor.paddingTopInPixels = 20;
        each_Image_decor.paddingBottomInPixels = 20;
        grid_decorInfo.addControl(each_Image_decor, i, 0);  
    }
    //decor names
    var text_decorName = ["bell rope", "cat tree"];
    for(var i=0; i<text_decorName.length; i++){
        var each_text_decorName = new BABYLON.GUI.TextBlock();
        each_text_decorName.text = text_decorName[i];
        each_text_decorName.color = itemTextColor;
        each_text_decorName.fontSize = itemTextFontSize;
        //each_text_decorName.fontFamily = "Cottonwood";
        grid_decorInfo.addControl(each_text_decorName, i, 1);
    }
    // decorBuy
    var grid_decorBuy = new BABYLON.GUI.Grid();
    grid_decorBuy.addRowDefinition(shopItemHeight, true);
    grid_decorBuy.addRowDefinition(shopItemHeight, true);

    //decor buttons 
    var button_buyRope = BABYLON.GUI.Button.CreateImageButton("but", "17","assets/icon/coin.png");
    var button_buyTree = BABYLON.GUI.Button.CreateImageButton("but", "19","assets/icon/coin.png");
    grid_decorBuy.addControl(button_buyRope, 0, 0);
    grid_decorBuy.addControl(button_buyTree, 1, 0);
    // grid decor
    var grid_decor = new BABYLON.GUI.Grid();
    grid_decor.addColumnDefinition(shopItemWidth - 180);
    grid_decor.addColumnDefinition(180);
    grid_decor.addControl(grid_decorInfo, 0, 0);
    grid_decor.addControl(grid_decorBuy, 0, 1);
    grid_decor.paddingLeftInPixels = shopItemPaddingH;
    grid_decor.paddingRightInPixels = shopItemPaddingH;

    // add grid_decor to shopGrid
    shopGrid.addControl(grid_decor, 6, 0);
    //END OF DECOR PART

    //buttons format
    let buttonsWH = 85;//button image's width and height size
    let buttonsTB = 55;//button text's top and bottom size
    var buttons = [button_buyDryFood, button_buyWetFood, button_buySpecFood,
        button_buyYarn,button_buyMouse,button_buyDog,button_buyElephant,
        button_buyRope, button_buyTree];
    for(var i=0; i<buttons.length; i++){
        buttons[i].background = butBackgroundColor;
        buttons[i].children[1].widthInPixels = buttonsWH;
        buttons[i].children[1].heightInPixels = buttonsWH;
        buttons[i].children[1].paddingLeftInPixels = 20;
        buttons[i].children[1].horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        buttons[i].thickness = 3;
        buttons[i].children[0].fontSize = 50;
        buttons[i].children[0].color = "white";
        buttons[i].children[0].paddingRightInPixels =0;
        buttons[i].children[0].heightInPixels = 80;
        buttons[i].children[0].widthInPixels = 100;
        buttons[i].children[0].horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        buttons[i].children[0].paddingRightInPixels = 20;
        buttons[i].cornerRadius = 40;
        buttons[i].paddingTopInPixels = buttonsTB;
        buttons[i].paddingBottomInPixels = buttonsTB;

     }

    //Scroll viewer
    var sv = new BABYLON.GUI.ScrollViewer();
    sv.width = "1080px";
    sv.height = "2244px";
    sv.background = "orange";
    advancedTexture.addControl(sv);
    sv.addControl(shopGrid);
    });
    grid.addControl(shopButton, 0, 2);

    var exitButton = BABYLON.GUI.Button.CreateImageOnlyButton("but", "assets/icon/exit.png");
    exitButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;   
    exitButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    exitButton.widthInPixels = 180;
    exitButton.heightInPixels = 180;
    exitButton.cornerRadius = 30;
    exitButton.thickness = 0;
    exitButton.paddingTopInPixels = 30;
    exitButton.paddingLeftInPixels = 30;
    exitButton.onPointerClickObservable.add(function () {
        exitAR();
    });
    // exitButton.color = "#FF7979";
    // exitButton.background = "#EB4D4B";
    advancedTexture.addControl(exitButton);

    return coinText;
}

function displayActions(foodButtons,toyButtons, decorButtons, scene, mats, user){
    const size = 180;
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ActionUI");
    var grid = new BABYLON.GUI.Grid(); 
    advancedTexture.addControl(grid); 
    grid.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;   
    grid.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    grid.widthInPixels = size*4;
    grid.heightInPixels = size*1.8;
    grid.addColumnDefinition(1/3);
    grid.addColumnDefinition(1/3);
    grid.addColumnDefinition(1/3);
    grid.addRowDefinition(2/3);
    grid.addRowDefinition(1/3);

    const click = new BABYLON.Sound("click", "./assets/sounds/click.wav", scene);

    var feedButton = BABYLON.GUI.Button.CreateImageOnlyButton("but", "assets/icon/feed.png");
    feedButton.onPointerClickObservable.add(function () {
        click.play();
        showFoodButtons(foodButtons, user.cat, mats);
    });
    var playButton = BABYLON.GUI.Button.CreateImageOnlyButton("but", "assets/icon/play.png");
    playButton.onPointerClickObservable.add(function () {
        click.play();
        showToyButtons(toyButtons, user.cat, mats);
    });
    var decorateButton = BABYLON.GUI.Button.CreateImageOnlyButton("but", "assets/icon/decorate.png");
    decorateButton.onPointerClickObservable.add(function () {
        click.play();
        showDecorButtons(decorButtons, user.cat, mats);
    });

    const textSize = 150;
    var feedText = new BABYLON.GUI.TextBlock();
    feedText.text = `Feed`;
    var playText = new BABYLON.GUI.TextBlock();
    playText.text = `Play`;
    var decorateText = new BABYLON.GUI.TextBlock();
    decorateText.text = `Decorate`;

    // change buttons and texts styles
    var buttons = [feedButton, playButton, decorateButton];
    for(var i=0;i<buttons.length;i++){
        buttons[i].widthInPixels = size;
        buttons[i].heightInPixels = size;
        buttons[i].cornerRadius = size;
        buttons[i].thickness = 6;
        buttons[i].children[0].widthInPixels = 0.8*size;
        buttons[i].children[0].heightInPixels = 2/3*size;
        buttons[i].children[0].paddingLeftInPixels = 22;
        buttons[i].color = "#FF7979";
        buttons[i].background = "#EB4D4B";
        grid.addControl(buttons[i], 0, i);
    }
    var texts = [feedText, playText, decorateText];
    for(var i=0;i<texts.length;i++){
        texts[i].heightInPixels = textSize;
        texts[i].color = "white";
        texts[i].fontSize = 0.3*textSize;
        texts[i].paddingTopInPixels = -0.5*textSize;
        grid.addControl(texts[i], 1, i);
    }
}

function displayShop(advancedTexture){
    // SHOP UI START
    // shop constants
    let subBackgroundColor = "#ACC7DB";
    let butBackgroundColor = "#EB4D4B";
    let shopItemHeight = 220;
    let shopItemPaddingH = 60;
    let itemTextColor = "#2A3741";
    let itemTextFont = "Comic Sans MS";
    let itemTextFontSize = 60;
    let price_size = 120;
    let foodItemCount = 3;
    let toyItemCount = 4;
    let decorItemCount = 2;

    // Create shopGrid
    var shopGrid = new BABYLON.GUI.Grid();   
    shopGrid.background = "#6B899E";
    shopGrid.widthInPixels = 1080;
    shopGrid.heightInPixels= 2800;//test
    let shopItemWidth = shopGrid.widthInPixels - 60*2;
    advancedTexture.addControl(shopGrid); 

    var shopGrid_rows = [210, 170, shopItemHeight*foodItemCount, 170, shopItemHeight*toyItemCount, 170, shopItemHeight*decorItemCount];
    for(var i=0; i<shopGrid_rows.length; i++){
        shopGrid.addRowDefinition(shopGrid_rows[i], true);
    }

    // exit button
    var exitShopButton = BABYLON.GUI.Button.CreateImageOnlyButton("but", "assets/icon/exit.png");
    exitShopButton.widthInPixels = 180;
    exitShopButton.heightInPixels = 180;
    exitShopButton.cornerRadius = 30;
    exitShopButton.thickness = 0;
    exitShopButton.paddingTopInPixels = 30;
    exitShopButton.paddingLeftInPixels = 30;
    exitShopButton.onPointerUpObservable.add(function(){
        console.log("exit");
        advancedTexture.removeControl(sv);
        advancedTexture.removeControl(shopGrid); 
    });

    // coin icon and text
    var coinShopIcon = new BABYLON.GUI.Image("coin", "assets/icon/coin.png");
    coinShopIcon.widthInPixels = 120;
    coinShopIcon.heightInPixels = 120;
    coinShopIcon.paddingRightInPixels = 10;

    var coinShopText = new BABYLON.GUI.TextBlock();
    coinShopText.text = `500`;
    coinShopText.heightInPixels = 120;
    coinShopText.color = "#E5A33F";
    coinShopText.fontSize = 60;
    coinShopText.paddingRightInPixels = 30;

    // top bar label
    var grid_topShopBar = new BABYLON.GUI.Grid();  
    grid_topShopBar.addRowDefinition(1);
    grid_topShopBar.addColumnDefinition(exitShopButton.widthInPixels, true);
    let remaining = shopGrid.widthInPixels - exitShopButton.widthInPixels - coinShopIcon.widthInPixels - 150;
    grid_topShopBar.addColumnDefinition(remaining, true);
    grid_topShopBar.addColumnDefinition(coinShopIcon.heightInPixels, true);
    grid_topShopBar.addColumnDefinition(150, true);

    grid_topShopBar.addControl(exitShopButton, 0, 0); 
    grid_topShopBar.addControl(coinShopIcon, 0, 2);
    grid_topShopBar.addControl(coinShopText, 0, 3);

    // add grid_topShopBar to shopGrid
    shopGrid.addControl(grid_topShopBar, 0, 0); 

    // food text
    var text_food = new BABYLON.GUI.TextBlock();
    text_food.text = "FOOD";
    text_food.color = itemTextColor;
    text_food.fontSize = 80;
    text_food.fontFamily = itemTextFont;

    var grid_foodText = new BABYLON.GUI.Grid(); 
    grid_foodText.paddingTopInPixels = 30;
    grid_foodText.paddingRightInPixels = shopItemPaddingH;
    grid_foodText.paddingLeftInPixels = shopItemPaddingH;
    grid_foodText.background = subBackgroundColor;
    grid_foodText.addRowDefinition(1);
    grid_foodText.addControl(text_food, 0, 0); 

    // add grid_foodText to shopGrid
    shopGrid.addControl(grid_foodText, 1, 0); 

    // foodInfo
    var grid_foodInfo = new BABYLON.GUI.Grid(); 
    grid_foodInfo.addColumnDefinition(180, true);
    grid_foodInfo.addColumnDefinition(shopItemWidth - 180 - 180)
    grid_foodInfo.addRowDefinition(shopItemHeight, true);
    grid_foodInfo.addRowDefinition(shopItemHeight, true);
    grid_foodInfo.addRowDefinition(shopItemHeight, true);
    
    //food images
    var Image_food = ["assets/icon/dry_food.png", "assets/icon/wet_food.png", "assets/icon/salmon.png"];
    for(var i=0; i<Image_food.length; i++){
        var each_Image_food = new BABYLON.GUI.Image("image", Image_food[i]);
        grid_foodInfo.addControl(each_Image_food, i, 0);  
    }
    //food names
    var text_foodName = ["dry food", "wet food", "sardine"];
    for(var i=0; i<text_foodName.length; i++){
        var each_text_foodName = new BABYLON.GUI.TextBlock();
        each_text_foodName.text = text_foodName[i];
        each_text_foodName.color = itemTextColor;
        each_text_foodName.fontSize = itemTextFontSize;
        grid_foodInfo.addControl(each_text_foodName, i, 1);
    }

    // foodBuy
    var grid_foodBuy = new BABYLON.GUI.Grid();
    grid_foodBuy.addRowDefinition(shopItemHeight, true);
    grid_foodBuy.addRowDefinition(shopItemHeight, true);
    grid_foodBuy.addRowDefinition(shopItemHeight, true);
    //food buttons
    var button_buyDryFood = BABYLON.GUI.Button.CreateImageButton("but", "1","assets/icon/coin.png");
    var button_buyWetFood = BABYLON.GUI.Button.CreateImageButton("but", "2","assets/icon/coin.png");
    var button_buySpecFood = BABYLON.GUI.Button.CreateImageButton("but", "5","assets/icon/coin.png");
    grid_foodBuy.addControl(button_buyDryFood, 0, 0);
    grid_foodBuy.addControl(button_buyWetFood, 1, 0);
    grid_foodBuy.addControl(button_buySpecFood, 2, 0);

    // grid food
    var grid_food = new BABYLON.GUI.Grid();
    grid_food.addColumnDefinition(shopItemWidth - 180);
    grid_food.addColumnDefinition(180);
    grid_food.addControl(grid_foodInfo, 0, 0);
    grid_food.addControl(grid_foodBuy, 0, 1);
    grid_food.paddingLeftInPixels = shopItemPaddingH;
    grid_food.paddingRightInPixels = shopItemPaddingH;

    // add grid_food to shopGrid
    shopGrid.addControl(grid_food, 2, 0); 
    //END OF FOOD PART

    //START: TOY PART
    // toy names in display order: ball of yarn, mouse, stuffed dog, stuffed elephant
    // toy picture names in display order: yarn.png, toy.png, dog.png, elephant.png
    // toy prices in display order: 3, 5, 7, 11
    // toy text
    var text_toy = new BABYLON.GUI.TextBlock();
    text_toy.text = "TOY";
    text_toy.color = itemTextColor;
    text_toy.fontSize = 80;
    text_toy.fontFamily = itemTextFont;

    var grid_toyText = new BABYLON.GUI.Grid(); 
    grid_toyText.paddingTopInPixels = 30;
    grid_toyText.paddingRightInPixels = shopItemPaddingH;
    grid_toyText.paddingLeftInPixels = shopItemPaddingH;
    grid_toyText.background = subBackgroundColor;
    grid_toyText.addRowDefinition(1);
    grid_toyText.addControl(text_toy, 0, 0); 

    // add grid_toyText to shopGrid
    shopGrid.addControl(grid_toyText, 3, 0);

    // toyInfo
    var grid_toyInfo = new BABYLON.GUI.Grid(); 
    grid_toyInfo.addColumnDefinition(180, true);
    grid_toyInfo.addColumnDefinition(shopItemWidth - 180 - 180)
    grid_toyInfo.addRowDefinition(shopItemHeight, true);
    grid_toyInfo.addRowDefinition(shopItemHeight, true);
    grid_toyInfo.addRowDefinition(shopItemHeight, true);
    grid_toyInfo.addRowDefinition(shopItemHeight, true);


    //toy images import
    var Image_toy = ["assets/icon/yarn.png", "assets/icon/play.png", "assets/icon/dog.png", "assets/icon/elephant.png"];
    for(var i=0; i<Image_toy.length; i++){
        var each_Image_toy = new BABYLON.GUI.Image("image", Image_toy[i]);
        each_Image_toy.paddingBottomInPixels = 20;
        each_Image_toy.paddingTopInPixels = 20;
        grid_toyInfo.addControl(each_Image_toy, i, 0);  
    }
    //toy names text import
    var text_toyName = ["ball of yarn", "mouse", "stuffed dog", "stuffed elephant"];
    for(var i=0; i<text_toyName.length; i++){
        var each_text_toyName = new BABYLON.GUI.TextBlock();
        each_text_toyName.text = text_toyName[i];
        each_text_toyName.color = itemTextColor;
        each_text_toyName.fontSize = itemTextFontSize;
        grid_toyInfo.addControl(each_text_toyName, i, 1);
    }

    // toyBuy
    var grid_toyBuy = new BABYLON.GUI.Grid();
    grid_toyBuy.addRowDefinition(shopItemHeight, true);
    grid_toyBuy.addRowDefinition(shopItemHeight, true);
    grid_toyBuy.addRowDefinition(shopItemHeight, true);
    grid_toyBuy.addRowDefinition(shopItemHeight, true);
    //toy buttons
    var button_buyYarn = BABYLON.GUI.Button.CreateImageButton("but", "3","assets/icon/coin.png");
    var button_buyMouse = BABYLON.GUI.Button.CreateImageButton("but", "5","assets/icon/coin.png");
    var button_buyDog = BABYLON.GUI.Button.CreateImageButton("but", "7","assets/icon/coin.png");
    var button_buyElephant = BABYLON.GUI.Button.CreateImageButton("but", "11","assets/icon/coin.png");
    grid_toyBuy.addControl(button_buyYarn, 0, 0);
    grid_toyBuy.addControl(button_buyMouse, 1, 0);
    grid_toyBuy.addControl(button_buyDog, 2, 0);
    grid_toyBuy.addControl(button_buyElephant, 3, 0);
    
    // grid toy
    var grid_toy = new BABYLON.GUI.Grid();
    grid_toy.addColumnDefinition(shopItemWidth - 180);
    grid_toy.addColumnDefinition(180);
    grid_toy.addControl(grid_toyInfo, 0, 0);
    grid_toy.addControl(grid_toyBuy, 0, 1);
    grid_toy.paddingLeftInPixels = shopItemPaddingH;
    grid_toy.paddingRightInPixels = shopItemPaddingH;

    // add grid_toy to shopGrid
    shopGrid.addControl(grid_toy, 4, 0);
    //END OF TOY PART

    //START: DECOR PART
    // decor names in display order: bell rope, cat tree
    // decor picture names in display order: rope.png, decoration.png
    // decor prices in display order: 17, 19
    // decor text
    var text_decor = new BABYLON.GUI.TextBlock();
    text_decor.text = "DECOR";
    text_decor.color = itemTextColor;
    text_decor.fontSize = 80;
    text_decor.fontFamily = itemTextFont;

    var grid_decorText = new BABYLON.GUI.Grid(); 
    grid_decorText.paddingTopInPixels = 30;
    grid_decorText.paddingRightInPixels = shopItemPaddingH;
    grid_decorText.paddingLeftInPixels = shopItemPaddingH;
    grid_decorText.background = subBackgroundColor;
    grid_decorText.addRowDefinition(1);
    grid_decorText.addControl(text_decor, 0, 0); 

    // add grid_decorText to shopGrid
    shopGrid.addControl(grid_decorText, 5, 0); 

    // decorInfo
    var grid_decorInfo = new BABYLON.GUI.Grid(); 
    grid_decorInfo.addColumnDefinition(180, true);
    grid_decorInfo.addColumnDefinition(shopItemWidth - 180 - 180)
    grid_decorInfo.addRowDefinition(shopItemHeight, true);
    grid_decorInfo.addRowDefinition(shopItemHeight, true);
    grid_decorInfo.addRowDefinition(shopItemHeight, true);

    //decor images 
    var Image_decor = ["assets/icon/rope.png", "assets/icon/decorate.png"];
    for(var i=0; i<Image_decor.length; i++){
        var each_Image_decor = new BABYLON.GUI.Image("image", Image_decor[i]);
        each_Image_decor.paddingTopInPixels = 20;
        each_Image_decor.paddingBottomInPixels = 20;
        grid_decorInfo.addControl(each_Image_decor, i, 0);  
    }
    //decor names
    var text_decorName = ["bell rope", "cat tree"];
    for(var i=0; i<text_decorName.length; i++){
        var each_text_decorName = new BABYLON.GUI.TextBlock();
        each_text_decorName.text = text_decorName[i];
        each_text_decorName.color = itemTextColor;
        each_text_decorName.fontSize = itemTextFontSize;
        //each_text_decorName.fontFamily = "Cottonwood";
        grid_decorInfo.addControl(each_text_decorName, i, 1);
    }
    // decorBuy
    var grid_decorBuy = new BABYLON.GUI.Grid();
    grid_decorBuy.addRowDefinition(shopItemHeight, true);
    grid_decorBuy.addRowDefinition(shopItemHeight, true);

    //decor buttons 
    var button_buyRope = BABYLON.GUI.Button.CreateImageButton("but", "17","assets/icon/coin.png");
    var button_buyTree = BABYLON.GUI.Button.CreateImageButton("but", "19","assets/icon/coin.png");
    grid_decorBuy.addControl(button_buyRope, 0, 0);
    grid_decorBuy.addControl(button_buyTree, 1, 0);
    // grid decor
    var grid_decor = new BABYLON.GUI.Grid();
    grid_decor.addColumnDefinition(shopItemWidth - 180);
    grid_decor.addColumnDefinition(180);
    grid_decor.addControl(grid_decorInfo, 0, 0);
    grid_decor.addControl(grid_decorBuy, 0, 1);
    grid_decor.paddingLeftInPixels = shopItemPaddingH;
    grid_decor.paddingRightInPixels = shopItemPaddingH;

    // add grid_decor to shopGrid
    shopGrid.addControl(grid_decor, 6, 0);
    //END OF DECOR PART

    //buttons format
    let buttonsWH = 85;//button image's width and height size
    let buttonsTB = 55;//button text's top and bottom size
    var buttons = [button_buyDryFood, button_buyWetFood, button_buySpecFood,
        button_buyYarn,button_buyMouse,button_buyDog,button_buyElephant,
        button_buyRope, button_buyTree];
    for(var i=0; i<buttons.length; i++){
        buttons[i].background = butBackgroundColor;
        buttons[i].children[1].widthInPixels = buttonsWH;
        buttons[i].children[1].heightInPixels = buttonsWH;
        buttons[i].children[1].paddingLeftInPixels = 20;
        buttons[i].children[1].horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        buttons[i].thickness = 3;
        buttons[i].children[0].fontSize = 50;
        buttons[i].children[0].color = "white";
        buttons[i].children[0].paddingRightInPixels =0;
        buttons[i].children[0].heightInPixels = 80;
        buttons[i].children[0].widthInPixels = 100;
        buttons[i].children[0].horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        buttons[i].children[0].paddingRightInPixels = 20;
        buttons[i].cornerRadius = 40;
        buttons[i].paddingTopInPixels = buttonsTB;
        buttons[i].paddingBottomInPixels = buttonsTB;

     }

    //Scroll viewer
    var sv = new BABYLON.GUI.ScrollViewer();
    sv.width = "1080px";
    sv.height = "2244px";
    sv.background = "orange";
    advancedTexture.addControl(sv);
    sv.addControl(shopGrid);
    
}

function showFoodButtons(foodButtons, cat, mats){
    foodButtons.dry.isVisible = true;
    foodButtons.wet.isVisible = true;
    foodButtons.special.isVisible = true;
    if(cat.dryFood > 0){
        foodButtons.drySphere.material = mats.pink;
    }
    if(cat.wetFood > 0){
        foodButtons.wetSphere.material = mats.pink;
    }
    if(cat.specialFood > 0){
        foodButtons.specialSphere.material = mats.pink;
    }
}

function showToyButtons(toyButtons, cat, mats){
    toyButtons.mouse.isVisible = true;
    toyButtons.yarn.isVisible = true;
    toyButtons.dog.isVisible = true;
    toyButtons.elephant.isVisible = true;

    if(cat.mouse){
        toyButtons.mouseSphere.material = mats.pink;
    }
    if(cat.yarn){
        toyButtons.yarnSphere.material = mats.pink;
    }
    if(cat.stuffed_dog){
        toyButtons.dogSphere.material = mats.pink;
    }
    if(cat.stuffed_elephant){
        toyButtons.elephantSphere.material = mats.pink;
    }
}

function showDecorButtons(decorButtons, cat, mats){
    decorButtons.catTree.isVisible = true;
    decorButtons.bellRope.isVisible = true;

    if(cat.cat_tree > 0){
        decorButtons.catTreeSphere.material = mats.pink;
    }
    if(cat.bell_rope > 0){
        decorButtons.bellRopeSphere.material = mats.pink;
    }
}



//////////////////// Update UI /////////////////////
const FOOD_HUNGER = {
    dry: 1,
    wet: 2,
    special: 5
};
const TOY_MOOD = {
    yarn: 3,
    mouse: 5,
    stuffed_dog: 7,
    stuffed_elephant: 11
};
const DECOR_MOOD = {
    bell_rope: 17,
    cat_tree: 19
};
function onFeedClicked(user, foodType, textUI, bars, mats){
    const feed = functions.httpsCallable('eat');
    feed({email: user.email, catName: user.cat.name, type: foodType})
    .then(res => {
        //alert(res.data);
    });
    switch(foodType){
    case "dry":
        user.cat.dryFood -= 1;
        user.cat.hunger += FOOD_HUNGER.dry;
        textUI.dry.text = `${user.cat.dryFood}`;
        for(var i=0;i<FOOD_HUNGER.dry;i++){
        bars.hungerBar[user.cat.hunger-FOOD_HUNGER.dry+i].material = mats.red;
        }
        break;
    case "wet":
        user.cat.wetFood -= 1;
        user.cat.hunger += FOOD_HUNGER.wet;
        textUI.wet.text = `${user.cat.wetFood}`;
        for(var i=0;i<FOOD_HUNGER.wet;i++){
        bars.hungerBar[user.cat.hunger-FOOD_HUNGER.wet+i].material = mats.red;
        }
        break;
    case "special":
        user.cat.specialFood -= 1;
        user.cat.hunger += FOOD_HUNGER.special;
        textUI.special.text = `${user.cat.specialFood}`;
        for(var i=0;i<FOOD_HUNGER.special;i++){
        bars.hungerBar[user.cat.hunger-FOOD_HUNGER.special+i].material = mats.red;
        }
        break;
    }

}

function onPlayClicked(user, playType, textUI, bars, mats){
    const play = functions.httpsCallable('play');
    play({email: user.email, catName: user.cat.name, type: playType})
    .then(res => {
        //alert(res.data);
    });
    switch(playType){
    case "yarn":
        user.cat.mood += TOY_MOOD.yarn;
        for(var i=0;i<TOY_MOOD.yarn;i++){
            bars.moodBar[user.cat.mood-TOY_MOOD.yarn+i].material = mats.orange;
        }
        break;
    case "mouse":
        user.cat.mood += TOY_MOOD.mouse;
        for(var i=0;i<TOY_MOOD.mouse;i++){
            bars.moodBar[user.cat.mood-TOY_MOOD.mouse+i].material = mats.orange;
        }
        break;
    case "stuffed_dog":
        user.cat.mood += TOY_MOOD.stuffed_dog;
        for(var i=0;i<TOY_MOOD.stuffed_dog;i++){
            bars.moodBar[user.cat.mood-TOY_MOOD.stuffed_dog+i].material = mats.orange;
        }
        break;
    case "stuffed_elephant":
        user.cat.mood += TOY_MOOD.stuffed_elephant;
        for(var i=0;i<TOY_MOOD.stuffed_elephant;i++){
            bars.moodBar[user.cat.mood-TOY_MOOD.stuffed_elephant+i].material = mats.orange;
        }
        break;
    }
}

function onDecorClicked(user, decorType, textUI, bars, mats){
    const decor = functions.httpsCallable('placeDecor');
    decor({email: user.email, catName: user.cat.name, type: decorType})
    .then(res => {
        //alert(res.data);
    });
    switch(decorType){
    case "bell_rope":
        user.cat.mood += DECOR_MOOD.bell_rope;
        for(var i=0;i<DECOR_MOOD.bell_rope;i++){
            bars.moodBar[user.cat.mood-DECOR_MOOD.bell_rope+i].material = mats.orange;
        }
        break;
    case "cat_tree":
        user.cat.mood += DECOR_MOOD.cat_tree;
        for(var i=0;i<DECOR_MOOD.cat_tree;i++){
            bars.moodBar[user.cat.mood-DECOR_MOOD.cat_tree+i].material = mats.orange;
        }
        break;
    }

}