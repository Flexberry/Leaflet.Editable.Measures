QUnit.module('measure', function () {

  let editLayer = new L.LayerGroup();
  let featuresLayer = new L.LayerGroup();

  let leafletMap = L.map(document.createElement('div'), {
    center: [51.505, -0.09],
    zoom: 13
  });

  editLayer.addTo(leafletMap);
  featuresLayer.addTo(leafletMap);

  leafletMap.editTools = new L.Editable(leafletMap, {
    editOptions: {
      editLayer: editLayer,
      featuresLayer: featuresLayer
    }
  });

  var measureTools = new L.MeasureBase(leafletMap, {
    editOptions: {
      editLayer: editLayer,
      featuresLayer: featuresLayer
    }
  });

  QUnit.test('create measure tools', function (assert) {
    assert.ok(measureTools.editTools != undefined, 'editTools is not null');
    assert.notEqual(measureTools.editTools, leafletMap.editTools, 'has own editTools');
    assert.ok(measureTools.editTools.editLayer == editLayer, 'editTools.editLayer');
    assert.ok(measureTools.editTools.featuresLayer == featuresLayer, 'editTools.featuresLayer');
  });

  QUnit.test('clear layers', function (assert) {
    measureTools.polygonBaseTool.addShape([[1, 2], [4, 2], [4, 4], [1, 2]]);
    assert.ok(Object.keys(measureTools.editTools.featuresLayer._layers).length == 1, 'featuresLayer has layer');
    assert.ok(Object.keys(measureTools.editTools.editLayer._layers).length == 1, 'editLayer has layer');
    measureTools.clearLayers();
    assert.ok(Object.keys(measureTools.editTools.featuresLayer._layers).length == 0, 'featuresLayer has no layers');
    assert.ok(Object.keys(measureTools.editTools.editLayer._layers).length == 0, 'editLayer has no layers');
  });

  QUnit.test('hide/show measure results', function (assert) {
    measureTools.hideMeasureResult();
    var polygon = new L.polygon([[1, 2], [4, 2], [4, 4], [1, 2]], { editOptions: { editTools: this.editTools } });
    measureTools.polygonBaseTool.addShape(polygon._latlngs);

    for (layerId in measureTools.editTools.featuresLayer._layers) {
      var layer = measureTools.editTools.featuresLayer._layers[layerId];

      assert.ok(layer._latlngs[0][layer._latlngs[0].length - 1].__vertex.getTooltip(), 'vertex has tooltip');
      assert.false(layer._latlngs[0][layer._latlngs[0].length - 1].__vertex.isTooltipOpen(), 'tooltip closed');
    }

    measureTools.showMeasureResult();

    for (layerId in measureTools.editTools.featuresLayer._layers) {
      var layer = measureTools.editTools.featuresLayer._layers[layerId];

      assert.ok(layer._latlngs[0][layer._latlngs[0].length - 1].__vertex.getTooltip(), 'vertex has tooltip');
      assert.true(layer._latlngs[0][layer._latlngs[0].length - 1].__vertex.isTooltipOpen(), 'tooltip open');
    }
  });
});
