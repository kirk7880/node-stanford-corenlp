'use strict';

const REG_EXP=/^\s+|\s+$/g;

/**
 * Parser
 */
class Parser {
  constructor(str) {
    this.str = str;
    this.list = [];
    this.index = 1;
    this.tree = this.parse(this.str, this.list);
  }

  parse(_str, collection) {
    _str = Array.isArray(_str) ? _str[0] : _str;
    let __str = _str.slice(1, -1);
    let bracketCount = 0;
    let char = null;
    let current = '';
    let tokens = __str.split(' ');
    let firstToken = tokens[0];
    let str = tokens.slice(1).join(' ');
    let isBracket = false;
    let list = [];
    let len = str.length;
    let i = 0;

    collection = Array.isArray(collection) ? collection : [];

    collection.push({
      type: firstToken,
      children: list
    });

    collection = list;

    for (i=0; i < len; i++) {
      char = str.charAt(i);
      current += char;

      if (char === '(') {
        bracketCount++;
        isBracket = true;
      } else if (char === ')') {
        bracketCount--;
        if (bracketCount === 0) {
          current = current.replace(REG_EXP, '');
          this.parse(current, collection);
          current = '';
        }
      }
    }

    if (!isBracket) {
      collection.push({
        type: firstToken,
        word: tokens[1],
        id: this.index
      });

      this.index++;
    }

    return collection
  }
}

module.exports = Parser;
