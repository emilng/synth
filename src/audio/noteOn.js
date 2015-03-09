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
      gainNode.gain.setValueAtTime(envelope.delayValue, now);
      var delayTime = now + (envelope.delayTime * DELAY_MAX_TIME);
      var attackTime = delayTime + (envelope.attackTime * ATTACK_MAX_TIME);
      var decayTime = attackTime + (envelope.decayTime * DECAY_MAX_TIME);
      gainNode.gain.linearRampToValueAtTime(envelope.delayValue, delayTime);
      gainNode.gain.linearRampToValueAtTime(envelope.attackValue, attackTime);
      gainNode.gain.linearRampToValueAtTime(envelope.decayValue, decayTime);
      data.notesChanged = true;
    }
  }
};

module.exports = noteOn;