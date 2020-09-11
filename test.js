const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);

app.enable('trust proxy');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

http.listen(5000, () => {
    console.log("test is up!");
});

app.get('/testGet', (req, res) => {
    setTimeout(() => {
        if (req.query.success == "true") {
            res.end();
        }
        else {
            res.sendStatus(500);
        }
    }, req.query.time);
});

app.post('/testPost', (req, res) => {
    setTimeout(() => {
        if (req.body.success == "true" || req.body.success == true) {
            res.send({ "success": true });
        }
        else {
            res.status(500).send({ "success": false });
        }
    }, req.body.time);
});

app.put('/testPut', (req, res) => {
    setTimeout(() => {
        if (req.body.success == "true" || req.body.success == true) {
            res.send("success");
        }
        else {
            res.status(500).send("error");
        }
    }, req.body.time);
});

app.delete('/testDelete', (req, res) => {
    setTimeout(() => {
        if (req.query.success == "true") {
            res.send(true);
        }
        else {
            res.status(500).send(false);
        }
    }, req.query.time);
});

app.get('/randomGet', (req, res) => {
    setTimeout(() => {
        if (Math.floor(Math.random() * 2)) {
            res.send("success");
        }
        else {
            res.status(500).send("error");
        }
    }, req.query.time);
});

app.post('/randomPost', (req, res) => {
    setTimeout(() => {
        if (Math.floor(Math.random() * 2)) {
            res.send("success");
        }
        else {
            res.status(500).send("error");
        }
    }, req.body.time);
});

app.put('/randomPut', (req, res) => {
    setTimeout(() => {
        if (Math.floor(Math.random() * 2)) {
            res.send("success");
        }
        else {
            res.status(500).send("error");
        }
    }, req.body.time);
});

app.delete('/randomDelete', (req, res) => {
    setTimeout(() => {
        if (Math.floor(Math.random() * 2)) {
            res.send("success");
        }
        else {
            res.status(500).send("error");
        }
    }, req.query.time);
});