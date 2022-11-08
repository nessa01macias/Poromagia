const express = require('express');
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const mqtt = require('mqtt');
const cors = require('cors');


const app = express();
const PORT = 3000;
const http = require('http').createServer(app);


/* mongoDB database connection */

let db = null;
const url = `mongodb://localhost:27017`;
const dbName = 'cardSorting';
let sortingDataCollection;

MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then((connection) => {
    db = connection.db(dbName);
    sortingDataCollection = db.collection('sortingData');
    console.log('connected to database ' + dbName);
});


/* mqtt client */

const addr = process.argv.slice(2) && process.argv.slice(2).length > 0 ?
    'mqtt://' + process.argv.slice(2) + ':1883' : 'mqtt://192.168.1.10:1883';
const mqttClient = mqtt.connect(addr);
const publishTopic = "statusChange";

mqttClient.on('error', (err) => {
    console.error("mqtt error: " + err);
    mqttClient.end();
});

mqttClient.on('connect', () => {
    console.log(`mqtt client connected`);
});


/* http routes */

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors({origin: ["http://localhost:4200"],}));

app.post('/start', (req, res, next) => {
    const { category, lowerBoundary, upperBoundary } = req.body;
    console.log("cat: " + category + ", lower: " + lowerBoundary + ", upper: " + upperBoundary);
    //TODO: check boundaries depending on category
    mqttClient.publish(publishTopic, JSON.stringify({status: 'start'}));
    return res.status(200).send({ message: "start response test" });
});

app.post('/stop', (req, res) => {
    mqttClient.publish(publishTopic, JSON.stringify({status: 'stop'}));
    return res.status(200).send({ message: "stop response test" });
});

app.post('/recognize', (req, res, next) => {
    //TODO: get pic from body, call ML model, etc.
    return res.status(200).send({ message: "recognize response test" });
});


/**
 * 404-Error-Middleware
 */
app.use((req, res) => {
    res.status(404).send({ message: 'Not found' });
});

/**
 * 500-Error-Middleware
 */
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send({ message: 'InternalServerError: ' + err });
});


http.listen(PORT);
console.log(`Server listening on port ${PORT}`);
