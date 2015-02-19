
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
  var offset = 0;
  var whiteKeyWidth = 6;
  var blackKeyWidth = 4;
  var whiteKeyHeight = 22;
  var blackKeyHeight = 14;
  var keys = {
    black: {width: 4, height: 14},
    white: {width: 6, height: 22}
  };
  data.keys = keys;
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#000';
  var maxKey = 73;
  // get offsets
  data.notes.map(function(note, index) {
    if (index < maxKey) {
      if (note.name.length === 1) {
        note.offset = offset;
        offset = offset + keys.white.width;
      } else {
        note.offset = offset - Math.round(keys.white.width/2) + 1;
      }
    }
  });
  // draw white keys
  data.notes.map(function(note, index) {
    if (index < maxKey) {
      if (note.name.length === 1) {
        ctx.strokeRect(note.offset, 0, keys.white.width, keys.white.height);
      }
    }
  });
  // draw black keys
  data.notes.map(function(note, index) {
    if (index < maxKey) {
      if (note.name.length == 2) {
        ctx.fillRect(note.offset, 0, keys.black.width, keys.black.height);
      }
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
  var octave = data.octave;
  if (keyIndex >= data.oscillators.length) {
    octave++;
    keyIndex = keyIndex - data.oscillators.length;
  }
  var osc = data.oscillators[keyIndex];
  if (osc === null) {
    osc = data.context.createOscillator();
    osc.type = osc.SINE;
    var notes = data.notes;
    var noteIndex = (octave * 12) + keyIndex;
    if (noteIndex < notes.length - 1) {
      var note = notes[noteIndex];
      osc.noteIndex = noteIndex;
      osc.frequency.value = note.frequency;
      osc.connect(data.context.destination);
      osc.start(0);
      data.oscillators[keyIndex] = osc;
      data.notesChanged = true;
    }
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
    data.notesChanged = true;
  } else if (data.oscillators[keyIndex] !== null) {
    data.oscillators[keyIndex].stop(0);
    data.oscillators[keyIndex] = null;
    data.notesChanged = true;
  }
};

var updateOctave = function(data, direction) {
  data.octave = Math.max(0, Math.min(6,data.octave + direction));
  var octaveDisplay = document.getElementById("octave-display");
  octaveDisplay.innerHTML = "Octave " + data.octave;
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
  var canvas = document.getElementById('full-keyboard');
  var ctx = canvas.getContext('2d');
  ctx.putImageData(data.keyboard, 0, 0);
  var keys = data.keys;
  ctx.fillStyle = 'rgba(140,140,140,0.8)';
  data.oscillators.map(function(osc) {
    if (osc !== null) {
      var note = data.notes[osc.noteIndex];
      if (note.name.length === 1) {
        ctx.fillRect(note.offset, 0, keys.white.width, keys.white.height);
      } else {
        ctx.fillRect(note.offset, 0, keys.black.width, keys.black.height);
      }
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
  var destination = context.destination;
  var keyChars = ["A", "W", "S", "E", "D", "F", "T", "G", "Y", "H", "U", "J", "K", "O", "L", "P", ";", "'"];
  var oscillators = keyChars.map(function() { return null; });
  var data = {
    keyChars: keyChars,
    octave: 3,
    oscillators: oscillators,
    context:context,
    notesChanged: true
  };

  data.notes = generateNoteMappings();
  data.keyboard = generateKeyboard(data);
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
