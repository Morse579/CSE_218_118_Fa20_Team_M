export { musicTask, feedWetTask }
import { sendCansUpdate, sendFishUpdate } from './sync.js'

// music task
var rewardMusicIsPlaying = false;
var musicTaskRewarded = false;

// feed wet task
var wetCountForReward = 2;  // need to feed such amount of wet food for a special food reward
var feedWetCount = 0;

function musicTask(scene, musicToPlay, cans, canPosX, canPosZ, musicTaskButton, clubroom) {
    var text1 = new BABYLON.GUI.TextBlock();
    text1.color = "orange";
    text1.fontSize = 50;

    if (rewardMusicIsPlaying) {
        musicToPlay.stop();
        musicTaskRewarded = true;
        text1.text = "Ads\nFor Reward";
        musicTaskButton.content = text1;
        rewardMusicIsPlaying = false;
        return;
    }
    else {
        musicToPlay.play();
        musicTaskRewarded = false;
        rewardMusicIsPlaying = true;
        text1.text = "Stop Ads\nNo Reward";
        musicTaskButton.content = text1;

        musicToPlay.onEndedObservable.addOnce(() => {
            if (!musicTaskRewarded) {
                rewardMusicIsPlaying = false;
                text1.text = "Ads\nFor Reward";
                musicTaskButton.content = text1;
                // console.log("finished listening to the reward music!");
                clubroom.canCount += 1;
                clubroom.cansAvailable -= 1;
                sendCansUpdate(clubroom.canCount);
                BABYLON.SceneLoader.ImportMesh("", "../assets/food/capurrrcino/", "scene.gltf", scene, function (newMeshes, particleSystems, skeletons) {
                    // console.log("musicTask reward loaded");
                    var can = newMeshes[0];
                    cans.push(can);
                    can.position.x = canPosX;
                    if (!clubroom.prevCanPosY) {
                        can.position.y = clubroom.roomPosY + 0.15;
                    }
                    else {
                        can.position.y = clubroom.prevCanPosY + 0.2;
                    }
                    can.position.z = canPosZ;
                    can.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
                    clubroom.prevCanPosY = can.position.y;
                });
                musicTaskRewarded = true;
            }
        });
    }
}

function feedWetTask(fishPosX, allFish, fishPosZ, clubroom) {
    feedWetCount += 1;
    console.log("feedWetCount incremented :: ", feedWetCount);

    if (feedWetCount === wetCountForReward) {
        feedWetCount = 0;
        clubroom.lastOwnedFishIndex += 1;
        clubroom.fishAvailable -=1;
        sendFishUpdate(clubroom.lastOwnedFishIndex+1, clubroom.fishAvailable);
        var fish = allFish[clubroom.lastOwnedFishIndex];
        fish.position.y = clubroom.roomPosY + 0.3;
        fish.position.z = fishPosZ;
        if (!clubroom.prevFishPosX) {
            fish.position.x = fishPosX;
        }
        else {
            fish.position.x = clubroom.prevFishPosX - 1.5;
        }
        fish.scaling = new BABYLON.Vector3(40, 40, 40);
        fish.rotation = new BABYLON.Vector3(0, 0, -Math.PI/2);
        fish.setEnabled(true);
        clubroom.prevFishPosX = fish.position.x;
    }
}
