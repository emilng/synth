
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

var main = function(context) {

  var destination = context.destination;
  var data = {};

  var notes = generateNoteMappings();

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