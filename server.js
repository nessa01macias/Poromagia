const express = require('express');
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const fetch = require('node-fetch');
const mqtt = require('mqtt');
const cors = require('cors');
const ISODate = require('isodate');
const dotenv = require('dotenv').config();
const path = require('path');

const multer = require('multer')
const storage = multer.diskStorage({
    destination: (res, file, cb) => {
        cb(null, 'test_raspimg')
    },
    filename: (req, file, cb) => {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({ storage: storage });
const app = express();
const http = require('http').createServer(app);


// /* Serve front end */
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '/dist/frontend/')));
    app.get('*', (req, res) =>
        res.sendFile(
            path.resolve(__dirname, 'dist', 'frontend', 'index.html')
        )
    );
}

/* websocket server */
const io = require('socket.io')(http, {
    cors: {
        origins: [process.env.FROND_END_URI]
    }
});


/* mongoDB database connection */
let db = null;
const dbName = 'cardSorting';
let sortingValuesCollection, resultCollection;

MongoClient.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then((connection) => {
    db = connection.db(dbName);
    sortingValuesCollection = db.collection('sortingData');
    resultCollection = db.collection('resultData');
    picturesCollection = db.collection('picturesData');
    console.log('connected to database ' + dbName);
}).catch((err) => console.log("Error in database setup", err))



/* mqtt client */
const addr = process.argv.slice(2) && process.argv.slice(2).length > 0 ?
    'mqtt://' + process.argv.slice(2) + ':2048' : 'mqtt://hetkinen.ddns.net:2048';
const mqttClient = mqtt.connect(addr, {
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
});
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
let machineStatus = 0;

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors({ origin: [process.env.FROND_END_URI] }));

/**
 * checks and inserts the sorting value (start time, category, lower and upper boundary) in the database
 * and publishes the start status via mqtt afterwards
 * @param req http request containing the category and the lower and upper boundary in the request body
 */
app.post('/start', (req, res, next) => {
    const { category, lowerBoundary, upperBoundary } = req.body;
    console.debug("cat: " + category + ", lower: " + lowerBoundary + ", upper: " + upperBoundary);
    try {
        if (lowerBoundary === undefined || lowerBoundary === null
            || upperBoundary === undefined || upperBoundary === null) {
            sortingValuesCollection.insertOne({ start: new Date(), category });
        } else {
            if (typeof lowerBoundary === "number" && typeof upperBoundary === "number" && lowerBoundary >= upperBoundary) {
                console.error('Invalid arguments - lower boundary ' + lowerBoundary
                    + ' is greater than or equal to upper boundary ' + upperBoundary);
                return res.status(400).send({
                    error: 'cannot set sorting values to lower boundary ' + lowerBoundary
                        + ' and upper boundary ' + upperBoundary + ' - lower boundary is greater than or equal to upper boundary'
                });
            }
            sortingValuesCollection.insertOne({ start: new Date(), category, lowerBoundary, upperBoundary });
        }
        machineStatus = 1;
        mqttClient.publish(publishTopic, JSON.stringify({ status: 1, decision: 0 }));
        return res.status(200).send({ message: "successfully send start status" });
    } catch (err) {
        next('failed to insert sorting values in db: ' + err);
    }
});

/**
 * adds the end time to the latest sorting value entry in the database and publishes the stop status via mqtt afterwards
 */
app.post('/stop', (req, res, next) => {
    try {
        sortingValuesCollection.find({}).sort({ start: -1 }).toArray((err, items) => {
            if (err) {
                next('failed to get entry with latest start timestamp: ' + err);
            }
            sortingValuesCollection.updateOne({ _id: items[0]._id }, { $set: { end: new Date() } });
        });
        machineStatus = 0;
        mqttClient.publish(publishTopic, JSON.stringify({ status: 0, decision: 0 }));
        return res.status(200).send({ message: "successfully sent stop status" });
    } catch (err) {
        next('failed to update sorting data in db: ' + err);
    }
});

