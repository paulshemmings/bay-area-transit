var transit = transit || {};

transit.FullPageViewManager = $.extend({

	topTemplate : 'full-page-top-template',
	topContainer : undefined,
	currentPosition : undefined,
	mapLayer : undefined,
	dateLayer : undefined,
	navigationLayer : undefined,
	templateLayer : undefined,

	renderTopView : function(containerSelector) {
		return this.templateLayer.renderTemplate(this.topTemplate, containerSelector, {});	
	},		

	renderAgencies : function(agencyList) {
		this.templateLayer.renderTemplate('agency-template-block',  "#selector-container", agencyList);
	},	

	renderRoutes : function(routeList) {
		this.templateLayer.renderTemplate('agency-routes-template-block', "#selector-container", routeList);
		$('#stop-codes-container').empty();
		$('#agency-routes-container').show();
	},	

	renderStops : function(stopList) {

		// render the stops
		this.templateLayer.renderTemplate('stop-codes-template', '#selector-container', stopList);

		// no map? stop here.
		if(!this.mapLayer.hasMap()) {
			return;
		}

		// render the maps on the stop (should this be a different method entirely?)
		/*
		$.each(stopList.stops, $.proxy(function(index, value) {			
			var stopCode = value["$"]["StopCode"],
				stopDetails = transit.Cache.getStopDetails(stopCode),
				location = stopDetails ? stopDetails.location : undefined;

			if(location) {
				this.mapLayer.addMarker(location, index == 0);
			}
		}, this));
		*/
	},	

	renderDepartureTimes : function(times) {
		this.templateLayer.renderTemplate('depature-times-template-detailed', '#selector-container', times);
	},	

	renderMap : function() {
		if(!this.mapLayer.hasMap()) {
			this.mapLayer.renderMap("map-canvas", undefined);
			this.mapLayer.removeMarkers();	
		}
	},

	renderPosition : function(position, showOmMap) {
		this.currentPosition = position;		
		if(showOmMap) {
			if(this.mapLayer.hasMap()) {
				this.mapLayer.addMarker(position);
			} else {
				this.mapLayer.renderMap("map-canvas", this.currentPosition);	
			}
			$('#central-map-container').toggleClass('hidden', false);
		}
	},

	renderMarkerOnMap : function(position) {
		this.mapLayer.addMarker(position);
	},

	renderMarkerChange : function(markerCount) {
		// $('#central-map-container').toggle(markerCount != 0);
		// this.mapLayer.resizeMap();
	},

	clearAllStopsFromMap : function() {
		this.mapLayer.removeMarkers(false);
		this.mapLayer.addMarker(this.currentPosition);
	},

	renderWatchHint : function(watchedStop, absoluteTimes) { 

		if(watchedStop.journey) {
			departureTime = this.dateLayer.calculateDepartureTime(absoluteTimes.split(','), watchedStop.journey.duration.value);
		}

		this.templateLayer.renderTemplate('watched-route-template-detailed', '#selector-container', {
			arrivalTimes : absoluteTimes,
			departureTime : departureTime,
			stopCode : watchedStop.code,
			stopName : watchedStop.name,
			stopAddress : watchedStop.address || watchedStop.name,
			routeName : watchedStop.route.name,
			journeyDuration : watchedStop.journey.duration.text,
			journeyDistance : watchedStop.journey.distance.text
		});		
	},

	refreshHint : function() {
		transit.EventBus.fire(transit.EventBus.codes.WATCH_STOP, {
			absoluteTimes: 	$(this.viewModel.watchedRoute).attr('data-arrival-absolute-times'),
			routeName: 		$(this.viewModel.watchedRoute).data('arrival-route-name'),
			stopCode : 		$(this.viewModel.watchedRoute).data('stop-code')
		});
	},

	initListeners : function() {

		// SELECT AGENCY

		$(this.topContainer).on('click','.agency-selector', function(ev) {
			ev.preventDefault();

			transit.EventBus.fire(transit.EventBus.codes.AGENCY_SELECTED, {
				selectedAgency : $(this).data('agency-name')
			});			

		});


		// ROUTE_SELECTED (non-directional)

		$(this.topContainer).on('click', 'div.routeName', function() {

			var hasDirection = $('#agency-routes').attr('data-has-direction');
			if (hasDirection != 'False') {
			  return;
			}

			var request = {
			  agencyName : $('#agency-routes').attr('data-agency-name').toString(),
			  routeName : $(this).closest('.agencyRouteRow').attr('id').toString(),
			  routeCode : $(this).closest('.agencyRouteRow').attr('data-code').toString()
			};

			transit.EventBus.fire(transit.EventBus.codes.ROUTE_SELECTED, request);
		});   		

		// ROUTE_SELECTED (directional)

		  $(this.topContainer).on('click', 'li.routeDirection', function() {
		    
		    var request = {
		      agencyName : $('#agency-routes').attr('data-agency-name').toString(),
		      routeCode : $(this).closest('.agencyRouteRow').attr('data-code').toString(),
		      routeName : $(this).closest('.agencyRouteRow').attr('id').toString(),
		      routeDirectionCode : $(this).attr('data-code').toString(),
		      routeDirectionName : $(this).attr('id')
		    };

		    transit.EventBus.fire(transit.EventBus.codes.ROUTE_SELECTED, request);
		  });	

		// STOP SELECTED

		$(this.topContainer).on('click', '.stopName', function() {

			var self = transit.FullPageViewManager;
				stopElement = $(this).closest('.stopRow');

			// record this stop element in the view manager view model (for internal use)

			self.viewModel.setSelectedStop(stopElement);

			// tell the controller a stop has been selected 

			transit.EventBus.fire(transit.EventBus.codes.STOP_SELECTED, {
				stopCode : $(stopElement).data('stop-code'),
				stopName : $(stopElement).data('stop-name'),
				routeName : $(stopElement).data('route-name')
			});
		});	

		// WATCH THE ROUTE


		$(this.topContainer).on('click', '.arrival-times', function() { 

			var self = transit.FullPageViewManager;

			// record this element in the view manager view model (for internal use)

			self.viewModel.setWatchedRoute(this);

			// notify stop now watched

			transit.EventBus.fire(transit.EventBus.codes.WATCH_STOP, {
				absoluteTimes: 	$(self.viewModel.watchedRoute).attr('data-arrival-absolute-times'),
				routeName: 		$(self.viewModel.watchedRoute).data('arrival-route-name'),
				stopCode : 		$(self.viewModel.watchedRoute).data('stop-code')
			});

			// empty the markers on the map
			// self.mapLayer.removeMarkers(false);				

			// put this stop on the map

			transit.EventBus.fire(transit.EventBus.codes.PLACE_STOP_REQUESTED, {
				stopName : $(self.viewModel.selectedStop).data('stop-name'),
				stopCode : $(self.viewModel.watchedRoute).data('stop-code')
			});

			// put current location on map

			if(!self.currentPosition) {
				transit.EventBus.fire(transit.EventBus.codes.LOCATION_REQUESTED, {
					showOnMap : true
				});
			} else {				
				$('#central-map-container').toggleClass('hidden', false);
				self.mapLayer.resizeMap();
				self.mapLayer.addMarker(self.currentPosition);
			}
					
		});	

		$(this.topContainer).on('click', '#toggle-map-view', function() {
			var self = transit.FullPageViewManager;
			if(self.currentPosition) {
				self.mapLayer.toggleMap(self.currentPosition);
			}
		});

		$(this.topContainer).on('click', '#show-nearby-stops', function() {
			var self = transit.FullPageViewManager;

			transit.EventBus.fire(transit.EventBus.codes.NEARBY_STOPS_REQUESTED, {
				currentPosition : self.currentPosition,
				boundaries : self.mapLayer.getBounds(),
				filter : {
					agency : self.navigationLayer.getLocation.agency.code,
					route : self.navigationLayer.getLocation.route.code
				}
			});			
		});

		$(this.topContainer).on('click', '#clear-stops-on-map', function() {
			transit.EventBus.fire(transit.EventBus.codes.REMOVE_ALL_STOPS, {});			
		});		

		// REFRESH THE HINT

		$(this.topContainer).on('click', '.watched-hint-refresh', function() {

			var self = transit.FullPageViewManager,
				hint = $(this).closest('#selected-journey-container');

			transit.EventBus.fire(transit.EventBus.codes.WATCH_STOP, {
				absoluteTimes: 	$(self.viewModel.watchedRoute).attr('data-arrival-absolute-times'),
				routeName: 		$(self.viewModel.watchedRoute).data('arrival-route-name'),
				stopCode : 		$(self.viewModel.watchedRoute).data('stop-code')
			});

		});

		// LISTEN to any filter change

		transit.EventBus.listen(transit.EventBus.codes.RESULT_FILTER_CHANGED, this, function(data) {
			var rowSelector = data.filterTarget == 'route' ? '.agencyRouteRow' : '.stopRow';
			$(rowSelector).each(function(){
				var match = $(this).data('filter-text').toString().toLowerCase().match(data.filterText);
				if(match){
					$(this).show();
				}else{
					$(this).hide();
				}
			});  			  
		});

	},

	// Initialize the vew manager

	init: function(containerSelector) {
		
		this.mapLayer = transit.MapLayer;
		this.dateLayer = transit.DateLayer;
		this.navigationLayer = transit.NavigationLayer;
		this.templateLayer = transit.TemplateLayer;
		this.topContainer = containerSelector;

		this.renderTopView(containerSelector)
		.done($.proxy(function(){

			this.initListeners();
			this.templateLayer.init();
			this.navigationLayer.init(this.templateLayer);


			transit.EventBus.fire(transit.EventBus.codes.MAP_REQUESTED, {});
			transit.EventBus.fire(transit.EventBus.codes.AGENCY_LIST_REQUESTED, {});
			transit.EventBus.fire(transit.EventBus.codes.LOCATION_REQUESTED, {
				showOnMap : true
			});					
			
		},this));
	}


}, transit.BaseViewManager);