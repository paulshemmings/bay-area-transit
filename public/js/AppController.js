/*
require (["ServiceLayer"])
require (["locationLayer"])
require (["eventLayer"])
require (["dateLayer"])
require (["historyLayer"])
require (["cacheLayer"])
*/

var transit = transit || {};

transit.AppController = {

	viewManager : undefined,
	serviceLayer : undefined,
	locationLayer : undefined,
	eventLayer : undefined,
	dateLayer : undefined,
	historyLayer : undefined,
	cacheLayer : undefined,

	displayStopRouteDetails : function(stopCode, routeName, absoluteTimes) {	

		var self = this;

		// update the departure times for this stop

		self.serviceLayer.getNextDepartureTimes(stopCode, routeName, function(times) {  

			// render the new times

			self.viewManager.renderDepartureTimes(times);

			// get the times relevant to this route
			var newAbsoluteTimes = $.map(times.routes, function(m) {
				if(m.routeName == routeName) return m;
			})[0].absoluteTimes;

			// get the full stop model. we've already selected this
			// stop once, so we have all the details in the cacheLayer
			// is this cheating?

			var stopDetails = self.cacheLayer.getStopDetails(stopCode);

			// render (get distance first if not got it)

			if (stopDetails.journey) {
				// render the hint
				self.viewManager.renderWatchHint(stopDetails, newAbsoluteTimes);			
			} else {
				self.locationLayer.getDistanceTo(stopDetails.location, function(journey) {
					// store in cacheLayer
					self.cacheLayer.storeStopDetails(stopCode, { 
						stopJourney : journey
					});
					// get details again(!)
					stopDetails = self.cacheLayer.getStopDetails(stopCode);
					// now render the hint
					self.viewManager.renderWatchHint(stopDetails, newAbsoluteTimes);				
				});  		

			}			

		});		
		
	},

	displayAgencies : function() {
		// this.viewManager.toggleLoading("#selector-container", true);
		this.serviceLayer.getAgencies(function(agencies) {
			transit.AppController.viewManager.renderAgencies(agencies);
		});		
	},

	displayRoutes : function(agency) {
		this.serviceLayer.getRoutesForAgency(agency, function(routeList) {
			transit.AppController.viewManager.renderRoutes(routeList);
		});						
	},

	displayStops : function(request) {
		var self = this;
		this.serviceLayer.getStopsForRoute(request, function(stopList) {

			// render the stops on the page
			transit.AppController.viewManager.renderStops(stopList);

			// go through stops 

			$.each(stopList.stops, function() {
				
				var stopCode = this["StopCode"],
					stopName = this["name"],
					stopLocation = this["location"],
					storedStop = self.cacheLayer.getStopDetails(stopCode);

				// store in cacheLayer

				self.cacheLayer.storeStopDetails (stopCode, {
					stopName : stopName, 
					agencyName : stopList.agencyName,
					routeName : stopList.routeName,
					routeDirection : stopList.directionName,
					stopLocation : stopLocation
				});				

				// stop now if we have location already

				if (stopLocation || (storedStop && storedStop.location)) return;

				// geocode the stop for later use (for now)

				self.locationLayer.geocodeAdress(stopName, function(address) {
					// store in cacheLayer
					self.cacheLayer.storeStopDetails(stopCode, { 
						stopAddress : address.formatted_address, 
						stopLocation : address.geometry.location
					});
				});

			});

		});
	},

	displayStopOnMap : function(request) {

		// retrieve cacheLayer if exists
		var stop = this.cacheLayer.getStopDetails(request.stopCode) || {};
		if(stop.location) {
			this.viewManager.renderMarkerOnMap(stop.location);      
			return;
		}

		var self = this;

		// get the location
		self.locationLayer.geocodeAdress(request.stopName, function(address) {
			// store in cacheLayer
			self.cacheLayer.storeStopDetails(request.stopCode, { 
				stopAddress : address.formatted_address, 
				stopLocation : address.geometry.location
			});
			// show on map
			self.viewManager.renderMarkerOnMap(address.geometry.location);
		});

	},

	mapMarkerCountChanged : function(markerCount) {
		this.viewManager.renderMarkerChange(markerCount);
	},

	displayNextDepartureTimes : function(stopCode, routeName) {
		this.serviceLayer.getNextDepartureTimes(stopCode, routeName, function(times) {  
			transit.AppController.viewManager.renderDepartureTimes(times);
		});
	},

	displayMap : function() {
		var self = this;
		self.viewManager.renderMap();
	},

	retrievePosition : function(showOnMap) {
		var self = this;
		self.locationLayer.getLocation()
			.done(function(position){
				self.viewManager.renderPosition(position, showOnMap);	
			})
			.fail(function(){
				self.viewManager.renderMap();
			});
	},

	retrieveNearbyStops : function(data){
		var self = this,
			stops = this.cacheLayer.getStopsInBoundaries(data.boundaries, data.filter.agency, data.filter.route);

		$.each(stops, function(stop) {
			self.displayStopOnMap({stopCode : stops[stop].code});
		});

		console.log(stops.length);
	},

	clearAllStopsFromMap : function() {
		this.viewManager.clearAllStopsFromMap();
	},

	initListeners: function() {

		// Agency list requested 

		this.eventLayer.listen(this.eventLayer.codes.AGENCY_LIST_REQUESTED, this, function(data) {
			this.displayAgencies();
		});

		// Map Requested

		this.eventLayer.listen(this.eventLayer.codes.MAP_REQUESTED, this, function(data) {
			this.displayMap(data);
		});

		// Agency Selected

		this.eventLayer.listen(this.eventLayer.codes.AGENCY_SELECTED, this, function(data) {
			this.displayRoutes(data.selectedAgency);
		});

		// Route Selected

		this.eventLayer.listen(this.eventLayer.codes.ROUTE_SELECTED, this, function(request) {
			this.displayStops({
				agencyName : request.agencyName,
				routeCode : request.routeCode,
				routeName : request.routeName,
				routeDirectionCode : request.routeDirectionCode,
				routeDirectionName : request.routeDirectionName
		    });			
		});		

		// Stop Selected

		this.eventLayer.listen(this.eventLayer.codes.STOP_SELECTED, this, function(request) {
			this.displayNextDepartureTimes(request.stopCode, request.routeName);		
		});

		this.eventLayer.listen(this.eventLayer.codes.PLACE_STOP_REQUESTED, this, function(request) {
			this.displayStopOnMap({
				stopName: request.stopName,
				stopCode : request.stopCode
			});
		});

		// Stop Arrival times selected for watching

		this.eventLayer.listen(this.eventLayer.codes.WATCH_STOP, this, function(request) {
			this.displayStopRouteDetails(request.stopCode, request.routeName, request.absoluteTimes);		
		});

		// Location requested

		this.eventLayer.listen(this.eventLayer.codes.LOCATION_REQUESTED, this, function(request) {
			this.retrievePosition(request.showOnMap || false);
		});

		this.eventLayer.listen(this.eventLayer.codes.MAP_MARKER_CHANGED, this, function(request) {
			this.mapMarkerCountChanged(request.markerCount);
		});

		this.eventLayer.listen(transit.EventBus.codes.NEARBY_STOPS_REQUESTED, this, function(request){
			this.retrieveNearbyStops({
				currentPosition : request.currentPosition,
				boundaries : request.boundaries
			});
		});	

		this.eventLayer.listen(transit.EventBus.codes.REMOVE_ALL_STOPS, this, function(request) {
			this.clearAllStopsFromMap();
		});	




	},

	URL_Mapping : {
		"agency" : {
			method : function(){ return transit.AppController.displayRoutes; },
			arguments : function(vars) { return vars["agency"]; }
		},
		"stop" : {
			method : function(){ return transit.AppController.displayNextDepartureTimes; },
			arguments : function(vars) { return vars["code"]; }
		}
	},

	init: function(pageContainer, viewManager) {
		// initialize layers
		this.viewManager = viewManager;
		this.serviceLayer = transit.ServiceLayer;
		this.locationLayer = transit.LocationLayer;
		this.eventLayer = transit.EventBus;		
		this.dateLayer = transit.DateLayer;
		this.historyLayer = transit.HistoryLayer;
		this.cacheLayer = transit.CacheLayer;
		// initialize own listeners
		this.initListeners();
		// initialize the view
		this.viewManager.init(pageContainer);
		// load the stop cacheLayer
		this.serviceLayer.getLocationCache(function(data) {
			transit.AppController.cacheLayer.loadStopsFromArray(data);
		});
		// determine where to start
		/*
	    var queryVars = this.historyLayer.getQuery();
	    if(queryVars.length >0) {
	      var mapping = this.URL_Mapping[queryVars[0]];
	      if(mapping) {
	        return mapping.method().call(this, mapping.arguments(queryVars));
	      }
	    } 
	    */		
	}
};