/**
 * compares the current card's value in the selected category to the lower and upper boundary to get the box value
 * @param cardValue the current card's value of the selected category property
 * @param lowerBoundary the currently set lower boundary value in the selected category
 * @param upperBoundary the currently set upper boundary value in the selected category
 * @return {number} the number of the box in which the current card should be sorted
 */
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

/**
 * gets the current sorting values (category, lower and upper boundary) from the database and compares it to the current card's values to get the box value
 * and sends the result or the error message via websockets to the frontend and via http response to the requester
 * @param poromagiaData the card data of the recognized card from Poromagia's database
 * @param cardId the id of the recognized card (this id is used in the scryfall and in Poromagia's database)
 * @param res the http response
 * @param cardLink the url to the picture of the recognized card
 * @param objectId the id of the database entry for the current card (used to update the database entry)
 */
function sendBoxValue(poromagiaData, cardId, res, cardLink, objectId) {
    let error = null;
    let userError = null;
    const price = poromagiaData.price;
    const stock = poromagiaData.stock;
    const wanted = poromagiaData.wanted;
    try {
        // gets the sorting values of the latest database entry
        sortingValuesCollection.find({}).sort({ start: -1 }).toArray((err, items) => {
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
                error = "failed to get box value - no data from Poromagia's database for the current card found";
            } else {
                // send result via websocket, update database entry and send http response with the box to sort the current card in
                io.emit('recognized card', JSON.stringify({ price, stock, wanted, box: boxValue, imageLink: cardLink }));
                resultCollection.updateOne({ _id: objectId }, {
                    $set: {
                        timestamp: new Date(),
                        recognizedId: cardId.trim(), box: boxValue, price, stock, wanted
                    }
                });
                mqttClient.publish(publishTopic, JSON.stringify({ status: machineStatus, decision: boxValue + 1 }));
                res.status(200).send({ boxNumber: boxValue });
            }
        });
        if (error) {
            if (userError) {
                sendRecognizeError(error, objectId, price, stock, wanted, cardId, res, cardLink, userError);
            }
            sendRecognizeError(error, objectId, price, stock, wanted, cardId, res, cardLink);
        }
    } catch (err) {
        sendRecognizeError('failed to get box value: ' + err, objectId,
            price, stock, wanted, cardId, res, cardLink, 'Failed to get box value');
    }
}

/**
 * this function is called when an error occurs while trying to recognize the card
 * logs the error message in the console, sends an error message via websockets, updates the database entry for the current card
 * and sends the box number 4 (not recognized) via http response
 * @param errorMessage the error message to be logged in the console
 * @param objectId the id of the database entry for the current card (used to update the database entry)
 * @param price the price of the recognized card (data from Poromagia's database)
 * @param stock the stock value of the recognized card (data from Poromagia's database)
 * @param wanted the wanted value of the recognized card (data from Poromagia's database)
 * @param cardId the id of the recognized card (this id is used in the scryfall and in Poromagia's database)
 * @param res the http response
 * @param cardLink the url to the picture of the recognized card
 * @param errorMessageForUser the error message which is sent via websockets to be displayed in the frontend for the user; default value is the "normal" error message
 */
function sendRecognizeError(errorMessage, objectId, price, stock, wanted, cardId, res, cardLink, errorMessageForUser = errorMessage) {
    console.error("Error in recognize card: " + errorMessage);
    io.emit('recognized card', JSON.stringify({ price, stock, wanted, box: 4, imageLink: cardLink }));
    resultCollection.updateOne({ _id: objectId }, {
        $set: {
            timestamp: new Date(), recognizedId: cardId,
            box: 4, price, stock, wanted
        }
    });
    io.emit('error', JSON.stringify({ message: errorMessageForUser }));
    mqttClient.publish(publishTopic, JSON.stringify({ status: machineStatus, decision: 5 }));
    res.status(500).send({ boxNumber: 4 });
}

/**
 * calls the computer vision model (as python child process) to recognize the current card by the taken image
 * saves the result in the database and sends it via websockets and http response
 * @param req http request containing the taken image in the request body
 */
