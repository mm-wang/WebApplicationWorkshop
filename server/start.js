#!/usr/bin/env node

const Promise = require("bluebird");

const dotenv = require("dotenv");
const chalk = require("chalk");

const express = require("express");
const http = require("http");
const path = require("path");

require('rootpath')();

/*
ENVIRONMENT VARIABLES
*/
dotenv.config({
    path: ".env"
});
console.log(chalk.yellow("Environment variables loaded"));
const port = process.env.PORT || 1234;

let connectDb;

//Create application
let createApp = () => {
    return new Promise(function(resolve) {
        //Instantiate an application using express
        const app = express();

        var serverRoot = path.join(__dirname, '.');
        app.root = serverRoot;

        //Configure application
        require("./app/_app")(app, port);
        const router = require("./app/routes/_routes");
        app.use('/', router);

        resolve(app);
    });
}

//Configure the server
let startServer = (app) => {
    const server = http.createServer(app);
    server.listen(port);
    server.on("error", function(err) {
        console.log(chalk.bgRed("SERVER ERROR: ", chalk.black(err.syscall)));
        if (err.code == "EADDRINUSE") {
            console.log(chalk.red("Port " + port + " is already in use"));
            process.exit(1);
        }
    });
    server.on("listening", function(err) {
        if (!err) console.log(chalk.bgGreen("SERVER LISTENING ON: ", chalk.black(port)));
        else console.log(chalk.red("SERVER ERROR: ", err));
    });
}
if (typeof(process.env.DATABASE_URI) !== "undefined") {
    connectDb = require("./db/_db");
    connectDb.then(createApp).then(startServer);
}
else createApp().then(startServer);
