var canvas = document.getElementById("renderCanvas"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine
var markerOn = true;

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
                        });
                    }
                }
                else{
                    alert("You are tapping after cat is set up");
                }
                break;      
            case BABYLON.PointerEventTypes.POINTERDOWN:
                break;
            case BABYLON.PointerEventTypes.POINTERUP:
                break;
            case BABYLON.PointerEventTypes.POINTERMOVE:
                break;
            case BABYLON.PointerEventTypes.POINTERPICK:
                break;
            case BABYLON.PointerEventTypes.POINTERDOUBLETAP:
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