var request = require('request');

describe("An example server side test suite", function() {

  it("server side also contains spec with an expectation", function() {
    expect(true).toBe(true);
  });

  it("should handle an asyncronous test", function(done) {
	  request("http://www.google.com", function(error, response, body){
	    done();
	  });
  });

});