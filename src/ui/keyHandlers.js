var noteOn = require('../audio/noteOn.js');
var noteOff = require('../audio/noteOff.js');
var updateOctave = require('../audio/updateOctave.js');

var getKeyIndex = function(data, keyCode) {
    var keyChar;
    // there 2 separate keycodes for semicolon and single quote because browsers
    if (keyCode === 186 || keyCode === 59) {
      keyChar = ';';
    } else if (keyCode === 222 || keyCode === 39) {
      keyChar = "'";
    } else {
      keyChar = String.fromCharCode(keyCode);
    }
    return data.ui.keyChars.indexOf(keyChar);
};

var getKeyDownHandler = function(data) {
  return function(e) {
    var keyCode = e.keyCode;
    if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) {
      return;
    }
    var keyIndex = getKeyIndex(data, keyCode);
    if (keyIndex > -1) {
      noteOn(data, keyIndex);
      // chordOn(data, keyIndex);
      e.preventDefault();
    }
    var keyChar = String.fromCharCode(keyCode);
    if (keyChar === 'Z') {
      updateOctave(data, -1);
    } else if (keyChar === 'X') {
      updateOctave(data, 1);
    }
  };
};

var getKeyUpHandler = function(data) {
  return function(e) {
    var keyIndex = getKeyIndex(data, e.keyCode);
    if (keyIndex > -1) {
      noteOff(data, keyIndex);
    }
  };
};

exports.keyUp = getKeyUpHandler;
exports.keyDown = getKeyDownHandler;
