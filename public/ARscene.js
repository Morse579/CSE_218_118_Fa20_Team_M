export{initializeScene}
import{functions} from './ARmain.js'
import{displayShop} from './shop.js'

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

        var randAnim = [1, 2, 6, 19, 20, 22];

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
        displayTopUI(user, textUI);

        var mats = createMats();

        // 3D gui - for mesh interaction
        var manager = new BABYLON.GUI.GUI3DManager(scene);
        var panel3D = new BABYLON.GUI.StackPanel3D();
        panel3D.margin = 0.2;
        manager.addControl(panel3D);

        var panelFood = new BABYLON.GUI.StackPanel3D();
        manager.addControl(panelFood);
        panelFood.margin = 0.02;

        var panelToys = new BABYLON.GUI.StackPanel3D();
        manager.addControl(panelToys);
        panelToys.margin = 0.01;
    
        var panelDecor = new BABYLON.GUI.StackPanel3D();
        manager.addControl(panelDecor);
        panelDecor.margin = 0.03;
        
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
                        var rand = Math.floor(Math.random() * randAnim.length);
                        scene.animationGroups[randAnim[rand]].play(false);                 
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
    panel.position.z = cat.position.z - 0.15;
    panel.node.rotation = new BABYLON.Vector3(Math.PI/6, 0, 0);
    
    panel.blockLayout = true;
    var dryFoodButton = new BABYLON.GUI.Button3D("dryFoodButton");
    dryFoodButton.onPointerUpObservable.add(function(){
        dryFoodButton.isVisible = false;
        wetFoodButton.isVisible = false;
        specialFoodButton.isVisible = false;
        onFeedClicked(user, "dry", textUI, bars, mats);
    });   
    panel.addControl(dryFoodButton);
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Dry\nFood";
    text1.color = "white";
    text1.fontSize = 50;
    dryFoodButton.content = text1;
    dryFoodButton.scaling = new BABYLON.Vector3(0.08, 0.08, 0.08);
    dryFoodButton.isVisible = false;

    var wetFoodButton = new BABYLON.GUI.Button3D("wetFoodButton");
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
    var text2 = new BABYLON.GUI.TextBlock();
    text2.text = "Wet\nFood";
    text2.color = "white";
    text2.fontSize = 50;
    wetFoodButton.content = text2; 
    wetFoodButton.scaling = new BABYLON.Vector3(0.08, 0.08, 0.08);
    wetFoodButton.isVisible = false;

    var specialFoodButton = new BABYLON.GUI.Button3D("dryFoodButton");
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
    var text3 = new BABYLON.GUI.TextBlock();
    text3.text = "Special\nFood";
    text3.color = "white";
    text3.fontSize = 50;
    specialFoodButton.content = text3; 
    specialFoodButton.scaling = new BABYLON.Vector3(0.08, 0.08, 0.08);
    specialFoodButton.isVisible = false;

    panel.blockLayout = false;

    var foodButtons = {
        dry: dryFoodButton,
        wet: wetFoodButton,
        special: specialFoodButton
    };
    return foodButtons;
}

