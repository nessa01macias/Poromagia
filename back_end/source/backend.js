const express = require('express');
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const fetch = require('node-fetch');
const mqtt = require('mqtt');
const cors = require('cors');
const ISODate = require('isodate');


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
            sortingValuesCollection.insertOne({ start: new Date(), category });
        } else {
            if (lowerBoundary >= upperBoundary) {
                res.status(400).send({
                    error: 'cannot set sorting values to lower boundary ' + lowerBoundary
                        + ' and upper boundary ' + upperBoundary + ' - lower boundary is greater than or equal to upper boundary'
                });
            }
            sortingValuesCollection.insertOne({ start: new Date(), category, lowerBoundary, upperBoundary });
        }
        mqttClient.publish(publishTopic, JSON.stringify({ status: 'start' }));
        return res.status(200).send({ message: "successfully send start status" });
    } catch (err) {
        next('failed to insert sorting values in db: ' + err);
    }
});

app.post('/stop', (req, res, next) => {
    try {
        sortingValuesCollection.find({}).sort({ start: -1 }).toArray((err, items) => {
            if (err) {
                next('failed to get entry with latest start timestamp: ' + err);
            }
            sortingValuesCollection.updateOne({ _id: items[0]._id }, { $set: { end: new Date() } });
        });
        mqttClient.publish(publishTopic, JSON.stringify({ status: 'stop' }));
        return res.status(200).send({ message: "successfully sent stop status" });
    } catch (err) {
        next('failed to update sorting data in db: ' + err);
    }
});

function getBoxValue(cardValue, lowerBoundary, upperBoundary) {
    if (cardValue === undefined || cardValue === null) {
        return 4;
    }
    if (cardValue >= upperBoundary) {
        console.debug("box 3");
        return 3;
    } else if (cardValue < lowerBoundary) {
        console.debug("box 1");
        return 1;
    } else {
        console.debug("box 2");
        return 2;
    }
}

function sendBoxValue(poromagiaData, cardId, res, cardLink, objectId) {
    let error = null;
    let userError = null;
    const price = poromagiaData.price;
    const stock = poromagiaData.stock;
    const wanted = poromagiaData.wanted;
    try {
        sortingValuesCollection.find({}).sort({ start : -1 }).toArray((err, items) => {
            if (err) {
                error = 'failed to get entry with latest start timestamp: ' + err;
                userError = 'Failed to get entry with latest start timestamp';
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
                io.emit('recognized card', JSON.stringify({price, stock, wanted, box: boxValue, imageLink: cardLink}));
                resultCollection.updateOne({ _id: objectId }, { $set: { timestamp: new Date(),
                        recognizedId: cardId.trim(), box: boxValue, price, stock, wanted } });
                res.status(200).send({boxNumber: boxValue});
            }
        });
        if (error) {
            if (userError) {
                sendRecognizeError(error, objectId, price, stock, wanted, cardId, res, cardLink, userError);
            }
            sendRecognizeError(error, objectId, price, stock, wanted, cardId, res, cardLink);
        }
    } catch(err) {
        sendRecognizeError('failed to get box value: ' + err, objectId,
            price, stock, wanted, cardId, res, cardLink, 'Failed to get box value');
    }
}

function sendRecognizeError(errorMessage, objectId, price, stock, wanted, cardId, res, cardLink, errorMessageForUser = errorMessage) {
    console.error("Error in recognize card: " + errorMessage);
    io.emit('recognized card', JSON.stringify({price, stock, wanted, box: 4, imageLink: cardLink}));
    resultCollection.updateOne({ _id: objectId }, { $set: { timestamp: new Date(), recognizedId: cardId,
            box: 4, price, stock, wanted } });
    io.emit('error', JSON.stringify({message: errorMessageForUser}));
    res.status(500).send({boxNumber: 4});
}

