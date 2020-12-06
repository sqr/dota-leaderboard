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
    extname: 'hbs',
    defaultLayout: 'index'
}));

const database = new Datastore({ filename: 'database.db', timestampData: true, autoload: true });


app.listen(3000, () => console.log('listening at port 3000'));
app.use('/static', express.static('static'));

app.use(express.json());

app.get('/', (req, res) => {
    res.render('create');
});

app.post('/api', (request, response) => {
    const vanityurl = request.body.userid;
    const allData = [];

    (async function() {
        const steamid32 = await vanityToSteamid32(vanityurl);
        allData.push(steamid32);
        response.json(steamid32);
      })();
});

app.post('/generate', (request, response) => {
    const playerList = request.body;
    var id = nanoid();
    console.log(id);
    createDbRecord(playerList, id);
    var JSONdata = JSON.stringify(id);
    response.send(JSONdata);
});

app.get('/ajax', (req, res) => {
    var dataToSend = { 'message': 'pene' };
    var JSONdata = JSON.stringify(dataToSend);
    res.send(JSONdata);
});

app.get('/leaderboard/:leaderboard_id', (req, res) => {
    database.find({ leaderboard_id: req.params.leaderboard_id }, function (err, docs) {
        console.log('Request leaderboard id: ' + docs[0].leaderboard_id);
        var playerList = docs[0].playerList;
        var queryList = getQueryList(playerList);
        Promise.all(queryList).then(function (responses) {
            return Promise.all(responses.map(function (responses) {
                return responses.json();
            }));
        }).then(function (data) {
           var sortedData = sortPlayer(data);
           res.render('main', { data : sortedData });
        }).catch(function (error) {
            console.log(error);
        })
      });
});

async function vanityToSteamid32(vanityurl){
    token = process.env['DOTA2_API'];
    const api_url = 'http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=' +  token + '&vanityurl=' + vanityurl;
    const response = await fetch(api_url);
    const json = await response.json();
    console.log('Input SteamID64: ' + json.response.steamid);
    steamid64 = json.response.steamid;
    const id64 = BigInt(steamid64);
    const converter = BigInt('76561197960265728');
    var q = id64 - converter;
    console.log('Output SteamID32: ' + q.toString());
    return q.toString();
};

function createDbRecord(playerList, id){
    database.insert({'leaderboard_id': id, 'playerList': []});
    for (player in playerList){
         database.update({ leaderboard_id: id }, { $push: { playerList: playerList[player].profile.account_id } }, {}, function () {
        });
    }
 };

function getQueryList(playerList) {
    const promises = [];
    for (player in playerList) {
        api_url = 'https://api.opendota.com/api/players/' + playerList[player];
        promises.push(fetch(api_url))
    }
    return promises;
}

function sortPlayer(player_data){
    player_data.sort((a,b)=> (a.mmr_estimate.estimate < b.mmr_estimate.estimate ? 1 : -1));
    console.log('Sorting player list');
    return player_data;
}