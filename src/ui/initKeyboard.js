var initKeyboard = function(data) {
  var keyboard = document.getElementById('full-keyboard');
  var canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 30;
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
  var notes = data.audio.notes;
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

module.exports = initKeyboard;