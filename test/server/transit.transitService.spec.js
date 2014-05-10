var transitService = require ('../../scripts/transit/transitService');

describe("transit Service suit", function() {

  var request = null; 

  // jasmine.createSpy("request spy")

  beforeEach(function() {

      // reset the request recorder

      request = {
        count : 0,
        url : null
      };

      // inject mock request function to record request was made
      // TODO: find out *how* to spy on method not exported.

      transitService.inject({
          request : function(requestUrl) {
            request.count ++;
            request.url = requestUrl;
          }
      });

  });

  it("should make a request to agency API when getting agencies", function() {
    transitService.getAgencies(null, null);
    expect(request.count).toEqual(1);
    expect(request.url).toEqual('http://services.my511.org/Transit2.0/GetAgencies.aspx?token=');
  });

  it("should make a request to route API when getting routes", function() {
    var routeRequest = { "agencyName" : "BART" };
    var routeRequestJSON = JSON.stringify(routeRequest);
    transitService.getRoutesForAgency(routeRequestJSON);
    expect(request.count).toEqual(1);
    expect(request.url).toEqual('http://services.my511.org/Transit2.0/GetRoutesForAgency.aspx?token=&agencyName=BART');
  });

});
