
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
  if (keyIndex >= sound.activeNotes.length) {
    octave++;
    keyIndex = keyIndex - sound.activeNotes.length;
  }
  var isNoteActive = sound.activeNotes[keyIndex];
  if (!isNoteActive) {
    var now = sound.context.currentTime;
    sound.activeNotes[keyIndex] = true;
    var notes = sound.notes;
    var noteIndex = (octave * 12) + keyIndex;
    if (noteIndex < notes.length - 1) {
      var note = notes[noteIndex];
      var osc = sound.context.createOscillator();
      var gainNode = sound.context.createGain();
      sound.gainNodes[keyIndex] = gainNode;
      osc.connect(gainNode);
      gainNode.connect(sound.masterGain);
      osc.type = osc.SINE;
      osc.noteIndex = noteIndex;
      osc.frequency.value = note.frequency;
      osc.start(now);
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.setTargetAtTime(1, now, 0.1);
      data.notesChanged = true;
    }
  }
};

var triggerChord = function(data, keyIndex) {
  triggerNote(data, keyIndex);
  triggerNote(data, keyIndex + 4);
  triggerNote(data, keyIndex + 7);
};

var soundOff = function(data, keyIndex) {
  var sound = data.sound;
  var now = sound.context.currentTime;
  var isNoteActive = ((keyIndex !== undefined) && (sound.activeNotes[keyIndex] === true));
  if (isNoteActive) {
    var gainNode = sound.gainNodes[keyIndex];
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setTargetAtTime(0, now, 0.1);
    sound.activeNotes[keyIndex] = false;
    data.notesChanged = true;
  } else {
    sound.activeNotes = sound.activeNotes.map(function(isNoteActive, index) {
      if (isNoteActive) {
        var gainNode = sound.gainNodes[index];
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setTargetAtTime(0, now, 0.1);
        sound.activeNotes[keyIndex] = false;
      }
      return false;
    });
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

var getKeyIndex = function(data, keyCode) {
    // there 2 separate keycodes for semicolon and single quote because browsers
    if (keyCode === 186 || keyCode === 59) {
      keyChar = ";";
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
      triggerNote(data, keyIndex);
      // triggerChord(data, keyIndex);
      e.preventDefault();
    }
    var keyChar = String.fromCharCode(keyCode);
    if (keyChar === "Z") {
      updateOctave(data, -1);
    } else if (keyChar === "X") {
      updateOctave(data, 1);
    }
  };
};

var getKeyUpHandler = function(data) {
  return function(e) {
    var keyIndex = getKeyIndex(data, e.keyCode);
    if (keyIndex > -1) {
      soundOff(data, keyIndex);
    }
  };
};

var getScales = function() {
  return {
    major: 'ttsttts'
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
  sound.activeNotes.map(function(isNoteActive, index) {
    var key = document.getElementById('key-' + index);
    var offset = ui.keyOffsets[sound.octave * 12 + index];
    var note = sound.notes[sound.octave * 12 + index];
    var keyType = (note.name.length === 1) ? 'white' : 'black';
    if (isNoteActive) {
        ctx.fillRect(offset, 0, ui.keyDimensions[keyType].width, ui.keyDimensions[keyType].height);
        key.setAttribute('class', 'down-' + keyType + '-key');
    } else {
      key.setAttribute('class', keyType + '-key');
    }
  });
};

// visualizer code based off of https://github.com/mdn/voice-change-o-matic/blob/gh-pages/scripts/app.js#L123-L167
var getUpdateHandler = function(data) {
  var visualizer = data.ui.visualizer;
  var analyser = data.sound.analyser;
  analyser.fftSize = 2048;
  var bufferLength = analyser.fftSize;
  var dataArray = new Uint8Array(bufferLength);

  var ctx = visualizer.getContext('2d');
  var width = visualizer.width;
  var height = visualizer.height;

  var update = function() {
    if (data.notesChanged) {
      updateKeyboard(data);
      data.notesChanged = false;
    }
    analyser.getByteTimeDomainData(dataArray);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillRect(0, 0, width, height);
    ctx.beginPath();

    var sliceWidth = width * (1.0/bufferLength);
    var x  = 0;
    for (var i = 0; i < bufferLength; i++) {
      var v = dataArray[i] / 128.0;
      var y = v * height/2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.lineTo(width, height/2);
    ctx.stroke();

    requestAnimationFrame(update);
  };
  return update;
};

var main = function() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  var context = new AudioContext();
  var keyChars = ["A", "W", "S", "E", "D", "F", "T", "G", "Y", "H", "U", "J", "K", "O", "L", "P", ";", "'"];
  var gainNodes = keyChars.map(function() { return context.createGain(); });
  var activeNotes = keyChars.map(function() { return false; });
  var masterGain = context.createGain();
  masterGain.gain.value = 0.5;
  var compressor = context.createDynamicsCompressor();
  var analyser = context.createAnalyser();
  masterGain.connect(compressor);
  compressor.connect(analyser);
  analyser.connect(context.destination);
  var visualizer = document.getElementById('visualizer');
  var data = {
    sound: {
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
      visualizer: visualizer
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
