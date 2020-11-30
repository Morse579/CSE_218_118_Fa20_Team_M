function onFeedDryClicked(user, foodType, textUI){
    const feed = functions.httpsCallable('eat');
    
    feed({email: user.email, catName: user.cat.name, type: foodType})
    .then(res => {
        //alert(res.data);
    });
    user.cat.dryFood -= 1;
    user.cat.feedDryCount += 1;
    user.cat.hunger += 1;
    textUI.dry.text = `${user.cat.dryFood}`;
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