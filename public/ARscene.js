export{initializeScene}
import{functions} from './ARmain.js'

function initializeScene(user){
    var canvas = document.getElementById("renderCanvas"); // Get the canvas element
    var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
    var markerOn = true;

    // Currently unused
    var addMesh = function (xr, scene) {
        const fm = xr.baseExperience.featuresManager;

        const xrTest = fm.enableFeature(BABYLON.WebXRHitTest, "latest");

        const marker = BABYLON.MeshBuilder.CreateTorus('marker', { diameter: 0.15, thickness: 0.03 });
        marker.isVisible = false;
        marker.rotationQuaternion = new BABYLON.Quaternion();

        /*
        var markerMaterial = new BABYLON.StandardMaterial(scene);
        markerMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        markerMaterial.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        markerMaterial.emissiveColor = BABYLON.Color3.White();
        marker.material = markerMaterial;
        */

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
        return [hitTest, marker];
    }

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

        var cat = null;
        var sphere = null;
        // const [hitTest, marker] = addMesh(xr, scene);

        const fm = xr.baseExperience.featuresManager;
        const xrTest = fm.enableFeature(BABYLON.WebXRHitTest, "latest");

        // Initialize a marker to show hit test result 
        const marker = BABYLON.MeshBuilder.CreateTorus('marker', { diameter: 0.12, thickness: 0.02 });
        marker.isVisible = false;
        marker.rotationQuaternion = new BABYLON.Quaternion();
        var markerMaterial = new BABYLON.StandardMaterial(scene);
        markerMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        markerMaterial.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        // markerMaterial.emissiveColor = BABYLON.Color3.White();
        marker.material = markerMaterial;

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

        // Display 2D GUI: food and currency
        var textUI = displayProperties(user);

        // 3D gui - for mesh interaction
        var manager = new BABYLON.GUI.GUI3DManager(scene);
        var panel3D = new BABYLON.GUI.StackPanel3D();
        panel3D.margin = 0.2;
        manager.addControl(panel3D);

        scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERTAP:
                    meow.play();
                    if(cat == null){
                        if(marker.isVisible){
                            markerOn = false;
                            marker.isVisible = false;
                            var meshStaticCat = BABYLON.SceneLoader.ImportMesh("", "./assets/cat/CatV2glTFSeparated/", "ChibiCatV2_unity.gltf", scene, function (newMeshes, particleSystems, skeletons) {
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

                                // Create 3 3D GUI button for testing purpose
                                hitTest.transformationMatrix.decompose(null, panel3D.rotationQuaternion, panel3D.position);
                                panel3D.position.z = cat.position.z + 5.5;
                                panel3D.blockLayout = true;

                                var button_feed_dry = new BABYLON.GUI.Button3D("feed_dry");
                                button_feed_dry.onPointerClickObservable.add(function () {
                                    onFeedDryClicked(user, "dry", textUI);
                                    scene.animationGroups[7].play(false);
                                });
                                var text1 = new BABYLON.GUI.TextBlock();
                                text1.text = "eat_dry";
                                text1.color = "white";
                                text1.fontSize = 24;
                                button_feed_dry.content = text1; 
                                button_feed_dry.width = 50;
                                button_feed_dry.height = 50;
                                panel3D.addControl(button_feed_dry);

                                var button_buy_dry = new BABYLON.GUI.Button3D("buy_dry");
                                button_buy_dry.onPointerClickObservable.add(function () {
                                    onBuyFoodClicked(user, "dry", textUI);
                                });
                                var text2 = new BABYLON.GUI.TextBlock();
                                text2.text = "buy_dry";
                                text2.color = "white";
                                text2.fontSize = 24;
                                button_buy_dry.content = text2; 
                                button_buy_dry.width = 50;
                                button_buy_dry.height = 50;
                                panel3D.addControl(button_buy_dry);

                                var button_exist = new BABYLON.GUI.Button3D("exit");
                                button_exist.onPointerClickObservable.add(function () {
                                    exitAR();
                                });
                                var text3 = new BABYLON.GUI.TextBlock();
                                text3.text = "exit";
                                text3.color = "white";
                                text3.fontSize = 24;
                                button_exist.content = text3; 
                                button_exist.width = 50;
                                button_exist.height = 50;
                                panel3D.addControl(button_exist);
                                
                                panel3D.blockLayout = false;
                            });
                        }
                    }
                    else{
                        // alert("You are tapping after cat is set up");
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

  function onFeedDryClicked(user, foodType, textUI){
    const feed = functions.httpsCallable('eat');
    
    feed({email: user.email, catName: user.cat.name, type: foodType})
    .then(res => {
        //alert(res.data);
    });
    user.cat.dryFood -= 1;
    user.cat.feedDryCount += 1;
    user.cat.hunger += 1;
    textUI.dry.text = `${user.cat.dryFood}`;
  }
  function onBuyFoodClicked(user, foodType, textUI){
    const buyFood = functions.httpsCallable('buyFood');
    buyFood({email: user.email, catName: user.cat.name, type: foodType})
    .then(res => {
        //alert(res.data);
    });
    user.cat.dryFood += 1;
    user.cat.currency -= 1;
    textUI.dry.text = `${user.cat.dryFood}`;
    textUI.coin.text = `${user.cat.currency}`;
  }

  function exitAR(){
    window.location.href = "index.html";
  }

  function displayProperties(user){
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
    var grid = new BABYLON.GUI.Grid(); 
    advancedTexture.addControl(grid); 
    grid.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;   
    grid.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    
    grid.widthInPixels = 220;
    grid.heightInPixels = 400;

    grid.addColumnDefinition(0.4);
    grid.addColumnDefinition(0.6);
    grid.addRowDefinition(1/4);
    grid.addRowDefinition(1/4);
    grid.addRowDefinition(1/4);
    grid.addRowDefinition(1/4);

    const size = 100;
    const textSize = 60;
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

    var coinIcon = new BABYLON.GUI.Image("coin", "assets/icon/coin.png");
    coinIcon.widthInPixels = 0.9*size;
    coinIcon.heightInPixels = 0.9*size;
    grid.addControl(coinIcon, 3, 0);

    var dryCountText = new BABYLON.GUI.TextBlock();
    dryCountText.text = `${user.cat.dryFood}`;
    dryCountText.heightInPixels = size;
    dryCountText.color = "white";
    dryCountText.fontSize = textSize;
    dryCountText.fontFamily = "Comic Sans MS";
    dryCountText.paddingRightInPixels = -10;
    grid.addControl(dryCountText, 0, 1);

    var wetCountText = new BABYLON.GUI.TextBlock();
    wetCountText.text = `${user.cat.wetFood}`;
    wetCountText.heightInPixels = size;
    wetCountText.color = "white";
    wetCountText.fontSize = textSize;
    wetCountText.fontFamily = "Comic Sans MS";
    wetCountText.paddingRightInPixels = -10;
    grid.addControl(wetCountText, 1, 1);

    var spCountText = new BABYLON.GUI.TextBlock();
    spCountText.text = `${user.cat.specialFood}`;
    spCountText.heightInPixels = size;
    spCountText.color = "white";
    spCountText.fontSize = textSize;
    spCountText.fontFamily = "Comic Sans MS";
    grid.addControl(spCountText, 2, 1);

    var coinText = new BABYLON.GUI.TextBlock();
    coinText.text = `${user.cat.currency}`;
    coinText.heightInPixels = 0.9*size;
    coinText.color = "white";
    coinText.fontSize = textSize;
    coinText.fontFamily = "Comic Sans MS";
    grid.addControl(coinText, 3, 1);

    var textUI = {
        dry: dryCountText,
        wet: wetCountText,
        special: spCountText,
        coin: coinText
    }
    return textUI;
}
  