(function(L, undefined) {
  L.Measure = L.Measure || {};

  /**
   * Класс инструмента для измерения координат.
   */
  L.Measure.Marker = L.Marker.extend({
    includes: L.Measure.Mixin,

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

    /* МЕТОДЫ Leaflet.draw START */
    /**
     * Метод для получения нового экзепляра слоя, на основе того, который сейчас отрисовывается.
     * @returns {Object} Новый экземпляр слоя.
     */
    _createLayer: function() {
      return map.editTools.startMarker();
    },

    /**
    * Метод для получения нового экземпляра инструмента редактирования для отрисованного слоя.
    * @param {Object} e Аргументы метода.
    * @param {Object} e.layer Слой, для которого требуется получить инструмент редактирования.
    * @returns {Object} Новый экземпляр инструмента редактирования.
    */
    _createEditTool: function(e) {
      ret = this.enableEdit();
      ret.markers = [e.layer]
      return ret;
    },

    /**
     * Метод для привязки обработчиков событий редактирования отрисованного слоя.
     * @param {Object} e Аргументы метода.
     * @param {Object} e.layer Слой, редактирование которого будет обрабатываться привязываемыми обработчиками.
     * @returns {Object} e.editTool Инструмент редактирования слоя.
     */
    _attachEditHandlers: function(e) {
      var _this = this;
      var marker = e.layer;
      var editTool = e.editTool;
      this._map.on ('editable:drawing:start',this._onEditToolMarkerDrag,{
        layer: marker,
        editTool: editTool,
        marker: marker
      });
      this._map.on ('editable:dragend',this._onEditToolEditEnd,{
        layer: marker,
        editTool: editTool,
        marker: marker
      });

//       marker.on('drag', function(e) {
//         _this._onEditToolMarkerDrag.call(_this, {
//           layer: marker,
//           editTool: editTool,
//           marker: marker
//         });
//       });
//
//       marker.on('dragend', function(e) {
//         _this._onEditToolEditEnd.call(_this, {
//           layer: marker,
//           editTool: editTool
//         });
//       });
    },

/* МЕТОДЫ Leaflet.draw END */

      /* Методы добавленные апи переходе на Editable */

      /**
        Инициализация режима перемщения маркера Marker с отображением tooltip текущего месторасположения
       */
    enable: function () {
      this.editTool = this.enableEdit();
//       this._map.on ('editable:drawing:mouseup',function() {alert('editable:drawing:mouseup');}, this);
// //       this._map.on ('editable:dragstart',function() {alert('editable:dragstart');}, this);
//       this._map.on ('editable:drawing:commit',function() {alert('editable:drawing:commit');}, this);

      //       this._map.on ('mouseover',function() {alert('over');});
      this._map.on ('editable:drag',this._setDragTooltipContent, this);
      this._map.on ('editable:dragstart',this._setDragStartTooltipContent, this);

      this._map.on ('editable:drawing:move', this._setMoveTooltipContent, this);
      this._map.on ('editable:drawing:click', this._setLabel, this);
      this._map.on ('editable:dragend',this._setLabel, this);
      this.measureLayer = map.editTools.startMarker();
    },

      /**
        Выключение режима перемщения маркера Marker
       */
      disable: function () {
      this.disableEdit();
      this.editTool = null;
    },

    _setMoveTooltipContent: function(e) {
      var text = 'Кликните по карте, чтобы зафиксировать маркер';
      var coords = this._getLabelContent();
      text += "<br>" + coords;
      if (!this._map.hasLayer(this.measureLayer)) {
        this.measureLayer.addTo(this._map)
      }
      if (this.measureLayer._tooltip) {
        this.measureLayer._tooltip.setTooltipContent(text);
      } else {
        this.measureLayer.bindTooltip(text,{permanent:true, opacity: 0.5});
      }
      //       this.measureLayer.bindTooltip(text).openTooltip();
    },

    _setDragTooltipContent: function(e) {
      var text = 'Отпустите кнопку мыши, чтобы зафиксировать маркер';
      var coords = this._getLabelContent();
      text += "<br>" + coords;
      if (this.measureLayer._tooltip) {
        this.measureLayer.closeTooltip(this.measureLayer._tooltip);
      }
      this.measureLayer.bindTooltip(text,{permanent:true, opacity: 0.5});
    },

    _setDragStartTooltipContent: function(e) {
      this.measureLayer = e.layer;
    },

    _setLabel: function(e) {
      var coords = this._getLabelContent();
      text = "<b>" + coords + '</b>';
      if (this.measureLayer._tooltip) {
        this.measureLayer.closeTooltip(this.measureLayer._tooltip);
      }
      this.measureLayer.bindTooltip(text,{permanent:true});
    },


  });

  /**
   * Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.marker = function(map, options) {
    return new L.Measure.Marker(map, options);
  };


})(L);
