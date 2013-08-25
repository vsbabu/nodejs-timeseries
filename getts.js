#!/usr/bin/env node
var argv = require('optimist')
    .usage('Log a timeseries data.\nUsage: $0')
    .demand('m').alias('m', 'mode').describe('m', 'Mode - manual (default) or auto')
    .demand('s').alias('s', 'source').describe('source', 'Source, of the data. For mode=auto, used for job class as well')
    .alias('k', 'key').describe('key', 'Key at source, if manual')
    .alias('i', 'item').describe('item', 'Item descriptor, if manual')
    .alias('v', 'value').describe('value', 'Item value, if manual')
    .default({m: 'manual'})
    .argv
;

var config = require('./config');
var path = require('path');

var tsrecorder = require("./lib/storage_" + config.storage.engine);

if (argv.m == 'manual') {
  if (!argv.k || !argv.i || !argv.v) {
    require('optimist').showHelp();
    process.exit(1);
  }
  // Just manually add a timeseries
  var result = {};
  result.source = argv.s;
  result.source_key = argv.k;
  result.item = argv.i;
  result.reading = argv.v;
  tsrecorder.record(result.source, result.source_key, result.item, result.reading);
} else {
  var nodeio = require('node.io');
  var job;
  try {
    job = require(path.resolve(config.jobs.dir,  argv.s));
  } catch (e) {
    console.log("Error: module file not found for `" + argv.s + "`. Expected a file " + config.jobs.dir + argv.s + ".js");
    console.log(e);
    process.exit(2);
  }
  try {
    nodeio.start(job.job, {timeout: 10}, function(err, output){
      tsrecorder.init(config.storage.db);
      output.forEach(function(output){
        tsrecorder.record(output.source, output.source_key, output.item, output.reading);
        //TODO: add a pluggable event listener here; at least one that could be specified by command line options
      });
      tsrecorder.close();
    },
    true);
  } catch (e) {
    console.log("Error: node.io job definition incorrect in `" + argv.s + "`. Expected a file " + config.jobs.dir +  argv.s + ".js implementing a nodeio job.");
    process.exit(3);
  }
}
