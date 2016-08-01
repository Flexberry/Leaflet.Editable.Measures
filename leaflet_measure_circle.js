(function(L, undefined) {
  L.Measure = L.Measure || {};

  /**
   * Класс инструмента для измерения координат.
   */
  L.Measure.Circle = L.Circle.extend({
    includes: L.Measure.Mixin,

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
    _getLabelContent: function(e) {
      if (!e.layer) {
        return '';
      }

      return 'Радиус: ' + L.Measure.getRadiusText({
        radius: e.layer.getRadius()
      });
    },


    _onActionsTest: function() {
//       this._map.on('editable:created', function() {alert('editable:created');}, this);
//       this._map.on('editable:disable', function() {alert('editable:disable');}, this);
//       this._map.on('editable:drag', function() {alert('editable:drag');}, this);
//       this._map.on('editable:dragend', function() {alert('editable:dragend');}, this);
//       this._map.on('editable:dragstart', function() {alert('editable:dragstart');}, this);
//       this._map.on('editable:drawing:cancel', function() {alert('editable:drawing:cancel');}, this);
//       this._map.on('editable:drawing:click', function() {alert('editable:drawing:click');}, this);
//       this._map.on('editable:drawing:clicked', function() {alert('editable:drawing:clicked');}, this);
//       this._map.on('editable:drawing:commit', function() {alert('editable:drawing:commit');}, this);
//       this._map.on('editable:drawing:end', function() {alert('editable:drawing:end');}, this);
//       this._map.on('editable:drawing:mousedown', function() {alert('editable:drawing:mousedown');}, this);
//       this._map.on('editable:drawing:mouseup', function() {alert('editable:drawing:mouseup');}, this);
//       this._map.on('editable:drawing:move', function() {alert('editable:drawing:move');}, this);
      //       this._map.on('editable:drawing:start', function() {alert('editable:drawing:start');}, this);
//       this._map.on('editable:editing', function() {alert('editable:editing');}, this);
//       this._map.on('editable:enable', function() {alert('editable:enable');}, this);
//       this._map.on('editable:middlemarker:mousedown', function() {alert(editable:middlemarker:mousedown');}, this);
//       this._map.on('editable:shape:delete', function() {alert('editable:shape:delete');}, this);
//       this._map.on('editable:shape:deleted', function() {alert('editable:shape:deleted');}, this);
//       this._map.on('editable:shape:new', function() {alert('editable:shape:new');}, this);
//       this._map.on('editable:vertex:altclick', function() {alert('editable:vertex:altclick');}, this);
//       this._map.on('editable:vertex:click', function() {alert('editable:vertex:click');}, this);
//       this._map.on('editable:vertex:clicked', function() {alert('editable:vertex:clicked');}, this);
//       this._map.on('editable:vertex:contextmenu', function() {alert('editable:vertex:contextmenu');}, this);
//       this._map.on('editable:vertex:ctrlclick', function() {alert('editable:vertex:ctrlclick');}, this);
//       this._map.on('editable:vertex:deleted', function() {alert('editable:vertex:deleted');}, this);
//       this._map.on('editable:vertex:drag', function() {alert('editable:vertex:drag');}, this);
//       this._map.on('editable:vertex:dragend', function() {alert('editable:vertex:dragend');}, this);
//       this._map.on('editable:vertex:dragstart', function() {alert('editable:vertex:dragstart');}, this);
//       this._map.on('editable:vertex:metakeyclick', function() {alert('editable:vertex:metakeyclick');}, this);
//       this._map.on('editable:vertex:mousedown', function() {alert('editable:vertex:mousedown');}, this);
//       this._map.on('editable:vertex:rawclick', function() {alert('editable:vertex:rawclick');}, this);
//       this._map.on('editable:vertex:shiftclick', function() {alert('editable:vertex:shiftclick');}, this);
    },

    enable: function () {
      this._latlng = this._map.getCenter();
      this.editTool = this.enableEdit();
      this._onActionsTest();
      this._map.on('editable:drawing:move', this._setMoveTooltipContent, this);
      this._map.on ('editable:vertex:dragstart', this._setDrawingTolltipContent, this);
      this._map.on ('editable:vertex:dragend', this.showLabel, this);
//             this._map.on ('editable:drawing:move', this._setMoveTooltipContent, this);
//             this._map.on ('editable:editing', this._setDrawingTolltipContent, this);
      this.measureLayer = map.editTools.startCircle();

    },

    _setMoveTooltipContent: function(e) {
//       alert('editable:drawing:move');
      var text = 'Зажмите кнопку мыши и переметите курсор, чтобы нарисовать круг ';
      var popup = L.popup()
      .setLatLng(e.latlng)
      .setContent(text)
      .openOn(this._map);

    },

    showLabel: function(e) {
      var text =this._getLabelContent(e);
      if (this.measureLayer._tooltip) {
        this.measureLayer.closeTooltip(this.measureLayer._tooltip);
      }
      this.measureLayer.bindTooltip(text, {permanent: false, sticky: true, opacity: 0.9});
      this.measureLayer.label = this.measureLayer._tooltip;
    },

    _setDrawingTolltipContent: function(e) {
      var text = 'Отпустите кнопку мыши, чтобы зафиксировать круг.';
      if (!this._map.hasLayer(this.measureLayer)) {
        this.measureLayer.addTo(this._map)
      }
      if (this.measureLayer._tooltip) {
        this.measureLayer._tooltip.setTooltipContent(text);
      } else {
        this.measureLayer.bindTooltip(text, {permanent: false, sticky: true, opacity: 0.5}).openTooltip();
      }

    },


  });

  /**
   * Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.circle = function(map, options) {
    return new L.Measure.Circle(map, options);
  };

})(L);
