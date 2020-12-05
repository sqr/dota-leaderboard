const express = require('express');
const Datastore = require('nedb');
var { nanoid } = require("nanoid");
const fetch = require('node-fetch');
var path = require('path');
const handlebars = require('express-handlebars');
require('dotenv').config({path: __dirname + '/.env'})

const app = express();

app.set('view engine', 'hbs');
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs'
}));

const database = new Datastore('database.db');
database.loadDatabase();
/* database.insert({name: 'Arturo'}) */

const allData = [];

app.listen(3000, () => console.log('listening at lul port 3000'));
app.use('/static', express.static('static'));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.post('/api', (request, response) => {
    const vanityurl = request.body.userid;
    
    (async function() {
        const steamid32 = await vanityToSteamid32(vanityurl);
        console.log('steamid 32', steamid32);
        console.log(vanityurl);
        allData.push(steamid32);
        response.json(steamid32);
      })();
});

app.post('/generate', (request, response) => {
    const playerList = request.body;
    console.log(playerList);
    //response.json('peine');
    var id = nanoid();
    console.log(id);
    createDbRecord(playerList, id);
    var JSONdata = JSON.stringify(id);
    // database.insert({name: 'Arturo'})
    response.send(JSONdata);
});

app.get('/nanoid', (req, res) => {
    token = process.env['DOTA2_API'];
    console.log(token)
    var id = nanoid();
    console.log(id);
    var JSONid = JSON.stringify(id);
    res.send(JSONid);
});

app.get('/ajax', (req, res) => {
    var dataToSend = { 'message': 'peine' };
    var JSONdata = JSON.stringify(dataToSend);
    res.send(JSONdata);
});

app.get('/leaderboard/:leaderboard_id', (req, res) => {
    database.find({ leaderboard_id: req.params.leaderboard_id }, function (err, docs) {
        // docs is an array containing documents Mars, Earth, Jupiter
        // If no document is found, docs is equal to []
        console.log(docs);
        var JSONdata = JSON.stringify(id);
        res.send(JSONdata);
      });
});

async function vanityToSteamid32(vanityurl){
    token = process.env['DOTA2_API'];
    const api_url = 'http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=' +  token + '&vanityurl=' + vanityurl;
    const response = await fetch(api_url);
    const json = await response.json();
    console.log(json.response.steamid);
    steamid64 = json.response.steamid;
    const id64 = BigInt(steamid64);
    const converter = BigInt('76561197960265728');
    console.log(converter);
    var q = id64 - converter;
    console.log(q);
    console.log(q.toString());
    return q.toString();
};

function createDbRecord(playerList, id){
    database.insert({'leaderboard_id': id, 'playerList': []});
    //for (player in playerList){
    for (player in playerList){
         database.update({ leaderboard_id: id }, { $push: { playerList: playerList[player].profile.account_id } }, {}, function () {
        });
    }
 };