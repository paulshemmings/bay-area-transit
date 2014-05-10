var transit = transit || {};

transit.NavigationLayer = {

	naviLocation : {
		agency : {
			code : undefined,
			name : undefined
		},
		route : {
			code : undefined,
			name : undefined,
			direction : {
				name : undefined,
				code : undefined
			}
		},
		stop : {
			code : undefined,
			name : undefined,
			route : undefined
		},
		watched : {
			name : undefined
		}
	},

	templateLayer : undefined,
	navigationTemplate : 'navigation-simple',
	navigationContainer : '#navigation-container',
	homeSelectorContainer : '#home-selector-container',
	agencySelectorContainer : '#agency-selector-container',
	routeSelectorContainer : '#route-selector-container',
	stopSelectorContainer : '#stop-selector-container',

	getLocation: function() {
		return $.extend({}, this.naviLocation);
	},

	setNaviLocation : function(agency, route, stop, watched) {
		if(watched == undefined) {
			this.naviLocation.watched = undefined;
		} else {
			this.naviLocation.watched = {name : watched.name, code : watched.code};
		}
		if(stop == undefined) {
			this.naviLocation.stop = undefined;		
			this.naviLocation.watched = undefined;
		} else {
			this.naviLocation.stop = { name : stop.name, code : stop.code, route : stop.route };
		}	
		if(route == undefined) {
			this.naviLocation.route = undefined;
			this.naviLocation.stop = undefined;		
			this.naviLocation.watched = undefined;
		} else {
			this.naviLocation.route = {name : route.name, code : route.code};
			if(route.direction) {
				this.naviLocation.route.direction = { name : route.direction.name, code : route.direction.code};
			} else {
				this.naviLocation.route.direction = undefined;
			}	
		}
		if(agency == undefined) {
			this.naviLocation.agency = undefined;
			this.naviLocation.route = undefined;
			this.naviLocation.stop = undefined;
			this.naviLocation.watched = undefined;
		} else {
			this.naviLocation.agency = { name : agency.name, code : agency.code};
		}
		// this is deep and will include functions
		// this.naviLocation = jQuery.extend(true, {}, location);;
		// this is shallow and excludes functions (but maybe quicker)
		// this.naviLocation = JSON.parse(JSON.stringify(location);
	},
 
	renderNavigation : function (agency, route, stop, watched) {
		this.setNaviLocation(agency, route, stop, watched);
		this.templateLayer.renderTemplate(this.navigationTemplate, this.navigationContainer, this.naviLocation);
	},

	initListeners : function() {

		// LISTEN

		transit.EventBus.listen(transit.EventBus.codes.AGENCY_LIST_REQUESTED, this, function(data) {
			this.renderNavigation();
		});		

		transit.EventBus.listen(transit.EventBus.codes.AGENCY_SELECTED, this, function(data) {
			this.renderNavigation({ name : data.selectedAgency });
		});		

		transit.EventBus.listen(transit.EventBus.codes.ROUTE_SELECTED, this, function(data) {
			var route = { name : data.routeName, code : data.routeCode };
			if (data.routeDirectionName) {
				route.direction = { name : data.routeDirectionName, code : data.routeDirectionCode };
			}
			this.renderNavigation(
				this.naviLocation.agency,
				route
			);
		});			

		transit.EventBus.listen(transit.EventBus.codes.STOP_SELECTED, this, function(data) {			
			this.renderNavigation(
				this.naviLocation.agency,
				this.naviLocation.route,
				{ name : data.stopName, code : data.stopCode, route : data.routeName }
			);		
		});

		transit.EventBus.listen(transit.EventBus.codes.WATCH_STOP, this, function(data) {
			this.renderNavigation(
				this.naviLocation.agency,
				this.naviLocation.route,
				this.naviLocation.stop,
				{ name : data.routeName }
			);		
		});
			
		// FIRE

		$(this.navigationContainer).on('click', this.homeSelectorContainer, function(ev) {
			transit.EventBus.fire(transit.EventBus.codes.AGENCY_LIST_REQUESTED, {				
			});
		});

		$(this.navigationContainer).on('click', this.agencySelectorContainer, function(ev) {
			var self = transit.NavigationLayer;
			transit.EventBus.fire(transit.EventBus.codes.AGENCY_SELECTED, {
				selectedAgency : $(self.agencySelectorContainer).find('.agency-selector').data('agency-name')
			});
		});

		$(this.navigationContainer).on('click', this.routeSelectorContainer, function(ev) {
			var self = transit.NavigationLayer;
			transit.EventBus.fire(transit.EventBus.codes.ROUTE_SELECTED, {
				agencyName : $(self.agencySelectorContainer).find('.agency-selector').data('agency-name'),
				routeCode : $(self.routeSelectorContainer).find('.route-selector').data('route-code'),
				routeName : $(self.routeSelectorContainer).find('.route-selector').data('route-name'),
				routeDirectionCode : $(self.routeSelectorContainer).find('.route-selector').data('route-direction-code'),
		      	routeDirectionName : $(self.routeSelectorContainer).find('.route-selector').data('route-direction-name')
			});
		});		

		$(this.navigationContainer).on('click', this.stopSelectorContainer, function(ev) {
			var self = transit.NavigationLayer;
			transit.EventBus.fire(transit.EventBus.codes.STOP_SELECTED, {
				stopCode : $(self.stopSelectorContainer).find('.stop-selector').data('stop-code'),
				stopName : $(self.stopSelectorContainer).find('.stop-selector').data('stop-name'),
				routeName : $(self.stopSelectorContainer).find('.stop-selector').data('route-name'),
			});
		});		

		// FILTER LISTENER

		$(this.navigationContainer).on('keyup', '.result-filter', function() {
			var filterText = $(this).val().toLowerCase();     
			transit.EventBus.fire(transit.EventBus.codes.RESULT_FILTER_CHANGED, {
				filterText : filterText,
				filterTarget : $(this).data('target')
			});			                   
		});
	},

	init : function(templateLayer, navigationContainer, template) {		
		this.templateLayer = templateLayer;
		this.navigationTemplate = template || this.navigationTemplate;
		this.navigationContainer = navigationContainer || this.navigationContainer;
		this.initListeners();
	}
}