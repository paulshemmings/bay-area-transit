var locationCache = require('../transit/locationCache');

exports.getLocationCache = function(req, res, path, content) {
	var locations = locationCache.getLocations();
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});				
	res.end(JSON.stringify(locations));	
}
