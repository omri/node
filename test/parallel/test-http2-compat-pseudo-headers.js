// Flags: --expose-http2 --expose-internals
'use strict';

const common = require('./node/test/common');
const assert = require('assert')
if (!common.hasCrypto)
  common.skip('missing crypto');
const h2 = require('http2');

// Checks that the http2 server throws an exception
// when passed pseudo headers.

let client;

const server = h2.createServer(common.mustCall((req, res) => {

  assert.throws(() => res.writeHead(200, "OK", {":method": "GET"}), /Cannot set HTTP\/2 pseudo-headers/)
  assert.throws(() => res.writeHead(200, "OK", {":path": "GET"}), /Cannot set HTTP\/2 pseudo-headers/)
  assert.throws(() => res.writeHead(200, "OK", {":authority": "GET"}), /Cannot set HTTP\/2 pseudo-headers/)
  assert.throws(() => res.writeHead(200, "OK", {":scheme": "GET"}), /Cannot set HTTP\/2 pseudo-headers/)

  server.close();
  client.destroy();
  server.unref();
}));
server.listen(0);

server.on('listening', function() {
  const port = server.address().port;

  const url = `http://localhost:${port}`;
  client = h2.connect(url, common.mustCall(function() {
    const headers = {
      ':path': '/foobar',
      ':method': 'GET',
      ':scheme': 'http',
      ':authority': `localhost:${port}`,
    };
    const request = client.request(headers);
    
    request.end();
  }));
});