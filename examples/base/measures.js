(function(L, undefined) {
  L.Measure = L.Measure || {};

  /**
   * Класс инструмента для измерения координат.
   */
  L.Measure.MarkerBase = L.Measure.Marker.extend({

    /*
     Метод для получения маркеров инструмента редактирования, имеющих метки
     @param {Object} editor Инструмент редактирования
     @returns {Object[]} Массив помеченных маркеров инструмента редактирования.
     */
    _labelledMarkers: function(editor) {
      return [];
    },

    /*
     Метод для получения маркеров инструмента редактирования, не имеющих меток
     @param {Object} editor Инструмент редактирования
     @returns {Object[]} Массив не помеченных маркеров инструмента редактирования.
     */
    _unlabelledMarkers: function(editor) {
      return [];
    },

    /**
     Метод для получения текстового описания результатов измерений.
     */
    _getLabelContent: function(layer, latlng) {
      latlng = latlng || layer.getLatLng();
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
   Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.markerBase = function(map, options) {
    return new L.Measure.MarkerBase(map, options);
  };


  /**
   * Класс инструмента для измерения координат.
   */
  L.Measure.CircleBase = L.Measure.Circle.extend({

    /*
     Метод для получения маркеров инструмента редактирования, имеющих метки
     @param {Object} editor Инструмент редактирования
     @returns {Object[]} Массив помеченных маркеров инструмента редактирования.
     */
    _labelledMarkers: function(editor) {
      var latlngs = editor.getLatLngs();
      var markers = [];
      markers.push(latlngs[1].__vertex)
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
//       var radius = layer.getRadius();
      var  radiusText = this.getRadiusText(layer);
      var ret = radiusText.length > 0 ? '<b>' + 'Радиус: ' + radiusText + '</b>' : '';
      return ret;
    },

  });

  /**
   *   Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.circleBase = function(map, options) {
    return new L.Measure.CircleBase(map, options);
  };

  /**
   * Класс инструмента для измерения координат.
   */
  L.Measure.PolylineBase = L.Measure.Polyline.extend({

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
      if (index === 0) return '';
      var distance = 0;
      var currentInc = 0;
      for(var i = 1; i <= index; i++) {
        var prevLatLng = latlngs[i - 1];
        var currentLatLng = latlngs[i];
        currentInc = this.getDistance({
          latlng1: prevLatLng,
          latlng2: currentLatLng
        });
        distance += currentInc;
      }

      //       'index='+ index + '<br>' +
      return '<b>' +
        this.getMeasureText({
          value: distance,
          dimension: 1
        }) +
      '<br><span class="measure-path-label-incdistance">+' +
      this.getMeasureText({
        value: currentInc,
        dimension: 1
      }) +
      '</span></b>';
    },

  });

  /**
   *   Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.polylineBase = function(map, options) {
    return new L.Measure.PolylineBase(map, options);
  };

  /**
   Класс инструмента для измерения координат.
   */
  L.Measure.PolygonBase = L.Measure.Polygon.extend({

    /*
     Метод для получения маркеров инструмента редактирования, имеющих метки
     @param {Object} editor Инструмент редактирования
     @returns {Object[]} Массив помеченных маркеров инструмента редактирования.
     */
    _labelledMarkers: function(editor, e) {
      var latlngs = editor.getLatLngs()[0];
      var markers = [];
      if (e._measureEventType !== 'measure:create:drag') {
        var marker = e.vertex ? e.vertex : latlngs[latlngs.length-1].__vertex;
        markers.push(marker);
      }
      return markers;
    },

    /*
     Метод для получения маркеров инструмента редактирования, не имеющих меток
     @param {Object} editor Инструмент редактирования
     @returns {Object[]} Массив не помеченных маркеров инструмента редактирования.
     */
    _unlabelledMarkers: function(editor, e) {
      var latlngs = editor.getLatLngs()[0];
      var markers = [];
      var marker;
      if (e._measureEventType !== 'measure:create:drag') {
        marker = e.vertex ? e.vertex : latlngs[latlngs.length-1].__vertex;
      }
      for(var i = 0, len = latlngs.length; i < len; i++) {
        var pathVertex = latlngs[i].__vertex;
        if (pathVertex !== marker) {
          markers.push(pathVertex);
        }
      }
      return markers;
    },

    /**
     Метод для получения текстового описания результатов измерений.
     @param {Object} e Аргументы метода.
     @param {Object} e.layer Слой с геометрией, представляющей производимые измерения.
     @param {Object} e.latlng Точка геометрии, для которой требуется получить текстовое описание измерений.
     @returns {String} Содержимое метки
     */
    _getLabelContent: function(layer, latlng, e) {
      var latlngs = layer.editor.getLatLngs()[0].slice();
      var mouseLatlng;
      if (e && !e.vertex) {  //Non drag
        eventLatlng = e.latlng;
        for (var index=0; index < latlngs.length && !latlngs[index].equals(eventLatlng); index++);
        if (index === latlngs.length) {
          mouseLatlng = eventLatlng;
        }
      }
      var ret = 'Площадь: ' + this.getAreaText(layer, mouseLatlng);
      ret = '<b>' + ret + '</b>';
//       var ret = '<b>' +
//       //       'index='+ index + '<br>' +
//       //       'eventLatlng=' + eventLatlng +  '<br>' +
//       //       'latlngs=' + latlngs + '<br>' +
//       'Периметр: ' + this.getMeasureText({
//       value: distance,
//       dimension: 1
//     }) + '</b>';
      return ret;
    },

//     _getMeasurelabelContext: function(layer, latlng) {
//       var latlngs = layer.editor.getLatLngs()[0].slice();
//       if (latlng) {
//         for (var index=0; index < latlngs.length && !latlngs[index].equals(latlng); index++);
//         if (index === latlngs.length) {
//           latlngs.push(latlng);
//         }
//       }
//       var ret = 'Площадь: ' + this.getAreaText(layer);
//       ret = '<b>' + ret + '</b>';
//       return ret;
//     },

//     /**
//     Метод обновления основного лейбла измеряемого объекта
//     @param {Object} layer Редактируемый слой.
//     */
//     _updateMeasureLabel: function(layer, e) {
//       var areaText = this._getMeasurelabelContext(layer, e.latlng);
//       var center;
//       var latlngs = layer.editor.getLatLngs()[0];
//       if (latlngs.length ==2) {
//         center = L.latLng((latlngs[0].lat + latlngs[1].lat)/2, (latlngs[0].lng + latlngs[1].lng)/2);
//       } else {
//         center = layer.getCenter();
//       }
//
//       this._showLabel(layer, areaText, center);
//     },

  });

  /**
   Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.polygonBase = function(map, options) {
    return new L.Measure.PolygonBase(map, options);
  };



})(L);
