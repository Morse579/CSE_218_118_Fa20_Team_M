import { functions } from './main.js'
export { display3DFoodButtons }

const FOOD_HUNGER = {
    dry: 1,
    wet: 2,
    special: 5
};

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
        var wetFoodMesh = BABYLON.SceneLoader.ImportMesh("", "../assets/food/capurrrcino/", "scene.gltf", scene, function (mesh, particleSystems, skeletons) {
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
        var specialFoodMesh = BABYLON.SceneLoader.ImportMesh("", "../assets/food/sardine/", "scene.gltf", scene, function (mesh, particleSystems, skeletons) {
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