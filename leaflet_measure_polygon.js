(function(L, undefined) {
  L.Measure = L.Measure || {};

  /**
   * Класс инструмента для измерения координат.
   */
  L.Measure.Polygon = L.Polygon.extend({
    includes: L.Measure.Mixin,

    labels: [],

    /*
    * Метод для получения настроек по умолчанию, для слоев создаваемых инструментом.
    * @abstract
    * @returns {Object} настроек по умолчанию, для слоев создаваемых инструментом.
    */
  _getDefaultOptions: function () {
    return {
      shapeOptions: {
        stroke: true,
        color: 'green',
        weight: 2,
        opacity: 0.5,
        fill: true,
        clickable: true
      }
    };
  },

  /**
   * Метод для получения текстового описания результатов измерений.
   * @param {Object} e Аргументы метода.
   * @param {Object} e.layer Слой с геометрией, представляющей производимые измерения.
   * @param {Object} e.latlng Точка геометрии, для которой требуется получить текстовое описание измерений.
   */
  _getLabelContent: function(e) {
    var latlngs = e.layer ? e.layer.getLatLngs().slice() : [];
    var layerContainsLatLng = latlngs.filter(function(latlng) {
      return latlng.equals(e.latlng);
    }).length > 0;

    if (!layerContainsLatLng) {
      latlngs.push(e.latlng);
    }

    if (latlngs.length < 3) {
      return '';
    }

    return 'Площадь: ' + L.Measure.getAreaText({
      latlngs: latlngs
    });
  },

  enable: function () {
//     this._latlng = this._map.getCenter();
    this.editTool = this.enableEdit();
    this._onActionsTest();
//     this.isDrawing = false;
//     this._map.on('editable:drawing:move', this._setMoveTooltipContent, this);
//     this._map.on('editable:drawing:mousedown', this.showLabel, this);
    //       this._map.on ('editable:vertex:dragstart', function() {this.isDrawing = true;}, this);
    //       this._map.on ('editable:vertex:dragend', this.showLabel, this);
    this.measureLayer = this._map.editTools.startPolygon();
  },

  });

  /**
   * Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.polygon = function(map, options) {
    return new L.Measure.Polygon(map, options);
  };

})(L);
