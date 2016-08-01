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
      return distance = parseFloat(L.GeometryUtil.geodesicArea(e.latlngs).toFixed(L.Measure.precition));
    },

    /**
     * Вычисляет площадь многоугольника возвращает её текстовое представление с заданной точностью.
     * @param {Object} e Аргументы метода.
     * @param {Object} e.latlngs Массив точек многоугольника.
     * @returns {Number} Текстовое представление площади.
     */
    getAreaText: function(e) {
      return L.Measure.getMeasureText({
        value: L.Measure.getArea(e),
        dimension: 2
      });
    },

    /**
     * Возвращает текстовое представление для радуиса с заданной точностью.
     * @param {Object} e Аргументы метода.
     * @param {Object} e.radius Значение радиуса в метрах.
     * @returns {Number} Текстовое представление радиуса.
     */
    getRadiusText: function(e) {
      return L.Measure.getMeasureText({
        value: e.radius,
        dimension: 1
      });
    },


  };


  /**
   * Примесь, переопределяющая базовые методы инструментов плагина leaflet.draw, превращая их в инструменты измерений.
   */
  L.Measure.Mixin = {
    /**
     * Инициализирует новый инструмент измерений.
     * @param {Object} map Используемая карта.
     * @param {Object} [options] Настройки инструмента ().
     * @param {Boolean} [options.repeatMode = true] Флаг, показывающий должен ли инструмент оставаться включенным после фиксации измерений на карте.
     * @param {Object} [options.layerGroup = map] Группа слоев на карте, в которой будут отображаться результаты измерений.
     */
    initialize: function (map, options) {
      this._map = map;

      options = options || {};
      if (options.repeatMode !== false) {
        options.repeatMode = true;
      }
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
      } else if (this instanceof L.Polyline) {
        this.basePrototype = L.Polyline.prototype;
      } else if (this instanceof L.Polygon) {
        lthis.basePrototype = L.Polygon.prototype;
      } else {
        ;
      }
      this.basePrototype.initialize.call(this, map, L.Util.extend(this._getDefaultOptions(), options));

    },

    /**
     * Метод для получения настроек по умолчанию, для слоев создаваемых инструментом.
     * @abstract
     * @returns {Object} настроек по умолчанию, для слоев создаваемых инструментом.
     */
    _getDefaultOptions: function () {
      return {};
    },

  /* МЕТОДЫ Leaflet.draw BEGIN*/


 /**
  * Метод для обновления лейблов, содержащих результаты измерений.
  * @param {Object} e Аргументы метода.
  * @param {Object[]} e.markers Массив маркеров, к которым должны быть привязаны лейблы.
  * @param {Object[]} e.hiddenMarkers Массив маркеров, для которых не нужно отображать лэйблы.
  */
 _updateLabels: function(e) {
   for (var i = 0; i < e.markers.length; i++) {
     var marker = e.markers[i];
     var latlng = marker.getLatLng();
     var labelText = this._getLabelContent({
       layer: e.layer,
       latlng: latlng
     });

     if (!marker.label) {
       marker.bindLabel(labelText, {
         noHide: true,
         pane: 'popupPane'
       });
     }

     marker.label.setContent(labelText);

     var showLabel = e.hiddenMarkers.filter(function(hiddenMarker) {
       return hiddenMarker.getLatLng().equals(latlng);
     }).length == 0;

     if (showLabel) {
       marker.showLabel();
     } else {
       marker.hideLabel();
     }
   }
 },

 /**
  * Обработчик события, сигнализирующего о перемещении курсора мыши, во время отрисовки измерений.
  * Переопределяет обработчик базового класса.
  * @param {Object} e Аргументы события.
  * @param {Object} e.latlng Точка на карте, соответствующая текущей точке курсора мыши.
  */
 _onDrawingStart: function(e) {
//    this.basePrototype._onDrawingStart.call(this, e);

   this._tooltip.updateContent({
    text: this._getLabelContent({
      layer:e.layer,
      latlng: e.latlng
     }),
     subtext: this._currentShapeIsDrawing()
     ? L.drawLocal.draw.handlers[this.type].tooltip.end
     : L.drawLocal.draw.handlers[this.type].tooltip.start
   });
 },


   /**
     * Обработчик события, сигнализирующего о завершении отрисовки измерений.
     * Переопределяет обработчик базового класса.
     */
    _fireCreatedEvent: function (created) {
      var layer = created.layer;
      var layerType;
      if (layer instanceof L.Marker) {
        layerType = 'marker;'
      } else if (layer instanceof L.Circle) {
        layerType = 'circle;'
      } else if (layer instanceof L.Polyline) {
        layerType = 'polyline;'
      } else if (layer instanceof L.Polygon) {
        layerType = 'polygon;'
      } else {
        layerType = 'unknown;'
      }



      this._layerGroup.addLayer(layer);

      var editTool = this._createEditTool({
        layer: layer
      });
      this.editTool = editTool;

      layer.on('remove', function(e) {
        editTool.disable();
      });

      this._attachEditHandlers({
        layer: layer,
        editTool: editTool
      });
//
//       editTool.enable();
//       this._updateLabels({
//         layer: layer,
//         markers: this._getEditToolMarkers({
//           editTool: editTool
//         }),
//         hiddenMarkers: this._getEditToolHiddenMarkers({
//           editTool: editTool
//         })
//       });
//
      this.fire('measure:created', {
        layer: layer,
        layerType: layerType
      });
      return true;
    },

 /**
 * Обработчик события, сигнализирующего о перемещении маркера на инструменте редактирования.
 * @param {Object} e Аргументы события.
 * @param {Object} e.layer Слой, к редактированию которого приводит перемещение маркера.
 * @param {Object} e.editTool Инструмент редактирования слоя.
 * @param {Object} e.marker Перемещаемый маркер.
 */
   _onEditToolMarkerDrag: function(e) {
     e.editTool._lastDraggedMarker = e.marker;

     this._updateLabels({
       layer: e.layer,
       markers: this._getEditToolMarkers({
         editTool: e.editTool
       }),
       hiddenMarkers: this._getEditToolHiddenMarkers({
         editTool: e.editTool
       })
     });

     if (e.marker.label) {
       e.marker.hideLabel();
     }

     var tooltipSubtext = L.drawLocal.draw.handlers[this.type].tooltip;
     this._tooltip.updatePosition(e.marker.getLatLng());
     this._tooltip.updateContent({
       text: e.marker.label._content,
       subtext: tooltipSubtext.edit
       ? tooltipSubtext.edit
       : tooltipSubtext.end
     });

     e.layer.fire('measure:edit');
   },

    /**
     * Метод для привязки обработчиков событий редактирования отрисованного слоя.
     * @abstract
     * @param {Object} e Аргументы метода.
     * @param {Object} e.layer Слой, редактирование которого будет обрабатываться привязываемыми обработчиками.
     * @returns {Object} e.editTool Инструмент редактирования слоя.
     */
    _attachEditHandlers: function(e) {
    },
    /**
     * Обработчик события, сигнализирующего о завершении редактирования слоя.
     * @param {Object} e Аргументы события.
     * @param {Object} e.layer Отредактированный слой.
     * @param {Object} e editTool Инструмент редактирования слоя.
     */
    _onEditToolEditEnd: function(e) {
      if (this._tooltip) {
        this._tooltip.dispose();
        this._tooltip = null
      };

      this._updateLabels({
        layer: e.layer,
        markers: this._getEditToolMarkers({
          editTool: e.editTool
        }),
        hiddenMarkers: this._getEditToolHiddenMarkers({
          editTool: e.editTool
        })
      });
      e.layer.fire('measure:editend');
    },

 /* МЕТОДЫ Leaflet.draw END */


    /* Методы добавленные при переходе на Editable */
    enable: function () {
    },

    disable: function () {
      this.disableEdit();
      this.editTool = null;
    },

 _onActionsTest: function() {
//          this._map.on('editable:created', function() {alert('editable:created');}, this);
   //       this._map.on('editable:disable', function() {alert('editable:disable');}, this);
//          this._map.on('editable:drag', function() {alert('editable:drag');}, this);
//          this._map.on('editable:dragend', function() {alert('editable:dragend');}, this);
//          this._map.on('editable:dragstart', function() {alert('editable:dragstart');}, this);
//          this._map.on('editable:drawing:cancel', function() {alert('editable:drawing:cancel');}, this);
//          this._map.on('editable:drawing:click', function() {alert('editable:drawing:click');}, this);
//          this._map.on('editable:drawing:clicked', function() {alert('editable:drawing:clicked');}, this);
//          this._map.on('editable:drawing:commit', function() {alert('editable:drawing:commit');}, this);
//          this._map.on('editable:drawing:end', function() {alert('editable:drawing:end');}, this);
//          this._map.on('editable:drawing:mousedown', function() {alert('editable:drawing:mousedown');}, this);
//          this._map.on('editable:drawing:mouseup', function() {alert('editable:drawing:mouseup');}, this);
//          this._map.on('editable:drawing:move', function() {alert('editable:drawing:move');}, this);
//          this._map.on('editable:drawing:start', function() {alert('editable:drawing:start');}, this);
//          this._map.on('editable:editing', function() {alert('editable:editing');}, this);
//          this._map.on('editable:enable', function() {alert('editable:enable');}, this);
//          this._map.on('editable:middlemarker:mousedown', function() {alert('editable:middlemarker:mousedown');}, this);
//          this._map.on('editable:shape:delete', function() {alert('editable:shape:delete');}, this);
//          this._map.on('editable:shape:deleted', function() {alert('editable:shape:deleted');}, this);
//          this._map.on('editable:shape:new', function() {alert('editable:shape:new');}, this);
//          this._map.on('editable:vertex:altclick', function() {alert('editable:vertex:altclick');}, this);
//          this._map.on('editable:vertex:click', function() {alert('editable:vertex:click');}, this);
//          this._map.on('editable:vertex:clicked', function() {alert('editable:vertex:clicked');}, this);
//          this._map.on('editable:vertex:contextmenu', function() {alert('editable:vertex:contextmenu');}, this);
//          this._map.on('editable:vertex:ctrlclick', function() {alert('editable:vertex:ctrlclick');}, this);
//          this._map.on('editable:vertex:deleted', function() {alert('editable:vertex:deleted');}, this);
//          this._map.on('editable:vertex:drag', function() {alert('editable:vertex:drag');}, this);
//          this._map.on('editable:vertex:dragend', function() {alert('editable:vertex:dragend');}, this);
//          this._map.on('editable:vertex:dragstart', function() {alert('editable:vertex:dragstart');}, this);
//          this._map.on('editable:vertex:metakeyclick', function() {alert('editable:vertex:metakeyclick');}, this);
//          this._map.on('editable:vertex:mousedown', function() {alert('editable:vertex:mousedown');}, this);
//          this._map.on('editable:vertex:rawclick', function() {alert('editable:vertex:rawclick');}, this);
//          this._map.on('editable:vertex:shiftclick', function() {alert('editable:vertex:shiftclick');}, this);
 },

 /* Events order:

    Circle:
      До первого клика
      editable:enable
      editable:drawing:start
      editable:drawing:move
    Клик и перемещение, изменение размера круга
      editable:drawing:mousedown
      editable:vertex:dragstart
      editable:drawing:move
      editable:vertex:drag
      editable:editing
     отпуск клавиши
      editable:drawing:commit
      editable:drawing:end
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
