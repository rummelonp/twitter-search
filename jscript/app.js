Import("System.Windows.Application");
Import("System.Windows.Controls.UserControl");
Import("System.Windows.Controls.Grid");
Import("System.Windows.Controls.ColumnDefinition");
Import("System.Windows.Controls.Image");
Import("System.Windows.Controls.TextBlock");
Import("System.Windows.Controls.ListBoxItem")
Import("System.Windows.Controls.HyperlinkButton");
Import("System.Windows.Browser.HttpUtility");
Import("System.Windows.Markup.XamlReader");
Import("System.Net.WebClient");
Import("System.Uri");

// ライブラリ
var $break = {};

var emptyFunction = function(v) {
  return v;
};

var Class = function() {
  var extend = function(klass, properties) {
    for (var p in properties) {
      klass[p] = properties[p];
    };
    return klass;
  };
  var create = function(parent, properties){
    var klass = function(){
      this.initialize.apply(this, arguments);
    };
    if (typeof parent === "function") {
      klass.prototype = new parent;
    };
    extend(klass.prototype, properties);
    if (!klass.prototype.initialize) {
      klass.prototype.initialize = function(){};
    };
    return klass;
  };
  return {
    create: create,
    extend: extend
  };
}();

Class.extend(Array.prototype, function() {
  var each = function(iterator) {
    try {
      for (var i = 0; i < this.length; i += 1) {
        iterator(this[i], i);
      };
    } catch (e) {
      if (e !== $break) { throw e; };
    };
    return this;
  };
  var collect = function(iterator) {
    var r = [];
    this.each(function(v, i) {
      r.push(iterator(v, i));
    });
    return r;
  };
  var unique = function(iterator) {
    iterator = iterator || emptyFunction;
    var r = [], t = [], s;
    this.each(function(v) {
      s = iterator(v);
      if (!t.inArray(s)) {
        r.push(v);
        t.push(s);
      };
    })
    return r;
  };
  var inArray = function(s) {
    var r = false;
    this.each(function(v) {
      if (s === v) { r = true; };
    });
    return r;
  };
  var pluck = function(property) {
    var r = [];
    this.each(function(v) {
      r.push(v[property]);
    });
    return r;
  };
  return {
    each: each,
    collect: collect,
    unique: unique,
    inArray: inArray,
    pluck: pluck
  };
}());

// アプリケーション
var App = Class.create(null, function() {
  
  var root = null, defaultText = '', items = [];
  
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

  var searchTwitter = function(s, e) {
    var text = root.searchText.Text;
    if (text === defaultText) { return false; };
    var url = new Uri('http://search.twitter.com/search.json?q=' + HttpUtility.UrlEncode(text) + '&rpp=20&lang=ja');
    var client = new WebClient();
    client.DownloadStringCompleted += displayResult;
    client.DownloadStringAsync(url);
  };
  
  var displayResult = function(s, e) {
    root.searchText.Text = defaultText;
    try {
      var responseJson = eval('(' + e.Result + ')');
    } catch (e) { return; };
    items = items.concat(responseJson.results.collect(function(tweet) {
      var xaml = '' +
        '<Grid xmlns="http://schemas.microsoft.com/client/2007" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">' +
        '  <Grid.ColumnDefinitions>' +
        '    <ColumnDefinition Width="60px" />' +
        '    <ColumnDefinition Width="*" />' +
        '  </Grid.ColumnDefinitions>' +
        '  <Image Source="' + tweet.profile_image_url + '" Height="50" Grid.Row="0" Grid.Column="0" />' +
        '  <TextBlock Text="' + tweet.text + '" FontSize="16" TextWrapping="Wrap" Grid.Row="0" Grid.Column="1" />' +
        '</Grid>' +
      '';
      var grid = XamlReader.Load(xaml);
      return {id: parseInt(tweet.id, 10), content:grid};
    })).unique(function(item) {
      return item.id;
    }).sort(function(l, r) {
      var a = l.id, b = r.id;
      return (a < b)? 1: ((a > b)? -1: 0);
    });
    root.contentList.ItemsSource = items.pluck('content');
  };
  
  return {
    initialize: initialize
  };
}());

new App();