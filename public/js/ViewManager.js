var transit = transit || {};

transit.ViewManager = $.extend({

	topTemplate : 'all-in-one-top',
	container: undefined,
	agencySelector : "#agency",
	mapLayer : undefined,
	dateLayer : undefined,

	// set up method to update departure hint

	hintTimerThread : undefined,
	hintTimerCount : 0,

	renderTopView : function(containerSelector) {
		this.renderTemplate(this.topTemplate, containerSelector, {});	
	},	


	renderWatchHint : function(watchedStop, arrivaltTimes) {  

		var departureTime = '';

		// determine the jouurney time to use (do this hear or in the controller?)
		
		var journey = {
			distance : {
				text : watchedStop.journey ? watchedStop.journey.distance.text : 'unknown distance',
				value : watchedStop.journey ? watchedStop.journey.distance.value : 'unknown km'	
			},
			duration : {
				value : watchedStop.journey ? (watchedStop.journey.duration.value / 60) : "10",
				text  : watchedStop.journey ? watchedStop.journey.duration.text : "10 mins"
			}
		};		

		// do we have an accurate distance for this route?

		var watchedRouteTemplate = 'watched-route-template';
		if(watchedStop.journey) {
			watchedRouteTemplate += '-detailed';
			departureTime = this.dateLayer.calculateDepartureTime(arrivaltTimes.split(','), watchedStop.journey.duration.value);
		}

		// render the watcher view (the ONLY part that should be in the view manager!!)

		this.renderTemplate(watchedRouteTemplate, "#watched-route-container", {
			departureTime : departureTime,
			stopName : watchedStop.name,
			stopAddress : watchedStop.address || watchedStop.name,
			routeName : watchedStop.route.name,
			journeyDuration : journey.duration.text,
			journeyDistance : journey.distance.text
		});

		// toggle timer to reload the hint

		this.toggleHintTimer();

		// fire off an event requesting an update for that stop
		/*
		transit.EventBus.fire(transit.EventBus.codes.STOP_SELECTED, {
			stopCode : $(this.viewModel.selectedStop.element).data('stop-code'),
			stopName : $(this.viewModel.selectedStop.element).data('stop-name')
		});
		*/
	},     

	updateDepartureHint : function () {
		self = transit.ViewManager;
		transit.EventBus.fire(transit.EventBus.codes.WATCH_STOP, {
			arrivaltTimes: 	$(self.viewModel.watchedRoute).attr('data-arrival-absolute-times'),
			stopCode : 		$(self.viewModel.selectedStop).data('stop-code')
		});		
	},

	toggleHintTimer : function() {
		if (this.viewModel.watchedRoute) {      
		  if(this.hintTimerThread == undefined) {
		    this.hintTimerThread = window.setInterval(this.updateDepartureHint, 10000);        
		  }
		} else {
		  if(this.hintTimerThread) {
		    window.clearInterval(this.hintTimerThread);
		    this.hintTimerThread = undefined;
		  }
		} 
	},

	// render the page 	

	renderAgencies : function(agencyList) {
		this.renderTemplate('agency-template-min', "#agency-container", agencyList);

		transit.EventBus.fire(transit.EventBus.codes.MAP_REQUESTED, {
		});
	},

	renderRoutes : function(routeList) {
		this.renderTemplate('agency-routes-template', "#agency-routes-container", routeList);
		$('#stop-codes-container').empty();
		$('#agency-routes-container').show();
	},

	renderStops : function(stopList) {
		this.renderTemplate('stop-codes-template', '#stop-codes-container', stopList);
		$('#agency-routes-container').hide();		
	},

	renderDepartureTimes : function(times) {
		var container = this.viewModel.selectedStop.find('.nextStop')[0];
		this.renderTemplate('depature-times-template', container, times);
		$('#show-full-route-list-anchor').toggle(true);
		$('#stop-filter').toggle(false);
	},

	renderMapContainer : function() {
		this.renderTemplate('central-map-template', "#central-map-container", {});
	},

	renderMap : function(position) {
		this.mapLayer.renderMap("map-canvas", position);
	},

	renderMarkerOnMap : function(position) {
		this.mapLayer.addMarker(position);
	},

	// Handle UI events

	initListeners : function() {

  		// AGENCY_SELECTED

		$('#agency-container').on('click', '.agency-selection', function() {

			var agency = $(this).data('agency');

			$('.selectedAgency').each(function(){
				$(this).removeClass('selectedAgency');
			})
			$(this).addClass('selectedAgency');

			transit.EventBus.fire(transit.EventBus.codes.AGENCY_SELECTED, {
				selectedAgency : agency
			});

		});		

		// ROUTE_SELECTED (non-directional)

		$('#agency-routes-container').on('click', 'td.routeName', function() {

			var hasDirection = $(this).closest('table').attr('data-has-direction');
			if (hasDirection != 'False') {
			  return;
			}

			var request = {
			  agencyName : $(this).closest('table').attr('data-agency-name').toString(),
			  routeName : $(this).closest('tr').attr('id').toString(),
			  routeCode : $(this).closest('tr').attr('data-code').toString()
			};

			transit.EventBus.fire(transit.EventBus.codes.ROUTE_SELECTED, request);
		});   		

		// ROUTE_SELECTED (directional)

		  $('#agency-routes-container').on('click', 'li.routeDirection', function() {
		    
		    var request = {
		      agencyName : $(this).closest('table').attr('data-agency-name').toString(),
		      routeCode : $(this).closest('tr').attr('data-code').toString(),
		      routeName : $(this).closest('tr').attr('id').toString(),
		      routeDirectionCode : $(this).attr('data-code').toString(),
		      routeDirectionName : $(this).attr('id')
		    };

		    transit.EventBus.fire(transit.EventBus.codes.ROUTE_SELECTED, request);
		  });		


		// STOP SELECTED

		$('#stop-codes-container').on('click', '.stopName', function() {

			var self = transit.ViewManager,
				stopElement = $(this).closest('.stopRow');

			if ($('.nextStop',stopElement).html().trim() != '') {
				$('.nextStop',stopElement).html('updating');
			} else {
				$('.nextStop',stopElement).html('loading');
			}

			// record this stop element in the view manager view model (for internal use)

			self.viewModel.setSelectedStop(stopElement);

			// tell the controller a stop has been selected 

			transit.EventBus.fire(transit.EventBus.codes.STOP_SELECTED, {
				stopCode : $(stopElement).data('stop-code'),
				stopName : $(stopElement).data('stop-name')
			});
		});		  

		 // capture the route/arrival pair selection

		$('#stop-codes-container').on('click', '.arrivalRouteName', function() { 

			var self = transit.ViewManager,
				stopElement = $(this).closest('.stopRow');

			// record this element in the view manager view model (for internal use)

			self.viewModel.setSelectedStop(stopElement);
			self.viewModel.setWatchedRoute(this);

			// notify stop now watched

			transit.EventBus.fire(transit.EventBus.codes.WATCH_STOP, {
				absoluteTimes: 	$(self.viewModel.watchedRoute).attr('data-arrival-absolute-times'),
				routeName: 		$(self.viewModel.watchedRoute).data('arrival-route-name'),
				stopCode : 		$(self.viewModel.selectedStop).data('stop-code')
			});
		});		

		/*
		 * UI only responses to events
		 */	 

		// capture display agency/route event

		$('#toggle-agency-routes-view').on('click', function() {
			if ( $('#stop-codes-container').html().trim() != "") {
			  $('#agency-route-selection').toggleClass('hidden');
			}
		});  		 

		// capture the change in estimated journey times

		$('#watched-route-container').on('blur', '#estimated-journey-time', function() {
			updateDepartureHint();
			transit.ViewManager.toggleHintTimer();
		});

		// capture the route filter change

		$('#agency-routes-container').on('keyup', '#route-filter', function() {
			var filterText = $(this).val().toLowerCase();            
			$('.agencyRouteRow').each(function(){
			  var match = $(this).attr('id').toLowerCase().match(filterText);
			  if(match){
			    $(this).show();
			  }else{
			    $(this).hide();
			  }
			});              
		});

		// capture the stop filter change

		$('#stop-codes-container').on('keyup', '#stop-filter', function() {
			var filterText = $(this).val().toLowerCase();            
			$('.stopRow').each(function(){
			  var match = $(this).attr('data-name').toLowerCase().match(filterText);
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
		this.compileTemplates();
		this.container = $(containerSelector);				
		this.mapLayer = transit.MapLayer;
		this.dateLayer = transit.DateLayer;
		this.renderTopView(containerSelector);
		this.initListeners();
	}

}, transit.BaseViewManager);
