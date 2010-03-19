Import("System.Windows.Application");
Import("System.Windows.Controls.*");
Import("System.Windows.*");
Import("System.Net.WebClient");
Import("System.Uri");
Import("System.Runtime.Serialization.Json");


// ライブラリ
var Class = {
  create: function(parent, properties){
    var klass = function(){
      this.initialize.apply(this, arguments);
    };
    if (typeof parent === "function") {
      klass.prototype = new parent;
    };
    Object.extend(klass.prototype, properties);
    if (!klass.prototype.initialize) {
      klass.prototype.initialize = function(){};
    };
    return klass;
  }
};

Object.extend = function(klass, properties) {
  for (var p in properties) {
    klass[p] = properties[p];
  };
  return klass;
};

Object.extend(Array.prototype, function() {
  var each = function(iterator) {
    try {
      for (var i = 0; i < this.length; i += 1) {
        iterator(this[i], i);
      };
    } catch (e) {
      if (e !== $break) { throw e; };
    };
  };
  
  return {
    each: each
  };
}());

Object.extend(String.prototype, function() {
  var toInt = function(radix) {
    var n = parseInt(this, radix || 10);
    return isNaN(n)? '': n;
  };
   
  return {
    toInt: toInt
  }
}());

var $break = {};

// アプリケーション
var App = Class.create(null, function() {
  var root = null, defaultText = '';
  
  var initialize = function() {
    root = Application.Current.LoadRootVisual(new UserControl(), "app.xaml");
    
    defaultText = root.searchText.Text;
    root.searchText.GotFocus += function(s, e) {
      if (s.Text == defaultText) { s.Text = ''; };
    };
    root.searchText.LostFocus += function(s, e) {
      if (s.Text.length == 0) { s.Text = defaultText; };
    };
    
    root.searchButton.Click += searchTwitter;
  };
  
  var createTwitterSearchUrl = function(text) {
    return new Uri('http://search.twitter.com/search.json?q=' + text + '&rpp=20&lang=ja');
  };

  var searchTwitter = function(s, e) {
    var text = root.searchText.Text;
    if (text === defaultText) { return false; };
    var url = createTwitterSearchUrl(text);
    var client = new WebClient();
    client.DownloadStringCompleted += displayResult;
    client.DownloadStringAsync(url);
    //client.OpenReadCompleted += displayResult;    
    //client.OpenReadAsync(url);
  };
  
  var displayResult = function(s, e) {
    root.searchText.Text = defaultText;
    try {
      var responseJson = eval('(' + e.Result + ')');
    } catch (e) {
      return;
    };
    responseJson.results.each(function(tweet) {
      var textBlock = new TextBlock();
      textBlock.Text = tweet.text;
      textBlock.FontSize = "16";
      textBlock.
      root.stackPanel.Children.Add(textBlock);
    });
  };
  
  return {
    initialize: initialize
  };
}());

new App();