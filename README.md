## Simple Timeseries Getter ##

Add node.io jobs, call these,  add to a database.

* Default configuration has the db in `data/timeseries.db`
* To install dependencies, run `npm link`
* Now run `node getts` to print the help


Added two samples `flipkart.js` and `yahoofin.js`. These two reads
the item/ticker information from their respective data files and 
then gets the data accordingly.

These are used as samples to get you started.

There is no query module now. Use your SQL skills :)
Here is a sample bash shell script to quickly print out the data:

    #!/bin/bash
    if [ $# -lt 1 ]; then
      cat <<EOF
      Usage: $0 search_string1 search_string2
    EOF
      exit 1
    fi
    while [ $# -ge 1 ]; do
    echo "~~~~~~~~~~~~~~~~~~~~~~~~~~ $1 ~~~~~~~~~~~~~~~~~~~~~~"
    sqlite3 data/timeseries.db <<EOF
    .separator \t
    select s.item from series s where upper(s.item) like '%$1%';
    select r.recorded_date as 'on', r.reading from series_reading r, series s where upper(s.item) like '%$1%' and r.series_id = s.id order by r.recorded_date desc;
    .q
    EOF
    shift
    done

