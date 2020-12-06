export {displayBoard}

const size = 1;

function displayBoard(){
    // GUI
    // GUI
    var plane = BABYLON.Mesh.CreatePlane("plane", 10);
    plane.position.y = 2;

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);

    var board = new BABYLON.GUI.Grid(); 
    advancedTexture.addControl(board);
    board.widthInPixels = 900;
    board.heightInPixels = 510;
    board.background = "#6B899E";
    board.addColumnDefinition(2/3);
    board.addColumnDefinition(1/3);
    board.addRowDefinition(1/3);
    board.addRowDefinition(1/3);
    board.addRowDefinition(1/3);

    var task1 = new BABYLON.GUI.Grid();
    task1.addRowDefinition(1);
    task1.addRowDefinition(1);
    board.addControl(task1, 0, 0);

    var task1Text = new BABYLON.GUI.TextBlock();
    task1Text.text = "Change Background Music";
    task1Text.heightInPixels = 120;
    task1Text.color = "#E5A33F";
    task1Text.fontSize = 40;
    task1.addControl(task1Text, 0, 0); 

    var task1Bar= new BABYLON.GUI.Rectangle();
    task1Bar.width = 0.8;
    task1Bar.height = 0.5;
    task1Bar.cornerRadius = 100;
    task1Bar.color = "Orange";
    task1Bar.thickness = 4;
    task1Bar.background = "green";
    task1.addControl(task1Bar, 1, 0); 

    var task1Progress = new BABYLON.GUI.TextBlock();
    task1Progress.text = "1/1";
    task1Progress.heightInPixels = 120;
    task1Progress.color = "black";
    task1Progress.fontSize = 40;
    task1.addControl(task1Progress, 1, 0); 

    var reward1 = new BABYLON.GUI.Grid();
    reward1.addColumnDefinition(1/2);
    reward1.addColumnDefinition(1/2);
    board.addControl(reward1, 0, 1);

    var reward1Icon = new BABYLON.GUI.Image("coin", "assets/icon/coin.png");
    reward1Icon.widthInPixels = 120;
    reward1Icon.heightInPixels = 120;
    reward1Icon.paddingRightInPixels = 10;
    reward1.addControl(reward1Icon, 0,0);

    var reward1Num = new BABYLON.GUI.TextBlock();
    reward1Num.text = "x20";
    reward1Num.heightInPixels = 120;
    reward1Num.color = "black";
    reward1Num.fontSize = 40;
    reward1.addControl(reward1Num, 0, 1); 
    
    
}