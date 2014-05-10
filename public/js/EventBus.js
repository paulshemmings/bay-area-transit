var transit = transit || {};

transit.EventBus = {
	codes: {

		MAP_REQUESTED : "mapRequeted",
		MAP_MARKER_CHANGED : "mapMarkerCountHasChanged",
		LOCATION_REQUESTED : "requestLocation",

		AGENCY_LIST_REQUESTED : "requestAgencyList",
		AGENCY_SELECTED : "agencySelected",
		ROUTE_SELECTED : "routeSelected",
		DIRECTION_SELECTED : "routeDirectionSelected",
		STOP_SELECTED : "stopSelected",
		WATCH_STOP : "watchStop",
		RESULT_FILTER_CHANGED : "resultFilterChanged",

		PLACE_STOP_REQUESTED : "placeStopOnMap",
		PLACE_LOCATION_REQUESTED : "placeLocationOnMap",
		REMOVE_ALL_STOPS : "removeAllStopsFromMap",
		REFRESH_HINT_REQUESTED : "refreshTheStopRouteHint",

		NEARBY_STOPS_REQUESTED : "retrieveStopsCloseToLocation"
	},
	fire : function(name, data) {
		$(this).trigger(name, data);
	},
	listen : function(name, context, listener) {
		$(this).on(name, function(evt, data) {
			listener.call(context, data);
		});
	},
	init: function() {
		$(this).unbind();
	}
};