const express = require("express");
const router = express.Router();
const path = require("path");

module.exports = router;

let viewsPath = path.join(__dirname, "..", "views/");

router.get("/*", function(req, res) {
    res.sendFile(viewsPath + "index.html");
});
