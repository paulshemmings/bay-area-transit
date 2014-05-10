var TransitPublic = {

	transitService : require('../transit/transitService'),
	dateHelper : require('../helpers/DateHelper'),
	xml2js : require('xml2js'),
	locationCache : require('../transit/locationCache'),
	parseString : require('xml2js').parseString,
	util : require('util'),
	extensions : require('../helpers/Extensions'),


	parseResponse : function(xml, callback) {
		var self = this;
		self.parseString(xml, function(err, json) {
			self.parseJsonResponse(json, function(response) {
				callback(err, response);
			});
		});
	},

	parseJsonResponse : function (json, callback) {
		var self = this,
			response = {};
		// self.util.puts(JSON.stringify(json));			
		function addChildren(destination, source) {
			if(source == undefined) return;
			for(var property in source) {			
				if (Array.isArray(source[property])) {
					destination[property] = [];
					for(var index = 0; index < source[property].length; index++) {
						if (typeof(source[property][index]) == 'string') {
							destination[property].push(source[property][index]);
						} else {
							var newElement = {};
							addChildren(newElement, source[property][index]);	
							destination[property].push(newElement);							
						}
					}				
				} else if (typeof(source[property]) == 'object') {
					if(property == "$") {
						addChildren(destination, source[property]);
					} else {
						destination[property] = {};
						addChildren(destination[property], source[property]);					
					}
					
				} else {
					destination[property] = source[property];
				}				
			}
		}
		addChildren(response, json);
		// self.util.puts(JSON.stringify(response));
		callback(response);
	},


	getAgencies : function(req, res, path, content) {
		var self = this;
		self.transitService.getAgencies(content, function(response) {
			self.parseResponse(response, function (err, data) {
				var agencyList = {
					agencies : data.RTT.AgencyList[0].Agency
				}; 

				res.writeHead(200, {
					'Content-Type': 'application/json'
				});			
				
				res.end(JSON.stringify(agencyList));		
			});			
		});
	},	

	getRoutesForAgency : function(req, res, path, content) {		
		var self = this;
		self.transitService.getRoutesForAgency(content, function(response) {
			self.parseResponse(response, function (err, data) {

	            var routeList = {
	              agencyName : data.RTT.AgencyList[0].Agency[0].Name,
	              hasDirection : data.RTT.AgencyList[0].Agency[0].HasDirection,
	              routes : data.RTT.AgencyList[0].Agency[0].RouteList[0].Route
	            };		

				res.writeHead(200, {
					'Content-Type': 'application/json'
				});			

				res.end(JSON.stringify(routeList));
			});		
		});
	},

	// GetStopsForRoute

	getStopsForRoute : function(req, res, path, content) {
		var self = this;
		self.transitService.getStopsForRoute(content, function(response) {
			self.parseResponse(response, function (err, data) {

		        var stopList = {
		          agencyName : data.RTT.AgencyList[0].Agency[0].Name,
		          routeName : data.RTT.AgencyList[0].Agency[0].RouteList[0].Route[0].Name
		      	};

		      	if (data.RTT.AgencyList[0].Agency[0].RouteList[0].Route[0].RouteDirectionList) {
		          stopList.stops = data.RTT.AgencyList[0].Agency[0].RouteList[0].Route[0].RouteDirectionList[0].RouteDirection[0].StopList[0].Stop
		        }

		        if (data.RTT.AgencyList[0].Agency[0].RouteList[0].Route[0].StopList) {
				  stopList.stops = data.RTT.AgencyList[0].Agency[0].RouteList[0].Route[0].StopList[0].Stop
		        }

		        if(stopList.stops && stopList.stops.length > 0) {
		        	for(var i = 0; i < stopList.stops.length; i++) {
		        		var stopLocation = self.locationCache.getLocationByCode(stopList.stops[i]['StopCode']);
		        		if(stopLocation) {
		        			stopList.stops[i]['location'] = stopLocation.location;
		        		}
					}
		        }

				res.writeHead(200, {
					'Content-Type': 'application/json'
				});		

				res.end(JSON.stringify(stopList));
			});		
		});				
	},

	// GetNextDeparturesByStopCode

	getNextDeparturesByStopCode : function(req, res, path, content) {
		var self = this;
		self.transitService.getNextDeparturesByStopCode(content, function(response) {
			self.parseResponse(response, function (err, data) {

		        var params = JSON.parse(content),
		        	departureTimes = {
		        	routeCount : data.RTT.AgencyList[0].Agency[0].RouteList[0].Route.length,
		        	routes : [] 
		        };

		        data.RTT.AgencyList[0].Agency[0].RouteList[0].Route.forEach(function(route){			

		        	var times = [];
		        	if (route.RouteDirectionList){
		        		if (route.RouteDirectionList[0].RouteDirection[0].StopList[0].Stop[0].DepartureTimeList != "") {
		        			times = route.RouteDirectionList[0].RouteDirection[0].StopList[0].Stop[0].DepartureTimeList[0].DepartureTime;
						}
		        	} else if (data.RTT.AgencyList[0].Agency[0].RouteList[0].Route[0].StopList) {
		        		if (route.StopList[0].Stop[0].DepartureTimeList != "") {
		        			times = route.StopList[0].Stop[0].DepartureTimeList[0].DepartureTime;
						}
		        	}

		        	if (times.length > 0) {
						departureTimes.routes.push({
							routeName : route.Name,
							selectedRouteName : params.selectedRouteName,
							selected : route.Name.indexOf(params.selectedRouteName) > -1,
							stopCode : params.stopCode,
							arrivalTimes : times.join(','),
							absoluteTimes : self.dateHelper.buildAbsoluteTimes(times).join(',')
		        		});	        	
					} else {
						departureTimes.routes.push({
							routeName : route.Name,
							stopCode : params.stopCode,
							arrivalTimes : ''
		        		});					
					}

				});

				res.writeHead(200, {
					'Content-Type': 'application/json'
				});		

				res.end(JSON.stringify(departureTimes));
			});		
		});	
	},

	export : function() {
		exports.getAgencies = this.extensions.bind(this.getAgencies, this);
		exports.getRoutesForAgency = this.extensions.bind(this.getRoutesForAgency, this);
		exports.getStopsForRoute = this.extensions.bind(this.getStopsForRoute, this);
		exports.getNextDeparturesByStopCode = this.extensions.bind(this.getNextDeparturesByStopCode, this);
	}
}

TransitPublic.export();