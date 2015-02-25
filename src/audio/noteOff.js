var noteOff = function(data, keyIndex) {
  var audio = data.audio;
  var now = audio.context.currentTime;
  var isNoteActive = ((keyIndex !== undefined) && (audio.activeNotes[keyIndex] === true));
  if (isNoteActive) {
    var gainNode = audio.gainNodes[keyIndex];
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setTargetAtTime(0, now, 0.1);
    audio.activeNotes[keyIndex] = false;
    data.notesChanged = true;
  } else {
    audio.activeNotes = audio.activeNotes.map(function(isNoteActive, index) {
      if (isNoteActive) {
        var gainNode = audio.gainNodes[index];
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setTargetAtTime(0, now, 0.1);
        audio.activeNotes[keyIndex] = false;
      }
      return false;
    });
    data.notesChanged = true;
  }
};

module.exports = noteOff;