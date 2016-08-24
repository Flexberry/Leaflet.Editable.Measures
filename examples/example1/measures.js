(function(L, undefined) {
  L.Measure = L.Measure || {};

  /**
   * Класс инструмента для измерения координат.
   */
  L.Measure.Marker1 = L.Measure.Marker.extend({

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
  L.Measure.marker1 = function(map, options) {
    return new L.Measure.Marker1(map, options);
  };


  /**
   Класс инструмента для измерения координат.
   */
  L.Measure.Rectangle1 = L.Measure.Rectangle.extend({

    /*
     Метод для получения маркеров инструмента редактирования, имеющих метки
     @param {Object} editor Инструмент редактирования
     @returns {Object[]} Массив помеченных маркеров инструмента редактирования.
     */
    _labelledMarkers: function(editor) {
      var latlngs = editor.getLatLngs()[0];
      var markers = [];
      for(var i = 0, len = latlngs.length; i < len; i++) {
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
      var latlngs = editor.getLatLngs()[0];
      var markers = [];
      return markers;
    },

    /**
     Метод для получения текстового описания результатов измерений.
     @param {Object} e Аргументы метода.
     @param {Object} e.layer Слой с геометрией, представляющей производимые измерения.
     @param {Object} e.latlng Точка геометрии, для которой требуется получить текстовое описание измерений.
     */
    _getLabelContent: function(layer, latlng) {
      var fixedLatLng = this.getFixedLatLng(latlng);
      var fixedLat = fixedLatLng.lat;
      var fixedLng = fixedLatLng.lng;
      return Math.abs(fixedLat).toFixed(5) + (fixedLat >= 0 ? ' с.ш. ' : ' ю.ш. ') + Math.abs(fixedLng).toFixed(5) + (fixedLng >= 0 ? ' в.д.' : ' з.д. ');
    },

    /**
     *    Метод обновления основного лейбла измеряемого объекта
     *    @param {Object} layer Редактируемый слой.
     */
    _updateMeasureLabel: function(layer, e) {
      var center = layer.getCenter();
      var latlngs = layer.editor.getLatLngs()[0];
      var areaText = 'Площадь: ' + this.getAreaText({latlngs: latlngs});
      areaText = '<b>' + areaText + '</b>';
      this._showLabel(layer, areaText, center);
    },

  });

  /**
   *   Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.rectangle1 = function(map, options) {
    return new L.Measure.Rectangle1(map, options);
  };

  /**
   * Класс инструмента для измерения координат.
   */
  L.Measure.Circle1 = L.Measure.Circle.extend({

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
      var radius = layer.getRadius();
      var  radiusText = this.getRadiusText({radius: radius});
      return '<b>' + 'Радиус: ' + radiusText + '</b>';
    },

    /**
     *    Метод обновления основного лейбла измеряемого объекта
     *    @param {Object} layer Редактируемый слой.
     */
    _updateMeasureLabel: function(layer, e) {
      var radius = layer.getRadius();
      var areaText = '<b>Площадь: ' + this.getCircleAreaText({radius: radius}) + '</b>';
      var latlngs = layer.editor.getLatLngs();
      var marker = latlngs[0].__vertex;
      this._showLabel(marker, areaText);
    },

  });

  /**
   *   Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.circle1 = function(map, options) {
    return new L.Measure.Circle1(map, options);
  };

  /**
   * Класс инструмента для измерения координат.
   */
  L.Measure.Polyline1 = L.Measure.Polyline.extend({
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
        currentInc = this.getDistance({
          latlng1: prevLatLng,
          latlng2: currentLatLng
        });
        distance += currentInc;
      }

      return '<b>' + this.getMeasureText({
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
  L.Measure.polyline1 = function(map, options) {
    return new L.Measure.Polyline1(map, options);
  };

  /**
   Класс инструмента для измерения координат.
   */
  L.Measure.Polygon1 = L.Measure.Polygon.extend({
    includes: [ L.Measure.Mixin, L.Measure.Mixin.Polygon ],

    /*
     Метод для получения маркеров инструмента редактирования, имеющих метки
     @param {Object} editor Инструмент редактирования
     @returns {Object[]} Массив помеченных маркеров инструмента редактирования.
     */
    _labelledMarkers: function(editor) {
      var latlngs = editor.getLatLngs()[0];
      var markers = [];
      markers.push(latlngs[0].__vertex);
      return markers;
    },

    /*
     Метод для получения маркеров инструмента редактирования, не имеющих меток
     @param {Object} editor Инструмент редактирования
     @returns {Object[]} Массив не помеченных маркеров инструмента редактирования.
     */
    _unlabelledMarkers: function(editor) {
      var latlngs = editor.getLatLngs()[0];
      var markers = [];
      for(var i = 1, len = latlngs.length; i < len; i++) {
        markers.push(latlngs[i].__vertex);
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
    _getLabelContent: function(layer, latlng, eventLatlng) {
      var latlngs = layer.editor.getLatLngs()[0].slice();
      if (eventLatlng) {
        for (var index=0; index < latlngs.length && !latlngs[index].equals(eventLatlng); index++);
        if (index === latlngs.length) {
          latlngs.push(eventLatlng);
        }
      }
      var distance = 0;
      var inc = 0;
      var currentInc = 0;
      for(var i = 1; i < latlngs.length; i++) {
        var prevLatLng = latlngs[i - 1];
        var currentLatLng = latlngs[i];
        currentInc = this.getDistance({
          latlng1: prevLatLng,
          latlng2: currentLatLng
        });
        distance += currentInc;
      }
      var ret = '<b>Периметр: ' + this.getMeasureText({
      value: distance,
      dimension: 1
    }) + '</b>';
      return ret;
    },

    _getMeasurelabelContext: function(layer, latlng) {
      var latlngs = layer.editor.getLatLngs()[0].slice();
      if (latlng) {
        for (var index=0; index < latlngs.length && !latlngs[index].equals(latlng); index++);
        if (index === latlngs.length) {
          latlngs.push(latlng);
        }
      }
      var ret = 'Площадь: ' + this.getAreaText({latlngs: latlngs});
      ret = '<b>' + ret + '</b>';
      return ret;
    },

    /**
    Метод обновления основного лейбла измеряемого объекта
    @param {Object} layer Редактируемый слой.
    */
    _updateMeasureLabel: function(layer, e) {
      var areaText = this._getMeasurelabelContext(layer, e.latlng);
      var center;
      var latlngs = layer.editor.getLatLngs()[0];
      if (latlngs.length ==2) {
        center = L.latLng((latlngs[0].lat + latlngs[1].lat)/2, (latlngs[0].lng + latlngs[1].lng)/2);
      } else {
        center = layer.getCenter();
      }

      this._showLabel(layer, areaText, center);
    },

  });

  /**
   Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.polygon1 = function(map, options) {
    return new L.Measure.Polygon1(map, options);
  };



})(L);
