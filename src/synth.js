
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
  var osc = data.oscillators[keyIndex];
  if (osc === null) {
    osc = data.context.createOscillator();
    osc.type = osc.SINE;
    var notes = data.notes;
    var note = notes[(data.octave * 12) + keyIndex];
    osc.frequency.value = note.frequency;
    osc.connect(data.context.destination);
    osc.start(0);
    data.oscillators[keyIndex] = osc;
  }
};

var soundOff = function(data, keyIndex) {
  if (keyIndex === undefined) {
    data.oscillators = data.oscillators.map(function(osc) {
      if (osc !== null) {
        osc.stop();
      }
      return null;
    });
  } else if (data.oscillators[keyIndex] !== null) {
    data.oscillators[keyIndex].stop(0);
    data.oscillators[keyIndex] = null;
  }
};

var getSoundOffHandler = function(data) {
  return function(e) {
    soundOff(data);
  };
};

var getKeyDownHandler = function(data) {
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
    var keyIndex = data.keyChars.indexOf(keyChar);
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

var main = function() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var context = new AudioContext();
  var destination = context.destination;
  var keyChars = ["A", "W", "S", "E", "D", "F", "T", "G", "Y", "H", "U", "J", "K", "O", "L", "P", ";", "'"];
  var oscillators = keyChars.map(function() { return null; });
  var data = {keyChars: keyChars, octave: 3, oscillators: oscillators, context:context};

  data.notes = generateNoteMappings();
  processKeys(data);

  document.addEventListener('mouseup', getSoundOffHandler(data));
  document.addEventListener('keydown', getKeyDownHandler(data));
  document.addEventListener('keyup', getKeyUpHandler(data));
};

window.addEventListener('load', main, false);