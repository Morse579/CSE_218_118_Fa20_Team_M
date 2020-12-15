export { displayTaskBoard, updateTaskBoard }

function displayTaskBoard(t1_count,t2_count,t3_count){
    
    // GUI
    //Game tasks plane
    var plane = BABYLON.MeshBuilder.CreatePlane("plane", {size:10,sideOrientation: BABYLON.Mesh.DOUBLESIDE});
    plane.position.y = 2;
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);

    //BACKGROUND COLOR
    var background_c = "#ACC7DB";
    var text_c = "#B8860B";
    let itemTextFont = "Comic Sans MS";

    //board for all
    var board = new BABYLON.GUI.Grid(); 
    advancedTexture.addControl(board);
    //board.isVisible = false;
    board.widthInPixels = 900;
    board.heightInPixels = 640;
    board.background = background_c;
    board.addRowDefinition(1/5);
    board.addRowDefinition(2/5);
    board.addRowDefinition(1/5);
    board.addRowDefinition(2.5/5);

    //title
    var title = new BABYLON.GUI.TextBlock();
    title.text = "Task Board";
    title.fontFamily = itemTextFont;
    title.heightInPixels = 120;
    title.color = text_c;
    title.fontSize = 65;
    board.addControl(title, 0, 0);
    
    //normal tasks
    var ntasks = new BABYLON.GUI.Grid(); 
    ntasks.background = background_c;
    ntasks.addColumnDefinition(2/3);
    ntasks.addColumnDefinition(1/3);
    ntasks.addRowDefinition(1/2);
    ntasks.addRowDefinition(1/2);
    board.addControl(ntasks, 1, 0);

    //Music Task
    var task1Text = format_tasks(ntasks,0,"an ads for a can","cans available for today: ",
    true,"../assets/icon/wet_food.png","x1",t1_count);
    //Feed Wet Task
    var task2Text = format_tasks(ntasks,1,"feed two cans for a fish","fish available for today: ",
    true,"../assets/icon/feed.png","x1",t2_count);

    //divider
    var divider = new BABYLON.GUI.Image("divider","../assets/icon/divider.png");
    divider.widthInPixels = 900;
    divider.heightInPixels = 85;
    divider.paddingRightInPixels = 10;
    board.addControl(divider,2,0);

    //special tasks
    var stasks = new BABYLON.GUI.Grid(); 
    stasks.background = background_c;
    stasks.addColumnDefinition(2/3);
    stasks.addColumnDefinition(1/3);
    stasks.addRowDefinition(1/2);
    stasks.addRowDefinition(1/2);
    board.addControl(stasks, 3, 0);
    var image_st;
    var r_d = "x1"
    //Feed Special Task images
    if(t3_count < 3){
        image_st = "../assets/icon/gift.png"
    }
    else{
        image_st = "../assets/icon/gift.png"
        r_d = "x0"
    }
    var items = format_tasks(stasks,0,"feed fish for decorations","",false,image_st,r_d,t3_count);
    var task3Text = items[0];
    var barGrid = items[1];
    
    plane.setEnabled(false);
    plane.displayed = false;

    var boardItems = [plane, task1Text, task2Text, task3Text, barGrid];
    return boardItems;
}

function format_tasks(grid_d,p,text_d,count_d,count,reward_icon,reward_d,pg){
    //Task
    var task1 = new BABYLON.GUI.Grid();
    task1.addRowDefinition(1);
    task1.addRowDefinition(1);
    grid_d.addControl(task1, p, 0);
    //Task text
    var task1Text = new BABYLON.GUI.TextBlock();
    task1Text.text = text_d;
    //task1Text.heightInPixels = 120;
    task1Text.paddingTopInPixels = 5;
    task1Text.color = "#B8860B";
    task1Text.fontSize = 40;
    task1Text.fontFamily = "Copperplate";
    task1.addControl(task1Text, 0, 0); 

    var text = {};
    //Task process categories
    if(count){
        text = count_display(task1,pg,count_d);
    }
    else{
        text = bar_display(task1,pg);
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

    return text;
}


function count_display(grid_d,pg,count_d){ 
    //Task count
    var task1Progress = new BABYLON.GUI.TextBlock();
    task1Progress.text = count_d+pg.toString();
    task1Progress.heightInPixels = 120;
    task1Progress.color = "#483D8B";
    task1Progress.fontSize = 30;
    task1Progress.fontFamily = "Copperplate";
    grid_d.addControl(task1Progress, 1, 0);

    return task1Progress;
}

function bar_display(grid_d,pg){
    //Task bar
    var task1Bar= new BABYLON.GUI.Rectangle();
    task1Bar.width = 0.6;
    task1Bar.height = 0.7;
    task1Bar.cornerRadius = 100;
    task1Bar.color = "#F5DEB3";
    task1Bar.thickness = 4;
    task1Bar.background = "#3CB371";
    task1Bar.horizontalAlignment = "left";
    task1Bar.left = 120;
    grid_d.addControl(task1Bar, 1, 0);
    //text initialize
    var p_text; 
    if(pg>=3){
        //process bar
        var task2Bar= new BABYLON.GUI.Rectangle();
        task2Bar.width = 0.6;
        task2Bar.height = 0.7;
        task2Bar.cornerRadius = 100;
        task2Bar.color = "#F5DEB3";
        task2Bar.thickness = 4;
        task2Bar.background = "#CD5C5C";
        grid_d.addControl(task2Bar, 1, 0);
        task2Bar.horizontalAlignment = "left";
        task2Bar.left = 120;
        //process text
        p_text = "DONE!"
    }
    else{
        //process bar     
        var task2Bar= new BABYLON.GUI.Rectangle();
        task2Bar.width = 0.6*(pg/3);
        task2Bar.height = 0.55;
        task2Bar.cornerRadius = 100;
        task2Bar.color = "#F5DEB3";
        task2Bar.thickness = 0;
        task2Bar.background = "#CD5C5C";
        task2Bar.left = 122;
        task2Bar.horizontalAlignment = "left";
        grid_d.addControl(task2Bar, 1, 0);
        //text 
        p_text = pg.toString()+"/3";
    }
    //text on the bar    
    var task1Progress = new BABYLON.GUI.TextBlock();
    task1Progress.text = p_text;
    task1Progress.heightInPixels = 120;
    task1Progress.color = "#483D8B";
    task1Progress.fontSize = 30;
    task1Progress.fontFamily = "Copperplate";
    grid_d.addControl(task1Progress, 1, 0);

    var items = [task1Progress, grid_d];

    return items;
}

function updateTaskBoard(taskBoard, cansAvailable, fishAvailable, feedSpecialCount){
    console.log("update", cansAvailable, fishAvailable, feedSpecialCount);
    var task1Text = taskBoard[1];
    var task2Text = taskBoard[2];
    var grid = taskBoard[4];
    task1Text.text = `cans available for today: ${cansAvailable}`;
    task2Text.text = `fish available for today: ${fishAvailable}`;
    bar_display(grid, feedSpecialCount);
}