var transit = transit || {};

transit.DateLayer = {
	
	dateDifference : function(firstDate, secondDate) {
		var diff = secondDate - firstDate;
		return {
			minutes : Math.floor(diff / 1000 / 60),
			seconds : Math.floor(diff / 1000)
		};
	},

	addMinutesToDate : function(date, minutes) {
    	// return new Date(date.getTime() + minutes*60000); 
    	return date.getTime() + minutes*60000; 
	},

	buildAbsoluteTimes : function(times) {
		var absoluteTimes = [];
		$.each(times, function() {
			var now = new Date();
			var minutes = parseInt(this);
			absoluteTimes.push(transit.DateLayer.addMinutesToDate(now, minutes).toString());
		});
		return absoluteTimes;
	},

	calculateDepartureTime : function(absoluteTimes, estimatedJourneyTime) {

		// build a default response

		var departureTime = {
			cannotReachStopInTime : true,
			estimatedJourneyTime  : estimatedJourneyTime
		};	

		var now = new Date().getTime();
		// var estimatedArrivalDate = now + (estimatedJourneyTime * 60000);
		var estimatedArrivalDate = now + (estimatedJourneyTime * 1000);

		// create a response if they can get to stop in time

	    $.each(absoluteTimes, function() {
	    	
	    	// var arrivalDate = Date.parse(this);	
	    	var arrivalDate = Number(this);	
	    	if (estimatedArrivalDate < arrivalDate) {

		    	var estimatedArrivalTime = transit.DateLayer.dateDifference (now, arrivalDate).minutes;
		    	var maxTimeLeft = estimatedArrivalTime - (estimatedJourneyTime / 60);
			
				departureTime = {
					canReachStopInTime : true,
					estimatedArrivalTime : estimatedArrivalTime,
					estimatedJourneyTime : estimatedJourneyTime,
					yourDepartureTime : maxTimeLeft.toFixed(2)
				};
				return false;
	    	}
	    });

	    return departureTime;
	}	
}