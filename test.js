const express = require('express');
const app = express();
const http = require('http').Server(app);

http.listen(5000, () => {
    console.log("Server is up!");
});

app.get('/testGet', (req, res) => {
    res.end();
});

app.post('/testPost', (req, res) => {
    res.end();
});

app.put('/testPut', (req, res) => {
    res.end();
});

app.delete('/testDelete', (req, res) => {
    res.end();
});