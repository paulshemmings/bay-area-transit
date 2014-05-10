var transit = transit || {};

transit.ServiceLayer = {

	serviceBaseUrl : "services/transit-public/",
	locationServiceUrl : "services/transit-location-service/",

	getLocationCache : function(callback) {
      $.ajax(this.locationServiceUrl + "getLocationCache")
        .done(function(data) {
        	callback(data);
        })
        .fail(function() {
          alert('failed to retrieve location cache');
        });	
	},

	getRoutesForAgency : function(agency, callback) {
        $.ajax({
          type: 'POST',
          url: this.serviceBaseUrl + "getRoutesForAgency",
          data: JSON.stringify({ "agencyName" : agency }),
          success : function(data) {
          	return callback(data);
          }
        });		
	},

	getStopsForRoute : function(request, callback) {
	    $.ajax({
	      type: 'POST',
	      url: this.serviceBaseUrl + "getStopsForRoute",
	      data: JSON.stringify(request),
	      success : function(data) {
	      	return callback(data);
	      }
	    });		
	},

	getNextDepartureTimes : function(stopCode, selectedRouteName, callback) {
	    $.ajax({
	      type: 'POST',
	      url: this.serviceBaseUrl + "getNextDeparturesByStopCode",
	      data: JSON.stringify({ stopCode : stopCode }),
	      success : function(data) {
	      	return callback(data);	      	
	      },
	      error : function() {
	        callback('no times available');
	      }
	  	});		
	},

	getAgencies : function(callback) {
      $.ajax(this.serviceBaseUrl + "getAgencies")
        .done(function(data) {
        	callback(data);
        })
        .fail(function() {
          alert('failed to retrieve agencies');
        });		
	}

};