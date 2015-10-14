'use strict';

const java = require('java');
const _ = require('lodash');
const xml2js = require('xml2js');
const path = require('path');
const n = path.normalize;
const Parser = require(n(__dirname + '/parser'));
const Promise = require('bluebird');
const config = require('config');

java.options.push(config.get('java.args'));

let initialized = false;

let loadLibraries = function(path, version) {
  if (!initialized) {
      config.get('corenlp.libs').forEach(function(lib) {
        let _path = n(path + '/' + lib.replace("{{VERSION}}", version));
        console.log('Loading classpath: ', _path);
        java.classpath.push(_path);
      });

      initialized = true;
    }
};

class StanfordNLP {
  constructor(options) {
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
        let annotations = self.options.annotators.join(',');

        props.setProperty('annotators', annotations, function(e) {
          if (e) return reject(e);
          
          java.newInstance('edu.stanford.nlp.pipeline.StanfordCoreNLP', props, function(e, pipeline) {
            if (e) return reject(e);

            self.pipeline = pipeline;
            return resolve(self.pipeline);
          });
        });
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
        return reject('Please initialize the pipeline!: nlp.loadPipeline().then(..).error(..)');
      }

      self.pipeline.process(text, function(e, annotation) {
        if (e) return reject(e);

        java.newInstance('java.io.StringWriter', function(e, writer) {
          if (e) return reject(e);

          self.pipeline.xmlPrint(annotation, writer, function(e) {
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
                
                sentences = result != null ? (ref = result.root.document[0]) != null ? (ref1 = ref.sentences[0]) != null ? ref1.sentence[0] : void 0 : void 0 : void 0;
                
                if (Array.isArray(sentences)) {
                  ref4 = result != null ? (ref2 = result.root.document[0]) != null ? (ref3 = ref2.sentences[0]) != null ? ref3.sentence[0] : void 0 : void 0 : void 0;
                  
                  let _ref4Len = ref4.length;

                  for (let i=0; i< _ref4.length; i++) {
                    sentence = ref4[i];
                    sentence.parsedTree = new Parser(sentence != null ? sentence.parse : void 0);
                  }
                } else {
                  sentences.parsedTree = new Parser(sentences != null ? sentences.parse : void 0);
                }

                return resolve(result);
              })
            })
          })
        });
      });

    });
  }

  sentiment(json) {
    return new Promise(function(resolve, reject) {
      let doc = (json.root.document && json.root.document[0]) ? json.root.document[0] : {};
      let sentences = (doc.sentences && doc.sentences[0]) ? doc.sentences[0] : {};
      let sentence = sentences.sentence || [];
      let $ = (sentence[0] && sentence[0]['$']) ? sentence[0]['$'] : {};
      let sentiment = $['sentiment'];

      if (sentiment) {
        return resolve(sentiment);
      }

      return reject('No sentiment was found');
    });
  }
}

module.exports = StanfordNLP;