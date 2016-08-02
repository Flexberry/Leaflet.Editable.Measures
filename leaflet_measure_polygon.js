(function(L, undefined) {
  L.Measure = L.Measure || {};

  /**
   Класс инструмента для измерения координат.
   */
  L.Measure.Polygon = L.Polygon.extend({
    includes: L.Measure.Mixin,

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
     Метод для получения текстового описания результатов измерений.
     @param {Object} e Аргументы метода.
     @param {Object} e.layer Слой с геометрией, представляющей производимые измерения.
     @param {Object} e.latlng Точка геометрии, для которой требуется получить текстовое описание измерений.

     */
    _getLabelContent: function(e, latlngs) {
      var LatLngs = e.layer.editor.getLatLngs()[0];
      var latlngs = e.layer ? LatLngs.slice() : [];

      var layerContainsLatLng = latlngs.filter(function(latlng) {
        return latlng.equals(e.latlng);
      }).length > 0;

      if (!layerContainsLatLng) {
        latlngs.push(e.latlng);
      }

      if (latlngs.length < 3) {
        return '';
      }

      return 'Площадь: ' + L.Measure.getAreaText({
        latlngs: latlngs
      });
    },


  enable: function () {
//     this._latlng = this._map.getCenter();
    this.editTool = this.enableEdit();
    this._onActionsTest();
    this.isDragging = false;
    this._map.on('editable:drawing:move', this._setMoveTooltipContent, this);
    this._map.on('editable:drawing:commit', this.showLabel, this);
    this._map.on('editable:drawing:mousedown', this._setCommitContent, this);
    this._map.on ('editable:vertex:dragstart', this._setDragStart, this);
    this._map.on ('editable:vertex:dragend', this._setDragEnd, this);
    this.measureLayer = this._map.editTools.startPolygon();
  },

  _setMoveTooltipContent: function(e) {
    var text;
    var LatLngs = e.layer.editor.getLatLngs()[0];
    var nPoints = LatLngs.length;
    if (nPoints > 1) {
      var square = this._getLabelContent(e);
    }
    if (this.isDragging) {
      text = 'Переместите маркер и отпустите кнопку мыши.' + '<br>' + square;
      this.lastLatLng = LatLngs;
    } else {
      switch (nPoints) {
        case 0: text = 'Кликните по карте, чтобы добавить начальную вершину.';
                                        break;
        case 1: text = 'Кликните по карте, чтобы добавить новую вершину.' + '<br>' + square;
                                        break;
        default:
          text = 'Кликните по карте, чтобы добавить новую вершину'  + '<br>' + square;
          //           this.measureLayer.bindTooltip(square, {permanent: true, opacity: 0.9}).openTooltip();
      }
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

  _setDragStart: function(e) {
    this.isDragging = true;

  },
  _setDragEnd: function(e) {
    this.isDragging = false;
    this.showLabel(e);

  },

  _setCommitContent: function(e) {
    if (e.layer.editor._drawnLatLngs.length <= 1) return;
    var text = "Кликните на текущую вершину, чтобы зафиксировать фигуру";
    this.measurePopup.setContent(text);
    if (!this.measurePopup.isOpen()) {
      this.measurePopup.openOn(this._map);
    }
    this.measurePopup.update();
  },

  showLabel: function(e) {
    if (e.layer.editor._drawnLatLngs.length <= 0) return;
    this._map.closePopup();
    var text = '<b>' + this._getLabelContent(e) + '</b>';
    if (this.measureLayer.centerTooltip) {
      this.measureLayer.centerTooltip.setContent(text);
    } else {
     this.measureLayer.bindTooltip(text, {permanent: true, opacity: 0.75});
     this.measureLayer.centerTooltip = this.measureLayer._tooltip;
    }
//     this.measureLayer._tooltip.setLatLng(e.latlng);
    this.measureLayer.addTo(this._map);


  },


  });

  /**
   Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.polygon = function(map, options) {
    return new L.Measure.Polygon(map, options);
  };

})(L);
