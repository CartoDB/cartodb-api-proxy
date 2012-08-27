
var restify = require('restify');
var CartoDBApiProxy = require('./lib/proxy').CartoDBApiProxy;

var server = restify.createServer({
  name: 'myapp',
  version: '1.0.0'
});

var argv = process.argv;
if(argv.length != 4) {
  console.log('usage: node app.js cartodb_host api_key');
  console.log('\nexample:');
  console.log('    node app.js rambo.cartodb.com 1af665a5f5d5e');
  process.exit();
}
var host = argv[2];
var api_key = argv[3];

var proxy = new CartoDBApiProxy(server, host, 8080, api_key);

server.listen(9090, function () {
  console.log('%s listening at %s', server.name, server.url);
});
