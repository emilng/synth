
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

var generateKeyboard = function(data) {
  var keyboard = document.getElementById('full-keyboard');
  var canvas = document.createElement('canvas');
  canvas.setAttribute('width', 400);
  canvas.setAttribute('height', 30);
  var ctx = canvas.getContext('2d');
  var keyDimensions = data.ui.keyDimensions = {
    black: {width: 4, height: 14},
    white: {width: 6, height: 22}
  };
  var halfWhiteKeyWidth = Math.round(keyDimensions.white.width/2);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#000';
  var maxKey = 87;
  var offset = 0;
  var notes = data.sound.notes;
  var offsets = data.ui.keyOffsets;
  // get offsets
  for (var i = 0; i < maxKey; i++) {
    if (notes[i].name.length === 1) {
      offsets.push(offset);
      offset = offset + keyDimensions.white.width;
    } else {
      offsets.push(offset - halfWhiteKeyWidth + 1);
    }
  }
  // draw white keys. white keys have to be drawn before black keys
  offsets.map(function(offset, index) {
    if (notes[index].name.length === 1) {
      ctx.strokeRect(offset, 0, keyDimensions.white.width, keyDimensions.white.height);
    }
  });
  // draw black keys
  offsets.map(function(offset, index) {
    if (notes[index].name.length === 2) {
      ctx.fillRect(offset, 0, keyDimensions.black.width, keyDimensions.black.height);
    }
  });
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
};

var setupNoteClickHandlers = function(data) {
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

var setupOctaveClickHandlers = function(data) {
  var getClickHandler = function(data, direction) {
    return function(e) {
      updateOctave(data, direction);
    };
  };
  var octaveDown = document.getElementById('octave-down');
  octaveDown.addEventListener('click', getClickHandler(data, -1));
  var octaveUp = document.getElementById('octave-up');
  octaveUp.addEventListener('click', getClickHandler(data, 1));
};

var triggerNote = function(data, keyIndex) {
  var sound = data.sound;
  var octave = sound.octave;
  if (keyIndex >= sound.oscillators.length) {
    octave++;
    keyIndex = keyIndex - sound.oscillators.length;
  }
  var osc = sound.oscillators[keyIndex];
  if (osc === null) {
    osc = sound.context.createOscillator();
    osc.type = osc.SINE;
    var notes = sound.notes;
    var noteIndex = (octave * 12) + keyIndex;
    if (noteIndex < notes.length - 1) {
      var note = notes[noteIndex];
      osc.noteIndex = noteIndex;
      osc.frequency.value = note.frequency;
      osc.connect(sound.context.destination);
      osc.start(0);
      sound.oscillators[keyIndex] = osc;
      data.notesChanged = true;
    }
  }
};

var soundOff = function(data, keyIndex) {
  var sound = data.sound;
  if (keyIndex === undefined) {
    sound.oscillators = sound.oscillators.map(function(osc) {
      if (osc !== null) {
        osc.stop();
      }
      return null;
    });
    data.notesChanged = true;
  } else if (sound.oscillators[keyIndex] !== null) {
    sound.oscillators[keyIndex].stop(0);
    sound.oscillators[keyIndex] = null;
    data.notesChanged = true;
  }
};

var updateOctave = function(data, direction) {
  var sound = data.sound;
  sound.octave = Math.max(0, Math.min(6,sound.octave + direction));
  var octaveDisplay = document.getElementById("octave-display");
  octaveDisplay.innerHTML = "Octave " + sound.octave;
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
    if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) {
      return;
    }
    // there 2 separate keycodes for semicolon and single quote because browsers
    if (keyCode === 186 || keyCode === 59) {
      keyChar = ";";
    } else if (keyCode === 222 || keyCode === 39) {
      keyChar = "'";
    } else {
      keyChar = String.fromCharCode(e.keyCode);
    }
    var keyIndex = data.ui.keyChars.indexOf(keyChar);
    if (keyIndex > -1) {
      triggerNote(data, keyIndex);
      e.preventDefault();
    }
    if (keyChar === "Z") {
      updateOctave(data, -1);
    } else if (keyChar === "X") {
      updateOctave(data, 1);
    }
  };
};

var getKeyUpHandler = function(data) {
  return function(e) {
    soundOff(data);
  };
};

var updateKeyboard = function(data) {
  var sound = data.sound;
  var ui = data.ui;
  var canvas = document.getElementById('full-keyboard');
  var ctx = canvas.getContext('2d');
  ctx.putImageData(ui.keyboard, 0, 0);
  var keys = data.keys;
  ctx.fillStyle = 'rgba(140,140,140,0.8)';
  sound.oscillators.map(function(osc, index) {
    var key = document.getElementById('key-' + index);
    var offset = ui.keyOffsets[sound.octave * 12 + index];
    var note = sound.notes[sound.octave * 12 + index];
    var keyType = (note.name.length === 1) ? 'white' : 'black';
    if (osc !== null) {
        ctx.fillRect(offset, 0, ui.keyDimensions[keyType].width, ui.keyDimensions[keyType].height);
        key.setAttribute('class', 'down-' + keyType + '-key');
    } else {
      key.setAttribute('class', keyType + '-key');
    }
  });
};

var getUpdateHandler = function(data) {
  var update = function() {
    if (data.notesChanged) {
      updateKeyboard(data);
      data.notesChanged = false;
    }
    requestAnimationFrame(update);
  };
  return update;
};

var main = function() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var context = new AudioContext();
  var keyChars = ["A", "W", "S", "E", "D", "F", "T", "G", "Y", "H", "U", "J", "K", "O", "L", "P", ";", "'"];
  var oscillators = keyChars.map(function() { return null; });
  var data = {
    sound: {
      context:context,
      oscillators: oscillators,
      octave: 3,
      notes: null
    },
    ui: {
      keyChars: keyChars,
      keyboard: null,
      keyDimensions: null,
      keyOffsets: []
    },
    notesChanged: true
  };

  data.sound.notes = generateNoteMappings();
  data.ui.keyboard = generateKeyboard(data);
  setupNoteClickHandlers(data);
  setupOctaveClickHandlers(data);
  updateOctave(data, 0);
  var update = getUpdateHandler(data);
  requestAnimationFrame(update);

  document.addEventListener('mouseup', getSoundOffHandler(data));
  document.addEventListener('keydown', getKeyDownHandler(data));
  document.addEventListener('keyup', getKeyUpHandler(data));
};

window.addEventListener('load', main, false);
