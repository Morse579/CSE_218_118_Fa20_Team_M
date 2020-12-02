var canvas = document.getElementById("renderCanvas"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

cat = {};

cat.dryFood = 10;
cat.wetFood = 2;
cat.specialFood = 0;

cat.mouse = true;
cat.yarn = false;
cat.stuffed_dog = false;
cat.stuffed_elephant = true;

cat.cat_tree = 1;
cat.bell_rope= 0;

cat.hunger = 50;

// Code for AR scene goes here
var createScene = async function () {
    // Set up basic scene with camera, light, sounds, etc.
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;


    var mats = {};
    mats.grey = new BABYLON.StandardMaterial("mat3");
    mats.grey.diffuseTexture = new BABYLON.Texture("assets/color/grey.jpg");

    mats.pink = new BABYLON.StandardMaterial("mat4");
    mats.pink.diffuseTexture = new BABYLON.Texture("assets/color/pink.jpg");

    const env = scene.createDefaultEnvironment();
    const xr = await scene.createDefaultXRExperienceAsync({
        floorMeshes: [env.ground]
    });

    const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 1});
    sphere.position.y = 1;

    // 3D gui - for mesh interaction
    var manager = new BABYLON.GUI.GUI3DManager(scene);
    var panel3D = new BABYLON.GUI.StackPanel3D();
    panel3D.margin = 0.2;
    manager.addControl(panel3D);
    panel3D.position.y = sphere.position.y + 3;
    add3DButtonsOnPanel(panel3D);

    var bars = addBars(cat, mats);
    var panelBottom = new BABYLON.GUI.StackPanel3D();
    manager.addControl(panelBottom);
    panelBottom.margin = 0.2;
    panelBottom.position.y = sphere.position.y;
    panelBottom.position.z = sphere.position.z - 2;
    var foodButtons = display3DFoodButtons(panelBottom, bars, mats);

    // Full screen UI - display text only
    displayActions(foodButtons, mats);
    displayTopUI();

    return scene;
}
//////////

createScene().then(scene => {
    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", function () {
    engine.resize();
    });
});
var clicks = 0;
function add3DButtonsOnPanel(panel){
    ////////////// test 3d button only /////////////////////////
    var count = new BABYLON.GUI.Button3D("count");
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "0";
    text1.color = "white";
    text1.fontSize = 80;
    count.content = text1; 
    panel.addControl(count);
    ///////////////////////////////////////
    const sphere1 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.5});
    var button1 = new BABYLON.GUI.MeshButton3D(sphere1, "pushButton");
    button1.onPointerUpObservable.add(function(){
        clicks++;
        text1.text = `${clicks}`;
        //play animations here
    });   
    panel.addControl(button1);

    const sphere2 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.5});
    var button2 = new BABYLON.GUI.MeshButton3D(sphere2, "pushButton");
    button2.onPointerUpObservable.add(function(){
        clicks++;
        text1.text = `${clicks}`;
        //play animations here
    });   
    panel.addControl(button2);
}


function addBars(cat, mats){
    var bars = {};
    bars.hungerBar = [];
  for(var i=0;i<100;i++){
      bars.hungerBar[i] = BABYLON.MeshBuilder.CreateBox("box", {height: 0.2, width: 0.02, depth: 0.2});
      bars.hungerBar[i].position.y = 5;
      bars.hungerBar[i].position.x = - 0.5 + i*0.02;
      var hungerValue = cat.hunger;
      hungerValue = Math.max(0, hungerValue);
      hungerValue = Math.min(100, hungerValue);
      if(i<hungerValue){
          bars.hungerBar[i].material = mats.pink;	
      }
  }
  
  return bars;
}

