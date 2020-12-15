export { getCatColorFile, createMats }

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

function createMats(){
    var mats = {};
    mats.red = new BABYLON.StandardMaterial("mat");
    mats.red.diffuseTexture = new BABYLON.Texture("../assets/color/red.jpg");

    mats.orange = new BABYLON.StandardMaterial("mat2");
    mats.orange.diffuseTexture = new BABYLON.Texture("../assets/color/orange.jpg");

    mats.pink = new BABYLON.StandardMaterial("mat4");
    mats.pink.diffuseTexture = new BABYLON.Texture("../assets/color/pink.jpg");

    return mats;
}