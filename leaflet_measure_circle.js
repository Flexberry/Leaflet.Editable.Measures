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
          move: this._setMoveTooltipContent,
//           end: this.disable
        },
	vertex: {
	  dragstart: function() {this.isDrawing = true;},
	  dragend: this.showLabel
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
    _getLabelContent: function(e) {
      if (!e.layer) {
        return '';
      }

      return 'Радиус: ' + L.Measure.getRadiusText({
        radius: e.layer.getRadius()
      });
    },


    enable: function () {
      this._latlng = this._map.getCenter();
      this.editTool = this.enableEdit();
      this.eventOffByPrefix('editable:');
      this.eventsOn( 'editable:', this.editableEventTree, true);
//      this._onActionsTest();
      this.isDrawing = false;
//       this._map.on('editable:drawing:move', this._setMoveTooltipContent, this);
//       this._map.on ('editable:vertex:dragstart', function() {this.isDrawing = true;}, this);
//       this._map.on ('editable:vertex:dragend', this.showLabel, this);
      this.measureLayer = this._map.editTools.startCircle();

    },

    _setMoveTooltipContent: function(e) {
//       alert('editable:drawing:move');
      var text = this.isDrawing ?
      'Отпустите кнопку мыши, чтобы зафиксировать круг.' :
      'Зажмите кнопку мыши и переметите курсор, чтобы нарисовать круг ';
      this.measurePopup = L.popup()
      this.measurePopup.setLatLng(e.latlng)
      .setContent(text);
      this.measurePopup.openOn(this._map);
    },

    showLabel: function(e) {
      var text = '<b>' + this._getLabelContent(e) + '</b>';
      if (this._map.hasLayer(this.measurePopup)) {
        this._map.closePopup();
        this._map.removeLayer(this.measurePopup);
      }
      if (this.measureLayer._tooltip) {
        this.measureLayer.closeTooltip(this.measureLayer._tooltip);
      }
      this.measureLayer.bindTooltip(text, {permanent: true, opacity: 0.9}).openTooltip();
      this.measureLayer.addTo(this._map);
      this.measureLayer.label = this.measureLayer._tooltip;
      this._map.off('editable:drawing:move', this._setMoveTooltipContent, this);

    },


  });

  /**
   * Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.circle = function(map, options) {
    return new L.Measure.Circle(map, options);
  };

})(L);
