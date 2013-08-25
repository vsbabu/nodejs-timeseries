/*
 * print yahoo stock value from yahoo india finance
 */

var nodeio = require('node.io'), nodeio_options = {timeout: 10};
var path  = require('path');


exports.job = new nodeio.Job(nodeio_options, {

  //put the yahoo codes in the file
  input: path.resolve(__dirname, 'yahoofin_symbols.txt'),

  run: function (path) {
    this.getHtml('http://in.finance.yahoo.com/q?s=' + encodeURIComponent(path), function (err, $) {
      try {
        var info = {};
        info.source_key = path;
        info.source = 'YAHOOFIN';
        var reading = $("span#yfs_l10_" + path).text;
        reading = reading.replace(/[^\d\.]/g,'');
        var symbol = $('div.title  h2').text;
        info.reading = reading;
        info.item = symbol;
        this.emit(info);
      } catch (e) {
        //just a catch all to take care of stuff
      }
    });
  },


});
