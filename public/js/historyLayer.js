var transit = transit || {};

transit.HistoryLayer = {

  getQuery : function() {
    var state = History.getState();
    var vars = [], hash;
    if(state.url.indexOf('?')>=0) {
      var hashes = state.url.slice(state.url.indexOf('?') + 1).split('&');
      for(var i = 0; i < hashes.length; i++)
      {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
      }
    }
    return vars;
  }

};