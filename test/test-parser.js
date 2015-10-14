'use strict';

const chai = require('chai');
const expect = chai.expect;
const path = require('path');
const n = path.normalize;
const treeString = require(n(__dirname + '/fixtures/tree'));
const Parser = require(n(__dirname) + '/../lib/parser');

describe('Tree parser', function() {
  it('should parse tree', function() {
    let parser = new Parser(treeString);
    expect(parser.tree.length).to.equal(1);
    expect(parser.tree[0].type).to.equal('S');
    expect(parser.tree[0].children.length).to.equal(3);
  })
});

