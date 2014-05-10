var transit = transit || {};

transit.LocationLayer = {

	currentPosition: {},

	getLocation : function() {
		var deferred = new $.Deferred(),
			self = this;

        if(navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				function(pos) {
					self.currentPosition = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
					deferred.resolve(self.currentPosition);
				},
				function(err) {
					console.warn('ERROR(' + err.code + '): ' + err.message);
					deferred.reject(err.message);
				}, {
					enableHighAccuracy: true,
					timeout: 5000,
					maximumAge: 0 					
            	}
			);	
		} else {
			deferred.reject('no geo location available');
		}	

		return deferred.promise();
	},

	geocodeAdress: function(address, callback) {
		var self = this;
		var geocoder = new google.maps.Geocoder();
		geocoder.geocode( { 'address': address}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results && results.length > 0) {
					callback(results[0]);
				}
			} 
		});		
	},

	getDistanceTo: function(latlng, callback) {
		// https://developers.google.com/maps/documentation/javascript/distancematrix
		var self = this;
		var origin = self.currentPosition;
		var destination = new google.maps.LatLng(latlng.d, latlng.e); 
		var service = new google.maps.DistanceMatrixService();

		function processResponse(response, status) {
			var results = [];						
			if (status == google.maps.DistanceMatrixStatus.OK) {
				var origins = response.originAddresses;
				var destinations = response.destinationAddresses;

				for (var i = 0; i < origins.length; i++) {
				  var elements = response.rows[i].elements;
				  for (var j = 0; j < elements.length; j++) {
				  	var element = elements[j];
				  	results.push({
					    distance: {
					    	text: element.distance.text,
					    	value: element.distance.value
					    },
					    duration: {
					    	text: element.duration.text,
					    	value: element.duration.value
					    },
					    from: origins[i],
					    to: destinations[j]				  		
				  	});
				  }
				}
			}
			return results;
		};		

		service.getDistanceMatrix(
		{
			origins: [origin],
			destinations: [destination],
			travelMode: google.maps.TravelMode.WALKING,
			unitSystem: google.maps.UnitSystem.METRIC,
			durationInTraffic: true,
			avoidHighways: false,
			avoidTolls: false
		}, function(response, status) {
			var processed = processResponse(response, status);
			if(processed && processed.length>0) {
				callback(processed[0]);	
			}
		});
	}

};