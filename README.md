# AR Meow Meow
AR Meow Meow is a mobile Augmented Reality game that can let users raise virtual cats on their smartphone through feeding, playing, and completing tasks anywhere, anytime. Meow o(-w-)o

## Why the project is useful?
AR Meow Meow is a simple and adorable game for helping people relax themselves in daily life.

The problem we are trying to solve with AR Meow Meow is “the desire for more social interaction that people who may be lonely and are unable to interact with others in these trying times have, and simultaneously, the desire for cat lovers who want to keep a cat but are unable to due to whatever circumstances”.

Our goal is to make a mobile Augmented Reality game that can let users raise virtual cats on their smartphone. We want to let users play with their virtual cats such as feeding and greeting at anywhere, anytime. Meanwhile, we also want to realize and encourage interactions between different users by letting them socialize with other cat lovers using our app.  

## What the project does?
### Storyboard
We realized that some cat lovers might not be able to raise real cats at their home, and due to the special situation this year, we know many people need more social interaction. We want to take these into consideration and design an AR app to solve the problems. The app will allow users to raise virtual cats, decorate their living space, and also let them socialize with other cat lovers.
<img src="https://github.com/WeibelLab-Teaching/CSE_218_118_Fa20_Team_M/blob/main/images/storyboard.png?raw=true" width="900">

### List of Features
Users can enjoy the experience of raising virtual cats with complete storyline in AR mode, and can also collaborate with other users to play with cats together in a shared VR club room.
<img src="https://github.com/WeibelLab-Teaching/CSE_218_118_Fa20_Team_M/blob/main/images/overview.jpeg?raw=true" width="800">

#### AR Features
- **Custom storyline & multiple endings:** We designed a complete storyline with multiple possible endings for each cat. (TODO)
<img src="https://github.com/WeibelLab-Teaching/CSE_218_118_Fa20_Team_M/blob/main/images/ar_storyline.jpeg?raw=true" width="800">

- **Random generation of cat appearance, age, background:** A cat of random color, age and background will be generated in our database when users start the game. The difference of each cat might result in different stories and endings. 
- **Physical environment detection to place cats:** Our app is able to search for and detect real-world objects and surfaces though processing camera image in AR session. Therefore, users can place their cat in a "reasonable" position in the real world. 
- **Interaction including feeding, playing and decorating:** Users can feed or play with cats using various types of items, and also decorate their living space by placing different preset furnitures around.
- **Hunger and mood level system:** We designed hunger and mood levels systems which will reflect the status of the cat after each user-cat interaction, and these different levels will cause different outcomes.

<img src="https://github.com/WeibelLab-Teaching/CSE_218_118_Fa20_Team_M/blob/main/images/ar_feed.png?raw=true" width="300"> 

- **Currency and shop system:** We also designed a currency and shop system that allows users to purchase new items for cats. The coins can be earned through daily login.
<img src="https://github.com/WeibelLab-Teaching/CSE_218_118_Fa20_Team_M/blob/main/images/ar_shop.png?raw=true" width="300"> 

#### VR Features
- Complete tasks to obtain shared items
  - An ad for a can
  - Cans for a fish
  - Fish for new decorations
<img src="https://github.com/WeibelLab-Teaching/CSE_218_118_Fa20_Team_M/blob/main/images/vr_overview.png?raw=true" width="900"> 

- Synced interactions and decorations
<img src="https://github.com/WeibelLab-Teaching/CSE_218_118_Fa20_Team_M/blob/main/images/vr_sync.png?raw=true" width="800"> 

- The task board
<img src="https://github.com/WeibelLab-Teaching/CSE_218_118_Fa20_Team_M/blob/main/images/vr_taskboard.png?raw=true" width="800"> 

### Architecture & Data Flow
The AR scene is rendered by Babylon.js. The interactions and data processing are handled by Firebase functions. 
User data is stored in Firestore (a NoSQL database).\
<img src="https://github.com/WeibelLab-Teaching/CSE_218_118_Fa20_Team_M/blob/main/images/ar_workflow.png?raw=true" width="800">

The VR scene is rendered by Babylon.js. The interactions are sent to a Heroku server and will be broadcast to 
all the users by the server.\
<img src="https://github.com/WeibelLab-Teaching/CSE_218_118_Fa20_Team_M/blob/main/images/vr_workflow.png?raw=true" width="800">

## How to get started?

### Hosting URL
Main page: https://ar-meowmeow.web.app \
AR: https://ar-meowmeow.web.app/AR/ARscene.html \
VR: https://ar-meowmeow.web.app/VR/VRscene.html 

### AR
**Android** users can enter the URL and view the AR scene with Chrome. \
**iOS** users can enter the URL and view the AR scene with WebXR Viewer(downloaded from App Store).

### VR
**PC**: Some browsers(such as Chrome 79) supports WebXR. Users can view the VR scene and 
user mouse interactions and keyboard interactions. \
**VR Headset**: Users can enter the URL in the browser of of the VR headset and view the VR scene.
Users can user controllers to perform interactions.


## Who maintains and contributes to the project?
AR Meow Meow is a course project for CSE118/218 in UC San Diego, and is developed by Team M.
Our team has 5 members and we divided our team roles as follows: 

Qinghui (Luna) Xia -- **Full Stack Developer**: focusing on the client side and website UI. Graduating BS Computer Engineering student. \
Yushan Liu -- **Game Designer** and **Front-end Developer** focusing on BabylonJS GUI. Yushan is a 1st year MS Computer Science student. \
Peizhen Wu -- **Full Stack Developer**: focusing on the server and Babylon.js GUI. Peizhen is a Computer Science Master student. \
Yiran Chen -- **Full Stack Developer**: focusing on graphics (models and animations). Yiran is a 1st year MS Computer Science student. \
Elvis Tran -- **Website Developer**. Elvis is a 5th year BS Computer Science student.

### Helps and Contacts
If you have any questions regarding AR Meow Meow, please feel free to email us. Our email address is cse218.team.m@gmail.com

## Links to Past Weekly Reports
Project Proposal: https://youtu.be/JUxQtUT9jrI \
Midterm Presentation: https://youtu.be/9oAKdyYR8-4 \
Week6 Report: https://youtu.be/nt9im_sug0A \
Week7 Report: https://youtu.be/XQgZS5he1UQ \
Week8 Report: https://youtu.be/HBDkMS0wsf4 \
Week9 Report: https://youtu.be/TywA0IBmgYA \
Final Presentation: https://youtu.be/gCcYBjDubjo

## Resources
### Music
BGMs: ukulele, little idea, cute, smile From www.bensound.com.

### Models
**TODO**

### Icons
**TODO**
