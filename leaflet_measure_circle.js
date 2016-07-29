(function(L, undefined) {
  L.Measure = L.Measure || {};

  /**
   * Класс инструмента для измерения координат.
   */
  L.Measure.Circle = L.Circle.extend({
    includes: L.Measure.Mixin,
    /**
     * Метод для получения настроек по умолчанию, для слоев создаваемых инструментом.
     * @abstract
     * @returns {Object} настроек по умолчанию, для слоев создаваемых инструментом.
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


    /* Методы добавленные апи переходе на Editable */

    /**
     *        Инициализация режима перемщения маркера Marker с отображением tooltip текущего месторасположения
     */
    enable: function () {
      this.editTool = this.enableEdit();
      this._map.on ('editable:drawing:mouseup',function() {alert('editable:drawing:mouseup');}, this);
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
    
  });

  /**
   * Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.circle = function(map, options) {
    return new L.Measure.Circle(map, options);
  };

})(L);
