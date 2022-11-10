const express = require('express');
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const fetch = require('node-fetch');
const mqtt = require('mqtt');
const cors = require('cors');


const app = express();
const PORT = 3000;
const http = require('http').createServer(app);


/* websocket server */
const io = require('socket.io')(http, {
    cors: {
        origins: ['http://localhost:4200']
    }
});


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

app.use(cors({ origin: ["http://localhost:4200"], }));

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

function getBoxValue(cardValue, lowerBoundary, upperBoundary) {
    if (cardValue === undefined || cardValue === null) {
        return 4;
    }
    if (cardValue >= upperBoundary) {
        console.log("box 3");
        return 3;
    } else if (cardValue < lowerBoundary) {
        console.log("box 1");
        return 1;
    } else {
        console.log("box 2");
        return 2;
    }
}

function sendBoxValue(poromagiaData, cardId) {
    let error = null;
    const price = poromagiaData.price;
    const stock = poromagiaData.stock;
    const wanted = poromagiaData.wanted; //TODO: test param not in poromagia data
    try {
        sortingValuesCollection.find({}).sort({ start : -1 }).toArray((err, items) => {
            if (err) {
                error = 'failed to get entry with latest start timestamp: ' + err;
            }
            const category = items[0].category;
            const lowerBoundary = category === 'wanted' ? null : items[0].lowerBoundary;
            const upperBoundary = category === 'wanted' ? null : items[0].upperBoundary;
            let boxValue;
            switch (category) {
                case 'Price':
                    boxValue = getBoxValue(price, lowerBoundary, upperBoundary);
                    break;
                case 'Stock':
                    boxValue = getBoxValue(stock, lowerBoundary, upperBoundary);
                    break;
                case 'Wanted':
                    boxValue = getBoxValue(wanted, lowerBoundary, upperBoundary);
            }

            if (boxValue < 1 || boxValue > 3) {
                error = 'failed to get price from Poromagia DB';
            } else {
                io.emit('recognized card', JSON.stringify({price, stock, wanted, box: boxValue}));
                resultCollection.insertOne({timestamp: (new Date()).getTime(), recognizedId: cardId,
                    box: boxValue, price, stock, wanted});
                return {error: null, boxNumber: boxValue};
            }
        });
    } catch(err) {
        error = 'failed to get box value: ' + err;
    }

    if (error) {
        io.emit('recognized card', JSON.stringify({price, stock, wanted, box: 4}));
        resultCollection.insertOne({timestamp: (new Date()).getTime(), recognizedId: cardId,
            box: 4, price, stock, wanted});
        return {error: error, boxNumber: 4};
    }
    return null;
}

app.post('/recognize', async (req, res, next) => {
    //TODO: get pic from body and send to frontend
    let cardImage = req.query.filepath;
    const childPython = spawn('python', ['get_match_and_sort.py', cardImage])

    childPython.stdout.on('data', async (data) => {
        const cardID = data.toString()

        // get data from poromagia database
        const options = {
            "method": "GET",
        };
        const response = await fetch(`https://poromagia.com/store_manager/card_api/?access_token=4f02d606&id=${cardID}`, options)
        const poromagiaData = await response.json();
        console.debug("poromagia data: " + JSON.stringify(poromagiaData));
        if (!poromagiaData) {
            return next('failed to get data from poromagia database for id "' + cardID + '"');
        }

        const boxValueResponse = sendBoxValue(poromagiaData, cardID);
        if (!boxValueResponse || boxValueResponse.error) {
            return res.status(500).send({boxNumber: 4});
            //return next(boxValueResponse.error);
        }

        return res.status(200).send({boxNumber: boxValueResponse.boxNumber});
    });

    childPython.stderr.on('data', (data) => {
        console.error('stderr:', data.toString());
        return next('error in python child process: ' + data.toString());
        //TODO: send error to frontend + send & save 4
    });

    childPython.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
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
