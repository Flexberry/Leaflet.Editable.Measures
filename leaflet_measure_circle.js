(function(L, undefined) {
  L.Measure = L.Measure || {};

  /**
   * Класс инструмента для измерения координат.
   */
  L.Measure.Circle = L.Circle.extend({
    includes: L.Measure.Mixin,

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
    _getLabelContent: function(layer, latlng) {
      var radius = layer.getRadius();
      var  radiusText = L.Measure.getRadiusText({radius: radius});
      return '<b>' + 'Радиус: ' + radiusText + '</b>';
    },

     /**
    Метод обновления основного лейбла измеряемого объекта
    @param {Object} layer Редактируемый слой.
    */
    _updateMeasureLabel: function(layer) {
      var radius = layer.getRadius();
      var areaText = '<b>Площадь: ' + L.Measure.getCircleAreaText({radius: radius}) + '</b>';
      var latlngs = layer.editor.getLatLngs();
      var marker = latlngs[0].__vertex;
      this._showLabel(marker, areaText);
    },

    /*
     *      Метод для получения маркеров инструмента редактирования, имеющих метки
     *      @param {Object} editor Инструмент редактирования
     *      @returns {Object[]} Массив помеченных маркеров инструмента редактирования.
     */
    _labelledMarkers: function(editor) {
      var latlngs = editor.getLatLngs();
      var markers = [];
      markers.push(latlngs[1].__vertex)
      return markers;
    },

    /*
     *      Метод для получения маркеров инструмента редактирования, не имеющих меток
     *      @param {Object} editor Инструмент редактирования
     *      @returns {Object[]} Массив не помеченных маркеров инструмента редактирования.
     */
    _unlabelledMarkers: function(editor) {
      var latlngs = editor.getLatLngs();
      var markers = [];
      markers.push(latlngs[0].__vertex)
      return markers;
    },

    enable: function () {
      this._latlng = this._map.getCenter();
      this.editTool = this.enableEdit();
      this.eventOffByPrefix('editable:');
      this.eventsOn( 'editable:', this.editableEventTree, true);
//      this._onActionsTest();
      this.isDrawing = false;
      this.measureLayer = this._map.editTools.startCircle();

    },

    _setMove: function(e) {
      if (this.isDrawing || this.isDragging) {
        this._fireEvent(e, 'edit');
        return;
      }
      var text = 'Зажмите кнопку мыши и переметите курсор, чтобы нарисовать круг ';
      this._onMouseMove(e, text);
    },

    _setDrawingEnd: function(e) {
      this.isDrawing = true;
    },

    _setDragstart: function(e) {
      if (this.isDrawing) return;
      this.isDragging = true;
    },

    _setDragend: function(e) {
      this._map.closePopup();
      if (this.isDrawing) {
        this._fireEvent(e, 'created');
        this.isDrawing = false;
      } else {
        this._fireEvent(e, 'editend');
        this.isDragging = false;
      }
//       this._map.closePopup();
//       var text = '<b>' + this._getLabelContent(e) + '</b>';
//       this._showLabel(e.layer, text);
//       this._map.off('editable:drawing:move', this._setMove, this);
    },

    _setDrag: function(e) {
      var text = 'Отпустите кнопку мыши, чтобы зафиксировать круг.';
      this._onMouseMove(e, text);
    },

  });

  /**
   * Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.circle = function(map, options) {
    return new L.Measure.Circle(map, options);
  };

})(L);
