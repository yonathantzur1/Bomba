const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);

app.enable('trust proxy');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

http.listen(5000, () => {
    console.log("Server is up!");
});

app.get('/testGet', (req, res) => {
    setTimeout(() => {
        if (req.query.success == "true") {
            console.log("get - success");
            res.end();
        }
        else {
            console.log("get - error");
            res.status(500).send("error");
        }
    }, req.query.time);
});

app.post('/testPost', (req, res) => {
    setTimeout(() => {
        if (req.body.success == "true" || req.body.success == true) {
            console.log("post - success");
            res.send("success");
        }
        else {
            console.log("post - error");
            res.status(500).send("error");
        }
    }, req.body.time);
});

app.put('/testPut', (req, res) => {
    setTimeout(() => {
        if (req.body.success == "true" || req.body.success == true) {
            console.log("put - success");
            res.send("success");
        }
        else {
            console.log("put - error");
            res.status(500).send("error");
        }
    }, req.body.time);
});

app.delete('/testDelete', (req, res) => {
    setTimeout(() => {
        if (req.query.success == "true") {
            console.log("delete - success");
            res.send("success");
        }
        else {
            console.log("delete - error");
            res.status(500).send("error");
        }
    }, req.query.time);
});

app.get('/randomGet', (req, res) => {
    setTimeout(() => {
        if (Math.floor(Math.random() * 2)) {
            console.log("random get - success");
            res.send("success");
        }
        else {
            console.log("random get - error");
            res.status(500).send("error");
        }
    }, req.query.time);
});

app.post('/randomPost', (req, res) => {
    setTimeout(() => {
        if (Math.floor(Math.random() * 2)) {
            console.log("random post - success");
            res.send("success");
        }
        else {
            console.log("random post - error");
            res.status(500).send("error");
        }
    }, req.query.time);
});

app.put('/randomPut', (req, res) => {
    setTimeout(() => {
        if (Math.floor(Math.random() * 2)) {
            console.log("random put - success");
            res.send("success");
        }
        else {
            console.log("random put - error");
            res.status(500).send("error");
        }
    }, req.query.time);
});

app.delete('/randomDelete', (req, res) => {
    setTimeout(() => {
        if (Math.floor(Math.random() * 2)) {
            console.log("random delete - success");
            res.send("success");
        }
        else {
            console.log("random delete - error");
            res.status(500).send("error");
        }
    }, req.query.time);
});