'use strict';

const path = require('path');
const n = path.normalize;

module.exports = {
  nlp: require(n(__dirname + '/nlp')),
  parser: require(n(__dirname + '/parser'))
};
