/* global require,module,console */

var FeedParser = require('feedparser');
var request = require('request');

function aggregate(url, cb) {
	console.log('Doing '+url);

	var req = request(url), feedparser = new FeedParser();
	var content = "";

	req.on('error', function (error) {
	});

	req.on('response', function (res) {
	  var stream = this;
		console.log(res.statusCode);
	  
	  if (res.statusCode != 200) {
		  cb({error:"Failed to parse the URL. Does it exist?"});
		  return;
	  }
	  stream.pipe(feedparser);
	});

	feedparser.on('error', function(error) {
		//console.log('[FEED ERROR] URL ['+url+']',error);
		cb({error:"URL was not a valid RSS feed."});
		return;
		// always handle errors
	});
	feedparser.on('readable', function() {
		// This is where the action is!
		var stream = this, meta = this.meta, item;

		while (item = stream.read()) {
			content += " " + item.description;
		}

	});
	feedparser.on('end', function() {
		console.log('done');
		cb(null,content);
	});
			
}

var RSSParser = {
	parse:function(url,cb) {
		aggregate(url, cb);
	}
};

module.exports = RSSParser;