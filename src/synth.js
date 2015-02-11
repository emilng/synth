
var generateNoteMappings = function() {

  var TWELFTH_ROOT_OF_TWO = 1.059463094359;
  var NOTE_NAMES = ["A","A#","B","C","C#","D","D#","E","F","F#","G","G#"];
  var middleA = 440;
  var octaveOffset = -4;
  var noteOffset = 3;
  var midiOffset = 21 + noteOffset;
  var notes = [];

  var i = 0;
  while(i < 88) {
    var note = i + noteOffset;
    var nameIndex = (note % 12);
    var octave = Math.floor(note/12);
    var frequency = middleA * Math.pow(TWELFTH_ROOT_OF_TWO, (octaveOffset * 12) + note);
    var midiCode = i + midiOffset;
    notes.push({
      frequency:frequency,
      midi: midiCode,
      name: NOTE_NAMES[nameIndex],
      octave: octave
    });
    i++;
  }

  return notes;
};

var processKeys = function(data) {
  var getClickHandler = function(data, index) {
    return function(e) {
      triggerNote(data, index);
    };
  };
  var i = 0;
  while(i < 18) {
    var key = document.getElementById('key-' + i);
    key.addEventListener('mousedown', getClickHandler(data, i));
    i++;
  }
};

var triggerNote = function(data, keyIndex) {
  if (!data.hasOwnProperty('osc') || data.osc === false) {
    var osc = data.context.createOscillator();
    osc.type = osc.SINE;
    var notes = data.notes;
    var note = notes[(data.octave * 12) + keyIndex];
    osc.frequency.value = note.frequency;
    osc.connect(data.context.destination);
    osc.start(0);
    data.osc = osc;
  }
};

var soundOff = function(data) {
  if (data.hasOwnProperty('osc') && data.osc !== false) {
    data.osc.stop(0);
    data.osc = false;
  }
};

var getSoundOffHandler = function(data) {
  return function(e) {
    soundOff(data);
  };
};

var getKeyDownHandler = function(data) {
  var keys = ["A", "W", "S", "E", "D", "F", "T", "G", "Y", "H", "U", "J", "K", "O", "L", "P", ";", "'"];
  return function(e) {
    var keyCode = e.keyCode;
    var keyChar;
    if (keyCode === 186 || keyCode === 59) {
      keyChar = ";";
    } else if (keyCode === 222 || keyCode === 39) {
      keyChar = "'";
    } else {
      keyChar = String.fromCharCode(e.keyCode);
    }
    var keyIndex = keys.indexOf(keyChar);
    if (keyIndex > -1) {
      triggerNote(data, keyIndex);
    }
  };
};

var getKeyUpHandler = function(data) {
  return function(e) {
    soundOff(data);
  };
};

var main = function(context) {

  var destination = context.destination;
  var data = {octave: 3, osc: false, context:context};

  data.notes = generateNoteMappings();
  processKeys(data);

  document.addEventListener('mouseup', getSoundOffHandler(data));
  document.addEventListener('keydown', getKeyDownHandler(data));
  document.addEventListener('keyup', getKeyUpHandler(data));

  var playButton = document.getElementById('play-button');
  playButton.addEventListener('click', function(e) {
    if (!data.hasOwnProperty('osc') || data.osc === false) {
      var osc = context.createOscillator();
      osc.type = osc.SINE;
      osc.frequency.value = 440;
      osc.connect(destination);
      osc.start(0);
      data.osc = osc;
    }
  });

  var stopButton = document.getElementById('stop-button');
  stopButton.addEventListener('click', function(e) {
    if (data.hasOwnProperty('osc') && data.osc !== false) {
      data.osc.stop(0);
      data.osc = false;
    }
  });
};

window.addEventListener('load', init, false);

function init() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var context = new AudioContext();
  main(context);
}