(function(L, undefined) {

  /**
   * Базовое пространство имен для инструментов измерений.
   */
  L.Measure = L.Measure || {

    /**
     * Количество знаков после десятичного разделителя для измерений в метрах.
       */
    precition: 0,

    _fireEditingEvent: function (editing) {
      ;
    },


    /**
     * Приводит значение координат точки, которые могут принимать любые действительные значения,
     * к значениям, лежещим в отрезках [-90; 90], для широты, [-180, 180] для долготы.
     * @param {Object} latlng Точка, содержащая координаты.
     * @param {Number} periodRadius Радиус периода координатной оси.
     * @returns {Number} Точка со скорректированными координатами.
     */
    getFixedLatLng: function(latlng) {
      var getFixedCoordinate = function(coordinate, periodRadius) {
        var divCoordinate = Math.floor(Math.abs(coordinate) / periodRadius);
        var fixCoefficient = divCoordinate % 2 ? (divCoordinate + 1) : divCoordinate;

        return (coordinate >= 0) ? coordinate - (periodRadius * fixCoefficient) : coordinate + (periodRadius * fixCoefficient);
      };

      return L.latLng(getFixedCoordinate(latlng.lat, 90), getFixedCoordinate(latlng.lng, 180));
    },

    /**
     * Получить текстовое представление произведенных измерений.
     * @param {Object} e Аргументы метода.
     * @param {Object} e.value Результат измерений в метрах.
     * @param {Object} e.dimension Размерность измерений (1 - линейные расстояния, 2- площади).
     * @returns {string} Текстовое представление произведенных измерений.
     */
    getMeasureText: function(e) {
      var value = parseFloat(e.value.toFixed(L.Measure.precition));
      var metersInOneKm = Math.pow(1000, e.dimension);
      var kmPrecition = L.Measure.precition + e.dimension * 3;
      var valueInKm = parseFloat((value / metersInOneKm).toFixed(kmPrecition));

      var dimensionText = (e.dimension > 1) ? '<sup>' + e.dimension + '</sup>' : '';
      var kmRoundingBound = 1.0 / Math.pow(10, e.dimension - 1);

      return (valueInKm >= kmRoundingBound)
          ? valueInKm.toFixed(kmPrecition) + ' км' + dimensionText
          : value.toFixed(L.Measure.precition) + ' м' + dimensionText;
    },

    /**
     * Вычисляет расстояние между двумя точками (в метрах) с заданной точностью.
     * @param {Object} e Аргументы метода.
     * @param {Object} e.latlng1 Первая точка.
     * @param {Object} e.latlng2 Вторая точка.
     * @returns {Number} Полученное расстояние (в метрах).
     */
    getDistance: function(e) {
      return parseFloat(e.latlng1.distanceTo(e.latlng2).toFixed(L.Measure.precition));
    },

    /**
     * Вычисляет расстояние между двумя точками и возвращает его текстовое представление с заданной точностью.
     * @param {Object} e Аргументы метода.
     * @param {Object} e.latlng1 Первая точка.
     * @param {Object} e.latlng2 Вторая точка.
     * @returns {Number} Текстовое представление расстояния.
     */
    getDistanceText: function(e) {
      return L.Measure.getMeasureText({
        value: L.Measure.getDistance(e),
        dimension: 1
      });
    },

    /**
     * Вычисляет площадь многоугольника (в метрах) с заданной точностью.
     * @param {Object} e Аргументы метода.
     * @param {Object} e.latlngs Массив точек многоугольника.
     * @returns {Number} Полощадь многоугольника (в метрах).
     */
    getArea: function(e) {
      return distance = parseFloat(this.geodesicArea(e.latlngs).toFixed(L.Measure.precition));
    },

    /**
    Вычисляет площадь многоугольника возвращает её текстовое представление с заданной точностью.
    @param {Object} e Аргументы метода.
    @param {Object} e.latlngs Массив точек многоугольника.
    @returns {Number} Текстовое представление площади.
     */
    getAreaText: function(e) {
      return L.Measure.getMeasureText({
        value: L.Measure.getArea(e),
        dimension: 2
      });
    },

    /**
    Возвращает текстовое представление для радиуса с заданной точностью.
    @param {Object} e Аргументы метода.
    @param {Object} e.radius Значение радиуса в метрах.
    @returns {Number} Текстовое представление радиуса.
      */
    getRadiusText: function(e) {
      return L.Measure.getMeasureText({
        value: e.radius,
        dimension: 1
      });
    },

    /**
    Возвращает текстовое представление площади круга с заданной точностью.
    @param {Object} e Аргументы метода.
    @param {Object} e.radius Значение радиуса в метрах.
    @returns {Number} Текстовое представление радиуса.
      */
    getCircleAreaText: function(e) {
      var area = Math.PI * e.radius * e.radius;
      return L.Measure.getMeasureText({
        value: area,
        dimension: 2
      });
    },
  /**
   Вычисляет площадь многоугольника согласно релизации  https://github.com/openlayers/openlayers/blob/master/lib/OpenLayers/Geometry/LinearRing.js#L270*
   Возможно требует доработок для многоугольников с пересекающимися гранями и составных многоугольников с дырами (Holes)
   @param {Object} latLngs  Массив точек многоугольника.
   @returns {Number} Полощадь многоугольника (в метрах).
   */
    geodesicArea: function (latLngs) {
      const DEG_TO_RAD = 0.017453292519943295;;
      var pointsCount = latLngs.length,
        area = 0.0,
        d2r = DEG_TO_RAD,
        p1, p2;

      if (pointsCount > 2) {
        for (var i = 0; i < pointsCount; i++) {
          p1 = latLngs[i];
          p2 = latLngs[(i + 1) % pointsCount];
          area += ((p2.lng - p1.lng) * d2r) *
              (2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
        }
        area = area * 6378137.0 * 6378137.0 / 2.0;
      }

      return Math.abs(area);
    },



  };


  /**
   * Примесь, переопределяющая базовые методы инструментов плагина leaflet.draw, превращая их в инструменты измерений.
   */
  L.Measure.Mixin = {
    /**
    Инициализирует новый инструмент измерений.
    @param {Object} map Используемая карта.
    @param {Object} [options] Настройки инструмента ().
    @param {Boolean} [options.repeatMode = true] Флаг, показывающий должен ли инструмент оставаться включенным после фиксации измерений на карте.
    @param {Object} [options.layerGroup = map] Группа слоев на карте, в которой будут отображаться результаты измерений.
     */
    initialize: function (map, options) {
      this._map = map;

      options = options || {};
      if (options.layerGroup) {
        this._layerGroup = options.layerGroup;
      } else {
        this._layerGroup = map;
      }

      // Т.к. базовый класс отличается для каждого инструмента, то добираемся до него следующим образом.
       //this.basePrototype = this.constructor.__super__.constructor.prototype;

      // Этот вызов аналогичен this._super в ember-е.
      //this.basePrototype.initialize.call(this, map, L.Util.extend(this._getDefaultOptions(), options));
      // Код выше может поломаться при переходе на Lefalet 1.0, он аналогичен следующей логике.
      if (this instanceof L.Marker) {
        this.basePrototype = L.Marker.prototype;
      } else if (this instanceof L.Circle) {
        this.basePrototype = L.Circle.prototype;
      } else if (this instanceof L.Polygon) {
        this.basePrototype = L.Polygon.prototype;
      } else if (this instanceof L.Polyline) {
        this.basePrototype = L.Polyline.prototype;
      } else {
        ;
      }
      this.setEvents();
      this.basePrototype.initialize.call(this, map, L.Util.extend(this._getDefaultOptions(), options));
    },


    /**
    Метод для получения настроек по умолчанию, для слоев создаваемых инструментом.
    @abstract
    @returns {Object} настроек по умолчанию, для слоев создаваемых инструментом.
     */
    _getDefaultOptions: function () {
      return {};
    },

  /* МЕТОДЫ Leaflet.draw BEGIN*/


 /**
  Метод для обновления лейблов, содержащих результаты измерений.
  @param {Object} layer Редактируемый слой.
  */
 _updateLabels: function(layer) {
    var editor = layer.editor;
    var labelledMarkers = this._labelledMarkers(editor);
    for (var i = 0; i < labelledMarkers.length; i++) {
      var marker = labelledMarkers[i];
//      var latlng = marker.getLatLng();
      var latlng = marker.latlng;
      var labelText = this._getLabelContent(layer, latlng);
      this._showLabel(marker, labelText, latlng);
   }
   var unlabelledMarkers = this._unlabelledMarkers(editor);
   for (var i = 0; i < unlabelledMarkers.length; i++) {
     var marker = unlabelledMarkers[i];
     marker.unbindTooltip();
   }
   this._updateMeasureLabel(layer); //Обновить tooltip измеряемого объекта
 },

 _showLabel: function(marker, labelText, latlng) {
   if (!marker._tooltip) {
     marker.bindTooltip(labelText, {permanent: true, opacity: 0.75}).addTo(this._map);
   } else {
     marker.setTooltipContent(labelText);
   }
   if (latlng) {
     marker._tooltip.setLatLng(latlng);
   }
 },

 /**
 Метод обновления основного лейбла измеряемого объекта
 @param {Object} layer Редактируемый слой.
 */
 _updateMeasureLabel: function(layer) {
 },


 /**
  Обработчик события, сигнализирующего о перемещении курсора мыши, во время отрисовки измерений.
  @param {String} text Отображаемый текст.
  */
 _onMouseMove: function(e, text) {
   this._showPopup(text, e.latlng);
 },

 _showPopup: function(text, latlng) {
   if (this.measurePopup) {
     if (!this.measurePopup.isOpen()) {
       this.measurePopup.openOn(this._map);
     }
     this.measurePopup.setLatLng(latlng).setContent(text);
   } else {
     this.measurePopup = L.popup()
     this.measurePopup.setLatLng(latlng).setContent(text);
     this.measurePopup.openOn(this._map);
   } },

   /**
    Обработчик события, сигнализирующий о редактировании слоя.
     */
  _fireEvent: function (e, type) {
    var layer = e.layer;
    var layerType = this._layerType(layer);
    if (type === 'created') {
      this._layerGroup.addLayer(layer);
      layer.on('remove', function(e) {
        this.editTool.disable();
      });
    }
    this._updateLabels(layer);
    this._map.fire('measure:'+ type, {
      layer: layer,
      layerType: layerType
    });
    return true;
  },

    _layerType: function (layer) {
      var layerType;
      if (layer instanceof L.Marker) {
        layerType = 'marker'
      } else if (layer instanceof L.Circle) {
        layerType = 'circle'
      } else if (layer instanceof L.Polyline) {
        layerType = 'polyline'
      } else if (layer instanceof L.Polygon) {
        layerType = 'polygon'
      } else {
        layerType = 'unknown;'
      }
      return layerType;
    },



    /* Методы добавленные при переходе на Editable */
    enable: function () {
    },

    disable: function () {
      this.disableEdit();
      this.editTool = null;
    },


     eventsOn: function(prefix, eventTree, offBefore) {
      for (var eventSubName in eventTree) {
        var func = eventTree[eventSubName];
        var eventName = prefix + eventSubName;
        if (typeof func == 'function') {
          if (!!offBefore) {
            this._map.off(eventName);
          }
          this.measureLayer.on(eventName, func, this);
        } else {
          this.eventsOn(eventName + ':', func, offBefore);
        }
      }
    },

//     eventsOff: function(prefix,eventTree) {
//       for (var eventSubName in eventTree) {
//         var func = eventTree[eventSubName];
//         var eventName = prefix + eventSubName;
//         if (typeof func == 'function') {
//           this._map.off(eventName);
//         } else {
//           this.eventsOff(eventName + ':', func);
//         }
//       }
//     },

    eventOffByPrefix: function (prefix) {
      var prefixLen = prefix.length;
      for (var eventName in this._map._events) {
        if (eventName.substr(0,prefixLen) == prefix) {
          this._map.off(eventName);
        }
      }
    },

    _onActionsTest: function() {
         this._map.on('editable:created', function() {alert('editable:created');}, this);
         this._map.on('editable:disable', function() {alert('editable:disable');}, this);
         this._map.on('editable:drag', function() {alert('editable:drag');}, this);
         this._map.on('editable:dragend', function() {alert('editable:dragend');}, this);
         this._map.on('editable:dragstart', function() {alert('editable:dragstart');}, this);
         this._map.on('editable:drawing:cancel', function() {alert('editable:drawing:cancel');}, this);
         this._map.on('editable:drawing:click', function() {alert('editable:drawing:click');}, this);
         this._map.on('editable:drawing:clicked', function() {alert('editable:drawing:clicked');}, this);
         this._map.on('editable:drawing:commit', function() {alert('editable:drawing:commit');}, this);
         this._map.on('editable:drawing:end', function() {alert('editable:drawing:end');}, this);
         this._map.on('editable:drawing:mousedown', function() {alert('editable:drawing:mousedown');}, this);
         this._map.on('editable:drawing:mouseup', function() {alert('editable:drawing:mouseup');}, this);
//          this._map.on('editable:drawing:move', function() {alert('editable:drawing:move');}, this);
         this._map.on('editable:drawing:start', function() {alert('editable:drawing:start');}, this);
         this._map.on('editable:editing', function() {alert('editable:editing');}, this);
         this._map.on('editable:enable', function() {alert('editable:enable');}, this);
         this._map.on('editable:middlemarker:mousedown', function() {alert('editable:middlemarker:mousedown');}, this);
         this._map.on('editable:shape:delete', function() {alert('editable:shape:delete');}, this);
         this._map.on('editable:shape:deleted', function() {alert('editable:shape:deleted');}, this);
         this._map.on('editable:shape:new', function() {alert('editable:shape:new');}, this);
         this._map.on('editable:vertex:altclick', function() {alert('editable:vertex:altclick');}, this);
         this._map.on('editable:vertex:click', function() {alert('editable:vertex:click');}, this);
         this._map.on('editable:vertex:clicked', function() {alert('editable:vertex:clicked');}, this);
         this._map.on('editable:vertex:contextmenu', function() {alert('editable:vertex:contextmenu');}, this);
         this._map.on('editable:vertex:ctrlclick', function() {alert('editable:vertex:ctrlclick');}, this);
         this._map.on('editable:vertex:deleted', function() {alert('editable:vertex:deleted');}, this);
//          this._map.on('editable:vertex:drag', function() {alert('editable:vertex:drag');}, this);
         this._map.on('editable:vertex:dragend', function() {alert('editable:vertex:dragend');}, this);
         this._map.on('editable:vertex:dragstart', function() {alert('editable:vertex:dragstart');}, this);
         this._map.on('editable:vertex:metakeyclick', function() {alert('editable:vertex:metakeyclick');}, this);
         this._map.on('editable:vertex:mousedown', function() {alert('editable:vertex:mousedown');}, this);
         this._map.on('editable:vertex:rawclick', function() {alert('editable:vertex:rawclick');}, this);
         this._map.on('editable:vertex:shiftclick', function() {alert('editable:vertex:shiftclick');}, this);
 },

 /* Events order:

    Marker:
    До первого клика
      editable:created
      editable:enable
      editable:drawing:start
      editable:drawing:move
    1-й клик  и последующие клики
      editable:drawing:mousedown
      editable:drawing:click
      editable:drawing:clicked
      editable:drawing:commit
      editable:drawing:end
    Перетаскивание вершины:
      editable:editing
      editable:dragstart
      editable:drag
      editable:dragend


    Circle:
      До первого клика
      editable:enable
      editable:drawing:start
      editable:drawing:move
    1-й клик
      editable:drawing:mousedown
      editable:drawing:commit
      editable:drawing:end
    Перемещение, изменение размера круга
      editable:vertex:dragstart
      editable:drawing:move
      editable:vertex:drag
      editable:editing
    Отпуск клавиши
      editable:vertex:dragend


    Polyline:
      До первого клика
        editable:enable
        editable:shape:new
        editable:drawing:start
        editable:drawing:move
      1-й клик и последующие клики
        editable:drawing:mousedown
        editable:drawing:click
        editable:editing
        editable:drawing:clicked
      Commit:
        editable:vertex:mousedown
        editable:vertex:click
        editable:vertex:clicked
        editable:drawing:commit
        editable:drawing:end
      Перетаскивание вершины:
        editable:vertex:dragstart
        editable:drawing:move
        editable:vertex:dragend
      Удаление вершины:
        editable:vertex:click
        editable:vertex:rawclick
        editable:vertex:deleted
        editable:vertex:clicked
      Перетаскивание срединного маркера
      editable:middlemarker:mousedown
      editable:vertex:dragstart
      editable:drawing:move
      editable:vertex:dragend







  * */

  };

})(L);
