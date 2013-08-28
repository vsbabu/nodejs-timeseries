
var fs = require("fs");
var path = require("path");
var sqlite3 = require("sqlite3").verbose();

var db;

exports.init = function(db_options) {
  var exists = fs.existsSync(db_options.database);
  if(!exists) {
    fs.mkdir(path.dirname(db_options.database));
    console.log("Initializing timeseries db file");
    fs.openSync(db_options.database, "w");
  }
  if (db == null) {
    db = new sqlite3.Database(db_options.database);
    db.serialize(function() {
      if(!exists) {
        db.serialize(function(){
          db.run("CREATE TABLE series (id INTEGER PRIMARY KEY, source VARCHAR(20) not null, source_key varchar(100) not null, item varchar(100) not null)");
          db.run("CREATE UNIQUE INDEX series_uix ON series(source, source_key)");
          db.run("CREATE TABLE series_reading (id INTEGER PRIMARY KEY, series_id INTEGER not null, recorded_date VARCHAR(18) not null, reading NUMERIC)");
        });
      }
    });
  }
}


exports.record = function (source, source_key, item, reading) {
  db.serialize(function(){
    //this ugly set of SQLs is to get around parallel/callback node.js function hierarchy easily
    db.run("INSERT INTO series(source, source_key, item) SELECT ?,?,? WHERE NOT EXISTS (SELECT 1 FROM series WHERE source=? and source_key=?)", source, source_key, item, source, source_key);
    db.run("UPDATE series SET item=? WHERE source=? AND source_key=?", item, source, source_key); //wasted update if this was an existing record
    db.run("INSERT INTO series_reading(series_id, recorded_date, reading) SELECT id as series_id,datetime('now'),? FROM series WHERE source=? and source_key=?", reading, source, source_key);
  });
};

exports.close = function() {
  db.close();
}
