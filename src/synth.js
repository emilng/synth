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
var updateEnvelope = require('./ui/updateEnvelope.js');
var updateKeyboard = require('./ui/updateKeyboard.js');
var getDrawVisualizerHandler = require('./ui/drawVisualizer.js');

var getUpdateHandler = function(data) {
  var drawVisualizer = getDrawVisualizerHandler(data);
  var update = function() {
    if (data.notesChanged) {
      updateKeyboard(data);
      data.notesChanged = false;
    }
    if (data.envelopeChanged) {
      updateEnvelope(data);
      data.envelopeChanged = false;
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
      envelope: {
        delayTime: 0,
        attackTime: 0.1,
        decayTime: 0.1,
        sustainTime: 0,
        releaseTime: 0.1,
        delayValue: 0,
        attackValue: 1,
        decayValue: 0.5,
        sustainValue: 0.5,
        releaseValue: 0
      },
      activeNotes: activeNotes
    },
    ui: {
      keyChars: keyChars,
      keyboard: null,
      keyDimensions: null,
      keyOffsets: [],
      envelope: {
        width: 400,
        height: 150,
        minSpacing: 20,
        maxSpacing: 60,
        marginY: 20,
        marginX: 25,
        // enough room to give the 4 elements before it maxSpacing
        releaseMin: 295,
      }
    },
    notesChanged: true,
    envelopeChanged: true
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
