var transit = transit || {};

transit.MapLayer = {

	map: undefined,
	markers: [],
	bounds: undefined,
	container : "map-canvas",	

	hasMap : function() {
		return (this.map != undefined);
	},

	toggleMap : function(center, force) {
		var show = force || !$('#map-canvas').is(':visible');
		$('#map-canvas').toggle(show);
		if(show) {			
			google.maps.event.trigger(this.map, "resize");
			if(center) {
				this.addMarker(center, true);
			}
		} 
	},

	resizeMap : function() {
		google.maps.event.trigger(this.map, "resize");
	},

	removeMarkers : function(notify) {
		while(this.markers.length > 0) {
			var marker = this.markers.pop();
			marker.setMap(null);				
		}
		if(notify) {
			this.notifyMarkerChange();
		}
	},
	
	addMarker: function(latlng, replace) {

		if (!latlng) return;

		if ( (replace || false) && this.markers.length > 1) {
			this.removeMarkers();
		}

		var	 position = (latlng.lat) ? latlng : new google.maps.LatLng(latlng.d, latlng.e),
			 newMarker = new google.maps.Marker({			
	          position: position,
	          map: this.map
	        });

		this.markers.push(newMarker);

        this.bounds = new google.maps.LatLngBounds();
        for(var index in this.markers) {
        	this.bounds.extend(this.markers[index].getPosition());	
        }        
        this.map.fitBounds(this.bounds);

        this.notifyMarkerChange();

        return newMarker;
	},

	getBounds : function() {
		var bounds = this.map.getBounds();
		return {
			maxLat : bounds.getNorthEast().lat(),
			minLat : bounds.getSouthWest().lat(),
			minLng : bounds.getNorthEast().lng(),
			maxLng : bounds.getSouthWest().lng()
		};
	},

	notifyMarkerChange : function() {
		transit.EventBus.fire (transit.EventBus.codes.MAP_MARKER_CHANGED, {
			markerCount : this.markers.length
		});
	},

	renderMap: function(element, position, container) {		

		// build the map attributes
		var mapOptions = {
			zoom: 15,
			mapTypeControl: false,
			navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};      

		// center if we have a position
		if(position) {
			mapOptions["center"] = position;
		}

		// generate map
		this.map = new google.maps.Map(document.getElementById(element), mapOptions);

		// add the marker
		if(position) {
			this.addMarker(position);
		}
	}	

};