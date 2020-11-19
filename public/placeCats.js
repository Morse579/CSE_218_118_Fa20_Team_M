export{initializeScene}
import{functions} from './main.js'

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

    var createScene = async function () {
        var scene = new BABYLON.Scene(engine);
        var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);
        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
        light.intensity = 0.7;

        const xr = await scene.createDefaultXRExperienceAsync({
            uiOptions: {
                sessionMode: 'immersive-ar'
            },
            optionalFeatures: true,
        });

        // Cat will be set later once hit test is performed
        var cat = null;
        var sphere = null;
        // const [hitTest, marker] = addMesh(xr, scene);

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

        // Full screen UI - display text only
        var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        var panel = new BABYLON.GUI.StackPanel();
        advancedTexture.addControl(panel);
        var header = new BABYLON.GUI.TextBlock();
        header.text = `Food level: ${user.food}`;
        header.height = "100px";
        header.color = "white";
        header.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
        header.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
        header.fontSize = "80";
        panel.addControl(header);

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
                            var meshStaticCat = BABYLON.SceneLoader.ImportMesh("", "./assets/cat/", "scene.gltf", scene, function (newMeshes, particleSystems, skeletons) {
                                cat = newMeshes[0];
                                cat.scaling = new BABYLON.Vector3(0.009, 0.009, 0.009);
                                cat.rotation = new BABYLON.Vector3(0, -Math.PI/2, 0);
                                hitTest.transformationMatrix.decompose(null, cat.rotationQuaternion, cat.position);
                                markerOn = false;

                                // Create 3 3D GUI button for testing purpose
                                hitTest.transformationMatrix.decompose(null, panel3D.rotationQuaternion, panel3D.position);
                                panel3D.position.z = cat.position.z + 5.5;
                                panel3D.blockLayout = true;
                                for (var index = 0; index < 3; index++) {
                                    // var sphere = BABYLON.Mesh.CreateSphere("sphere", 16, 0.3, scene);
                                    var button = new BABYLON.GUI.Button3D("click me");
                                    button.onPointerClickObservable.add(function () {
                                        feed(user);
                                    });
                                    var text1 = new BABYLON.GUI.TextBlock();
                                    text1.text = "meow";
                                    text1.color = "white";
                                    text1.fontSize = 24;
                                    button.content = text1; 
                                    panel3D.addControl(button);
                                }
                                panel3D.blockLayout = false;
                            });
                        }
                    }
                    else{
                        // alert("You are tapping after cat is set up");                 
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

  function feed(user){
    alert("feed!");
    const feed = functions.httpsCallable('feed');
    feed({email: user.email}).then(res => {
        console.log(res);
    });

  }