app.post('/', upload.single('image'), async (req, res, next) => {
    // save the start time in the database before processing the data
    const objectWithoutResultValues = { start: new Date() };
    let objectId;
    try {
        resultCollection.insertOne(objectWithoutResultValues, (err) => {
            if (err) return next("Failed to insert new result object with start timestamp: " + err);
            // save the object id of the database entry to update the entry later
            objectId = objectWithoutResultValues._id;
        });
    } catch (err) {
        return next("Failed to insert initial result object into database: " + err);
    }

    if (req.file) console.log("req.file:", req.file);
    let cardImage = path.join(__dirname, './test_raspimg/' + req.file['filename']);

    // call the computer vision model to recognize the card
    const childPython = spawn('python', ['get_match_and_sort.py', cardImage]);

    // only for testing TODO: remove
    io.emit('image', JSON.stringify({ imgSrc: "https://cards.scryfall.io/large/front/f/2/f295b713-1d6a-43fd-910d-fb35414bf58a.jpg" }));

    // listener to process the data returned by the computer vision model
    childPython.stdout.on('data', async (data) => {
        const recognizedData = JSON.parse(data.toString());
        const cardID = recognizedData.card_id;
        const cardLink = recognizedData.card_link;

        // get data from Poromagia database
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

    // listener to recognize and handle errors while trying to recognize the card
    childPython.stderr.on('data', (data) => {
        console.error('stderr:', data.toString());
        sendRecognizeError('error in python child process: ' + data.toString(), objectId, null, null,
            null, null, res, null, 'An error occurred while trying to recognize the card');
        childPython.stderr.removeAllListeners();
    });

    // listener to recognize when connection to computer vision model is closed
    childPython.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
});


/* endpoints to get data from database for statistics */

/**
 * gets database entries of recognized cards in the given time period that comply with the given type,
 * groups them by the day on which the card was recognized and counts the number of cards per day
 * sends the result (number of cards per day in the given time period) and the labels for the graph via http response
 * @param fromDate the start date of the requested time period
 * @param toDate the end date of the requested time period
 * @param type the type of the requested data (all cards, only recognized cards, only not recognized cards or only cards sorted in the box with the given number)
 * @param res the http response
 * @param next function to forward errors to the error middleware
 */
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
            {
                $match: {
                    timestamp: { $gte: ISODate(fromDate), $lte: new Date((ISODate(toDate)).getTime() + 1000 * 60 * 60 * 24) },
                    $or: matchExpression
                }
            },
            { $sort: { timestamp: 1 } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    count: { $sum: 1 }
                }
            }
        ]).toArray(function (err, result) {
            if (err) {
                io.emit('error', JSON.stringify({ message: "Failed to get number of cards for the selected diagram!" }));
                return next(err);
            }
            res.status(200).send({ data: result, labels: [label] });
        });
    } catch (err) {
        io.emit('error', JSON.stringify({ message: "Failed to get number of cards for the selected diagram!" }));
        next('Failed to get number of sorted cards in the given time period: ' + err);
    }
}

/**
 * gets the number of sorted cards per day in the given time period and sends the result via http response
 * @param req http request containing the start and end date of the requested time period in the query parameters
 */
app.get('/cardsCount/all', async (req, res, next) => {
    const { fromDate, toDate } = req.query;
    await getNumberOfCards(fromDate, toDate, 'all', res, next);
});

/**
 * gets the number of recognized cards (box 1, 2 or 3) per day in the given time period and sends the result via http response
 * @param req http request containing the start and end date of the requested time period in the query parameters
 */
app.get('/cardsCount/recognized', async (req, res, next) => {
    const { fromDate, toDate } = req.query;
    await getNumberOfCards(fromDate, toDate, 'recognized', res, next);
});

/**
 * gets the number of not recognized cards per day in the given time period and sends the result via http response
 * @param req http request containing the start and end date of the requested time period in the query parameters
 */
app.get('/cardsCount/notRecognized', async (req, res, next) => {
    const { fromDate, toDate } = req.query;
    await getNumberOfCards(fromDate, toDate, 'notRecognized', res, next);
});

/**
 * gets the number of cards sorted in the box with the given id per day in the given time period and sends the result via http response
 * @param req http request containing the start and end date of the requested time period in the query parameters and the number of the requested box in the url
 */
