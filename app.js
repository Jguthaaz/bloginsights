/*jshint node:false */
/* global console,require */
var express = require('express');
var hbs = require('hbs');
var url = require('url');

hbs.registerHelper('raw-helper', function(options) {
  return options.fn();
});

var rssReader = require('./rssreader.js');
var insightsAPI = require('./insights.js');

// setup middleware
var app = express();
app.use(app.router);
app.use(express.errorHandler());
app.use(express.static(__dirname + '/public')); //setup static public directory
app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.set('views', __dirname + '/views'); //optional since express defaults to CWD/views

// render index page
app.get('/', function(req, res){
	res.render('index');
});

app.get('/parse', function(req, res) {
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	if(!query.rss) {
		res.json({error:"Invalid data sent."});
		return;
	}
	rssReader.parse(query.rss, function(err,content) {
		if(err) {
			res.json(err);
		} else {
			console.log('bak with content, len is '+content.length);
			insightsAPI.parse(query.rss, query.rss, content, function(data) {
				console.log('back from IAPI');
				//console.log(JSON.stringify(data));
				res.json(data);	
			});
		}
	});
});

// There are many useful environment variables available in process.env.
// VCAP_APPLICATION contains useful information about a deployed application.
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
// TODO: Get application information and use it in your app.

// VCAP_SERVICES contains all the credentials of services bound to
// this application. For details of its content, please refer to
// the document or sample of each service.
if(process.env.VCAP_SERVICES) {
	var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
	console.log(services);
	var apiUrl = services.personality_insights[0].credentials.url;
	var apiUsername = services.personality_insights[0].credentials.username;
	var apiPassword = services.personality_insights[0].credentials.password;
} else {
	//todo - read from local file
	var apiUrl = "wontwork till i fix the code to read credentials.json";
	var apiUsername = "";
	var apiPassword = "";
}
insightsAPI.setAuth(apiUrl, apiUsername, apiPassword);
					
// The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');
// The port on the DEA for communication with the application:
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
app.listen(port, host);
console.log('App started on port ' + port);

