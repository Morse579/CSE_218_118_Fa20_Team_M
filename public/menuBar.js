var createScene = function () {

    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // GUI
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    var grid = new BABYLON.GUI.Grid();   
    grid.background = null; 
    grid.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    advancedTexture.addControl(grid); 

    function matrix (rows,cols,defaultValue){
        var arr = [];
        for (var i = 0;i<rows;i++){
            arr.push([]);
            arr[i].push(new Array(cols));
            for(var j=0;j<cols;j++){
            arr[i][j] = defaultValue;     
            }
        }
        return arr;
    }

  //update n_row and n_col to change dimensions of the menu bar, more row or col means smaller menu bar
  var n_row = 5;
  var n_col = 5;
  var gridWidth = 800;
  var gridHeight = 320;  
   
    grid.width = gridWidth + "px";
    grid.height = gridHeight + "px";  

  var gridCell = matrix(n_row,n_col,0);
  var gridButton = matrix(n_row,n_col,0);

  for(var i=0;i<n_row;i++){
      for(var j=0;j<n_col;j++){
      grid.addColumnDefinition(gridWidth/n_col, true);
      grid.addRowDefinition(gridHeight/n_row, true);      
      }
  }

// Add labels for each column with values, first label is not visible
  var label=[];
      label[0] = [
      "tmp",
      "Furniture1",
      "Furniture2",
      "Furniture3"
  ];

      label[1] = [
      "tmp",
      "Food1",
      "Food2",
      "Food3",
  ];

      label[2] = [
      "text02",
      /*"text12",
      "text22",
      "text32", */
  ];

      /*label[3] = [
      "text03",
      "text13",
      "text23",
      "text33" 
  ];*/

// Update for specific button with extension on the right side
var gridExtension = matrix(n_row,n_col,[]);

// Update for Button at location i = 2 and j =0
    gridExtension[2][0] = [
           "text20-1",
           "text20-2",
           "text20-3",
           "text20-4"
        ];
// Update for Button at location i = 3 and j =1
    gridExtension[3][1] = [
           "text31-1",
           "text31-2",
           "text31-3",
           "text31-4"
        ];

    for(var j=0;j<label.length;j++){
     for(var i=0;i<label[j].length;i++){    
       gridCell[i][j] = new BABYLON.GUI.Rectangle();
       gridCell[i][j].color = "black";
       gridCell[i][j].thickness = 1;
       gridCell[i][j].background = "silver";
       grid.addControl(gridCell[i][j],i,j);  
       if(i ==0){
       gridButton[i][j] = new button("Placeholder",callbackButton,label[j],i,j);} 

       else if(gridExtension[i][j].length > 0){
       gridButton[i][j] = new button("Button"+i+j,callbackButtonij,gridExtension[i][j],i,j);} 

       else{
       gridButton[i][j] = new button("Button"+i+j,function () {null},label[j],i,j);    
       }
       gridCell[i][j].addControl(gridButton[i][j].button);  
       if(i > 0){
           gridButton[i][j].button.isVisible = false;
           gridCell[i][j].isVisible = false;        
       }
     }
    }


    /*for (var k=1;k<n_row;k++){
      for (var m=0;m<n_col;m++){
       if(gridExtension[k][m].length > 0){
       var labelij = gridExtension[k][m];
       var loc_i = k;
       var loc_j = m;
       for(var i=0;i<labelij.length;i++){    
         gridCell[i+loc_i][loc_j+1] = new BABYLON.GUI.Rectangle();
         gridCell[i+loc_i][loc_j+1].color = "black";
         gridCell[i+loc_i][loc_j+1].thickness = 1;
         gridCell[i+loc_i][loc_j+1].background = "silver";
         grid.addControl(gridCell[i+loc_i][loc_j+1],i+loc_i,loc_j+1);  
         if(gridButton[i+loc_i][loc_j+1] == 0){
         gridButton[i+loc_i][loc_j+1] = new button("Button"+(i+loc_i)+(loc_j+1),function () {null},labelij,loc_i,loc_j);  
         } else {
          gridButton[i+loc_i][loc_j+1].button.children[0].text = labelij[i];
         }
         gridCell[i+loc_i][loc_j+1].addControl(gridButton[i+loc_i][loc_j+1].button);  
         gridButton[i+loc_i][loc_j+1].button.isVisible = false;
         gridCell[i+loc_i][loc_j+1].isVisible = false;        
        }
      }
      }
    } */

    function callbackButton(button,lab,loci,locj)
    {               
            if (button.toggle)
                {
                    for(var i =1;i<label[locj].length;i++){
                    gridButton[i][locj].button.children[0].text = label[locj][i];                          
                    gridButton[i][locj].button.isVisible = true;
                    gridCell[i][locj].isVisible = true; 
                    }

                }
            else if (!button.toggle)
                {
                    for(var i =1;i<label[locj].length;i++){
                    gridButton[i][locj].button.isVisible = false;
                    gridCell[i][locj].isVisible = false; 
                    }                    
                }

            button.toggle=!button.toggle;
    }

    function callbackButtonij(button,lab,loci,locj)
    {         
            if (button.toggle)
                {

                  for(var i=0;i<lab.length;i++){    
                    gridButton[i+loci][locj+1].button.children[0].text = lab[i];  
                    gridButton[i+loci][locj+1].button.isVisible = true;
                    gridCell[i+loci][locj+1].isVisible = true;        
                  }
                }
            else if (!button.toggle)
                {
                 for(var i=0;i<lab.length;i++){    
                    gridButton[i+loci][locj+1].button.isVisible = false;
                    gridCell[i+loci][locj+1].isVisible = false;        
                  }                  
                }

            button.toggle=!button.toggle;
    }

    return scene;

};


class button{
    constructor(text,callback,lab,loci,locj)
        {
            this._text=text;
            this._button = BABYLON.GUI.Button.CreateSimpleButton("button", this.text);
            this._toggle=true;
            this._button.width ="140px";
            this._button.height = "40px";
            this._button.color = "white";
            this._button.onPointerUpObservable.add(()=>
                {
                    callback(this,lab,loci,locj);         
                })
        }
        get text() {return this._text}
        set text(status){this.text=status}
        get toggle(){return this._toggle}
        set toggle(value){this._toggle=value}
        get button(){return this._button}
        set buttonColor(color){this._button.background=color}
    }
