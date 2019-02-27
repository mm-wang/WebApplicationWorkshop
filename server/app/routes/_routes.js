const express = require("express");
const router = express.Router();
const path = require("path");

module.exports = router;

let viewsPath = path.join(__dirname, "..", "views/");

router.use("/api", require("server/app/routes/api/_api"));

router.get("/*", function(req, res) {
    res.sendFile(viewsPath + "index.html");
});
