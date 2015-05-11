var noteOn = function(data, keyIndex) {
  var DELAY_MAX_TIME = 2.3;
  var ATTACK_MAX_TIME = 10;
  var DECAY_MAX_TIME = 20;
  var audio = data.audio;
  var octave = audio.octave;
  if (keyIndex >= audio.activeNotes.length) {
    octave++;
    keyIndex = keyIndex - audio.activeNotes.length;
  }
  var isNoteActive = audio.activeNotes[keyIndex];
  if (!isNoteActive) {
    var envelope = data.audio.envelope;
    var now = audio.context.currentTime;
    audio.activeNotes[keyIndex] = true;
    var notes = audio.notes;
    var noteIndex = (octave * 12) + keyIndex;
    if (noteIndex < notes.length - 1) {
      var note = notes[noteIndex];
      var osc = audio.oscillatorNodes[keyIndex];
      var gainNode = audio.gainNodes[keyIndex];
      osc.type = osc.SINE;
      osc.noteIndex = noteIndex;
      osc.frequency.value = note.frequency;
      var startTime = now + 0.01;
      var delayTime = startTime + (envelope.delayTime * DELAY_MAX_TIME);
      var attackTime = delayTime + (envelope.attackTime * ATTACK_MAX_TIME);
      var decayTime = attackTime + (envelope.decayTime * DECAY_MAX_TIME);
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.setValueAtTime(envelope.delayValue, startTime);
      gainNode.gain.linearRampToValueAtTime(envelope.delayValue, delayTime);
      gainNode.gain.linearRampToValueAtTime(envelope.attackValue, attackTime);
      gainNode.gain.linearRampToValueAtTime(envelope.decayValue, decayTime);
      data.notesChanged = true;
    }
  }
};

module.exports = noteOn;
