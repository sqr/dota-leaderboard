const express = require('express');
const Datastore = require('nedb');
var { nanoid } = require("nanoid");
var path = require('path');
require('dotenv').config({path: __dirname + '/.env'})

const app = express();
app.listen(3000, () => console.log('listening at lul port 3000'));
app.use('/static', express.static('static'));

const database = new Datastore('database.db');
database.loadDatabase();
/* database.insert({name: 'Arturo'}) */

app.get('/', (req, res) => {
    res.send('Hello World!')
});

const allData = [];

app.use(express.json());
app.post('/api', (request, response) => {
    const data = request.body;
    allData.push(data);

    response.json(allData);
    console.log('Got a request!');
    console.log(data);
    console.log(allData);
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


/* http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key= &vanityurl=square */