app.post('/recognize', async (req, res, next) => {
    const objectWithoutResultValues = {start: new Date()};
    let objectId;
    try {
        resultCollection.insertOne(objectWithoutResultValues, (err) => {
            if (err) return next("Failed to insert new result object with start timestamp: " + err);
            objectId = objectWithoutResultValues._id;
        });
    } catch(err) {
        return next("Failed to insert initial result object into database: " + err);
    }

    //TODO: get pic from body and send to frontend
    let cardImage = req.query.filepath;
    const childPython = spawn('python', ['get_match_and_sort.py', cardImage]);

    // only for testing TODO: remove
    io.emit('image', JSON.stringify({imgSrc: "https://cards.scryfall.io/large/front/f/2/f295b713-1d6a-43fd-910d-fb35414bf58a.jpg"}));

    childPython.stdout.on('data', async (data) => {
        const recognizedData = JSON.parse(data.toString());
        const cardID = recognizedData.card_id;
        const cardLink = recognizedData.card_link;

        // get data from poromagia database
        const options = {
            "method": "GET",
        };
        const response = await fetch(`https://poromagia.com/store_manager/card_api/?access_token=4f02d606&id=${cardID}`, options)
        const poromagiaData = await response.json();
        console.debug("poromagia data: " + JSON.stringify(poromagiaData));
        if (!poromagiaData) {
            sendRecognizeError('Failed to get data from poromagia database for id "' + cardID + '"',
                objectId, null, null, null, cardID, res, cardLink);
        }

        sendBoxValue(poromagiaData, cardID, res, cardLink, objectId);
    });

    childPython.stderr.on('data', (data) => {
        console.error('stderr:', data.toString());
        sendRecognizeError('error in python child process: ' + data.toString(), objectId, null, null,
            null, null, res, null, 'An error uccured while trying to recognize the card');
        childPython.stderr.removeAllListeners();
    });

    childPython.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
});


/* endpoints to get data from database for statistics */

async function getNumberOfCards(fromDate, toDate, type, res, next) {
    let matchExpression;
    let label;
    switch (type) {
        case 'all': matchExpression = [{}]; label = "Sorted cards"; break;
        case 'recognized': matchExpression = [{ box: 1 }, { box: 2 }, { box: 3 }]; label = "Recognized cards"; break;
        case 'notRecognized': matchExpression = [{ box: 4 }]; label = "Not recognized cards"; break;
        case 1: case 2: case 3: case 4: matchExpression = [{ box: type }]; label = "Cards sorted in box " + type; break;
        default: next("Failed to get number of cards - invalid type"); return;
    }

    try {
        await resultCollection.aggregate([
            { $match: {
                    timestamp : { $gte : ISODate(fromDate), $lte : ISODate(toDate)},
                    $or: matchExpression
                }
            },
            { $sort: { timestamp: 1 } },
            { $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp"} },
                    count: { $sum: 1 } }
            }
        ]).toArray(function (err, result) {
            if (err) next(err);
            res.status(200).send({data: result, labels: [label]});
        });
    } catch(err) {
        next('Failed to get number of sorted cards in the given time period: ' + err);
    }
}

app.get('/cardsCount/all', async (req, res, next) => {
    const { fromDate, toDate } = req.query;
    await getNumberOfCards(fromDate, toDate, 'all', res, next);
});

app.get('/cardsCount/recognized', async (req, res, next) => {
    const { fromDate, toDate } = req.query;
    await getNumberOfCards(fromDate, toDate, 'recognized', res, next);
});

app.get('/cardsCount/notRecognized', async (req, res, next) => {
    const { fromDate, toDate } = req.query;
    await getNumberOfCards(fromDate, toDate, 'notRecognized', res, next);
});

app.get('/cardsCount/boxes/:id', async (req, res, next) => {
    const { fromDate, toDate } = req.query;
    const boxId = parseInt(req.params.id);
    await getNumberOfCards(fromDate, toDate, boxId, res, next);
});

app.get('/cardsCount/boxes', async (req, res, next) => {
    const { fromDate, toDate } = req.query;
    try {
        await resultCollection.aggregate([
            { $match: {
                    timestamp : { $gte : ISODate(fromDate), $lte : ISODate(toDate)},
                    $or: [{ box: 1 }, { box: 2 }, { box: 3 }, { box: 4 }]
                }
            },
            { $sort: { timestamp: 1 } },
            { $project: {
                    timestamp: "$timestamp",
                    box1: { $cond: [ { $eq: [ "$box", 1 ] }, 1, 0 ] },
                    box2: { $cond: [ { $eq: [ "$box", 2 ] }, 1, 0 ] },
                    box3: { $cond: [ { $eq: [ "$box", 3 ] }, 1, 0 ] },
                    box4: { $cond: [ { $eq: [ "$box", 4 ] }, 1, 0 ] },
                }
            },
            { $group: {
                    _id: {$dateToString: {format: "%Y-%m-%d", date: "$timestamp"}},
                    count1: {$sum: "$box1"},
                    count2: {$sum: "$box2"},
                    count3: {$sum: "$box3"},
                    count4: {$sum: "$box4"}
                }
            }
        ]).toArray(function (err, result) {
            if (err) next(err);
            res.status(200).send({data: result, labels: ["Box 1", "Box 2", "Box 3", "Box 4"]});
        });
    } catch(err) {
        next('Failed to get number of sorted cards for each box in the given time period: ' + err);
    }
});

