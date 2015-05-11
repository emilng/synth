var noteOn = require('../audio/noteOn.js');
var noteOff = require('../audio/noteOff.js');
var updateOctave = require('../audio/updateOctave.js');

var setupNoteClickHandlers = function(data) {
  var getClickHandler = function(data, index) {
    return function() {
      noteOn(data, index);
    };
  };
  var i = 0;
  while(i < 18) {
    var key = document.getElementById('key-' + i);
    key.addEventListener('mousedown', getClickHandler(data, i));
    i++;
  }
};

var setupOctaveClickHandlers = function(data) {
  var getClickHandler = function(data, direction) {
    return function() {
      updateOctave(data, direction);
    };
  };
  var octaveDown = document.getElementById('octave-down');
  octaveDown.addEventListener('click', getClickHandler(data, -1));
  var octaveUp = document.getElementById('octave-up');
  octaveUp.addEventListener('click', getClickHandler(data, 1));
};

var getNoteOffHandler = function(data) {
  return function() {
    noteOff(data);
  };
};

exports.noteClick = setupNoteClickHandlers;
exports.octaveClick = setupOctaveClickHandlers;
exports.noteOff = getNoteOffHandler;
