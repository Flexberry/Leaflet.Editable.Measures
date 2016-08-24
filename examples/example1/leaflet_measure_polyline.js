(function(L, undefined) {
  L.Measure = L.Measure || {};

  /**
   * Класс инструмента для измерения координат.
   */
  L.Measure.Polyline = L.Polyline.extend({
    includes: [ L.Measure.Mixin, L.Measure.Mixin.Polyline ],

    /*
     Метод для получения маркеров инструмента редактирования, имеющих метки
     @param {Object} editor Инструмент редактирования
     @returns {Object[]} Массив помеченных маркеров инструмента редактирования.
     */
    _labelledMarkers: function(editor) {
      var latlngs = editor.getLatLngs();
      var markers = [];
      for(var i = 1, len = latlngs.length; i < len; i++) {
        markers.push(latlngs[i].__vertex);
      }
      return markers;
    },

    /*
     Метод для получения маркеров инструмента редактирования, не имеющих меток
     @param {Object} editor Инструмент редактирования
     @returns {Object[]} Массив не помеченных маркеров инструмента редактирования.
     */
    _unlabelledMarkers: function(editor) {
      var latlngs = editor.getLatLngs();
      var markers = [];
      markers.push(latlngs[0].__vertex)
      return markers;
    },

    /**
     Метод для получения текстового описания результатов измерений.
     @param {Object} e Аргументы метода.
     @param {Object} e.layer Слой с геометрией, представляющей производимые измерения.
     @param {Object} e.latlng Точка геометрии, для которой требуется получить текстовое описание измерений.
     */
    _getLabelContent: function(layer, latlng) {
      var latlngs = layer.editor.getLatLngs().slice();
      for (var index=0; index < latlngs.length && !latlngs[index].equals(latlng); index++);
      if (index === latlngs.length) {
        latlngs.push(latlng);
      }
      var distance = 0;
      var currentInc = 0;
      for(var i = 1; i <= index; i++) {
        var prevLatLng = latlngs[i - 1];
        var currentLatLng = latlngs[i];
        currentInc = L.Measure.getDistance({
          latlng1: prevLatLng,
          latlng2: currentLatLng
        });
        distance += currentInc;
      }

      return '<b>' + L.Measure.getMeasureText({
        value: distance,
        dimension: 1
      }) +
      '<br><span class="measure-path-label-incdistance">+' +
      L.Measure.getMeasureText({
        value: currentInc,
        dimension: 1
      }) +
      '</span></b>';
    },

  });

  /**
   Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.polyline = function(map, options) {
    return new L.Measure.Polyline(map, options);
  };

})(L);
