
start the server:

    $ node app.js  development.localhost.lan 82489986771c006b2736a128de304e110f27ec8b
    myapp listening at http://0.0.0.0:9090

in another term:

    # get the current url alias (none)
    $ curl http://localhost:9090/api/sql?api_key=82489986771c006b2736a128de304e110f27ec8b | python -m json.tool 
    {
    }


    # create one url alias. Note the 'id' param
    $ curl -d 'url=my&path=select ST_asgeojson(the_geom) from tm2 where cartodb_id={id}' http://localhost:9090/api/sql?api_key=82489986771c006b2736a128de304e110f27ec8b


    # check the aliases again
    $ curl http://localhost:9090/api/sql?api_key=82489986771c006b2736a128de304e110f27ec8b | python -m json.tool
    {
        "my": {
            "path": "select ST_asgeojson(the_geom) from tm2 where cartodb_id={id}", 
            "type": "sql"
        }
    }


    # get the current data, in this case we dont need to provide the api_key
    $ curl http://localhost:9090/my?id=1
        {"time":0.01,"total_rows":1,"rows":....



    # create an insert query
    $ curl -d "url=mywrite&path=insert into tm2 (iso2) values ('{iso}')" http://localhost:9090/api/sql?api_key=82489986771c006b2736a128de304e110f27ec8b



    # check it
    $ curl http://localhost:9090/api/sql?api_key=82489986771c006b2736a128de304e110f27ec8b | python -m json.tool 
    {
        "my": {
            "path": "select ST_asgeojson(the_geom) from tm2 where cartodb_id={id}", 
            "type": "sql"
        }, 
        "mywrite": {
            "path": "insert into tm2 (iso2) values ('{iso}')",
            "type": "sql"
        }
    }


    # write
    $ curl -d '' http://localhost:9090/mywrite?iso=test
    {"time":0.005,"total_rows":0,"rows":[]}
