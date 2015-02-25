var updateOctave = function(data, direction) {
  var audio = data.audio;
  audio.octave = Math.max(0, Math.min(6,audio.octave + direction));
  var octaveDisplay = document.getElementById("octave-display");
  octaveDisplay.innerHTML = "Octave " + audio.octave;
};

module.exports = updateOctave;