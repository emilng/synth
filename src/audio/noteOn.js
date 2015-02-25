var noteOn = function(data, keyIndex) {
  var audio = data.audio;
  var octave = audio.octave;
  if (keyIndex >= audio.activeNotes.length) {
    octave++;
    keyIndex = keyIndex - audio.activeNotes.length;
  }
  var isNoteActive = audio.activeNotes[keyIndex];
  if (!isNoteActive) {
    var now = audio.context.currentTime;
    audio.activeNotes[keyIndex] = true;
    var notes = audio.notes;
    var noteIndex = (octave * 12) + keyIndex;
    if (noteIndex < notes.length - 1) {
      var note = notes[noteIndex];
      var osc = audio.context.createOscillator();
      var gainNode = audio.context.createGain();
      audio.gainNodes[keyIndex] = gainNode;
      osc.connect(gainNode);
      gainNode.connect(audio.masterGain);
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

module.exports = noteOn;