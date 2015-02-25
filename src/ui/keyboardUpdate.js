var updateKeyboard = function(data) {
  var audio = data.audio;
  var ui = data.ui;
  var canvas = document.getElementById('full-keyboard');
  var ctx = canvas.getContext('2d');
  ctx.putImageData(ui.keyboard, 0, 0);
  var keys = data.keys;
  ctx.fillStyle = 'rgba(140,140,140,0.8)';
  audio.activeNotes.map(function(isNoteActive, index) {
    var key = document.getElementById('key-' + index);
    var offset = ui.keyOffsets[audio.octave * 12 + index];
    var note = audio.notes[audio.octave * 12 + index];
    var keyType = (note.name.length === 1) ? 'white' : 'black';
    if (isNoteActive) {
        ctx.fillRect(offset, 0, ui.keyDimensions[keyType].width, ui.keyDimensions[keyType].height);
        key.setAttribute('class', 'down-' + keyType + '-key');
    } else {
      key.setAttribute('class', keyType + '-key');
    }
  });
};

module.exports = updateKeyboard;