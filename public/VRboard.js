export {displayBoard}

const size = 1;

function displayBoard(t1_count,t2_count,t3_count){
    // GUI
    // GUI
    //Game tasks plane
    var plane = BABYLON.MeshBuilder.CreatePlane("plane", {size:10,sideOrientation: BABYLON.Mesh.DOUBLESIDE});
    plane.position.y = 2;
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);

    //board for all
    var board = new BABYLON.GUI.Grid(); 
    advancedTexture.addControl(board);
    board.widthInPixels = 900;
    board.heightInPixels = 520;
    board.background = "#6B899E";
    board.addRowDefinition(1/5);
    board.addRowDefinition(2/5);
    board.addRowDefinition(1/5);
    board.addRowDefinition(2.5/5);

    //title
    var title = new BABYLON.GUI.TextBlock();
    title.text = "TASKS";
    title.heightInPixels = 120;
    title.color = "#E5A33F";
    title.fontSize = 80;
    board.addControl(title, 0, 0);
    
    //normal tasks
    var ntasks = new BABYLON.GUI.Grid(); 
    ntasks.background = "#6B899E";
    ntasks.addColumnDefinition(2/3);
    ntasks.addColumnDefinition(1/3);
    ntasks.addRowDefinition(1/2);
    ntasks.addRowDefinition(1/2);
    board.addControl(ntasks, 1, 0);

    //Music Task
    format_tasks(ntasks,0,"Music Task",true,"./assets/icon/wet_food.png","x1",t1_count);
    //Feed Wet Task
    format_tasks(ntasks,1,"Feed Wet Task",true,"./assets/icon/feed.png","x1",t2_count);

    //divider
    var divider = new BABYLON.GUI.Image("divider","./assets/icon/divider.png");
    divider.widthInPixels = 900;
    divider.heightInPixels = 85;
    divider.paddingRightInPixels = 10;
    board.addControl(divider,2,0);

    //special tasks
    var stasks = new BABYLON.GUI.Grid(); 
    stasks.background = "#6B899E";
    stasks.addColumnDefinition(2/3);
    stasks.addColumnDefinition(1/3);
    stasks.addRowDefinition(1/2);
    stasks.addRowDefinition(1/2);
    board.addControl(stasks, 3, 0);
    var image_st;
    var r_d = "x1"
    //Feed Special Task images
    if(t3_count==0){
        image_st = "./assets/icon/package.png"
    }
    else if(t3_count==1){
        image_st = "./assets/icon/elephant.png"
    }
    else if(t3_count==2){
        image_st = "./assets/icon/decorate.png"
    }
    else{
        image_st = "./assets/icon/gift.png"
        r_d = "x0"
    }
    format_tasks(stasks,0,"Feed Special Task",false,image_st,r_d,t3_count);
    
}

function format_tasks(grid_d,p,text_d,count,reward_icon,reward_d,pg){
    //Task
    var task1 = new BABYLON.GUI.Grid();
    task1.addRowDefinition(1);
    task1.addRowDefinition(1);
    grid_d.addControl(task1, p, 0);
    //Task text
    var task1Text = new BABYLON.GUI.TextBlock();
    task1Text.text = text_d;
    task1Text.heightInPixels = 120;
    task1Text.paddingTopInPixels = 15;
    task1Text.color = "#E5A33F";
    task1Text.fontSize = 35;
    task1.addControl(task1Text, 0, 0); 
    //Task process categories
    if(count){
        count_display(task1,pg);
    }
    else{
        bar_display(task1,pg);
    }
    //reward
    var reward1 = new BABYLON.GUI.Grid();
    reward1.addColumnDefinition(1/2);
    reward1.addColumnDefinition(1/2);
    grid_d.addControl(reward1, p, 1);
    //reward image
    var reward1Icon = new BABYLON.GUI.Image("", reward_icon);
    reward1Icon.paddingTopInPixels = 10;
    reward1Icon.paddingBottomInPixels = 10;
    reward1Icon.paddingRightInPixels = 10;
    reward1.addControl(reward1Icon, 0,0);
    //reward text
    var reward1Num = new BABYLON.GUI.TextBlock();
    reward1Num.text = reward_d;
    reward1Num.heightInPixels = 120;
    reward1Num.color = "black";
    reward1Num.fontSize = 40;
    reward1.addControl(reward1Num, 0, 1);
}


function count_display(grid_d,pg){ 
    //Task count
    var task1Progress = new BABYLON.GUI.TextBlock();
    task1Progress.text = "Count: "+pg.toString();
    task1Progress.heightInPixels = 120;
    task1Progress.color = "black";
    task1Progress.fontSize = 30;
    grid_d.addControl(task1Progress, 1, 0);
}

function bar_display(grid_d,pg){
    //Task bar
    var task1Bar= new BABYLON.GUI.Rectangle();
    task1Bar.width = 0.8;
    task1Bar.height = 0.5;
    task1Bar.cornerRadius = 100;
    task1Bar.color = "Orange";
    task1Bar.thickness = 4;
    task1Bar.background = "green";
    task1Bar.horizontalAlignment = "left";
    task1Bar.left = 50;
    grid_d.addControl(task1Bar, 1, 0);
    //text initialize
    var p_text; 
    if(pg>=3){
        //process bar
        var task2Bar= new BABYLON.GUI.Rectangle();
        task2Bar.width = 0.8;
        task2Bar.height = 0.5;
        task2Bar.cornerRadius = 100;
        task2Bar.color = "Orange";
        task2Bar.thickness = 4;
        task2Bar.background = "red";
        grid_d.addControl(task2Bar, 1, 0);
        task2Bar.horizontalAlignment = "left";
        task2Bar.left = 50;
        //process text
        p_text = "DONE!"
    }
    else{
        //process bar     
        var task2Bar= new BABYLON.GUI.Rectangle();
        task2Bar.width = 0.8*(pg/3);
        task2Bar.height = 0.35;
        task2Bar.cornerRadius = 100;
        task2Bar.color = "Orange";
        task2Bar.thickness = 0;
        task2Bar.background = "red";
        task2Bar.left = 52;
        task2Bar.horizontalAlignment = "left";
        grid_d.addControl(task2Bar, 1, 0);
        //text 
        p_text = pg.toString()+"/3";
    }
    //text on the bar    
    var task1Progress = new BABYLON.GUI.TextBlock();
    task1Progress.text = p_text;
    task1Progress.heightInPixels = 120;
    task1Progress.color = "black";
    task1Progress.fontSize = 30;
    grid_d.addControl(task1Progress, 1, 0);
}