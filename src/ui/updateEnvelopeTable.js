
var getUpdateEnvelopeTableHandler = function(data) {
  var envelopeAudio = data.audio.envelope;
  var envelopeUI = data.ui.envelope;

  var getCellObj = function(cellId, cellName) {
    var cellElement = document.getElementById(cellId);
    var cellObj = { element: cellElement, name: cellName };
    return (cellElement) ? cellObj : null;
  };

  var tableCells = envelopeUI.propNames.reduce(function(cells, name) {
    var timeCell = getCellObj(name + '-time-cell', name + 'Time');
    var valueCell = getCellObj(name + '-value-cell', name + 'Value');
    if (timeCell) {
      cells.push(timeCell);
    }
    if (valueCell) {
      cells.push(valueCell);
    }
    return cells;
  }, []);

  tableCells.forEach(function(cell) {
    cell.element.addEventListener('change', function() {
      envelopeAudio[cell.name] = parseInt(cell.element.value, 10) / 100;
      data.envelopeChanged = true;
    });
  });

  var updateEnvelopeTable = function() {
    tableCells.forEach(function(cell) {
      var value = envelopeAudio[cell.name];
      cell.element.value = value * 100;
    });
  };

  return updateEnvelopeTable;
};

module.exports = getUpdateEnvelopeTableHandler;
