// visualizer code based off of https://github.com/mdn/voice-change-o-matic/blob/gh-pages/scripts/app.js#L123-L167
var getDrawVisualizerHandler = function(data) {
  var visualizer = document.getElementById('visualizer');
  var analyser = data.audio.analyser;
  analyser.fftSize = 2048;
  var bufferLength = analyser.fftSize;
  var dataArray = new Uint8Array(bufferLength);

  var ctx = visualizer.getContext('2d');
  var width = visualizer.width;
  var height = visualizer.height;

  var drawVisualizer = function() {
    analyser.getByteTimeDomainData(dataArray);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#EEE';
    ctx.fillRect(0, 0, width, height);
    ctx.beginPath();

    var sliceWidth = width * (1.0/bufferLength);
    var x  = 0;
    for (var i = 0; i < bufferLength; i++) {
      var v = dataArray[i] / 128.0;
      var y = v * height/2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.lineTo(width, height/2);
    ctx.stroke();
  };
  return drawVisualizer;
};

module.exports = getDrawVisualizerHandler;