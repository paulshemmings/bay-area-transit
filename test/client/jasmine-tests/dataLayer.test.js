describe("test dateLayer", function() {

	beforeEach(function() {
	});

	afterEach(function() {
	});

	it(" should see zero seconds from dateDifference when times the same ", function() {
		var firstDate = new Date(),
			secondDate = new Date(),
			difference = transit.DateLayer.dateDifference(firstDate, secondDate);

		expect(difference.minutes).toEqual(0);
	});

	it(" should return 10 seconds from dateDifference when times 10 seconds apart", function() {
		var firstDate = new Date(),
			secondDate = firstDate - (10 * 1000),
			difference = transit.DateLayer.dateDifference(firstDate, secondDate);			

		expect(difference.seconds).toEqual(-10);
		expect(difference.minutes).toEqual(-1); // really?
	});

	it(" should return 1 minute from dateDifference whn times are 1 minute apart ", function() {
		var firstDate = new Date(),
			secondDate = firstDate - (1 * 1000 * 60),
			difference = transit.DateLayer.dateDifference(firstDate, secondDate);			

		expect(difference.seconds).toEqual(-60);
		expect(difference.minutes).toEqual(-1);
	});

	
});