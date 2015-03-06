var template;


$(document).ready(function() {
	var $rss = $("#rss");
	var $status = $("#status");
	
	var source   = $("#reportTemplate").html();
	template = Handlebars.compile(source);

	Handlebars.registerHelper('perc', function(context,options) {
		return (context*100).toFixed(2)+'%';
	});

	$("#rssForm").on("submit", function(e) {
		e.preventDefault();
		var rss = $.trim($rss.val());
		if(rss === '') return;
		$rss.prop("disabled", true);
		$status.html("<i>Processing - doing lots of REALLY important stuff!!1!</i>");
		$.getJSON('/parse', {rss:rss}, function(res) {
			console.log('resp from server');
			console.dir(res);
			$rss.prop("disabled", false);
			if(res.error) {
				$status.html("<strong>Error:</strong> "+res.error);
			} else { 
				var report = generateReport(res.tree);
				$status.html(report);
			}
		});
	});
});

function generateReport(data) {

	var s = "";
	
	//lets start with values
	var valueData = data.children[2].children[0].children;
	valueData.sort(function(a, b) {
		return b.percentage - a.percentage;
	});
	
	var needData = data.children[1].children[0].children;
	needData.sort(function(a, b) {
		return b.percentage - a.percentage;
	});

	var big5Data = data.children[0].children[0].children;
	//this sorts the top level
	big5Data.sort(function(a, b) {
		return b.percentage - a.percentage;		
	});
	//now sort the babies
	for(var i=0, len=big5Data.length; i<len; i++) {
		big5Data[i].children.sort(function(a, b) {
			return b.percentage - a.percentage;		
		});		
	}
	console.dir(big5Data);
	
	var templateData = {};
	templateData.values = valueData;
	templateData.needs = needData;
	templateData.big5 = big5Data;
	
	s = template(templateData);
	return s;
}