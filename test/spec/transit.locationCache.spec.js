var locationCache = require ('../../scripts/transit/locationCache');

describe("tranit suite", function() {
  it("should find a stop in the cache", function() {
  	var result = locationCache.getLocationByCode('53377');
    expect(result.code).toEqual('53377');
  });
});