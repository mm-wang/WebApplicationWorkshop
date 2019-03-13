const express = require("express");
const path = require("path");
const chalk = require("chalk");
const bodyParser = require("body-parser");
const session = require('express-session');
const MongoStore = require("connect-mongo")(session);

module.exports = function(app, port) {
	//Static directories
	app.use(express.static(path.join(app.root, '../public')));
	app.use(express.static(path.join(app.root, '../node_modules/jquery')));
	app.use(express.static(path.join(app.root, '../node_modules/bootstrap')));
	app.use(express.static(path.join(app.root, '../node_modules/vue')));
	app.use(express.static(path.join(app.root, '../node_modules/vue-router')));
	app.use(express.static(path.join(app.root, '../node_modules/moment')));

	//Middleware to parse requests
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		limit: '500mb',
		extended: true
	}));

	//Middleware to use session
	//Middleware to use session
	let sessionData = {
		secret: process.env.SESSION_SECRET,
		resave: true,
		saveUninitialized: true
	};

	if (typeof(process.env.DATABASE_URI) !== "undefined") {
		sessionData.store = new MongoStore({
			url: process.env.DATABASE_URI,
			autoReconnect: true
		});
	}

	app.use(session(sessionData));

	// Redirect to HTTPS
	if (process.env.HTTPS === true || process.env.HTTPS == "true") {
		console.log(chalk.magenta('Using HTTPS'));
		app.use(function requireHTTPS(req, res, next) {
			// Insecure request?
			if (req.get('x-forwarded-proto') == 'http') {
				// Redirect to https://
				return res.redirect('https://' + req.get('host') + req.url);
			}
			next();
		});
	}

	// Redirect to HTTPS
	if (process.env.HTTPS === true || process.env.HTTPS == "true") {
		console.log(chalk.magenta('Using HTTPS'));
		app.use(function requireHTTPS(req, res, next) {
			// Insecure request?
			if (req.get('x-forwarded-proto') == 'http') {
				// Redirect to https://
				return res.redirect('https://' + req.get('host') + req.url);
			}
			next();
		});
	}

	//Use base URL + PORT
	app.set('port', port);
}
