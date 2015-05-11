var noteOn = require('./noteOn.js');

var chordOn = function(data, keyIndex) {
  noteOn(data, keyIndex);
  noteOn(data, keyIndex + 4);
  noteOn(data, keyIndex + 7);
};

module.exports = chordOn;
