Import("System.Windows.Application");
Import("System.Windows.Controls.UserControl");
Import("System.Windows.Controls.Grid");
Import("System.Windows.Controls.ColumnDefinition");
Import("System.Windows.Controls.Image");
Import("System.Windows.Controls.TextBlock");
Import("System.Windows.Controls.ListBoxItem");
Import("System.Windows.Controls.HyperlinkButton");
Import("System.Windows.Browser.HttpUtility");
Import("System.Windows.Browser.HtmlPage");
Import("System.Windows.Markup.XamlReader");
Import("System.Net.WebClient");
Import("System.EventHandler");
Import("System.Uri");

// Library
var $break = {};

var $ = function(id) {
  return HtmlPage.Document.GetElementById(id);
};

var emptyFubction = function() {};

var nothingFunction = function(v) { return v; };

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
      klass.prototype.initialize = emptyFubction;
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
  var inject = function(r, iterator) {
    this.each(function(v, i) {
      r = iterator(r, v, i);
    });
    return r;
  };
  var include = function(s) {
    var r = false;
    this.each(function(v) {
      if (s === v) {
        r = true;
        throw $break;
      };
    });
    return r;
  };
  var uniq = function(iterator) {
    iterator = iterator || nothingFunction;
    var t = [], s;
    return this.inject([], function(r, v, i) {
      s = iterator(v, i);
      if (!t.include(s)) {
        r.push(v);
        t.push(s);
      };
      return r;
    });
  };
  var sortBy = function(iterator) {
    return this.collect(function(v, i) {
      return {value: v, criteria: iterator(v, i)};
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return (a < b)? -1: ((a > b)? 1: 0);
    }).pluck('value');
  };
  var pluck = function(property) {
    return this.collect(function(v) {
      return v[property];
    });
  };
  return {
    each: each,
    collect: collect,
    inject: inject,
    include: include,
    uniq: uniq,
    sortBy: sortBy,
    pluck: pluck
  };
}());

// Application
var App = Class.create(null, function() {
  
  var root = null, defaultText = '', searchTexts = [], tweets = [];
  
  var initialize = function() {
    root = Application.Current.LoadRootVisual(new UserControl(), "app.xaml");
    defaultText = root.searchText.Text;
    root.searchText.GotFocus += function(s, e) {
      if (s.Text == defaultText) {
        s.Text = '';
      };
    };
    root.searchText.LostFocus += function(s, e) {
      if (s.Text.length == 0) {
        s.Text = defaultText;
      };
    };
    root.searchButton.Click += clickSearch;
    $('hiddenButton').AttachEvent('click', new EventHandler(autoSearch));
  };
  
  var search = function(text) {
    var url = new Uri('http://search.twitter.com/search.json?q=' + HttpUtility.UrlEncode(text) + '&rpp=20&lang=ja');
    var client = new WebClient();
    client.DownloadStringCompleted += display;
    client.DownloadStringAsync(url);
  };

  var clickSearch = function(s, e) {
    var text = root.searchText.Text;
    if (text === defaultText) {
      return false;
    };
    searchTexts.push(text);
    search(text);
  };
  
  var autoSearch = function(s, e) {
    if (searchTexts.length == 0) {
      return false;
    };
    searchTexts.each(function(text) {
      search(text);
    });
  };
  
  var display = function(s, e) {
    try {
      var responseJson = eval('(' + e.Result + ')');
    } catch (e) { return; };
    var selected = root.contentList.SelectedIndex;    
    tweets = tweets.concat(responseJson.results.collect(function(tweet) {
      var xaml = '' +
        '<Grid xmlns="http://schemas.microsoft.com/client/2007" xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">' +
        '  <Grid.ColumnDefinitions>' +
        '    <ColumnDefinition Width="60px" />' +
        '    <ColumnDefinition Width="*" />' +
        '  </Grid.ColumnDefinitions>' +
        '  <Grid.RowDefinitions>' +
        '    <RowDefinition />' +
        '    <RowDefinition />' +
        '  </Grid.RowDefinitions>' +
        '  <Image Source="' + tweet.profile_image_url + '" Height="50" VerticalAlignment="Top"' +
        '    Grid.Row="0" Grid.Column="0" Grid.RowSpan="2" />' +
        '  <HyperlinkButton Content="' + tweet.from_user + '" NavigateUri="http://twitter.com/' + tweet.from_user + '"' +
        '    FontSize="16" TargetName="_blank" Grid.Row="0" Grid.Column="1" />' +
        '  <TextBlock Text="' + tweet.text + '" FontSize="16" TextWrapping="Wrap" Grid.Row="1" Grid.Column="1" />' +
        '</Grid>' +
      '';
      var grid = XamlReader.Load(xaml);
      return {id: parseInt(tweet.id, 10), content:grid};
    })).uniq(function(tweet) {
      return tweet.id;
    }).sortBy(function(tweet) {
      return tweet.id;
    }).reverse();
    root.contentList.ItemsSource = tweets.pluck('content');
    root.contentList.SelectedIndex = selected;
  };
  
  return {
    initialize: initialize
  };
}());

new App();