app.get('/cardsCount/boxes/:id', async (req, res, next) => {
    const { fromDate, toDate } = req.query;
    const boxId = parseInt(req.params.id);
    await getNumberOfCards(fromDate, toDate, boxId, res, next);
});

/**
 * gets the number of cards per box in the given time period and sends the result via http response
 * @param req http request containing the start and end date of the requested time period in the query parameters
 */
app.get('/cardsCount/boxes', async (req, res, next) => {
    const { fromDate, toDate } = req.query;
    try {
        await resultCollection.aggregate([
            {
                $match: {
                    timestamp: { $gte: ISODate(fromDate), $lte: new Date((ISODate(toDate)).getTime() + 1000 * 60 * 60 * 24) },
                    $or: [{ box: 1 }, { box: 2 }, { box: 3 }, { box: 4 }]
                }
            },
            { $sort: { timestamp: 1 } },
            {
                $project: {
                    timestamp: "$timestamp",
                    box1: { $cond: [{ $eq: ["$box", 1] }, 1, 0] },
                    box2: { $cond: [{ $eq: ["$box", 2] }, 1, 0] },
                    box3: { $cond: [{ $eq: ["$box", 3] }, 1, 0] },
                    box4: { $cond: [{ $eq: ["$box", 4] }, 1, 0] },
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    count1: { $sum: "$box1" },
                    count2: { $sum: "$box2" },
                    count3: { $sum: "$box3" },
                    count4: { $sum: "$box4" }
                }
            }
        ]).toArray(function (err, result) {
            if (err) {
                io.emit('error', JSON.stringify({ message: "Failed to get number of sorted cards for each box in the given time period!" }));
                next(err);
            }
            res.status(200).send({ data: result, labels: ["Box 1", "Box 2", "Box 3", "Box 4"] });
        });
    } catch (err) {
        io.emit('error', JSON.stringify({ message: "Failed to get number of sorted cards for each box in the given time period!" }));
        next('Failed to get number of sorted cards for each box in the given time period: ' + err);
    }
});

/**
 * calculates the time it took to recognize a card (including saving the result in the database and sending it via websocket and http response),
 * splits the recognize-times into 5s intervals, counts the number of cards for each interval and sends the result via http response
 * @param req http request containing the start and end date of the requested time period in the query parameters
 */
app.get('/recognizeTimes', async (req, res, next) => {
    const { fromDate, toDate } = req.query;
    try {
        await resultCollection.aggregate([
            {
                $match: {
                    timestamp: { '$exists': true, $gte: ISODate(fromDate), $lte: new Date((ISODate(toDate)).getTime() + 1000 * 60 * 60 * 24) },
                    start: { '$exists': true },
                    $or: [{ box: 1 }, { box: 2 }, { box: 3 }]
                }
            },
            {
                $project: {
                    time: { $trunc: { $divide: [{ $subtract: ["$timestamp", "$start"] }, 5000] } } //5s intervals
                }
            },
            {
                $group: {
                    _id: {
                        $concat: [{ $substr: [{ $multiply: ["$time", 5] }, 0, -1] }, " - ",
                        { $substr: [{ $add: [{ $multiply: ["$time", 5] }, 5] }, 0, -1] }, " s"]
                    },
                    count: { $sum: 1 },
                    time: { $first: "$time" }
                }
            },
            { $sort: { time: 1 } },
            { $project: { _id: "$_id", count: "$count" } }
        ]).toArray(function (err, result) {
            if (err) {
                io.emit('error', JSON.stringify({ message: "Failed to get times to recognize cards in the given time period!" }));
                next(err);
            }
            res.status(200).send({ data: result, labels: ["Number of cards"] });
        });
    } catch (err) {
        io.emit('error', JSON.stringify({ message: "Failed to get times to recognize cards in the given time period!" }));
        next('Failed to get times to recognize cards in the given time period: ' + err);
    }
});

/**
 * counts how often the machine ran for each category in the given time period and returns the result via http response
 * @param req http request containing the start and end date of the requested time period in the query parameters
 */
