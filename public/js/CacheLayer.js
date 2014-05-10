var transit = transit || {};

transit.CacheLayer = {

	/*
	 * Store
	 */

	Stops : {

	},

	/*
	 * Prototype
     */

	StopModel : {

		agency : {
			name : undefined,
			code : undefined
		},

		route : {
			name : undefined,
			code : undefined,
			direction : undefined
		},

		code : undefined,
		name : undefined,
		address : undefined,
		location : undefined,
		journey : undefined, 
		arrivaltTimes : undefined,
		departureTimes : undefined,
	},

	/*
	 * Factory 
	 */

	Factory : {
		// Create a new instance based on the Model prototype
		createStopModel : function(code) {
			var newObject = Object.create(transit.CacheLayer.StopModel);
			newObject.route = Object.create(transit.CacheLayer.StopModel.route);
			newObject.agency = Object.create(transit.CacheLayer.StopModel.agency);
			newObject.code = code;
			return newObject;
		},
		// retrieve the stored instance. If none exists, create and add to CacheLayer
		// if the stored instance created from serialized data, then extend to include
		// all properties originally in prototype. When serializing, any undefined 
		// property is excluded. This puts those back in the Model.
		retrieveStoredStopModel : function(code) {
			var stopModel =  undefined;
			if(!transit.CacheLayer.Stops[code]) {
				stopModel = transit.CacheLayer.Stops[code] = this.createStopModel(code);
			} else {
				stopModel = transit.CacheLayer.Stops[code];
			}			
			return stopModel;
		}		
	},

	convertLocation : function(source) {
		if(source == undefined) return;

		var index = 0,
			location = {};

		for(var properties in source) { 
			if(index == 0) {
				location.d = source[properties];
			} else if (index == 1) {
				location.e = source[properties];
			} else if (index > 1) {
				return location;
			} 
			++ index;
		}

		return location;
	},

	/* 
	 * Public method. Store the stop details. Store the details defined
	 * in the CacheLayer.
	 */

	storeStopDetails : function(stopCode, stopAttributes) {

		if(!stopAttributes || !stopCode) return;

		var stopModel =  this.Factory.retrieveStoredStopModel(stopCode);

		stopModel.name = stopAttributes.stopName || stopModel.name;
		stopModel.agency.name = stopAttributes.agencyName || stopModel.agency.name;
		stopModel.agency.code = stopAttributes.agencyCode || stopModel.agency.code;

		stopModel.route.name  = stopAttributes.routeName  || stopModel.route.name;
		stopModel.route.code  = stopAttributes.routeCode  || stopModel.route.code;
		stopModel.route.direction = stopAttributes.routeDirection || stopModel.route.direction;

		stopModel.address = stopAttributes.stopAddress || stopModel.address;
		stopModel.location = this.convertLocation(stopAttributes.stopLocation) || this.convertLocation(stopModel.location);
		stopModel.journey = stopAttributes.stopJourney || stopModel.journey;
		stopModel.arrivaltTimes = stopAttributes.stopArrivalTimes || stopModel.arrivaltTimes;
		stopModel.departureTimes = stopAttributes.stopDepartureTimes || stopModel.departureTimes;

		return stopModel;
	},

	/*
	 * Public method. Retrieve the CacheLayerd details for the stop
	 */

	getStopDetails : function(code) {
		return this.Stops[code];
	},

	getStopsInBoundaries : function(boundaries, agency, route) {
		return this.exportStopsToArray().filter(function(stop) {
			return 	stop.location.d > boundaries.minLat &&
					stop.location.d < boundaries.maxLat &&
					stop.location.e < boundaries.minLng &&
					stop.location.e > boundaries.maxLng &&
					stop.agency.code == (agency || stop.agency.code) &&
					stop.route.code == (route || stop.route.code)
 		});
	},

	exportStopsToArray : function () {
		var output = [];
		$.each( this.Stops , function(name, value){
			if(value.location) {
				output.push({ 
					code : value.code, 
					name : value.name,
					agency : value.agency,
					location : value.location,
				});
			}
		});
		return output;
	},

	stopsToString : function() {
		return JSON.stringify(this.exportStopsToArray());
	},

	loadStopsFromArray : function(array) {
		$.each(array, function() {
			transit.CacheLayer.storeStopDetails(this.code, {stopLocation : this.location});
		});
	}
}


