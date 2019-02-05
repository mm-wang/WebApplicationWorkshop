const Promise = require('bluebird');
const chalk = require('chalk');
const mongoose = require('mongoose');

var db = mongoose.connection.openUri(process.env.DATABASE_URI, {
    // useMongoClient: true
    useNewUrlParser:true
});

mongoose.Promise = Promise;

let startDb = new Promise(function(resolve, reject){
    console.log(chalk.yellow("Connecting to MongoDB..."));
    db.on("open", function(){
        console.log(chalk.green("CONNECTED! MongoDB ready."))
        resolve(db);
    });
    db.on("error", function(err){
        console.log(chalk.bgRed(err));
        reject(err);
    });
    db.on("disconnected", function (){
        console.log(chalk.red("DISCONNECTED from MongoDB"));
    })
});

module.exports = startDb;
