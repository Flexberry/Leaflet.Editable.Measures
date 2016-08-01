(function(L, undefined) {
  L.Measure = L.Measure || {};

  /**
   * Класс инструмента для измерения координат.
   */
  L.Measure.Polyline = L.Polyline.extend({
    includes: L.Measure.Mixin,

    labels: [],

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
          fill: false,
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
      var latlngs = e.layer ? e.layer.editor._drawnLatLngs.slice() : [];
      if (latlngs.length == 0 || latlngs[0].equals(e.latlng)) {
        return '';
      }

      var layerContainsLatLng = latlngs.filter(function(latlng) {
        return latlng.equals(e.latlng);
      }).length > 0;

      if (!layerContainsLatLng) {
        latlngs.push(e.latlng);
      }

      var distance = 0;
      var inc = 0;
      for(var i = 1, len = latlngs.length; i < len; i++) {
        var prevLatLng = latlngs[i - 1];
        var currentLatLng = latlngs[i];
        var currentInc = L.Measure.getDistance({
          latlng1: prevLatLng,
          latlng2: currentLatLng
        });

        distance += currentInc;

        if (currentLatLng.equals(e.latlng)) {
          inc = currentInc;
          break;
        }
      }

      return L.Measure.getMeasureText({
        value: distance,
        dimension: 1
      }) +
      '<br><span class="measure-path-label-incdistance">+' +
      L.Measure.getMeasureText({
        value: inc,
        dimension: 1
      }) +
      '</span>';
    },

    enable: function () {
      this._latlng = this._map.getCenter();
      this.editTool = this.enableEdit();
      this._onActionsTest();
      this.isDrawing = false;
      this._map.on('editable:drawing:move', this._setMoveTooltipContent, this);
      this._map.on('editable:drawing:mousedown', this.showLabel, this);
      //       this._map.on ('editable:vertex:dragstart', function() {this.isDrawing = true;}, this);
//       this._map.on ('editable:vertex:dragend', this.showLabel, this);
      this.measureLayer = this._map.editTools.startPolyline();
    },

    _setMoveTooltipContent: function(e) {
      var text;
      var nPoints = e.layer.editor._drawnLatLngs.length;
      if (nPoints > 0) {
        var distances = this._getLabelContent(e);

      }
      switch (nPoints) {
        case 0: text = 'Кликните по карте, чтобы добавить начальную вершину.';
          break;
        case 1: text = 'Кликните по карте, чтобы добавить новую вершину.' + '<br>' + distances;
          break;
        default:
          text = 'Кликните по карте, чтобы добавить новую вершину'  + '<br>' + distances;
//           this.measureLayer.bindTooltip(distances, {permanent: true, opacity: 0.9}).openTooltip();
      }

      if (this.measurePopup) {
        if (!this.measurePopup.isOpen()) {
          this.measurePopup.openOn(this._map);
        }
        this.measurePopup.setLatLng(e.latlng).setContent(text);
      } else {
        this.measurePopup = L.popup()
        this.measurePopup.setLatLng(e.latlng).setContent(text);
        this.measurePopup.openOn(this._map);
      }

    },

    showLabel: function(e) {
      if (e.layer.editor._drawnLatLngs.length <= 0) return;
      this._map.closePopup();
      var text = '<b>' + this._getLabelContent(e) + '</b>';
      this.measureLayer.bindTooltip(text, {permanent: true, opacity: 0.75});
      this.measureLayer._tooltip.setLatLng(e.latlng);
      this.measureLayer.addTo(this._map);
      this.labels.push(this._tooltip);

      var text = "Кликните на текущую вершину, чтобы зафиксировать линию";
      this.measurePopup.setLatLng(e.latlng).setContent(text);
      if (!this.measurePopup.isOpen()) {
        this.measurePopup.openOn(this._map);
      }

    },


  });

  /**
   * Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.polyline = function(map, options) {
    return new L.Measure.Polyline(map, options);
  };

})(L);
