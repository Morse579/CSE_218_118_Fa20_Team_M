import { functions } from './main.js'
export { display3DToyButtons }

const TOY_MOOD = {
    yarn: 3,
    mouse: 5,
    stuffed_dog: 7,
    stuffed_elephant: 11
};

function display3DToyButtons(panel, user, textUI, scene, cat, bars, mats){
    panel.position.z = cat.position.z - 0.15;
    panel.node.rotation = new BABYLON.Vector3(Math.PI/6, 0, 0);

    panel.blockLayout = true;

    var mouseButton = new BABYLON.GUI.Button3D("mouseButton");
    mouseButton.onPointerUpObservable.add(function(){
        hideToyButtons();
        var mouseMesh = BABYLON.SceneLoader.ImportMesh("", "../assets/toy/mouse/", "scene.gltf", scene, function (mesh) {
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
        var yarnMesh = BABYLON.SceneLoader.ImportMesh("", "../assets/toy/yarn/", "yarn.obj", scene, function (mesh) {
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
        var dogMesh = BABYLON.SceneLoader.ImportMesh("", "../assets/toy/stuffed2/", "scene.gltf", scene, function (mesh) {
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
        var elephantMesh = BABYLON.SceneLoader.ImportMesh("", "../assets/toy/stuffed1/", "scene.gltf", scene, function (mesh) {
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