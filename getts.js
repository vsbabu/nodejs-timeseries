#!/usr/bin/env node
var argv = require('optimist')
    .usage('Log a timeseries data.\nUsage examples:\n\t $0 -m auto -s yahoofin\n\t $0 -m manual -s twitter -k myhandle -i tweets -r 200')
    .demand('m').alias('m', 'mode').describe('m', 'Mode - manual (default) or auto')
    .demand('s').alias('s', 'source').describe('source', 'Source of the data. For mode=auto, used for job name as well. In this case specify just the job file name without .js extension')
    .alias('k', 'key').describe('key', 'Key at source, if manual')
    .alias('i', 'item').describe('item', 'Item descriptor, if manual')
    .alias('r', 'reading').describe('value', 'Item reading, if manual')
    .default({m: 'manual'})
    .argv
;

var config = require('./config');
var path = require('path');

var tsrecorder = require("./lib/storage_" + config.storage.engine);

if (argv.m == 'manual') {
  if (!argv.k || !argv.i || !argv.r) {
    require('optimist').showHelp();
    process.exit(1);
  }
  // Just manually add a timeseries
  var result = {};
  result.source = argv.s;
  result.source_key = argv.k;
  result.item = argv.i;
  result.reading = argv.r;
  tsrecorder.init(config.storage.db);
  tsrecorder.record(result.source, result.source_key, result.item, result.reading);
  tsrecorder.close();
} else {
  var nodeio = require('node.io');
  var job; var job_file = path.resolve(config.jobs.dir, argv.s);
  try {
    job = require(job_file);
  } catch (e) {
    console.log("Error: module file not found for `" + argv.s + "`. Expected a file " + job_file + ".js");
    process.exit(2);
  }
  try {
    nodeio.start(job.job, {timeout: 10}, function(err, output){
      tsrecorder.init(config.storage.db);
      output.forEach(function(result){
        tsrecorder.record(result.source, result.source_key, result.item, result.reading);
      });
      tsrecorder.close();
    },
    true);
  } catch (e) {
    console.log("Error: node.io job definition incorrect in `" + argv.s + "`. Expected a file " + job_file + ".js implementing a nodeio job.");
    process.exit(3);
  }
}
