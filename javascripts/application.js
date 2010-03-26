var onSilverlightLoaded = function() {
  
  var root = null, autoSearchButton = null;
  
  var initialize = function(s, e) {
    root = s.getHost();
    observeAutoSearch();
  };
  
  var observeAutoSearch = function() {
    var autoSearchButton = document.getElementById('autoSearchButton');
    (function() {
      var self = arguments.callee;
      setTimeout(function() {
        autoSearchButton.click();
        self();
      }, 30000);
    })();
  };
  
  return initialize;
}();