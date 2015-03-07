var updateEnvelope = function(data) {
  var audioEnvelope = data.audio.envelope;
  var envelopeData = data.ui.envelope;

  var envelopeSvg = document.getElementById('svg-envelope');
  var boundRect = envelopeSvg.getBoundingClientRect();
  var width = envelopeSvg.getAttributeNS(null, 'width');
  var height = envelopeSvg.getAttributeNS(null, 'height');

  var releaseMin = envelopeData.releaseMin;
  var minSpacing = envelopeData.minSpacing;
  var maxSpacing = envelopeData.maxSpacing;
  var marginX = envelopeData.marginX;
  var marginY = envelopeData.marginY;
  var bottomY = height - marginY;
  var drawHeight = height - (marginY * 2);

  var propNames = ['delay', 'attack', 'decay', 'sustain', 'release'];

  var between = function(value, min, max) {
    return Math.min(Math.max(value, min), max);
  };

  var addMouseHandlers = function(params) {
    var mouseUpHandler = function(e) {
      envelopeSvg.style.cursor = '';
      document.removeEventListener('mousemove', timeDragHandler);
      document.removeEventListener('mousemove', valueTimeDragHandler);
      document.removeEventListener('mouseup', mouseUpHandler);
    };

    var timeDragHandler = function(e) {
      var x = parseInt(params.timeRect.getAttributeNS(null, 'x'), 10);
      var xOffset = e.clientX - boundRect.left;
      var newX = between(xOffset - (params.previousX + minSpacing), 0, maxSpacing);
      var paramTime = newX/maxSpacing;
      audioEnvelope[params.name + 'Time'] = paramTime;
      data.envelopeChanged = true;
    };

    var valueTimeDragHandler = function(e) {
      var y = parseInt(params.valueTimeRect.getAttributeNS(null, 'y'), 10);
      var newY = between(e.clientY - marginY, 0, drawHeight);
      var paramValue = 1 - (newY/drawHeight);
      audioEnvelope[params.name + 'Value'] = paramValue;
      if (params.name === 'sustain' || params.name === 'decay') {
        audioEnvelope.decayValue = paramValue;
        audioEnvelope.sustainValue = paramValue;
      }
      timeDragHandler(e);
      data.envelopeChanged = true;
    };

    var startTimeDrag = function(e) {
      envelopeSvg.style.cursor = 'ew-resize';
      document.addEventListener('mousemove', timeDragHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    };

    var startValueTimeDrag = function(e) {
      if (params.name === 'sustain') {
        envelopeSvg.style.cursor = 'ns-resize';
      } else {
        envelopeSvg.style.cursor = 'move';
      }
      document.addEventListener('mousemove', valueTimeDragHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    };

    var overTime = function(e) {
      if (envelopeSvg.style.cursor === '') {
        params.timeRect.style.cursor = 'ew-resize';
      }
    };

    var leaveTime = function(e) {
      if (envelopeSvg.style.cursor === '') {
        params.timeRect.style.cursor = '';
      }
    };

    var overValueTime = function(e) {
      if (envelopeSvg.style.cursor === '') {
        params.valueTimeRect.style.cursor = (params.name === 'sustain') ? 'ns-resize' : 'move';
      }
    };

    var leaveValueTime = function(e) {
      if (envelopeSvg.style.cursor === '') {
        params.valueTimeRect.style.cursor = '';
      }
    };

    if (params.name !== 'sustain') {
      params.timeRect.addEventListener('mousedown', startTimeDrag);
      params.timeRect.addEventListener('mouseover', overTime);
      params.timeRect.addEventListener('mouseleave', leaveTime);
    }
    params.valueTimeRect.addEventListener('mousedown', startValueTimeDrag);
    params.valueTimeRect.addEventListener('mouseover', overValueTime);
    params.valueTimeRect.addEventListener('mouseleave', leaveValueTime);
  };

  var params = propNames.reduce(function(params, name) {
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
    addMouseHandlers(elementParams);
    params.push(elementParams);
    return params;
  }, []);

  var previousY = bottomY - (audioEnvelope.delayValue * drawHeight);
  var previousX = marginX;

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

  params.forEach(function(param, index) {
    var currentY = bottomY - (audioEnvelope[param.value] * drawHeight);
    var currentX = previousX + minSpacing + (audioEnvelope[param.time] * maxSpacing);
    param.previousX = previousX;
    currentX = (param.name === 'sustain') ? releaseMin : currentX;
    updateLine(param.valueLine, previousX, previousY, currentX, currentY);
    updateLine(param.timeLine, currentX, 0, currentX, height);
    updateLabel(param.label, previousX + 3, bottomY + 12);
    updateRect(param.timeRect, currentX - 5, 0, 10, height);
    updateRect(param.valueTimeRect, currentX - 5, currentY - 5, 10, 10);
    previousX = currentX;
    previousY = currentY;
  });

};

module.exports = updateEnvelope;