app.get('/recognizeTimes', async (req, res, next) => {
    const { fromDate, toDate } = req.query;
    try {
        await resultCollection.aggregate([
            { $match: {
                    timestamp : { $gte : ISODate(fromDate), $lte : ISODate(toDate)}
                }
            },
            { $project: {
                time: { $trunc : { $divide: [{ $subtract: ["$timestamp", "$start"] }, 5000] } } //5s intervals
            }},
            { $group: {
                _id: { $concat: [ { $substr: [{ $multiply: [ "$time", 5 ] }, 0, -1 ]}, " - ",
                        { $substr: [{ $add: [ { $multiply: [ "$time", 5 ] }, 5 ] }, 0, -1 ] }, " s" ] },
                    count: { $sum: 1 },
                    time: { $first: "$time" }
                }
            },
            { $sort: { time: 1 } },
            { $project: { _id: "$_id", count: "$count" }}
        ]).toArray(function (err, result) {
            if (err) next(err);
            res.status(200).send({data: result, labels: ["Number of cards"]});
        });
    } catch(err) {
        next('Failed to get times to recognize cards in the given time period: ' + err);
    }
});

app.get('/cardsCount/categories', async (req, res, next) => {
    const { fromDate, toDate } = req.query;
    try {
        await sortingValuesCollection.aggregate([
            { $match: {
                    start : { $lte : ISODate(toDate)},
                    $or: [{ end: { $gte : ISODate(fromDate) } }, { end: {'$exists':false} }],
                }
            },
            { $sort: { start: 1 } },
            { $project: {
                    priceCat: {  // set to 1 if category is "Price"; 0 otherwise
                        $cond: [ { $eq: [ "$category", "Price" ] }, 1, 0 ]
                    },
                    stockCat: {  // set to 1 if category is "Stock"; 0 otherwise
                        $cond: [ { $eq: [ "$category", "Stock" ] }, 1, 0 ]
                    },
                    wantedCat: {  // set to 1 if category is "Wanted"; 0 otherwise
                        $cond: [ { $eq: [ "$category", "Wanted" ] }, 1, 0 ]
                    }
                }
            },
            { $group: {
                    _id: 'cards per category',
                    price: { $sum: "$priceCat" },
                    stock: { $sum: "$stockCat" },
                    wanted: { $sum: "$wantedCat" }
                }
            }
        ]).toArray(function (err, result) {
            if (err) next(err);
            res.status(200).send({data: result, labels: ["Cards sorted by Price",
                    "Cards sorted by Stock", "Cards sorted by Wanted value"]});
        });
    } catch(err) {
        next('Failed to get number of sorted cards in different categories in the given time period: ' + err);
    }
});

app.get('/sortingData/categories', async (req, res, next) => {
    const { fromDate, toDate } = req.query;
    try {
        await sortingValuesCollection.aggregate([
            { $match: {
                    start : { $lte : ISODate(toDate)},
                    $or: [{ end: { $gte : ISODate(fromDate) } }, { end: {'$exists':false} }],
                }
            },
            { $sort: { start: 1 } },
            { $project: {
                    category: "$category",
                    start: "$start",
                    end: "$end",
                    Time: { $trunc : { $divide: [{ $subtract: ["$end","$start"] }, 1000] } }
                }
            }
        ]).toArray(function (err, result) {
            if (err) next(err);
            res.status(200).send({data: result, labels: ["Category", "Start time", "End time", "Duration"]});
        });
    } catch(err) {
        next('Failed to get sorting data in the given time period: ' + err);
    }
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
