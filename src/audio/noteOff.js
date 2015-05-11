var noteOff = function(data, keyIndex) {
  var RELEASE_MAX_TIME = 10;

  var audio = data.audio;
  var envelope = data.audio.envelope;
  var now = audio.context.currentTime;

  var singleNoteOff = function(keyIndex) {
    var gainNode = audio.gainNodes[keyIndex];
    if (gainNode) {
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      var releaseTime = now + (envelope.releaseTime * RELEASE_MAX_TIME);
      gainNode.gain.linearRampToValueAtTime(0, releaseTime);
    }
    audio.activeNotes[keyIndex] = false;
  };

  var isNoteActive = ((keyIndex !== undefined) && (audio.activeNotes[keyIndex] === true));
  if (isNoteActive) {
    singleNoteOff(keyIndex);
  } else {
    audio.activeNotes = audio.activeNotes.map(function(isNoteActive, index) {
      if (isNoteActive) {
        singleNoteOff(index);
      }
      return false;
    });
  }
  data.notesChanged = true;
};

module.exports = noteOff;
