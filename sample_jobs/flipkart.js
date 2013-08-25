/*
 * print item prices from flipkart
 * Install node, npm and node.io
 */

var nodeio = require('node.io'), nodeio_options = {timeout: 10};
var path  = require('path');


exports.job = new nodeio.Job(nodeio_options, {

  //put the url parts on flipkart.com for the product pages to track in this file
  input: path.resolve(__dirname, 'flipkart_items.txt'),

  run: function (path) {
    this.getHtml('http://www.flipkart.com/' + path, function (err, $) {
      try {
        var info = {};
        info.source_key = path;
        info.source = 'FLIPKART';
        var price = $(".pprice").text;
        price = price.replace(/[^\d]/g,'');
        var product = $(".title.fk-hidden").text;
        info.reading = price;
        info.item = product;
        this.emit(info);
      } catch (e) {
        //just a catch all to take care of stuff
      }
    });
  },


});


//meta tags is the right way; doesn't work yet
//$("meta").each(function(i, meta){ map[$(meta).attr('itemprop')] = $(meta).attr('content'); }
