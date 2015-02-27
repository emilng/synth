// audio init
var generateNoteMappings = require('./audio/generateNoteMappings.js');

// audio update
var updateOctave = require('./audio/updateOctave.js');

// ui init
var initKeyboard = require('./ui/initKeyboard.js');

// ui interaction
var clickHandlers = require('./ui/clickHandlers.js');
var keyHandlers = require('./ui/keyHandlers');

// ui update
var updateKeyboard = require('./ui/updateKeyboard.js');
var getDrawVisualizerHandler = require('./ui/drawVisualizer.js');

var getUpdateHandler = function(data) {
  var drawVisualizer = getDrawVisualizerHandler(data);
  var update = function() {
    if (data.notesChanged) {
      updateKeyboard(data);
      data.notesChanged = false;
    }
    drawVisualizer();

    requestAnimationFrame(update);
  };
  return update;
};

var main = function() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var context = new AudioContext();
  var keyChars = ["A", "W", "S", "E", "D", "F", "T", "G", "Y", "H", "U", "J", "K", "O", "L", "P", ";", "'"];
  var activeNotes = keyChars.map(function() { return false; });
  var masterGain = context.createGain();
  masterGain.gain.value = 0.5;
  var compressor = context.createDynamicsCompressor();
  var analyser = context.createAnalyser();
  masterGain.connect(compressor);
  compressor.connect(analyser);
  analyser.connect(context.destination);
  var data = {
    audio: {
      context:context,
      gainNodes: [],
      masterGain: masterGain,
      analyser: analyser,
      octave: 3,
      notes: null,
      activeNotes: activeNotes
    },
    ui: {
      keyChars: keyChars,
      keyboard: null,
      keyDimensions: null,
      keyOffsets: [],
    },
    notesChanged: true
  };

  data.audio.notes = generateNoteMappings();
  data.ui.keyboard = initKeyboard(data);
  clickHandlers.noteClick(data);
  clickHandlers.octaveClick(data);
  updateOctave(data, 0);
  var update = getUpdateHandler(data);
  requestAnimationFrame(update);

  document.addEventListener('mouseup', clickHandlers.noteOff(data));
  document.addEventListener('keydown', keyHandlers.keyDown(data));
  document.addEventListener('keyup', keyHandlers.keyUp(data));
};

window.addEventListener('load', main, false);
