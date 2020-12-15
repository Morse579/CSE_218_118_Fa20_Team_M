export{ addBars }

function addBars(user, catPos, mats){
    var bars = {};
    bars.hungerBar = [];
  for(var i=0;i<100;i++){
      bars.hungerBar[i] = BABYLON.MeshBuilder.CreateBox("box", {height: 0.1, width: 0.01, depth: 0.1});
      bars.hungerBar[i].position.z = catPos.z + 2;
      bars.hungerBar[i].position.y = catPos.y + 0.3;
      bars.hungerBar[i].position.x = catPos.x - 0.5 + i*0.01;
      var hungerValue = user.cat.hunger;
      hungerValue = Math.max(0, hungerValue);
      hungerValue = Math.min(100, hungerValue);
      if(i<hungerValue){
          bars.hungerBar[i].material = mats.red;	
      }
  }
  bars.moodBar = [];
  for(var i=0;i<100;i++){
      bars.moodBar[i] = BABYLON.MeshBuilder.CreateBox("box", {height: 0.1, width: 0.01, depth: 0.1});
      bars.moodBar[i].position.z = catPos.z + 2;
      bars.moodBar[i].position.y = catPos.y + 0.15;
      bars.moodBar[i].position.x = catPos.x - 0.5 + i*0.01;
      var moodValue = user.cat.mood;
      moodValue = Math.max(0, moodValue);
      moodValue = Math.min(100, moodValue);
      if(i<moodValue){
          bars.moodBar[i].material = mats.orange;	
      }
  }
  return bars;
}