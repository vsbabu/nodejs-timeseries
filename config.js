/*
 * Configuration options
 */

var config = {};

config.jobs = {};
config.jobs.dir = './sample_jobs/';

config.storage = {};
config.storage.db = {};
config.storage.engine = 'sqlite';
config.storage.db.database = './data/timeseries.db';



module.exports = config;