app.get('/cardsCount/categories', async (req, res, next) => {
    const { fromDate, toDate } = req.query;
    try {
        await sortingValuesCollection.aggregate([
            {
                $match: {
                    $or: [
                        // start time is in given time period
                        { start: { $lte: new Date((ISODate(toDate)).getTime() + 1000 * 60 * 60 * 24), $gte: ISODate(fromDate) } },
                        // end time is in given time period
                        { end: { $lte: new Date((ISODate(toDate)).getTime() + 1000 * 60 * 60 * 24), $gte: ISODate(fromDate) } },
                        // start time is before and end time after given time period
                        { $and: [{ start: { $lte: new Date((ISODate(fromDate)).getTime() + 1000 * 60 * 60 * 24) } }, { end: { $gte: ISODate(toDate) } }] }
                    ]
                }
            },
            { $sort: { start: 1 } },
            {
                $project: {
                    priceCat: {  // set to 1 if category is "Price"; 0 otherwise
                        $cond: [{ $eq: ["$category", "Price"] }, 1, 0]
                    },
                    stockCat: {  // set to 1 if category is "Stock"; 0 otherwise
                        $cond: [{ $eq: ["$category", "Stock"] }, 1, 0]
                    },
                    wantedCat: {  // set to 1 if category is "Wanted"; 0 otherwise
                        $cond: [{ $eq: ["$category", "Wanted"] }, 1, 0]
                    }
                }
            },
            {
                $group: {
                    _id: 'cards per category',
                    price: { $sum: "$priceCat" },
                    stock: { $sum: "$stockCat" },
                    wanted: { $sum: "$wantedCat" }
                }
            }
        ]).toArray(function (err, result) {
            if (err) {
                io.emit('error', JSON.stringify({ message: "Failed to get number of sorted cards in different categories in the given time period!" }));
                return next(err);
            }
            res.status(200).send({
                data: result, labels: ["Cards sorted by Price", "Cards sorted by Stock", "Cards sorted by Wanted value"]
            });
        });
    } catch (err) {
        io.emit('error', JSON.stringify({ message: "Failed to get number of sorted cards in different categories in the given time period!" }));
        next('Failed to get number of sorted cards in different categories in the given time period: ' + err);
    }
});

/**
 * gets all sorting data entries in the given time period and sends the category, the start and end time
 * and the time the machine was running for each entry via http response
 * @param req http request containing the start and end date of the requested time period in the query parameters
 */
app.get('/sortingData/categories', async (req, res, next) => {
    const { fromDate, toDate } = req.query;
    try {
        await sortingValuesCollection.aggregate([
            {
                $match: {
                    $or: [
                        // start time is in given time period
                        { start: { $lte: new Date((ISODate(toDate)).getTime() + 1000 * 60 * 60 * 24), $gte: ISODate(fromDate) } },
                        // end time is in given time period
                        { end: { $lte: new Date((ISODate(toDate)).getTime() + 1000 * 60 * 60 * 24), $gte: ISODate(fromDate) } },
                        // start time is before and end time after given time period
                        { $and: [{ start: { $lte: new Date((ISODate(fromDate)).getTime() + 1000 * 60 * 60 * 24) } }, { end: { $gte: ISODate(toDate) } }] }
                    ]
                }
            },
            { $sort: { start: 1 } },
            {
                $project: {
                    category: "$category",
                    start: "$start",
                    end: "$end",
                    Time: { $trunc: { $divide: [{ $subtract: ["$end", "$start"] }, 1000] } }
                }
            }
        ]).toArray(function (err, result) {
            if (err) {
                io.emit('error', JSON.stringify({ message: "Failed to get start and end time of all categories in the given time period!" }));
                return next(err);
            }
            res.status(200).send({ data: result, labels: ["Category", "Start time", "End time", "Duration"] });
        });
    } catch (err) {
        io.emit('error', JSON.stringify({ message: "Failed to get start and end time of all categories in the given time period!" }));
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


http.listen(process.env.PORT);
console.log(`Server listening on port ${process.env.PORT}`);
