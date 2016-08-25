(function(L, undefined) {

  /**
   * Базовое пространство имен для инструментов измерений.
   */
  L.Measure = L.Measure || {

    /**
     * Количество знаков после десятичного разделителя для измерений в метрах.
       */
    precition: 0,

//     _fireEditingEvent: function (editing) {
//       ;
//     },
  };


  /**
   * Примесь, переопределяющая базовые методы инструментов плагина Leaflet.Editable, превращая их в инструменты измерений.
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


     _getLabelContent: function(layer, latlng) {
       return '';
    },

     _labelledMarkers: function(editor) {
      return [];
    },

     _unlabelledMarkers: function(editor) {
      return [];
    },


    /**
    Метод для получения настроек по умолчанию, для слоев создаваемых инструментом.
    @abstract
    @returns {Object} настроек по умолчанию, для слоев создаваемых инструментом.
     */
    _getDefaultOptions: function () {
      return {};
    },


 /**
  Метод для обновления лейблов, содержащих результаты измерений.
  @param {Object} layer Редактируемый слой.
  */
 _updateLabels: function(e) {
   var layer = e.layer;
    var editor = layer.editor;
    var labelledMarkers = this._labelledMarkers(editor, e);
    for (var i = 0; i < labelledMarkers.length; i++) {
      var marker = labelledMarkers[i];
//      var latlng = marker.getLatLng();
      var latlng = marker.latlng;
      var labelText = this._getLabelContent(layer, latlng, e.latlng);
      this._showLabel(marker, labelText, latlng);
   }
   var unlabelledMarkers = this._unlabelledMarkers(editor);
   for (var i = 0; i < unlabelledMarkers.length; i++) {
     var marker = unlabelledMarkers[i];
     marker.unbindTooltip();
   }
   this._updateMeasureLabel(layer, e); //Обновить tooltip измеряемого объекта
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
 _updateMeasureLabel: function(layer, e) {
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
  //      var element = this.measurePopup.getElement();
    }
    L.DomUtil.setOpacity(this.measurePopup.getElement(), 0.5);
  },

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
    if (type !== 'move') {
      this._updateLabels(e);
    }
    this._map.fire('measure:'+ type, {
      e:e,
      measurer: this,
      layer: layer,
      layerType: layerType
    });
    return true;
  },

    _layerType: function (layer) {
      var layerType;
      if (layer instanceof L.Marker) {
        layerType = 'Marker';
      } else if (layer instanceof L.Circle) {
        layerType = 'Circle';
      } else if (layer instanceof L.Rectangle) {
        layerType = 'Rectangle';
      } else if (layer instanceof L.Polygon) {
        layerType = 'Polygon';
      } else if (layer instanceof L.Polyline) {
        layerType = 'Polyline';
      } else {
        layerType = 'unknown';
      }
      return layerType;
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

    eventsOff: function(prefix,eventTree) {
      for (var eventSubName in eventTree) {
        var func = eventTree[eventSubName];
        var eventName = prefix + eventSubName;
        if (typeof func == 'function') {
          this._map.off(eventName);
        } else {
          this.eventsOff(eventName + ':', func);
        }
      }
    },

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
         this._map.on('editable:vertex:drag', function() {alert('editable:vertex:drag');}, this);
         this._map.on('editable:vertex:dragend', function() {alert('editable:vertex:dragend');}, this);
         this._map.on('editable:vertex:dragstart', function() {alert('editable:vertex:dragstart');}, this);
         this._map.on('editable:vertex:metakeyclick', function() {alert('editable:vertex:metakeyclick');}, this);
         this._map.on('editable:vertex:mousedown', function() {alert('editable:vertex:mousedown');}, this);
         this._map.on('editable:vertex:rawclick', function() {alert('editable:vertex:rawclick');}, this);
         this._map.on('editable:vertex:shiftclick', function() {alert('editable:vertex:shiftclick');}, this);
 }

  };

  /**
  Миксины для методов работы с объектами
  Дерево миксинов повторяет дерево классов объектов Leaflet 1.0.0-rc3
  L.Layer +-> L.Marker
          +-> L.Path +-> L.Polyline -> L.Polygon -> L.Rectangle
                     +->L.CircleMarker -> L.Circle
   */

  /**
   *   Примесь, обеспечивающая поддержку основных методов редактирования маркера
   */
  L.Measure.Mixin.Marker = {
    /**
     Приводит значение координат точки, которые могут принимать любые действительные значения,
     к значениям, лежещим в отрезках [-90; 90], для широты, [-180, 180] для долготы.
     @param {Object} latlng Точка, содержащая координаты.
     @param {Number} periodRadius Радиус периода координатной оси.
     @returns {Number} Точка со скорректированными координатами.
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
     Получить текстовое представление произведенных измерений.
     @param {Object} e Аргументы метода.
     @param {Object} e.value Результат измерений в метрах.
     @param {Object} e.dimension Размерность измерений (1 - линейные расстояния, 2- площади).
     @returns {string} Текстовое представление произведенных измерений.
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
     Вычисляет расстояние между двумя точками (в метрах) с заданной точностью.
     @param {Object} e Аргументы метода.
     @param {Object} e.latlng1 Первая точка.
     @param {Object} e.latlng2 Вторая точка.
     @returns {Number} Полученное расстояние (в метрах).
     */
    getDistance: function(e) {
      return parseFloat(e.latlng1.distanceTo(e.latlng2).toFixed(L.Measure.precition));
    },

    /**
     Вычисляет расстояние между двумя точками и возвращает его текстовое представление с заданной точностью.
     @param {Object} e Аргументы метода.
     @param {Object} e.latlng1 Первая точка.
     @param {Object} e.latlng2 Вторая точка.
     @returns {String} Текстовое представление расстояния.
     */
    getDistanceText: function(e) {
      return this.getMeasureText({
        value: this.getDistance(e),
        dimension: 1
      });
    },

  };

  /**
   Примесь, обеспечивающая поддержку основных методов редактирования пути
   */
  L.Measure.Mixin.Path = {
    /**
     Метод для получения периметра точек слоя
     @param {Object} layer Слой с геометрией, представляющей производимые измерения.
     @returns {Number} Периметр.
     */
    getPerimeter: function(layer) {
      var latlngs = layer.editor.getLatLngs();
      var distance = 0;
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

      return distance;
    },

    /**
     Метод для получения периметра точек слоя
     @param {Object} layer Слой с геометрией, представляющей производимые измерения.
     @returns {Number} String} Текстовое представление периметра.
     */
    getPerimeterText: function(layer) {
      return this.getMeasureText({
        value: this.getPerimeter(layer),
        dimension: 1
      });
    },

  };

  /**
  Примесь, обеспечивающая поддержку основных методов редактирования ломаной
   */
  L.Measure.Mixin.Polyline = {
  };

  /**
     Примесь, обеспечивающая поддержку основных методов редактирования многоугольника
   */
  L.Measure.Mixin.Polygon = {

     /**
     Метод для получения периметра точек слоя
     @param {Object} layer Слой с геометрией, представляющей производимые измерения.
     @returns {Number} Периметр.
     */
    getPerimeter: function(layer) {
      var latlngs = layer.editor.getLatLngs()[0];
      var distance = 0;
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

      return distance;
    },

       /**
     * Вычисляет площадь многоугольника (в метрах) с заданной точностью.
     * @param {Object} e Аргументы метода.
     * @param {Object} e.latlngs Массив точек многоугольника.
     * @returns {Number} Полощадь многоугольника (в метрах).
     */
    getArea: function(layer) {
      var latlngs = layer.editor.getLatLngs()[0];
      return distance = parseFloat(this.geodesicArea(latlngs).toFixed(L.Measure.precition));
    },

    /**
    Вычисляет площадь многоугольника возвращает её текстовое представление с заданной точностью.
    @param {Object} e Аргументы метода.
    @param {Object} e.latlngs Массив точек многоугольника.
    @returns {Number} Текстовое представление площади.
     */
    getAreaText: function(layer) {
      return this.getMeasureText({
        value: this.getArea(layer),
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
   Примесь, обеспечивающая поддержку основных методов редактирования прямоугольника
   */
  L.Measure.Mixin.Rectangle = {
  };

  /**
   Примесь, обеспечивающая поддержку основных методов редактирования прямоугольника
   */
  L.Measure.Mixin.CircleMarker = {
  };

  /**
   Примесь, обеспечивающая поддержку основных методов измерения круга
   */
  L.Measure.Mixin.Circle = {

    /**
    Возвращает текстовое представление для радиуса с заданной точностью.
    @param {Object} e Аргументы метода.
    @param {Object} e.radius Значение радиуса в метрах.
    @returns {Number} Текстовое представление радиуса.
      */
    getRadiusText: function(layer) {
      return this.getMeasureText({
        value: layer.getRadius(),
        dimension: 1
      });
    },

     /**
    Возвращает текстовое представление для диаметра с заданной точностью.
    @param {Object} e Аргументы метода.
    @param {Object} e.radius Значение радиуса в метрах.
    @returns {String} Текстовое представление радиуса.
      */
    getDiameterText: function(layer) {
      return this.getMeasureText({
        value: 2 * layer.getRadius(),
        dimension: 1
      });
    },

     /**
    Возвращает текстовое представление для периметра с заданной точностью.
    TODO - УЧЕСТЬ СФЕРИЧНОСТЬ - ВОЗМОЖНО СТОИТ ПЕРЕВЕСТИ В МНОГОУГОЛЬНИК?
    @param {Object} e Аргументы метода.
    @param {Object} e.radius Значение радиуса в метрах.
    @returns {String} Текстовое представление радиуса.
      */
    getPerimeterText: function(layer) {
      return this.getMeasureText({
        value: 2 * Math.PI * layer.getRadius(),
        dimension: 1
      });
    },



    /**
    Возвращает текстовое представление площади круга с заданной точностью.
    TODO - УЧЕСТЬ СФЕРИЧНОСТЬ - ВОЗМОЖНО СТОИТ ПЕРЕВЕСТИ В МНОГОУГОЛЬНИК?
    @param {Object} e Аргументы метода.
    @param {Object} e.radius Значение радиуса в метрах.
    @returns {Number} Текстовое представление радиуса.
      */
    getAreaText: function(layer) {
      var radius = layer.getRadius();
      var area = Math.PI * radius * radius;
      return this.getMeasureText({
        value: area,
        dimension: 2
      });
    },
  };

  /**
   Примесь, обеспечивающая поддержку событий измерения круга и прямоугольника
   */
  L.Measure.Mixin.CircleRectangleEvents = {
    /**
      Метод, обеспечивающий в момент инициализации перехват основных событий редактирования

      Порядок событий в Leaflet.Editable:
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
     */
    setEvents: function (map, options) {
      this.editableEventTree = {
        drawing: {
          move: this._setMove,
          end: this._setDrawingEnd
        },
        vertex: {
          dragstart: this._setDragstart,
          drag: this._setDrag,
          dragend: this._setDragend
        }
      };
    },

    _setMove: function(e) {
      if (!this.create && !this.isDragging) {
        var text = this.popupText.move;
        this._onMouseMove(e, text);
        this._fireEvent(e, 'move');
      }
    },

    _setDrawingEnd: function(e) {
      this.create = true;
    },

    _setDragstart: function(e) {
      this.isDragging = true;
    },

    _setDragend: function(e) {
      this._map.closePopup();
      if (this.create) {
        this._fireEvent(e, 'created');
        this.create = false;
      } else {
        this._fireEvent(e, 'editend');
      }
    },

    _setDrag: function(e) {
      var text = this.popupText.drag;
      this._onMouseMove(e, text);
      if (this.create) {
        this._fireEvent(e, 'create');
      } else {
        this._fireEvent(e, 'edit');
      }

    },
  };

  /**
   Класс, обеспечивающая поддержку основных cобытий редактирования маркера
   */
  L.Measure.Marker = L.Marker.extend({
    includes: [ L.Measure.Mixin, L.Measure.Mixin.Marker ],

    popupText: {
      move: 'Кликните по карте, чтобы зафиксировать маркер',
      drag: 'Отпустите кнопку мыши, чтобы зафиксировать маркер'
    },

    /**
     Метод для получения настроек по умолчанию, для слоев создаваемых инструментом.
     @abstract
     @returns {Object} настроек по умолчанию, для слоев создаваемых инструментом.
     */
    _getDefaultOptions: function () {
      return {
        icon: L.icon({
          iconUrl: './vendor/leaflet_1_0_0_rc2/images/marker-icon.png',
          iconRetinaUrl: './vendor/leaflet_1_0_0_rc2/images/marker-icon-2x.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: './vendor/leaflet_1_0_0_rc2/images/marker-shadow.png',
          shadowSize: [41, 41]
        })
      };
    },

    /**
      Метод, обеспечивающий в момент инициализации перехват основных событий редактирования

      Порядок событий в Leaflet.Editable:

        До первого клика
          editable:created
          editable:enable
          editable:drawing:start
          editable:drawing:move

        1-й клик  и последующие клики
          editable:created
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
     */
    setEvents: function (map, options) {
      this.editableEventTree = {
        drawing: {
          move: this._setMove,
          commit: this._setCommit,
        },
        drag: this._setDrag,
        dragstart: this._setDragStart,
        dragend: this._setDragend
      };
    },

    /**
      Инициализация режима перемщения маркера Marker с отображением tooltip текущего месторасположения
      */
    enable: function() {
      this.editTool = this.enableEdit();
      this.measureLayer = this._map.editTools.startMarker();
      //       this._onActionsTest();
//       this.eventOffByPrefix('editable:');
      this.eventsOn( 'editable:', this.editableEventTree, true);
      this.isDragging = false;
    },

      /**
        Выключение режима перемщения маркера Marker
       */
    disable: function () {
      this.disableEdit();
      this.editTool = null;
    },


    _setMove: function(e) {
      var text = this.isDragging ? this.popupText.drag : this.popupText.move + '<br>' + this._getLabelContent(e.layer, e.latlng);
      this._onMouseMove(e, text);
      this._fireEvent(e, 'move');
    },

    _setDrag: function(e) {
      this._fireEvent(e, 'edit');
    },

    _setDragStart: function(e) {
      this.isDragging = true;
    },

    _setDragend:function(e) {
      this.isDragging = false;
      this._fireEvent(e, 'editend');
    },

    _setCommit: function(e) {
      this._fireEvent(e, 'created');
    },
  });

  /**
   Класс, обеспечивающая поддержку основных cобытий редактирования круга
   */
  L.Measure.Circle = L.Circle.extend({
    includes: [ L.Measure.Mixin, L.Measure.Mixin.Marker, L.Measure.Mixin.CircleMarker, L.Measure.Mixin.Circle, L.Measure.Mixin.CircleRectangleEvents],

    popupText: {
      move: 'Зажмите кнопку мыши и перемеcтите курсор, чтобы нарисовать круг',
      drag: 'Отпустите кнопку мыши, чтобы зафиксировать круг.'
    },

    /**
     Метод для получения настроек по умолчанию, для слоев создаваемых инструментом.
     @abstract
     @returns {Object} настроек по умолчанию, для слоев создаваемых инструментом.
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

    enable: function () {
      this.measureLayer = this._map.editTools.startCircle();
      this._latlng = this._map.getCenter();
      this.editTool = this.enableEdit();
      this.eventsOn( 'editable:', this.editableEventTree, true);
      this.create = false;
      this.isDragging = false;
    },

  });

  /**
   Класс, обеспечивающая поддержку основных cобытий редактирования прямоугольника
   */
  L.Measure.Rectangle = L.Rectangle.extend({
    includes: [ L.Measure.Mixin,
      L.Measure.Mixin.Marker, L.Measure.Mixin.Path, L.Measure.Mixin.Polyline, L.Measure.Mixin.Polygon, L.Measure.Mixin.Rectangle,
      L.Measure.Mixin.CircleRectangleEvents
    ],

    popupText: {
      move: 'Зажмите кнопку мыши и перемеcтите курсор, чтобы нарисовать прямоугольник',
      drag: 'Отпустите кнопку мыши, чтобы зафиксировать прямоугольник.'
    },

    /**
     Метод для получения настроек по умолчанию, для слоев создаваемых инструментом.
     @abstract
     @returns {Object} настроек по умолчанию, для слоев создаваемых инструментом.
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

    enable: function () {
      this.measureLayer = this._map.editTools.startRectangle();
      this._latlng = this._map.getCenter();
      this.editTool = this.enableEdit();
      this.eventsOn( 'editable:', this.editableEventTree, true);
      this.isDrawing = false;
    },

  });

  /**
   Класс, обеспечивающая поддержку основных cобытий редактирования ломаной
   */
  L.Measure.Polyline = L.Polyline.extend({
    includes: [ L.Measure.Mixin, L.Measure.Mixin.Marker, L.Measure.Mixin.Path ],

    popupText: {
      move: 'Кликните по карте, чтобы добавить начальную вершину.',
      add: 'Кликните по карте, чтобы добавить новую вершину.',
      commit: 'Кликните на текущую вершину, чтобы зафиксировать линию',
      drag: ''
    },
    /**
     Метод для получения настроек по умолчанию, для слоев создаваемых инструментом.
     @abstract
     @returns {Object} настроек по умолчанию, для слоев создаваемых инструментом.
     */
    _getDefaultOptions: function () {
      return {
        shapeOptions: {
          stroke: true,
          color: 'green',
          weight: 2,
          opacity: 0.5,
          fill: false,
          clickable: true
        }
      };
    },

     /**
      Метод, обеспечивающий в момент инициализации перехват основных событий редактирования

      Порядок событий в Leaflet.Editable:
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
     */
    setEvents: function (map, options) {
      this.editableEventTree = {
        vertex: {
          dragstart: this._setDragStart,
          dragend: this._setDragEnd,
          deleted: this._setVertexDeleted
        },
        drawing: {
          move: this._setMove,
          clicked: this._setClicked,
          mousedown: this._setMouseDown,
          end: this._setDrawingEnd
        },
      };
    },
    enable: function () {
      this.editTool = this.enableEdit();
      this.measureLayer = this._map.editTools.startPolyline();
      this.eventsOn( 'editable:', this.editableEventTree, true);
      this.isDragging = false;
    },

    disable: function() {
    },


    _setMove: function(e) {
      var text;
      var latlngs = e.layer.editor.getLatLngs();
      var nPoints = latlngs.length;
      if (this.isDragging) {
        this._fireEvent(e, 'edit');
      } else {
        if (nPoints == 0) {
          text = this.popupText.move;
          this._fireEvent(e, 'move');
        }
        this._onMouseMove(e, text);
      }
    },

    _setMouseDown: function(e) {
      if (e.layer.getLatLngs().length < 1) return;
      var text = this.popupText.commit;
      var latlng = e.latlng? e.latlng : e.vertex.latlng;
      this._showPopup(text, latlng);
    },

    _setClicked: function(e) {
      this._map.closePopup();
      this._fireEvent(e, 'create');
    },

    _setDrawingEnd: function(e) {
      this._fireEvent(e, 'created');
    },

    _setDragStart: function(e) {
      this.measureLayer = e.layer;
      this.isDragging = true;
    },

    _setDragEnd: function(e) {
      this._map.closePopup();
      this.isDragging = false;
      this._fireEvent(e, 'editend');
    },

    _setVertexDeleted: function(e) {
      this._fireEvent(e, 'editend');
    },

  });

  /**
   Класс, обеспечивающая поддержку основных cобытий редактирования многоугольника
   */
  L.Measure.Polygon =  L.Polygon.extend({
    includes: [ L.Measure.Mixin, L.Measure.Mixin.Marker, L.Measure.Mixin.Path, L.Measure.Mixin.Polyline, L.Measure.Mixin.Polygon ],

    popupText: {
      move: 'Кликните по карте, чтобы добавить начальную вершину.',
      add: 'Кликните по карте, чтобы добавить новую вершину.',
      commit: 'Кликните на текущую вершину, чтобы зафиксировать многоугольник',
      drag: 'Отпустите курсор, чтобы  зафиксировать многоугольник'
    },

     /**
     Метод для получения настроек по умолчанию, для слоев создаваемых инструментом.
     @abstract
     @returns {Object} настроек по умолчанию, для слоев создаваемых инструментом.
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
      Метод, обеспечивающий в момент инициализации перехват основных событий редактирования

      Порядок событий в Leaflet.Editable:
        До первого клика
          editable:enable
          editable:created
          editable:enable
          editable:drawing:start
          editable:shape:new
          editable:drawing:move
        1-й клик
          editable:vertex:mousedown
          ???
        и последующие клики
        ???
      */
    setEvents: function (map, options) {
      this.editableEventTree = {
        vertex: {
          dragstart: this._setDragStart,
          dragend: this._setDragEnd,
          deleted: this.setVertexDeleted
        },
        drawing: {
          move: this._setMove,
          clicked: this._setClicked,
          commit: this._setCommit,
          mousedown: this._setMouseDown,
          end: this.disable
        }
      };
    },

    enable: function () {
      this.editTool = this.enableEdit();
      this.measureLayer = this._map.editTools.startPolygon();
      this.isDragging = false;
      this.eventsOn( 'editable:', this.editableEventTree, true);
    },

    disable: function() {
  //     this.eventsOff( 'editable:', this.editableEventTree);
    },

    _setMove: function(e) {
      var text;
      var latlngs = e.layer.editor.getLatLngs()[0];
      var nPoints = latlngs.length;
      if (nPoints == 0) {
        text = this.popupText.move;
        this._fireEvent(e, 'move');
      } else {
        if (this.isDragging) {
          text = this.popupText.drag;
          this._fireEvent(e, 'edit');
        } else {
          text = this.popupText.add;
        }
      }
      this._onMouseMove(e, text);
    },

    _setDragStart: function(e) {
      this.measureLayer = e.layer;
      this.isDragging = true;

    },
    _setDragEnd: function(e) {
      this._map.closePopup();
      this._fireEvent(e, 'editend');
      this.isDragging = false;

    },

    setVertexDeleted: function(e) {
      this.vertexDeleted = true;
      this._fireEvent(e, 'editend');
      this.vertexDeleted = false;
    },

    _setMouseDown: function(e) {
      var latlngs = e.layer.editor.getLatLngs()[0];
      if (latlngs.length <= 1) return;
      var text = this.popupText.commit;
      var latlng = e.latlng? e.latlng : e.vertex.latlng;
      this._showPopup(text, latlng);
    },

    _setClicked: function(e) {
      this._map.closePopup();
      this._fireEvent(e, 'create');
    },

    _setCommit: function(e) {
      this._fireEvent(e, 'created');
    },

  });

  /**
   Фабричный метод для создания экземпляра инструмента измерения маркера.
   */
  L.Measure.marker = function(map, options) {
    return new L.Measure.Marker(map, options);
  };

  /**
   Фабричный метод для создания экземпляра инструмента измерения прямоугольника.
   */
  L.Measure.rectangle = function(map, options) {
    return new L.Measure.Rectangle(map, options);
  };

  /**
   Фабричный метод для создания экземпляра инструмента измерения круга.
   */
  L.Measure.circle = function(map, options) {
    return new L.Measure.Circle(map, options);
  };

  /**
   Фабричный метод для создания экземпляра инструмента измерения ломаной.
   */
  L.Measure.polyline = function(map, options) {
    return new L.Measure.Polyline(map, options);
  };

  /**
   Фабричный метод для создания экземпляра инструмента измерения многоугольника.
   */
  L.Measure.polygon = function(map, options) {
    return new L.Measure.Polygon(map, options);
  };

})(L);
