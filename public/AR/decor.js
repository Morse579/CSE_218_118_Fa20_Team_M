import { functions } from './main.js'
export { display3DDecorButtons }

const DECOR_MOOD = {
    bell_rope: 17,
    cat_tree: 19
};

function display3DDecorButtons(panel, user, textUI, scene, cat, bars, mats){
    panel.position.z = cat.position.z - 0.15;
    panel.node.rotation = new BABYLON.Vector3(Math.PI/6, 0, 0);

    panel.blockLayout = true;

    var catTreeButton = new BABYLON.GUI.Button3D("catTreeButton");
    catTreeButton.onPointerUpObservable.add(function(){
        hideDecorButtons();
        var catTreeMesh = BABYLON.SceneLoader.ImportMesh("", "../assets/decor/arbre_a_chat_cat_tree/", "scene.gltf", scene, function (mesh) {
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
        var bellRopeMesh = BABYLON.SceneLoader.ImportMesh("", "../assets/decor/bell_rope/", "scene.gltf", scene, function (mesh) {
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