// data object that contains state of whole app
var data = require('./data/data.js');

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
var getUpdateEnvelopeVisualHandler = require('./ui/updateEnvelopeVisual.js');
var getUpdateEnvelopeTableHandler = require('./ui/updateEnvelopeTable.js');
var updateKeyboard = require('./ui/updateKeyboard.js');
var getDrawVisualizerHandler = require('./ui/drawVisualizer.js');

var getUpdateHandler = function(data) {
  var drawVisualizer = getDrawVisualizerHandler(data);
  var updateEnvelopeTable = getUpdateEnvelopeTableHandler(data);
  var updateEnvelopeVisual = getUpdateEnvelopeVisualHandler(data);
  var update = function() {
    if (data.notesChanged) {
      updateKeyboard(data);
      data.notesChanged = false;
    }
    if (data.envelopeChanged) {
      updateEnvelopeVisual();
      updateEnvelopeTable();
      data.envelopeChanged = false;
    }
    drawVisualizer();

    requestAnimationFrame(update);
  };
  return update;
};

var main = function() {
  var AudioContext = window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var context = new AudioContext();
  var masterGain = context.createGain();
  masterGain.gain.value = 0.5;
  data.ui.keyChars.forEach(function(value, index) {
    var osc = context.createOscillator();
    osc.type = 'sine';
    osc.start(0);
    data.audio.oscillatorNodes[index] = osc;
    var gainNode = context.createGain();
    gainNode.gain.setValueAtTime(0, 0);
    data.audio.gainNodes[index] = gainNode;
    osc.connect(gainNode);
    gainNode.connect(masterGain);
  });
  var compressor = context.createDynamicsCompressor();
  var analyser = context.createAnalyser();
  masterGain.connect(compressor);
  compressor.connect(analyser);
  analyser.connect(context.destination);
  data.audio.context = context;
  data.audio.masterGain = masterGain;
  data.audio.analyser = analyser;

  data.audio.activeNotes = data.ui.keyChars.map(function() { return false; });
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