function displayActions(foodButtons, mats){
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

    var feedButton = BABYLON.GUI.Button.CreateImageOnlyButton("but", "assets/icon/feed.png");
    feedButton.onPointerClickObservable.add(function () {
        showFoodButtons(foodButtons, cat, mats);
    });
    var playButton = BABYLON.GUI.Button.CreateImageOnlyButton("but", "assets/icon/play.png");
    playButton.onPointerClickObservable.add(function () {
        showToyButtons(toyButtons, cat, mats);
    });
    var decorateButton = BABYLON.GUI.Button.CreateImageOnlyButton("but", "assets/icon/decorate.png");
    decorateButton.onPointerClickObservable.add(function () {
        showDecorButtons(decorButtons, cat, mats);
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
        foodButtons.drySphere.material = mats.pink;
    }else{
        foodButtons.drySphere.material = mats.grey;
    }
    if(cat.wetFood > 0){
        foodButtons.wetSphere.material = mats.pink;
    }else{
        foodButtons.wetSphere.material = mats.grey;
    }
    if(cat.specialFood > 0){
        foodButtons.specialSphere.material = mats.pink;
    }else{
        foodButtons.specialSphere.material = mats.grey;
    }
}

function showToyButtons(toyButtons, cat, mats){
    toyButtons.mouse.isVisible = true;
    toyButtons.yarn.isVisible = true;
    toyButtons.dog.isVisible = true;
    toyButtons.elephant.isVisible = true;

    if(cat.mouse){
        toyButtons.mouseSphere.material = mats.pink;
    }
    if(cat.yarn){
        toyButtons.yarnSphere.material = mats.pink;
    }
    if(cat.stuffed_dog){
        toyButtons.dogSphere.material = mats.pink;
    }
    if(cat.stuffed_elephant){
        toyButtons.elephantSphere.material = mats.pink;
    }
}

function showDecorButtons(decorButtons, cat, mats){
    decorButtons.catTree.isVisible = true;
    decorButtons.bellRope.isVisible = true;

    if(cat.cat_tree > 0){
        decorButtons.catTreeSphere.material = mats.pink;
    }
    if(cat.bell_rope > 0){
        decorButtons.bellRopeSphere.material = mats.pink;
    }
}

function displayTopUI(){
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
    coinText.text = `500`;
    coinText.heightInPixels = 120;
    coinText.color = "white";
    coinText.fontSize = 60;
    grid.addControl(coinText, 0, 1);

    var shopButton = BABYLON.GUI.Button.CreateImageOnlyButton("but", "assets/icon/shop.png");
    shopButton.widthInPixels = 150;
    shopButton.heightInPixels = 150;
    shopButton.cornerRadius = 30;
    shopButton.thickness = 6;
    shopButton.children[0].widthInPixels = 120;
    shopButton.children[0].heightInPixels = 120;
    shopButton.children[0].paddingLeftInPixels = 15;
    shopButton.color = "#FF7979";
    shopButton.background = "#EB4D4B";
    shopButton.onPointerUpObservable.add(function(){
        //TODO
        console.log("shopping");
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
    advancedTexture.addControl(exitButton);
}
function display3DFoodButtons(panel, bars, mats){
    console.log("display 3d food buttons");

    //sphere1 should be replaced by dry food mesh
    const sphere1 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.5});

    var dryFoodButton = new BABYLON.GUI.MeshButton3D(sphere1, "dryFoodButton");
    dryFoodButton.onPointerUpObservable.add(function(){
        dryFoodButton.isVisible = false;
        wetFoodButton.isVisible = false;
        specialFoodButton.isVisible = false;
        cat.dryFood -= 1;

        cat.hunger += 10;
        for(var i = cat.hunger-10;i<cat.hunger;i++){
            bars.hungerBar[i].material = mats.pink;
        }
    });   
    panel.addControl(dryFoodButton);
    dryFoodButton.isVisible = false;
    

    const sphere2 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.5});
    var wetFoodButton = new BABYLON.GUI.MeshButton3D(sphere2, "wetFoodButton");
    wetFoodButton.onPointerUpObservable.add(function(){
        dryFoodButton.isVisible = false;
        wetFoodButton.isVisible = false;
        specialFoodButton.isVisible = false;
        cat.wetFood -= 1;
    });   
    panel.addControl(wetFoodButton);
    wetFoodButton.isVisible = false;

    const sphere3 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.5});
    var specialFoodButton = new BABYLON.GUI.MeshButton3D(sphere3, "dryFoodButton");
    specialFoodButton.onPointerUpObservable.add(function(){
        dryFoodButton.isVisible = false;
        wetFoodButton.isVisible = false;
        specialFoodButton.isVisible = false;
        cat.specialFood -= 1;
    });   
    panel.addControl(specialFoodButton);
    specialFoodButton.isVisible = false;

    var foodButtons = {
        dry: dryFoodButton,
        wet: wetFoodButton,
        special: specialFoodButton,
        drySphere: sphere1,
        wetSphere: sphere2,
        specialSphere: sphere3
    };
    return foodButtons;
}

