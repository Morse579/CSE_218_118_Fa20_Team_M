const express = require('express');
const cors = require('cors');
const fs = require('fs');

const interval = 2000;

const app = express();
app.use(cors());


app.get('/', (req, res) => {
    let rawdata = fs.readFileSync('room.json');
    let room = JSON.parse(rawdata);
    res.json(room);
});

app.get('/update', (req, res) => {
    let name = req.params.name;
    let rawdata = fs.readFileSync('room.json');
    let room = JSON.parse(rawdata);
    res.json(room);
});

app.get('/feedSpecial', (req, res) => {
    let rawdata = fs.readFileSync('room.json');
    let room = JSON.parse(rawdata);
    room.state = "feedSpecial";
    room.feedSpecialCount += 1;
    room.fish -= 1;
    let data = JSON.stringify(room);
    fs.writeFileSync('room.json', data);

    setTimeout(()=>{
        let rawdata2 = fs.readFileSync('room.json');
        let room2 = JSON.parse(rawdata2);
        room2.state = "none";
        let data2 = JSON.stringify(room2);
        fs.writeFileSync('room.json', data2);
    },interval);
    res.json();
});

app.get('/feedWet', (req, res) => {
    let rawdata = fs.readFileSync('room.json');
    let room = JSON.parse(rawdata);
    switch(req.query.index){
        case "1":
            room.indivState1 = "feedWet";
            break;
        case "2":
            room.indivState2 = "feedWet";
            break;
        case "3":
            room.indivState3 = "feedWet";
            break;
    }
    room.cans -= 1;
    let data = JSON.stringify(room);
    fs.writeFileSync('room.json', data);

    setTimeout(()=>{
        let rawdata2 = fs.readFileSync('room.json');
        let room2 = JSON.parse(rawdata2);
        switch(req.query.index){
            case "1":
                room2.indivState1 = "none";
                break;
            case "2":
                room2.indivState2 = "none";
                break;
            case "3":
                room2.indivState3 = "none";
                break;
        }
        let data2 = JSON.stringify(room2);
        fs.writeFileSync('room.json', data2);
        console.log("finish feeding wet");
    },interval);
    res.json();
});

app.get('/displayTree', (req, res) => {
    let rawdata = fs.readFileSync('room.json');
    let room = JSON.parse(rawdata);
    room.displayTree = !room.displayTree;
    let data = JSON.stringify(room);
    fs.writeFileSync('room.json', data);
    res.json();
});

app.get('/updateTree', (req, res) => {
    let rawdata = fs.readFileSync('room.json');
    let room = JSON.parse(rawdata);
    room.treePosX = parseFloat(req.query.x);
    room.treePosZ = parseFloat(req.query.z);
    let data = JSON.stringify(room);
    fs.writeFileSync('room.json', data);
    res.json();
});

app.get('/displayBoard', (req, res) => {
    let rawdata = fs.readFileSync('room.json');
    let room = JSON.parse(rawdata);
    room.displayBoard = !room.displayBoard;
    let data = JSON.stringify(room);
    fs.writeFileSync('room.json', data);
    res.json();
});

app.get('/updateBoard', (req, res) => {
    let rawdata = fs.readFileSync('room.json');
    let room = JSON.parse(rawdata);
    room.boardPosX = parseFloat(req.query.x);
    room.boardPosZ = parseFloat(req.query.z);
    let data = JSON.stringify(room);
    fs.writeFileSync('room.json', data);
    res.json();
});

app.get('/displayElephant', (req, res) => {
    let rawdata = fs.readFileSync('room.json');
    let room = JSON.parse(rawdata);
    room.displayElephant = !room.displayElephant;
    let data = JSON.stringify(room);
    fs.writeFileSync('room.json', data);
    res.json();
});

app.get('/updateElephant', (req, res) => {
    let rawdata = fs.readFileSync('room.json');
    let room = JSON.parse(rawdata);
    room.elephantPosX = parseFloat(req.query.x);
    room.elephantPosZ = parseFloat(req.query.z);
    let data = JSON.stringify(room);
    fs.writeFileSync('room.json', data);
    res.json();
});

app.get('/updateCans', (req, res) => {
    let rawdata = fs.readFileSync('room.json');
    let room = JSON.parse(rawdata);
    room.cans = parseFloat(req.query.cans);
    room.cansAvailable -= 1;
    let data = JSON.stringify(room);
    fs.writeFileSync('room.json', data);
    res.json();
});

app.get('/updateFish', (req, res) => {
    let rawdata = fs.readFileSync('room.json');
    let room = JSON.parse(rawdata);
    room.fish = parseFloat(req.query.fish);
    room.fishAvailable = parseFloat(req.query.fishAvail);
    let data = JSON.stringify(room);
    fs.writeFileSync('room.json', data);
    res.json();
});

app.get('/reset', (req, res) => {
    let rawdata = fs.readFileSync('room.json');
    let room = JSON.parse(rawdata);
    room.displayTree = false;
    room.displayBoard = false;
    room.displayElephant = false;
    room.feedSpecialCount = 0;
    room.cans = 2;
    room.fish = 2;
    room.cansAvailable = 5;
    room.fishAvailable = 5;
    let data = JSON.stringify(room);
    fs.writeFileSync('room.json', data);
    res.json();
});


app.listen(process.env.PORT, () => {
});