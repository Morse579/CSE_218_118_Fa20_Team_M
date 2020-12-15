export { displayShop }
import { functions } from './main.js'

function displayShop(advancedTexture, user, textUI, coinText){
    // SHOP UI START
    // shop constants
    let subBackgroundColor = "#ACC7DB";
    let butBackgroundColor = "#EB4D4B";
    let shopItemHeight = 220;
    let shopItemPaddingH = 60;
    let itemTextColor = "#2A3741";
    let itemTextFont = "Comic Sans MS";
    let itemTextFontSize = 60;
    let price_size = 120;
    let foodItemCount = 3;
    let toyItemCount = 4;
    let decorItemCount = 2;

    // Create shopGrid
    var shopGrid = new BABYLON.GUI.Grid();   
    shopGrid.background = "#6B899E";
    shopGrid.widthInPixels = 1080;
    shopGrid.heightInPixels= 2800;//test
    let shopItemWidth = shopGrid.widthInPixels - 60*2;
    advancedTexture.addControl(shopGrid); 

    var shopGrid_rows = [210, 170, shopItemHeight*foodItemCount, 170, shopItemHeight*toyItemCount, 170, shopItemHeight*decorItemCount];
    for(var i=0; i<shopGrid_rows.length; i++){
        shopGrid.addRowDefinition(shopGrid_rows[i], true);
    }

    // exit button
    var exitShopButton = BABYLON.GUI.Button.CreateImageOnlyButton("but", "../assets/icon/exit.png");
    exitShopButton.widthInPixels = 180;
    exitShopButton.heightInPixels = 180;
    exitShopButton.cornerRadius = 30;
    exitShopButton.thickness = 0;
    exitShopButton.paddingTopInPixels = 30;
    exitShopButton.paddingLeftInPixels = 30;
    exitShopButton.onPointerClickObservable.add(function(){
        console.log("exit");
        advancedTexture.removeControl(sv);
        advancedTexture.removeControl(shopGrid); 
    });

    // coin icon and text
    var coinShopIcon = new BABYLON.GUI.Image("coin", "../assets/icon/coin.png");
    coinShopIcon.widthInPixels = 120;
    coinShopIcon.heightInPixels = 120;
    coinShopIcon.paddingRightInPixels = 10;

    var coinShopText = new BABYLON.GUI.TextBlock();
    coinShopText.text = `${user.cat.currency}`;
    coinShopText.heightInPixels = 120;
    coinShopText.color = "#E5A33F";
    coinShopText.fontSize = 60;
    coinShopText.paddingRightInPixels = 30;

    // top bar label
    var grid_topShopBar = new BABYLON.GUI.Grid();  
    grid_topShopBar.addRowDefinition(1);
    grid_topShopBar.addColumnDefinition(exitShopButton.widthInPixels, true);
    let remaining = shopGrid.widthInPixels - exitShopButton.widthInPixels - coinShopIcon.widthInPixels - 150;
    grid_topShopBar.addColumnDefinition(remaining, true);
    grid_topShopBar.addColumnDefinition(coinShopIcon.heightInPixels, true);
    grid_topShopBar.addColumnDefinition(150, true);

    grid_topShopBar.addControl(exitShopButton, 0, 0); 
    grid_topShopBar.addControl(coinShopIcon, 0, 2);
    grid_topShopBar.addControl(coinShopText, 0, 3);

    // add grid_topShopBar to shopGrid
    shopGrid.addControl(grid_topShopBar, 0, 0); 

    // food text
    var text_food = new BABYLON.GUI.TextBlock();
    text_food.text = "FOOD";
    text_food.color = itemTextColor;
    text_food.fontSize = 80;
    text_food.fontFamily = itemTextFont;

    var grid_foodText = new BABYLON.GUI.Grid(); 
    grid_foodText.paddingTopInPixels = 30;
    grid_foodText.paddingRightInPixels = shopItemPaddingH;
    grid_foodText.paddingLeftInPixels = shopItemPaddingH;
    grid_foodText.background = subBackgroundColor;
    grid_foodText.addRowDefinition(1);
    grid_foodText.addControl(text_food, 0, 0); 

    // add grid_foodText to shopGrid
    shopGrid.addControl(grid_foodText, 1, 0); 

    // foodInfo
    var grid_foodInfo = new BABYLON.GUI.Grid(); 
    grid_foodInfo.addColumnDefinition(180, true);
    grid_foodInfo.addColumnDefinition(shopItemWidth - 180 - 180)
    grid_foodInfo.addRowDefinition(shopItemHeight, true);
    grid_foodInfo.addRowDefinition(shopItemHeight, true);
    grid_foodInfo.addRowDefinition(shopItemHeight, true);
    
    //food images
    var Image_food = ["../assets/icon/dry_food.png", "../assets/icon/wet_food.png", "../assets/icon/salmon.png"];
    for(var i=0; i<Image_food.length; i++){
        var each_Image_food = new BABYLON.GUI.Image("image", Image_food[i]);
        grid_foodInfo.addControl(each_Image_food, i, 0);  
    }
    //food names
    var text_foodName = ["dry food", "wet food", "sardine"];
    for(var i=0; i<text_foodName.length; i++){
        var each_text_foodName = new BABYLON.GUI.TextBlock();
        each_text_foodName.text = text_foodName[i];
        each_text_foodName.color = itemTextColor;
        each_text_foodName.fontSize = itemTextFontSize;
        grid_foodInfo.addControl(each_text_foodName, i, 1);
    }

    // foodBuy
    var grid_foodBuy = new BABYLON.GUI.Grid();
    grid_foodBuy.addRowDefinition(shopItemHeight, true);
    grid_foodBuy.addRowDefinition(shopItemHeight, true);
    grid_foodBuy.addRowDefinition(shopItemHeight, true);
    //food buttons
    var button_buyDryFood = BABYLON.GUI.Button.CreateImageButton("but", "1","../assets/icon/coin.png");
    var button_buyWetFood = BABYLON.GUI.Button.CreateImageButton("but", "2","../assets/icon/coin.png");
    var button_buySpecFood = BABYLON.GUI.Button.CreateImageButton("but", "5","../assets/icon/coin.png");
    grid_foodBuy.addControl(button_buyDryFood, 0, 0);
    grid_foodBuy.addControl(button_buyWetFood, 1, 0);
    grid_foodBuy.addControl(button_buySpecFood, 2, 0);

    button_buyDryFood.onPointerClickObservable.add(function () {
        user.cat.dryFood += 1;
        user.cat.currency -= 1;
        updateTexts();
        updateDbFood("dry");
    });
    button_buyWetFood.onPointerClickObservable.add(function () {
        user.cat.wetFood += 1;
        user.cat.currency -= 2;
        updateTexts();
        updateDbFood("wet");
    });
    button_buySpecFood.onPointerClickObservable.add(function () {
        user.cat.specialFood += 1;
        user.cat.currency -= 5;
        updateTexts();
        updateDbFood("special");
    });

    function updateTexts(){
        textUI.dry.text = `${user.cat.dryFood}`;
        textUI.wet.text = `${user.cat.wetFood}`;
        textUI.special.text = `${user.cat.specialFood}`;
        coinText.text = `${user.cat.currency}`;
        coinShopText.text = `${user.cat.currency}`;
    }
    function updateDbFood(foodType){
        const buyFood = functions.httpsCallable('buyFood');
        buyFood({email: user.email, catName: user.cat.name, type: foodType})
        .then(res => { });
    }
    
    // grid food
    var grid_food = new BABYLON.GUI.Grid();
    grid_food.addColumnDefinition(shopItemWidth - 180);
    grid_food.addColumnDefinition(180);
    grid_food.addControl(grid_foodInfo, 0, 0);
    grid_food.addControl(grid_foodBuy, 0, 1);
    grid_food.paddingLeftInPixels = shopItemPaddingH;
    grid_food.paddingRightInPixels = shopItemPaddingH;

    // add grid_food to shopGrid
    shopGrid.addControl(grid_food, 2, 0); 
    //END OF FOOD PART

    //START: TOY PART
    // toy names in display order: ball of yarn, mouse, stuffed dog, stuffed elephant
    // toy picture names in display order: yarn.png, toy.png, dog.png, elephant.png
    // toy prices in display order: 3, 5, 7, 11
    // toy text
    var text_toy = new BABYLON.GUI.TextBlock();
    text_toy.text = "TOY";
    text_toy.color = itemTextColor;
    text_toy.fontSize = 80;
    text_toy.fontFamily = itemTextFont;

    var grid_toyText = new BABYLON.GUI.Grid(); 
    grid_toyText.paddingTopInPixels = 30;
    grid_toyText.paddingRightInPixels = shopItemPaddingH;
    grid_toyText.paddingLeftInPixels = shopItemPaddingH;
    grid_toyText.background = subBackgroundColor;
    grid_toyText.addRowDefinition(1);
    grid_toyText.addControl(text_toy, 0, 0); 

    // add grid_toyText to shopGrid
    shopGrid.addControl(grid_toyText, 3, 0);

    // toyInfo
    var grid_toyInfo = new BABYLON.GUI.Grid(); 
    grid_toyInfo.addColumnDefinition(180, true);
    grid_toyInfo.addColumnDefinition(shopItemWidth - 180 - 180)
    grid_toyInfo.addRowDefinition(shopItemHeight, true);
    grid_toyInfo.addRowDefinition(shopItemHeight, true);
    grid_toyInfo.addRowDefinition(shopItemHeight, true);
    grid_toyInfo.addRowDefinition(shopItemHeight, true);


    //toy images import
    var Image_toy = ["../assets/icon/yarn.png", "../assets/icon/play.png", "../assets/icon/dog.png", "../assets/icon/elephant.png"];
    for(var i=0; i<Image_toy.length; i++){
        var each_Image_toy = new BABYLON.GUI.Image("image", Image_toy[i]);
        each_Image_toy.paddingBottomInPixels = 20;
        each_Image_toy.paddingTopInPixels = 20;
        grid_toyInfo.addControl(each_Image_toy, i, 0);  
    }
    //toy names text import
    var text_toyName = ["ball of yarn", "mouse", "stuffed dog", "stuffed elephant"];
    for(var i=0; i<text_toyName.length; i++){
        var each_text_toyName = new BABYLON.GUI.TextBlock();
        each_text_toyName.text = text_toyName[i];
        each_text_toyName.color = itemTextColor;
        each_text_toyName.fontSize = itemTextFontSize;
        grid_toyInfo.addControl(each_text_toyName, i, 1);
    }

    // toyBuy
    var grid_toyBuy = new BABYLON.GUI.Grid();
    grid_toyBuy.addRowDefinition(shopItemHeight, true);
    grid_toyBuy.addRowDefinition(shopItemHeight, true);
    grid_toyBuy.addRowDefinition(shopItemHeight, true);
    grid_toyBuy.addRowDefinition(shopItemHeight, true);
    //toy buttons
    var button_buyYarn = BABYLON.GUI.Button.CreateImageButton("but", "3","../assets/icon/coin.png");
    var button_buyMouse = BABYLON.GUI.Button.CreateImageButton("but", "5","../assets/icon/coin.png");
    var button_buyDog = BABYLON.GUI.Button.CreateImageButton("but", "7","../assets/icon/coin.png");
    var button_buyElephant = BABYLON.GUI.Button.CreateImageButton("but", "11","../assets/icon/coin.png");
    grid_toyBuy.addControl(button_buyYarn, 0, 0);
    grid_toyBuy.addControl(button_buyMouse, 1, 0);
    grid_toyBuy.addControl(button_buyDog, 2, 0);
    grid_toyBuy.addControl(button_buyElephant, 3, 0);

    button_buyYarn.onPointerClickObservable.add(function () {
        user.cat.yarn = true;
        user.cat.currency -= 3;
        updateTexts();
        updateDbToy("yarn");
        button_buyYarn.isVisible = false;
        var soldOutText = createSoldOutText();
        grid_toyBuy.addControl(soldOutText, 0, 0);
    });

    button_buyMouse.onPointerClickObservable.add(function () {
        user.cat.mouse = true;
        user.cat.currency -= 5;
        updateTexts();
        updateDbToy("mouse");
        button_buyMouse.isVisible = false;
        var soldOutText = createSoldOutText();
        grid_toyBuy.addControl(soldOutText, 1, 0);
    });

    button_buyDog.onPointerClickObservable.add(function () {
        user.cat.stuffed_dog = true;
        user.cat.currency -= 7;
        updateCoinTexts();
        updateDbToy("stuffed_dog");
        button_buyDog.isVisible = false;
        var soldOutText = createSoldOutText();
        grid_toyBuy.addControl(soldOutText, 2, 0);
    });

    button_buyElephant.onPointerClickObservable.add(function () {
        user.cat.stuffed_elephant = true;
        user.cat.currency -= 11;
        updateCoinTexts();
        updateDbToy("stuffed_elephant");
        button_buyElephant.isVisible = false;
        var soldOutText = createSoldOutText();
        grid_toyBuy.addControl(soldOutText, 3, 0);
    });

    function updateCoinTexts(){
        coinText.text = `${user.cat.currency}`;
        coinShopText.text = `${user.cat.currency}`;
    }
    function updateDbToy(toyType){
        const buyToy = functions.httpsCallable('buyToy');
        buyToy({email: user.email, catName: user.cat.name, type: toyType})
        .then(res => {});
    }

    if(user.cat.yarn){
        button_buyYarn.isVisible = false;
        var soldOutText = createSoldOutText();
        grid_toyBuy.addControl(soldOutText, 0, 0);
    }
    if(user.cat.mouse){
        button_buyMouse.isVisible = false;
        var soldOutText = createSoldOutText();
        grid_toyBuy.addControl(soldOutText, 1, 0);
    }
    if(user.cat.stuffed_dog){
        button_buyDog.isVisible = false;
        var soldOutText = createSoldOutText();
        grid_toyBuy.addControl(soldOutText, 2, 0);
    }
    if(user.cat.stuffed_elephant){
        button_buyElephant.isVisible = false;
        var soldOutText = createSoldOutText();
        grid_toyBuy.addControl(soldOutText, 3, 0);
    }

    function createSoldOutText(){
        var soldOutText = new BABYLON.GUI.TextBlock();
        soldOutText.text = "Sold Out";
        soldOutText.color = itemTextColor;
        soldOutText.fontSize = 40;
        soldOutText.fontFamily = itemTextFont;
        return soldOutText;
    }
    
    // grid toy
    var grid_toy = new BABYLON.GUI.Grid();
    grid_toy.addColumnDefinition(shopItemWidth - 180);
    grid_toy.addColumnDefinition(180);
    grid_toy.addControl(grid_toyInfo, 0, 0);
    grid_toy.addControl(grid_toyBuy, 0, 1);
    grid_toy.paddingLeftInPixels = shopItemPaddingH;
    grid_toy.paddingRightInPixels = shopItemPaddingH;

    // add grid_toy to shopGrid
    shopGrid.addControl(grid_toy, 4, 0);
    //END OF TOY PART

    //START: DECOR PART
    // decor names in display order: bell rope, cat tree
    // decor picture names in display order: rope.png, decoration.png
    // decor prices in display order: 17, 19
    // decor text
    var text_decor = new BABYLON.GUI.TextBlock();
    text_decor.text = "DECOR";
    text_decor.color = itemTextColor;
    text_decor.fontSize = 80;
    text_decor.fontFamily = itemTextFont;

    var grid_decorText = new BABYLON.GUI.Grid(); 
    grid_decorText.paddingTopInPixels = 30;
    grid_decorText.paddingRightInPixels = shopItemPaddingH;
    grid_decorText.paddingLeftInPixels = shopItemPaddingH;
    grid_decorText.background = subBackgroundColor;
    grid_decorText.addRowDefinition(1);
    grid_decorText.addControl(text_decor, 0, 0); 

    // add grid_decorText to shopGrid
    shopGrid.addControl(grid_decorText, 5, 0); 

    // decorInfo
    var grid_decorInfo = new BABYLON.GUI.Grid(); 
    grid_decorInfo.addColumnDefinition(180, true);
    grid_decorInfo.addColumnDefinition(shopItemWidth - 180 - 180)
    grid_decorInfo.addRowDefinition(shopItemHeight, true);
    grid_decorInfo.addRowDefinition(shopItemHeight, true);
    grid_decorInfo.addRowDefinition(shopItemHeight, true);

    //decor images 
    var Image_decor = ["../assets/icon/rope.png", "../assets/icon/decorate.png"];
    for(var i=0; i<Image_decor.length; i++){
        var each_Image_decor = new BABYLON.GUI.Image("image", Image_decor[i]);
        each_Image_decor.paddingTopInPixels = 20;
        each_Image_decor.paddingBottomInPixels = 20;
        grid_decorInfo.addControl(each_Image_decor, i, 0);  
    }
    //decor names
    var text_decorName = ["bell rope", "cat tree"];
    for(var i=0; i<text_decorName.length; i++){
        var each_text_decorName = new BABYLON.GUI.TextBlock();
        each_text_decorName.text = text_decorName[i];
        each_text_decorName.color = itemTextColor;
        each_text_decorName.fontSize = itemTextFontSize;
        //each_text_decorName.fontFamily = "Cottonwood";
        grid_decorInfo.addControl(each_text_decorName, i, 1);
    }
    // decorBuy
    var grid_decorBuy = new BABYLON.GUI.Grid();
    grid_decorBuy.addRowDefinition(shopItemHeight, true);
    grid_decorBuy.addRowDefinition(shopItemHeight, true);

    //decor buttons 
    var button_buyRope = BABYLON.GUI.Button.CreateImageButton("but", "17","../assets/icon/coin.png");
    var button_buyTree = BABYLON.GUI.Button.CreateImageButton("but", "19","../assets/icon/coin.png");
    grid_decorBuy.addControl(button_buyRope, 0, 0);
    grid_decorBuy.addControl(button_buyTree, 1, 0);

    button_buyRope.onPointerClickObservable.add(function () {
        user.cat.bell_rope += 1;
        user.cat.currency -= 17;
        updateCoinTexts();
        updateDbDecor("bell_rope");
    });
    button_buyTree.onPointerClickObservable.add(function () {
        user.cat.cat_tree += 1;
        user.cat.currency -= 19;
        updateCoinTexts();
        updateDbDecor("cat_tree");
    });

    function updateDbDecor(decorType){
        const buyDecor = functions.httpsCallable('buyDecor');
        buyDecor({email: user.email, catName: user.cat.name, type: decorType})
        .then(res => { });
    }
    

    // grid decor
    var grid_decor = new BABYLON.GUI.Grid();
    grid_decor.addColumnDefinition(shopItemWidth - 180);
    grid_decor.addColumnDefinition(180);
    grid_decor.addControl(grid_decorInfo, 0, 0);
    grid_decor.addControl(grid_decorBuy, 0, 1);
    grid_decor.paddingLeftInPixels = shopItemPaddingH;
    grid_decor.paddingRightInPixels = shopItemPaddingH;

    // add grid_decor to shopGrid
    shopGrid.addControl(grid_decor, 6, 0);
    //END OF DECOR PART

    //buttons format
    let buttonsWH = 85;//button image's width and height size
    let buttonsTB = 55;//button text's top and bottom size
    var buttons = [button_buyDryFood, button_buyWetFood, button_buySpecFood,
        button_buyYarn,button_buyMouse,button_buyDog,button_buyElephant,
        button_buyRope, button_buyTree];
    for(var i=0; i<buttons.length; i++){
        buttons[i].background = butBackgroundColor;
        buttons[i].children[1].widthInPixels = buttonsWH;
        buttons[i].children[1].heightInPixels = buttonsWH;
        buttons[i].children[1].paddingLeftInPixels = 20;
        buttons[i].children[1].horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
        buttons[i].thickness = 3;
        buttons[i].children[0].fontSize = 50;
        buttons[i].children[0].color = "white";
        buttons[i].children[0].paddingRightInPixels =0;
        buttons[i].children[0].heightInPixels = 80;
        buttons[i].children[0].widthInPixels = 100;
        buttons[i].children[0].horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
        buttons[i].children[0].paddingRightInPixels = 20;
        buttons[i].cornerRadius = 40;
        buttons[i].paddingTopInPixels = buttonsTB;
        buttons[i].paddingBottomInPixels = buttonsTB;

     }

    //Scroll viewer
    var sv = new BABYLON.GUI.ScrollViewer();
    sv.width = "1080px";
    sv.height = "2244px";
    sv.background = "orange";
    advancedTexture.addControl(sv);
    sv.addControl(shopGrid);
}