'use strict';

process.env['ALLOW_CONFIG_MUTATIONS']=true

const chai = require('chai');
const expect = chai.expect;
const path = require('path');
const n = path.normalize;
const NLP = require(n(__dirname + '/../lib/nlp'));
const config = require('config');

const txt = `During Friday's episode of The View, the hosts were discussing a new study on racial bias and names. The study showed that people view those with traditional "black" names like Darnell, Jamal or DeShawn as much more muscular and threatening than people with names like Wyatt or Garrett.

During the segment, host Raven-Symoné, who just last week was part of a stigmatizing interview with newly out as HIV-positive child star Danny Pintauro, said that she wouldn't hire someone whose name was "Watermelondrea" or "Watermelonisha." Prior to saying those names, Raven-Symoné said that she didn't consider bias against those names "racism," only discrimination. 

"I am very discriminatory against the ones that they were saying in those names," she said, adding, "I'm not about to hire you if your name is Watermelondrea. That's just not gonna happen."

"That's just not gonna happen!" Source: Mic/YouTube
After Raven-Symoné, whose name has English and Old Norse origins, made those comments, there were audible gasps from the audience, and looks from her panel. 

Even Whoopi Goldberg was taken aback. 

Source: Mic/YouTube
A list of names has circulated Tumblr addressing this very issue. The list points out that names like "Latonia" are actually Latin and a name like "Lateefah" is a North African name meaning "gentle and pleasant."

Sorry, Everyone, Raven-Symoné Says She Won't Hire You if You Have a Black Name
Source: Tumblr
Two years ago, in response to people who were unable to pronounce Academy Award nominee Quvenzhané Wallis' name, artist Sha'Condria "iCon" Sibley released an empowering video on black names and their origins. 

Source: YouTube
A YouTube series star who goes by the name Watermelondrea Jones even clapped back at Raven-Symoné on Twitter. 

Whether or not Raven gets the message, it's fair to say that, in this moment, we are all Whoopi.

Source: YouTube
Correction: Oct. 10, 2015
An earlier version of this article stated that child star Danny Pintauro was "newly HIV-positive." Pintauro has been HIV-positive for 12 years, but has only recently gone public with the information.`

describe('Stanford NLP', function() {
  it.only('should get the sentiment', function(done) {
    this.timeout(50000);

    let nlp = new NLP(config.get('corenlp'));

    nlp.loadPipeline()
      .then(function() {
          nlp.process(txt).then(function(result) {
            nlp.sentiment(result).
              then(function(tone) {
                console.log('Sentiment: ', tone)
              }).catch(function(e) {
                console.log('Error: ', e);
              })
          }).catch(function(e) {
            console.log(e);
          });
      });
  });
})