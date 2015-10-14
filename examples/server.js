'use strict';

process.env['ALLOW_CONFIG_MUTATIONS']=true

const path = require('path');
const n = path.normalize;
const NLP = require(n(__dirname + '/../lib/nlp'));
const config = require('config');
const http = require('http');
const url = require('url');
const PORT = 3000;

let start = function() {
  const server = http.createServer(function s(req, res) {
    let query = url.parse(req.url, true).query;
    res.writeHead(200, {"Content-Type": "text/plain"});

    if (query.q) {
      nlp.process(query.q).then(function(result) {
        nlp.sentiment(result).
          then(function(result) {
            res.end(JSON.stringify(result));
          }).catch(function(e) {
            res.end(e.message);
          })
      }).catch(function(e) {
        res.end(e.message);
      });
    } else {
      res.end('Please specify text to analyze');
    }
  });

  server.listen(PORT);
}

let nlp = new NLP(config.get('corenlp'));
nlp.loadPipeline()
  .then(start)
  .catch(function(e) {
    console.log(e);
    process.exit(1);
  });