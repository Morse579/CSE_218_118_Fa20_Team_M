export{onFeedClicked}

const FOOD_HUNGER = {
  dry: 1,
  wet: 2,
  special: 5
};

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
        for(var i=0;i<FOOD_HUNGER.dry;i++){
          bars.hungerBar[user.cat.hunger-FOOD_HUNGER.dry+i].material = mats.red;
        }
        break;
      case "wet":
        user.cat.wetFood -= 1;
        user.cat.hunger += FOOD_HUNGER.wet;
        textUI.wet.text = `${user.cat.wetFood}`;
        for(var i=0;i<FOOD_HUNGER.wet;i++){
          bars.hungerBar[user.cat.hunger-FOOD_HUNGER.wet+i].material = mats.red;
        }
        break;
      case "special":
        user.cat.specialFood -= 1;
        user.cat.hunger += FOOD_HUNGER.special;
        textUI.special.text = `${user.cat.specialFood}`;
        for(var i=0;i<FOOD_HUNGER.special;i++){
          bars.hungerBar[user.cat.hunger-FOOD_HUNGER.special+i].material = mats.red;
        }
        break;
    }

  }
  function onBuyFoodClicked(user, foodType, textUI){
    const buyFood = functions.httpsCallable('buyFood');
    buyFood({email: user.email, catName: user.cat.name, type: foodType})
    .then(res => {
        //alert(res.data);
    });
    user.cat.dryFood += 1;
    user.cat.currency -= 1;
    textUI.dry.text = `${user.cat.dryFood}`;
    textUI.coin.text = `${user.cat.currency}`;
  }