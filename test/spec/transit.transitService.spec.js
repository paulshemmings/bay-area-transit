var transitService = require ('../../scripts/transit/transitService');

describe("transit Service suit", function() {

  it("should return a list of agencies", function(done) {
  	transitService.getAgencies(null, function(response) {
  		expect(response).toContain('Agency');
  		done();
  	});
  });

  it("should return a list of routes for an agency", function(done) {
    var routeRequest = { "agencyName" : "BART" };
    var routeRequestJSON = JSON.stringify(routeRequest);
    transitService.getRoutesForAgency(routeRequestJSON, function(response) {
      expect(response).toContain('Route');
      done();
    });
  });

});
