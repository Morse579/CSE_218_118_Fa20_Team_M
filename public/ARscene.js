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

        // Full screen UI - display text only
        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        var panel = new BABYLON.GUI.StackPanel();
        advancedTexture.addControl(panel);

        var header = new BABYLON.GUI.TextBlock();
        header.text = `Hunger: ${user.cat.hunger}`;
        header.height = "100px";
        header.color = "white";
        header.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        header.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        header.fontSize = "80";
        panel.addControl(header);

        var header2 = new BABYLON.GUI.TextBlock();
        header2.text = `Mood: ${user.cat.mood}`;
        header2.height = "100px";
        header2.color = "white";
        header2.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        header2.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        header2.fontSize = "80";
        panel.addControl(header2);

        var header3 = new BABYLON.GUI.TextBlock();
        header3.text = `Money: ${user.cat.currency}`;
        header3.height = "100px";
        header3.color = "white";
        header3.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        header3.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        header3.fontSize = "80";
        panel.addControl(header3);

        // 3D gui - for mesh interaction
        var manager = new BABYLON.GUI.GUI3DManager(scene);
        var panel3D = new BABYLON.GUI.StackPanel3D();
        panel3D.margin = 0.2;
        manager.addControl(panel3D);

        scene.onPointerObservable.add((pointerInfo) => {
            switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERTAP:
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
                                meow.play(); 

                                // Create 3 3D GUI button for testing purpose
                                hitTest.transformationMatrix.decompose(null, panel3D.rotationQuaternion, panel3D.position);
                                panel3D.position.z = cat.position.z + 5.5;
                                panel3D.blockLayout = true;

                                var button_feed_dry = new BABYLON.GUI.Button3D("feed_dry");
                                button_feed_dry.onPointerClickObservable.add(function () {
                                    onFeedDryClicked(user, "dry", header);
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
                                    onBuyFoodClicked(user, "dry", header3);
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
                        meow.play();
                        scene.animationGroups[1].play(false);                 
                    }
                    break;      
            }
        });

    //////////////////////////////// UI  test ////////////////////////////////
        /*
        var button = BABYLON.GUI.Button.CreateSimpleButton("but", "Click Me");
        button.height = "200px";
        button.width = "400px";
        button.color = "#003399";
        button.background = "grey";
        button.left = "120px";
        button.cornerRadius = 20;
        button.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        button.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
        */
        //panel.addControl(button);
    //////////////////////////////// UI test //////////////////////////////// 

        return scene;
    }

    createScene().then(scene => {
        engine.runRenderLoop(() => scene.render());
        window.addEventListener("resize", function () {
        engine.resize();
        });
    });
  }

  function onFeedDryClicked(user, foodType, header){
    const feed = functions.httpsCallable('eat');
    
    feed({email: user.email, catName: user.cat.name, type: foodType})
    .then(res => {
        //alert(res.data);
    });
    user.cat.dryFood -= 1;
    user.cat.feedDryCount += 1;
    user.cat.hunger += 1;
    header.text = `Hunger: ${user.cat.hunger}`;
  }
  function onBuyFoodClicked(user, foodType, header){
    const buyFood = functions.httpsCallable('buyFood');
    buyFood({email: user.email, catName: user.cat.name, type: foodType})
    .then(res => {
        //alert(res.data);
    });
    user.cat.food += 1;
    user.cat.currency -= 1;
    header.text = `Money: ${user.cat.currency}`;
  }

  function exitAR(){
    window.location.href = "index.html";
  }

  