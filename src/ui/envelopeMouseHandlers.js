var addMouseHandlers = function(data, params) {
  var audioEnvelope = data.audio.envelope;
  var envelopeData = data.ui.envelope;
  var envelopeSvg = document.getElementById('svg-envelope');
  var height = envelopeData.height;
  var minSpacing = envelopeData.minSpacing;
  var maxSpacing = envelopeData.maxSpacing;
  var marginY = envelopeData.marginY;
  var drawHeight = height - (marginY * 2);

  var between = function(value, min, max) {
    return Math.min(Math.max(value, min), max);
  };

  var timeDragHandler = function(e) {
    var boundRect = envelopeSvg.getBoundingClientRect();
    var xOffset = e.clientX - boundRect.left;
    var newX = between(xOffset - (params.previousX + minSpacing), 0, maxSpacing);
    var paramTime = newX / maxSpacing;
    audioEnvelope[params.name + 'Time'] = paramTime;
    data.envelopeChanged = true;
  };

  var valueTimeDragHandler = function(e) {
    var boundRect = envelopeSvg.getBoundingClientRect();
    var mouseY = e.clientY - boundRect.top;
    var newY = between(mouseY - marginY, 0, drawHeight);
    var paramValue = 1 - (newY / drawHeight);
    audioEnvelope[params.name + 'Value'] = paramValue;
    if (params.name === 'sustain' || params.name === 'decay') {
      audioEnvelope.decayValue = paramValue;
      audioEnvelope.sustainValue = paramValue;
    }
    if (params.name !== 'sustain') {
      timeDragHandler(e);
    }
    data.envelopeChanged = true;
  };

  var mouseUpHandler = function() {
    envelopeSvg.style.cursor = '';
    document.removeEventListener('mousemove', timeDragHandler);
    document.removeEventListener('mousemove', valueTimeDragHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  };

  var startTimeDrag = function() {
    envelopeSvg.style.cursor = 'ew-resize';
    document.addEventListener('mousemove', timeDragHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };

  var startValueTimeDrag = function() {
    if (params.name === 'sustain') {
      envelopeSvg.style.cursor = 'ns-resize';
    } else {
      envelopeSvg.style.cursor = 'move';
    }
    document.addEventListener('mousemove', valueTimeDragHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  };

  var overTime = function() {
    if (envelopeSvg.style.cursor === '') {
      params.timeRect.style.cursor = 'ew-resize';
    }
  };

  var leaveTime = function() {
    if (envelopeSvg.style.cursor === '') {
      params.timeRect.style.cursor = '';
    }
  };

  var overValueTime = function() {
    if (envelopeSvg.style.cursor === '') {
      params.valueTimeRect.style.cursor = (params.name === 'sustain') ? 'ns-resize' : 'move';
    }
  };

  var leaveValueTime = function() {
    if (envelopeSvg.style.cursor === '') {
      params.valueTimeRect.style.cursor = '';
    }
  };

  if (params.name !== 'sustain') {
    params.timeRect.addEventListener('mousedown', startTimeDrag);
    params.timeRect.addEventListener('mouseover', overTime);
    params.timeRect.addEventListener('mouseleave', leaveTime);
  }
  if (params.name !== 'release') {
    params.valueTimeRect.addEventListener('mousedown', startValueTimeDrag);
    params.valueTimeRect.addEventListener('mouseover', overValueTime);
    params.valueTimeRect.addEventListener('mouseleave', leaveValueTime);
  }
};

module.exports = addMouseHandlers;
