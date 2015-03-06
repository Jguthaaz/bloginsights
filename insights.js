var https = require('https');
var querystring = require('querystring');
var url = require('url');

var apiUsername;
var apiPassword;
var apiUrl;
var apiHost;
var apiPath;

function setAuth(apiurl, u, p) {
	apiUrl = apiurl;
	apiUsername=u;
	apiPassword=p;
	var parts = url.parse(apiUrl);
	apiHost = parts.host;
	apiPath = parts.pathname;
}

function sendInsights(user,source,input,cb) {
	//cb(fake);return;
	var data = {"contentItems":[]};
	var item = {};
	item.userid = user;
	item.sourceid = source;
	this.id = this.userid + '_'+this.sourceid;
	item.contenttype = "text/plain";
	//todo - remove html from input. the service does it, but we can do it ourselves
	item.language = "en";
	item.content = input;
	
	data.contentItems.push(item);
	
	var postData = JSON.stringify(data);
	
	
	var options = {
		host: apiHost,
		port: 443, 
		path: apiPath + "/v2/profile",
		headers: {
			'Authorization': 'Basic ' + new Buffer(apiUsername + ':' + apiPassword).toString('base64'),
			'Content-Type':'application/json',
			'Content-Length': Buffer.byteLength(postData)
		},
		method:"post"
	};
	console.log(options);
	var req = https.request(options, function(resp) {
		var body = "";
		resp.on("data", function(chunk) {
			body += chunk;
		});
		
		resp.on("end", function() {
			//console.log("done");console.log(body);
			cb(JSON.parse(body));
		});
		
	});
	req.write(postData);
	req.end();
	
};

var InsightAPI = {
	setAuth:setAuth,
	parse:sendInsights
};

module.exports = InsightAPI;