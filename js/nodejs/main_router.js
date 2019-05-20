var express = require('express');
var router = express.Router();
var fs = require('fs');
var bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/", function(req, res) {
    fs.readFile("main.html", "utf-8", function(error, data) {
        res.end(data);
    });
});

module.exports = router;