var request = require('request');

describe("An example server side test suite", function() {

  it("server side also contains spec with an expectation", function() {
    expect(true).toBe(true);
  });

  /* 
   * A simple example of how aysnchronous calls are tested.
   * Not really relevant for unit tests, but good to keep for reference
   */

  it("should handle an asyncronous test", function(done) {
	  request("http://www.google.com", function(error, response, body){
	    done();
	  });
  });

});