function display3DToyButtons(panel, user, textUI, scene, cat, bars, mats){
    panel.position.z = cat.position.z - 0.15;
    panel.node.rotation = new BABYLON.Vector3(Math.PI/6, 0, 0);

    panel.blockLayout = true;

    var mouseButton = new BABYLON.GUI.Button3D("mouseButton");
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
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Mouse";
    text1.color = "white";
    text1.fontSize = 50;
    mouseButton.content = text1; 
    mouseButton.scaling = new BABYLON.Vector3(0.08, 0.08, 0.08);
    mouseButton.isVisible = false;

    var yarnButton = new BABYLON.GUI.Button3D("yarnButton");
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
    var text2 = new BABYLON.GUI.TextBlock();
    text2.text = "Yarn";
    text2.color = "white";
    text2.fontSize = 50;
    yarnButton.content = text2; 
    yarnButton.scaling = new BABYLON.Vector3(0.08, 0.08, 0.08);
    yarnButton.isVisible = false;

    var dogButton = new BABYLON.GUI.Button3D("dogButton");
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
    var text3 = new BABYLON.GUI.TextBlock();
    text3.text = "Dog";
    text3.color = "white";
    text3.fontSize = 50;
    dogButton.content = text3; 
    dogButton.scaling = new BABYLON.Vector3(0.08, 0.08, 0.08);
    dogButton.isVisible = false;

    var elephantButton = new BABYLON.GUI.Button3D("elephantButton");
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
    var text4 = new BABYLON.GUI.TextBlock();
    text4.text = "Elephant";
    text4.color = "white";
    text4.fontSize = 50;
    elephantButton.content = text4; 
    elephantButton.scaling = new BABYLON.Vector3(0.08, 0.08, 0.08);
    elephantButton.isVisible = false;

    panel.blockLayout = false;

    var toyButtons = {
        mouse: mouseButton,
        yarn: yarnButton,
        dog: dogButton,
        elephant: elephantButton
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
    panel.position.z = cat.position.z - 0.15;
    panel.node.rotation = new BABYLON.Vector3(Math.PI/6, 0, 0);

    panel.blockLayout = true;

    var catTreeButton = new BABYLON.GUI.Button3D("catTreeButton");
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
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Cat\nTree";
    text1.color = "white";
    text1.fontSize = 50;
    catTreeButton.content = text1; 
    catTreeButton.scaling = new BABYLON.Vector3(0.08, 0.08, 0.08);
    catTreeButton.isVisible = false;

    var bellRopeButton = new BABYLON.GUI.Button3D("bellRopeButton");
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
    var text2 = new BABYLON.GUI.TextBlock();
    text2.text = "Bell\nRope";
    text2.color = "white";
    text2.fontSize = 50;
    bellRopeButton.content = text2; 
    bellRopeButton.scaling = new BABYLON.Vector3(0.08, 0.08, 0.08);
    bellRopeButton.isVisible = false;

    panel.blockLayout = false;

    var decorButtons = {
        catTree: catTreeButton,
        bellRope: bellRopeButton
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
  function displayTopUI(user, textUI){
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
        displayShop(advancedTexture, user, textUI, coinText);
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
function showFoodButtons(foodButtons, cat, mats){
    foodButtons.dry.isVisible = true;
    foodButtons.wet.isVisible = true;
    foodButtons.special.isVisible = true;
    if(cat.dryFood > 0){
        foodButtons.dry.content.color = "orange";
    }
    if(cat.wetFood > 0){
        foodButtons.wet.content.color = "orange";
    }
    if(cat.specialFood > 0){
        foodButtons.special.content.color = "orange";
    }
}

function showToyButtons(toyButtons, cat, mats){
    toyButtons.mouse.isVisible = true;
    toyButtons.yarn.isVisible = true;
    toyButtons.dog.isVisible = true;
    toyButtons.elephant.isVisible = true;

    if(cat.mouse){
        toyButtons.mouse.content.color = "orange";
    }
    if(cat.yarn){
        toyButtons.yarn.content.color = "orange";
    }
    if(cat.stuffed_dog){
        toyButtons.dog.content.color = "orange";
    }
    if(cat.stuffed_elephant){
        toyButtons.elephant.content.color = "orange";
    }
}

function showDecorButtons(decorButtons, cat, mats){
    decorButtons.catTree.isVisible = true;
    decorButtons.bellRope.isVisible = true;

    if(cat.cat_tree > 0){
        decorButtons.catTree.content.color = "orange";
    }
    if(cat.bell_rope > 0){
        decorButtons.bellRope.content.color = "orange";
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
        for(var i=Math.max(0,user.cat.hunger-FOOD_HUNGER.dry);i<Math.min(100,user.cat.hunger);i++){
            bars.hungerBar[i].material = mats.red;
        }
        break;
    case "wet":
        user.cat.wetFood -= 1;
        user.cat.hunger += FOOD_HUNGER.wet;
        textUI.wet.text = `${user.cat.wetFood}`;
        for(var i=Math.max(0,user.cat.hunger-FOOD_HUNGER.wet);i<Math.min(100,user.cat.hunger);i++){
            bars.hungerBar[i].material = mats.red;
        }
        break;
    case "special":
        user.cat.specialFood -= 1;
        user.cat.hunger += FOOD_HUNGER.special;
        textUI.special.text = `${user.cat.specialFood}`;
        for(var i=Math.max(0,user.cat.hunger-FOOD_HUNGER.special);i<Math.min(100,user.cat.hunger);i++){
            bars.hungerBar[i].material = mats.red;
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
        for(var i=Math.max(0,user.cat.mood-TOY_MOOD.yarn);i<Math.min(100,user.cat.mood);i++){
            bars.moodBar[i].material = mats.orange;
        }
        break;
    case "mouse":
        user.cat.mood += TOY_MOOD.mouse;
        for(var i=Math.max(0,user.cat.mood-TOY_MOOD.mouse);i<Math.min(100,user.cat.mood);i++){
            bars.moodBar[i].material = mats.orange;
        }
        break;
    case "stuffed_dog":
        user.cat.mood += TOY_MOOD.stuffed_dog;
        for(var i=Math.max(0,user.cat.mood-TOY_MOOD.stuffed_dog);i<Math.min(100,user.cat.mood);i++){
            bars.moodBar[i].material = mats.orange;
        }
        break;
    case "stuffed_elephant":
        user.cat.mood += TOY_MOOD.stuffed_elephant;
        for(var i=Math.max(0,user.cat.mood-TOY_MOOD.stuffed_elephant);i<Math.min(100,user.cat.mood);i++){
            bars.moodBar[i].material = mats.orange;
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
        for(var i=Math.max(0,user.cat.mood-DECOR_MOOD.bell_rope);i<Math.min(100,user.cat.mood);i++){
            bars.moodBar[i].material = mats.orange;
        }
        break;
    case "cat_tree":
        user.cat.mood += DECOR_MOOD.cat_tree;
        for(var i=Math.max(0,user.cat.mood-DECOR_MOOD.cat_tree);i<Math.min(100,user.cat.mood);i++){
            bars.moodBar[i].material = mats.orange;
        }
        break;
    }

}