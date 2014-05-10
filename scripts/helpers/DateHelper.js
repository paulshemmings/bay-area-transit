var extensions = require('./Extensions');
var DateHelper = {
	
	dateDifference : function(firstDate, secondDate) {
		var diff = secondDate - firstDate;
		return {
			minutes : Math.floor(diff / 1000 / 60),
			seconds : Math.floor(diff / 1000)
		};
	},

	addMinutesToDate : function(date, minutes) {
    	return date.getTime() + minutes*60000; 
	},

	buildAbsoluteTimes : function(times) {
		var self = DateHelper,
			absoluteTimes = [];

		for(var i = 0; i < times.length; i++) {
			var now = new Date();
			var minutes = parseInt(times[i]);
			absoluteTimes.push(self.addMinutesToDate(now, minutes).toString());
		}
		return absoluteTimes;
	},

	calculateDepartureTime : function(absoluteTimes, estimatedJourneyTime) {

		// build a default response

		var self = DateHelper,
			departureTime = {
			cannotReachStopInTime : true,
			estimatedJourneyTime  : estimatedJourneyTime
		};	

		var now = new Date().getTime();
		var estimatedArrivalDate = now + (estimatedJourneyTime * 1000);

		// create a response if they can get to stop in time

	    for(var i = 0; i < absoluteTimes.length; i++) {
	    	
	    	// var arrivalDate = Date.parse(this);	
	    	var arrivalDate = Number(absoluteTimes[i]);	
	    	if (estimatedArrivalDate < arrivalDate) {

		    	var estimatedArrivalTime = self.dateDifference (now, arrivalDate).minutes;
		    	var maxTimeLeft = estimatedArrivalTime - (estimatedJourneyTime / 60);
			
				departureTime = {
					canReachStopInTime : true,
					estimatedArrivalTime : estimatedArrivalTime,
					estimatedJourneyTime : estimatedJourneyTime,
					yourDepartureTime : maxTimeLeft.toFixed(2)
				};
				return false;
	    	}
	    }

	    return departureTime;
	}	
}

exports.buildAbsoluteTimes = extensions.bind(DateHelper.buildAbsoluteTimes, DateHelper);
exports.calculateDepartureTime = extensions.bind(DateHelper.calculateDepartureTime, DateHelper);