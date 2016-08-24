(function(L, undefined) {
  L.Measure = L.Measure || {};

  /**
   * Класс инструмента для измерения координат.
   */
  L.Measure.Marker = L.Measure.Mixin.Marker.extend({
    includes: [ L.Measure.Mixin ],

    /*
     * Метод для получения маркеров инструмента редактирования, имеющих метки
     * @param {Object} editor Инструмент редактирования
     * @returns {Object[]} Массив помеченных маркеров инструмента редактирования.
     */
    _labelledMarkers: function(editor) {
      return [];
    },

    /*
     * Метод для получения маркеров инструмента редактирования, не имеющих меток
     * @param {Object} editor Инструмент редактирования
     * @returns {Object[]} Массив не помеченных маркеров инструмента редактирования.
     */
    _unlabelledMarkers: function(editor) {
      return [];
    },

    /**
     * Метод для получения текстового описания результатов измерений.
     */
    _getLabelContent: function(layer, latlng) {
      var fixedLatLng = L.Measure.getFixedLatLng(latlng);
      var fixedLat = fixedLatLng.lat;
      var fixedLng = fixedLatLng.lng;
      return Math.abs(fixedLat).toFixed(5) + (fixedLat >= 0 ? ' с.ш. ' : ' ю.ш. ') + Math.abs(fixedLng).toFixed(5) + (fixedLng >= 0 ? ' в.д.' : ' з.д. ');
    },

    /**
     Метод обновления основного лейбла измеряемого объекта
     @param {Object} layer Редактируемый слой.
     */
    _updateMeasureLabel: function(layer, e) {
        var coords = this._getLabelContent(layer, e.latlng);
        text = "<b>" + coords + '</b>';
        this._showLabel(layer, text);
    },

  });

  /**
   * Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.marker = function(map, options) {
    return new L.Measure.Marker(map, options);
  };


})(L);
