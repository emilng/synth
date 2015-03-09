var data = {
  audio: {
    context: null,
    gainNodes: [],
    masterGain: null,
    analyser: null,
    octave: 3,
    notes: null,
    envelope: {
      delayTime: 0,
      attackTime: 0.1,
      decayTime: 0.1,
      sustainTime: 0,
      releaseTime: 0.1,
      delayValue: 0,
      attackValue: 1,
      decayValue: 0.5,
      sustainValue: 0.5,
      releaseValue: 0
    },
    activeNotes: null
  },
  ui: {
    keyChars: ["A", "W", "S", "E", "D", "F", "T", "G", "Y", "H", "U", "J", "K", "O", "L", "P", ";", "'"],
    keyboard: null,
    keyDimensions: null,
    keyOffsets: [],
    envelope: {
      width: 400,
      height: 150,
      minSpacing: 20,
      maxSpacing: 60,
      marginY: 20,
      marginX: 25,
      // enough room to give the 4 elements before it maxSpacing
      releaseMin: 295,
    }
  },
  notesChanged: true,
  envelopeChanged: true
};

module.exports = data;