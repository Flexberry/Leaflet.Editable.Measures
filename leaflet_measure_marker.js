(function(L, undefined) {
  L.Measure = L.Measure || {};

  /**
   * Класс инструмента для измерения координат.
   */
  L.Measure.Marker = L.Marker.extend({
    includes: L.Measure.Mixin,

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

    tooltipText: {
      drag: 'Кликните по карте, чтобы зафиксировать маркер',
    },

    /**
     * Метод для получения настроек по умолчанию, для слоев создаваемых инструментом.
     * @abstract
     * @returns {Object} настроек по умолчанию, для слоев создаваемых инструментом.
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
     * Метод для получения текстового описания результатов измерений.
     */
    _getLabelContent: function() {
      var fixedLatLng = L.Measure.getFixedLatLng(this.measureLayer._latlng);
      var fixedLat = fixedLatLng.lat;
      var fixedLng = fixedLatLng.lng;
      return Math.abs(fixedLat).toFixed(5) + (fixedLat >= 0 ? ' с.ш. ' : ' ю.ш. ') + Math.abs(fixedLng).toFixed(5) + (fixedLng >= 0 ? ' в.д.' : ' з.д. ');
    },


      /* Методы добавленные апи переходе на Editable */

      /**
        Инициализация режима перемщения маркера Marker с отображением tooltip текущего месторасположения
       */
    enable: function () {
      this.editTool = this.enableEdit();
//       this._onActionsTest();
      this.eventOffByPrefix('editable:');
      this.eventsOn( 'editable:', this.editableEventTree, true);
      this.isDragging = false;
      this.measureLayer = this._map.editTools.startMarker();
    },

      /**
        Выключение режима перемщения маркера Marker
       */
      disable: function () {
      this.disableEdit();
      this.editTool = null;
    },

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
     Метод обновления основного лейбла измеряемого объекта
     @param {Object} layer Редактируемый слой.
     */
    _updateMeasureLabel: function(layer) {
      if (this.isDragging) {
        var text = 'Отпустите кнопку мыши, чтобы зафиксировать маркер';
        var coords = this._getLabelContent();
        text += "<br>" + coords;
        if (layer._tooltip) {
          layer.closeTooltip(layer._tooltip);
        }
        layer.bindTooltip(text,{permanent:true, opacity: 0.5});
      } else {
        var coords = this._getLabelContent();
        text = "<b>" + coords + '</b>';
        this._showLabel(layer, text);      }
    },

    _setMove: function(e) {
      if (!this.isDragging) {
        var text = 'Кликните по карте, чтобы зафиксировать маркер';
        var coords = this._getLabelContent();
        text += "<br>" + coords;
        this._onMouseMove(e, text);
      }
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
   * Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.marker = function(map, options) {
    return new L.Measure.Marker(map, options);
  };


})(L);
