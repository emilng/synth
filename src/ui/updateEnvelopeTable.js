
var getUpdateEnvelopeTableHandler = function(data) {
  var envelopeAudio = data.audio.envelope;
  var envelopeUI = data.ui.envelope;

  var params = envelopeUI.propNames.reduce(function(params, name) {
    timeElement = document.getElementById(name + '-time-cell');
    valueElement = document.getElementById(name + '-value-cell');
    if (timeElement) {
      var timeObj = {
        element: timeElement,
        name: name + 'Time',
      };
      params.push(timeObj);
    }
    if (valueElement) {
      var valueObj = {
        element: valueElement,
        name: name + 'Value',
      };
      params.push(valueObj);
    }
    return params;
  }, []);

  params.forEach(function(param) {
    param.element.addEventListener('change', function() {
      envelopeAudio[param.name] = parseInt(param.element.value, 10)/100;
      data.envelopeChanged = true;
    });
  });

  var updateEnvelopeTable = function() {
    params.forEach(function(param) {
      var value = envelopeAudio[param.name];
      param.element.value = value * 100;
    });
  };

  return updateEnvelopeTable;
};

module.exports = getUpdateEnvelopeTableHandler;