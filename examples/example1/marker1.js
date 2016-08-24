(function(L, undefined) {
  L.Measure = L.Measure || {};

  /**
   * Класс инструмента для измерения координат.
   */
  L.Measure.Marker1 = L.Measure.Marker.extend({

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
      var fixedLatLng = this.getFixedLatLng(latlng);
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
  L.Measure.marker1 = function(map, options) {
    return new L.Measure.Marker1(map, options);
  };


})(L);
