
var fs = require("fs");
var moment = require("moment");
var sqlite3 = require("sqlite3").verbose();

var db, stmt;

exports.init = function(db_options) {
  var exists = fs.existsSync(db_options.database);
  if(!exists) {
    console.log("Initializing timeseries db file");
    fs.openSync(db_options.database, "w");
  }
  if (db == null) {
    db = new sqlite3.Database(db_options.database);
    db.serialize(function() {
      if(!exists) {
        db.run("CREATE TABLE series (id INTEGER PRIMARY KEY, source VARCHAR(20) not null, source_key varchar(100) not null, item varchar(100) not null, recorded_date VARCHAR(18) not null, reading NUMERIC)");
      }
    });
  }
  stmt = db.prepare("INSERT INTO series(source, source_key, item, recorded_date, reading) VALUES (?,?,?,?,?)");
}


exports.record = function (source, source_key, item, reading) {
  var today = moment().format("YYYY-MM-DD HH:mm:ss");
  stmt.run(source, source_key, item, today, reading);
};

exports.close = function() {
  stmt.finalize();
  db.close();
}
