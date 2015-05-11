var addMouseHandlers = require('./envelopeMouseHandlers.js');

var getUpdateEnvelopeVisualHandler = function(data) {
  var audioEnvelope = data.audio.envelope;
  var envelopeData = data.ui.envelope;

  var height = envelopeData.height;

  var releaseMin = envelopeData.releaseMin;
  var minSpacing = envelopeData.minSpacing;
  var maxSpacing = envelopeData.maxSpacing;
  var marginX = envelopeData.marginX;
  var marginY = envelopeData.marginY;
  var bottomY = height - marginY;
  var drawHeight = height - (marginY * 2);

  var params = envelopeData.propNames.reduce(function(params, name) {
    var elementParams = {
      timeLine: document.getElementById('envelope-' + name + '-time'),
      valueLine: document.getElementById('envelope-' + name + '-value'),
      label: document.getElementById('envelope-' + name + '-label'),
      timeRect: document.getElementById('envelope-' + name + '-time-rect'),
      valueTimeRect: document.getElementById('envelope-' + name + '-value-time-rect'),
      value: name + 'Value',
      time: name + 'Time',
      name: name,
      previousX: 0
    };
    addMouseHandlers(data, elementParams);
    params.push(elementParams);
    return params;
  }, []);

  var updateLine = function(line, x1, y1, x2, y2) {
    line.setAttributeNS(null, 'x1', x1);
    line.setAttributeNS(null, 'y1', y1);
    line.setAttributeNS(null, 'x2', x2);
    line.setAttributeNS(null, 'y2', y2);
  };

  var updateLabel = function(label, x, y) {
    label.setAttributeNS(null, 'x', x);
    label.setAttributeNS(null, 'y', y);
  };

  var updateRect = function(rect, x, y, width, height) {
    rect.setAttributeNS(null, 'x', x);
    rect.setAttributeNS(null, 'y', y);
    rect.setAttributeNS(null, 'width', width);
    rect.setAttributeNS(null, 'height', height);
  };

  var updateEnvelopeVisual = function() {
    var previousY = bottomY - (audioEnvelope.delayValue * drawHeight);
    var previousX = marginX;

    params.forEach(function(param) {
      var currentY = bottomY - (audioEnvelope[param.value] * drawHeight);
      var currentX = previousX + minSpacing + (audioEnvelope[param.time] * maxSpacing);
      param.previousX = previousX;
      currentX = (param.name === 'sustain') ? releaseMin : currentX;
      updateLine(param.valueLine, previousX, previousY, currentX, currentY);
      updateLine(param.timeLine, currentX, 0, currentX, height);
      updateLabel(param.label, previousX + 3, bottomY + 12);
      if (param.name !== 'sustain') {
        updateRect(param.timeRect, currentX - 5, 0, 10, height);
      }
      if (param.name !== 'release') {
        updateRect(param.valueTimeRect, currentX - 5, currentY - 5, 10, 10);
      }
      previousX = currentX;
      previousY = currentY;
    });
  };

  return updateEnvelopeVisual;
};

module.exports = getUpdateEnvelopeVisualHandler;
