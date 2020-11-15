var canvas = document.getElementById("renderCanvas"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

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

    const fm = xr.baseExperience.featuresManager;

    const xrTest = fm.enableFeature(BABYLON.WebXRHitTest, "latest");

    const marker = BABYLON.MeshBuilder.CreateTorus('marker', { diameter: 0.15, thickness: 0.03 });
    var markerMaterial = new BABYLON.StandardMaterial(scene);
    markerMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    markerMaterial.specularColor = new BABYLON.Color3(0.4, 0.4, 0.4);
    markerMaterial.emissiveColor = BABYLON.Color3.Black();
    marker.isVisible = false;
    marker.rotationQuaternion = new BABYLON.Quaternion();

    var hitTest;
    xrTest.onHitTestResultObservable.add((results) => {
        if (results.length) {
            marker.isVisible = true;
            hitTest = results[0];
            hitTest.transformationMatrix.decompose(marker.scaling, marker.rotationQuaternion, marker.position);
        } else {
            marker.isVisible = false;
        }
    });

  // Placeholder for cat
  /*
  var cat = BABYLON.MeshBuilder.CreateBox("cat", {size:0.1}, scene);
  var material = new BABYLON.StandardMaterial(scene);
  material.alpha = 1;
  material.diffuseColor = new BABYLON.Color3(1.0, 0.0, 0.7);
  cat.material = material;
  cat.rotationQuaternion = new BABYLON.Quaternion();
  cat.isVisible = false;
  */

  /*
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
      if (startingPoint) { // we need to disconnect camera from canvas
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
*/

/*
  mesh.actionManager = new BABYLON.ActionManager(scene);
  mesh.actionManager.registerAction(
    new BABYLON.InterpolateValueAction(
        BABYLON.ActionManager.OnPickTrigger,
        light,
        'diffuse',
        BABYLON.Color3.Black(),
        1000
    )
);
*/

    

  scene.onPointerObservable.add((pointerInfo) => {
    switch (pointerInfo.type) {
        case BABYLON.PointerEventTypes.POINTERTAP:
            if(marker.isVisible){
                var meshStaticCat = BABYLON.SceneLoader.ImportMesh("", "./assets/cat/", "scene.gltf", scene, function (newMeshes, particleSystems, skeletons) {
                    var cat = newMeshes[0];
                    cat.scaling = new BABYLON.Vector3(0.009, 0.009, 0.009);
                    cat.rotation = new BABYLON.Vector3(0, -Math.PI/2, 0);
                    hitTest.transformationMatrix.decompose(null, cat.rotationQuaternion, cat.position);
                });
            }
            break;      
        case BABYLON.PointerEventTypes.POINTERDOWN:
          /*
            if(pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh != ground) {
                pointerDown(pointerInfo.pickInfo.pickedMesh)
            }
          */
            break;
        case BABYLON.PointerEventTypes.POINTERUP:
            //pointerUp();
            break;
        case BABYLON.PointerEventTypes.POINTERMOVE:
            //pointerMove();
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