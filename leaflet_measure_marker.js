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
      this._map.on ('editable:drawing:click', this.showLabel, this);
      this._map.on ('editable:dragend',this.showLabel, this);
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
//       if (this.measureLayer._tooltip) {
//         this.measureLayer._tooltip.setTooltipContent(text);
//       } else {
//         this.measureLayer.bindTooltip(text,{permanent:true, opacity: 0.5});
//       }
      if (this.measureLayer._popup) {
        this.measureLayer._popup.setLatLng(e.latlng).setContent(text);
      } else {
        this.measureLayer.bindPopup(text, {keepInView: true, autoClose:false, closeButton: false} ).openPopup();
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
//       this.measureLayer.bindTooltip(text,{permanent:true, opacity: 0.5});
//       if (this.measureLayer._popup) {
//         this.measureLayer._popup.setLatLng(e.latlng).setContent(text);
//       } else {
        this.measureLayer.unbindPopup();
        this.measureLayer.bindPopup(text, {keepInView: true, autoClose:false, closeButton: false} ).openPopup();
//       }

    },

    _setDragStartTooltipContent: function(e) {
      this.measureLayer = e.layer;
    },

    showLabel: function(e) {
      var coords = this._getLabelContent();
      var text = "<b>" + coords + '</b>';
//       if (this.measureLayer._tooltip) {
//         this.measureLayer.closeTooltip(this.measureLayer._tooltip);
//       }
//       if (this.measureLayer._popup) {
//         this.measureLayer._popup.setLatLng(e.latlng).setContent(text);
//       } else {
//         this.measureLayer.bindPopup(text, {keepInView: true, autoClose:false, closeButton: false} ).openPopup();
//       }
      if (this.measureLayer._tooltip) {
        this.measureLayer._tooltip.setTooltipContent(text);
      } else {
        this.measureLayer.bindTooltip(text,{permanent:true, opacity: 0.9});
      }
    },


  });

  /**
   * Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.marker = function(map, options) {
    return new L.Measure.Marker(map, options);
  };


})(L);
