
var restify = require('restify'),
    http = require('http'),
    httpProxy = require('http-proxy'),
    _ = require('underscore');

// model
function URLs() {
  this.urls = {};
  this.urls['api'] = null; // private url
}

URLs.prototype.create = function(url, type, path) {
  this.urls[url] = {
    path: path,
    type: type
  };
  return true;
};

URLs.prototype.to_json = function(url) {
  return this.urls;
};

URLs.prototype.exists = function(url) {
  console.log("exists" + this.urls[url]);
  return this.urls[url]  ? true: false;
};

URLs.prototype.evaluate = function(url, params) {
  var u = this.urls[url];
  var s = new String(u.path);
  for(var i in params) {
    if(i !== url) {
      s = s.replace('{' + i + '}', params[i]);
    }
  }
  if(u.type === 'sql') {
    s = '/api/v1/sql?q=' + encodeURIComponent(s)
  } 
  return s;
};


function CartoDBApiProxy(server, host, port, api_key) {

  server.use(restify.acceptParser(server.acceptable));
  server.use(restify.queryParser());
  server.use(restify.bodyParser());

  var urls = this.urls = new URLs();
  var proxy = new httpProxy.RoutingProxy();

  server.get('/api/sql', function (req, res, next) {
    if(req.params.api_key !== api_key) {
      res.send(403);
      return next();
    }
    res.send(urls.to_json());
  });

  var create_url_controller = function(type, req, res, next) {
    //check auth
    if(req.params.api_key !== api_key) {
      res.send(403);
      return next();
    }

    if(req.params.url && req.params.path) {
      urls.create(req.params.url, type, req.params.path);
      res.send();
    } else {
      res.send(400);
    }
    return next();
  }

  server.post('/api/sql', function (req, res, next) {
    return create_url_controller('sql', req, res, next);
  });

  server.post('/api/tiles', function (req, res, next) {
    return create_url_controller('tiles', req, res, next);
  });



  var proxy_to = function(u, req, res) {
    req.url = u + "&api_key=" + api_key;
    req.headers['Host'] = host;
    req.method = 'GET'
    req.headers['Content-Length'] = 0;
    proxy.proxyRequest(req, res, {
      host: host,
      port: port
    });
  }

  var proxy_regexp = /^\/([a-zA-Z0-9_\.~\-]+)\/?/;
  var proxy_controller = function (req, res, next) {
    console.log(req.params);
    if(urls.exists(req.params[0])) {
      var u = urls.evaluate(req.params[0], req.params);
      console.log(u);
      proxy_to(u, req, res);
    } else {
      res.send(404);
    }
  };

  server.get(proxy_regexp, proxy_controller);
  server.post(proxy_regexp, proxy_controller);

}

module.exports.CartoDBApiProxy = CartoDBApiProxy;


