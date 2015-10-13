'use strict';

const java = require('java');
const _ = require('lodash');
const xml2js = require('xml2js');
const path = require('path');
const n = path.normalize;
const Parser = require(n(__dirname + '/parser'));
const Promise = require('bluebird');
const config = require('config');
const libs = [
  'ejml-0.23.jar',
  'joda-time.jar',
  'jollyday.jar',
  'xom.jar',
  'stanford-corenlp-{{VERSION}}-models.jar',
  'stanford-corenlp-{{VERSION}}.jar'
];

java.options.push(config.get('java.args'));

let initialized = false;

let loadLibraries = function(path, version) {
  if (!initialized) {
      libs.forEach(function(lib) {
        java.classpath.push(n(path + '/' + lib.replace("{{VERSION}}", version)));
      });

      initialized = true;
    }
};

class StanfordNLP {
  constructor(o) {
    let options = Object.assign(config.get('corenlp.defaultOptions'), o);
    options.path = options.path || config.get('corenlp.path');
    options.version = options.version || config.get('corenlp.version');

    if (!options.path) {
      throw new Error('Invalid path to CoreNLP');
    }

    this.options = options;
    this.pipeline = null;
    loadLibraries(options.path, options.version);
  }

  loadPipeline () {
    let self = this;

    return new Promise(function(resolve, reject) {
      java.newInstance('java.util.Properties', function(e, props) {
        props.setProperty('annotators', self.options.annotators.join(', '), function(e) {
          if (e) return reject(e);
          
          console.log('Loading pipeline');
          java.newInstance('edu.stanford.nlp.pipeline.StanfordCoreNLP', props, function(e, pipeline) {
            if (e) return reject(e);

            self.pipeline = pipeline;
            resolve(self.pipeline);
          })
        })
      });
    });
  }

  process(text, options) {
    let self = this;

    return new Promise(function(resolve, reject) {
      if (typeof options === 'undefined') {
        options = config.get('xml');
      }

      if (self.pipeline === null) {
        console.log('Pipeline not loaded');
        self.loadPipeline()
          .then(function(pipeline) {
            pipeline.process(text, function(e, annotation) {
              if (e) return reject(e);

              java.newInstance('java.io.StringWriter', function(e, writer) {
                if (e) return reject(e);

                pipeline.xmlPrint(annotation, writer, function(e) {
                  if (e) return reject(e);

                  writer.toString(function(e, xmlString) {
                    if (e) return reject(e);

                    xml2js.parseString(xmlString, options.xml, function(e, result) {
                      if (e) return reject(e);

                      let ref = null;
                      let ref1 = null;
                      let ref2 = null;
                      let ref3 = null;
                      let ref4 = null;
                      let sentences = null;
                      let sentence = null;
                      
                      try {
                        sentences = result != null ? (ref = result.document) != null ? (ref1 = ref.sentences) != null ? ref1.sentence : void 0 : void 0 : void 0;
                        
                        console.log('Here!');

                        if (Array.isArray(sentences)) {
                          _ref4 = result != null ? (_ref2 = result.document) != null ? (_ref3 = _ref2.sentences) != null ? _ref3.sentence : void 0 : void 0 : void 0;
                          
                          let _ref4Len = _ref4.length;

                          for (let i=0; i< _ref4.length; i++) {
                            console.log('REF', _ref4);
                            sentence = _ref4[i];
                            sentence.parsedTree = new Parser(sentence != null ? sentence.parse : void 0);
                          }
                        } else {
                          console.log('Sentenxces', sentences);
                          sentences.parsedTree = new Parser(sentences != null ? sentences.parse : void 0);
                        }
                      } catch (_e) {
                        return reject(e);
                      }

                      return resolve(result);
                    })
                  })
                })
              });
            });
          })
          .error(reject);
      }
    });
  }
}

module.exports = StanfordNLP;