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
let sortingValuesCollection, resultCollection;

MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then((connection) => {
    db = connection.db(dbName);
    sortingValuesCollection = db.collection('sortingData');
    resultCollection = db.collection('resultData');
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

const { spawn } = require('child_process');

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use(cors({origin: ["http://localhost:4200"],}));

app.post('/start', (req, res, next) => {
    const { category, lowerBoundary, upperBoundary } = req.body;
    console.debug("cat: " + category + ", lower: " + lowerBoundary + ", upper: " + upperBoundary);
    try {
        if (lowerBoundary === undefined || lowerBoundary === null
            || upperBoundary === undefined || upperBoundary === null) {
            sortingValuesCollection.insertOne({start: (new Date()).getTime(), category});
        } else {
            if (lowerBoundary >= upperBoundary) {
                res.status(400).send({error: 'cannot set sorting values to lower boundary ' + lowerBoundary
                 + ' and upper boundary ' + upperBoundary + ' - lower boundary is greater than or equal to upper boundary'});
            }
            sortingValuesCollection.insertOne({start: (new Date()).getTime(), category, lowerBoundary, upperBoundary});
        }
        mqttClient.publish(publishTopic, JSON.stringify({status: 'start'}));
        return res.status(200).send({ message: "successfully send start status" });
    } catch (err) {
        next('failed to insert sorting values in db: ' + err);
    }
});

app.post('/stop', (req, res, next) => {
    try {
        sortingValuesCollection.find({}).sort({ start : -1 }).toArray((err, items) => {
            if (err) {
                next('failed to get entry with latest start timestamp: ' + err);
            }
            sortingValuesCollection.updateOne({_id: items[0]._id}, {$set: {end: (new Date()).getTime()}});
        });
        mqttClient.publish(publishTopic, JSON.stringify({status: 'stop'}));
        return res.status(200).send({ message: "successfully sent stop status" });
    } catch(err) {
        next('failed to update sorting data in db: ' + err);
    }
});

app.post('/recognize', (req, res, next) => {
    //TODO: get pic from body, call ML model, etc.
    let cardID = req.query.filepath;
    // let option = req.query.option;
    // if (req.query.parameter1 && req.query.parameter2) {
    //   let parameter1 = req.query.parameter1
    //   let parameter2 = req.query.parameter2
    // }

    let childPython = spawn('python', ['get_match_and_sort.py', cardID, 0, 1, 2])

    childPython.stdout.on('data', (data) => {
        console.log(data.toString());
        res.send(data)
    });

    childPython.stderr.on('data', (data) => {
        console.log('stderr:', data.toString());
    });

    childPython.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

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
