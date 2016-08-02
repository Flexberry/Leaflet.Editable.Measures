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
    _getLabelContent: function(e) {
      var latlngs;
      if (e.layer && e.layer.editor && e.layer.editor.getLatLngs) {
        latlngs = e.layer.editor.getLatLngs()[0].slice();
        if (!this.isDragging && !this.vertexDeleted && e.latlng) {
          var layerContainsLatLng = latlngs.filter(function(latlng) {
            return latlng.equals(e.latlng);
          }).length > 0;

          if (!layerContainsLatLng) {
            latlngs.push(e.latlng);
          }
        }
      } else {
        latlngs = this.lastLatLng;
      }

      if (latlngs.length < 3) {
        return '';
      }

      var ret = '';
//       for (i = 0; i < latlngs.length; i++) {
//         ret += latlngs[i].lat + ',' + latlngs[i].lng + '<br>';
//       }

      ret +=  'Площадь: ' + L.Measure.getAreaText({
        latlngs: latlngs
      });
      return ret;
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
    this._map.on('editable:vertex:deleted', this.setVertexDeleted, this);
    this.measureLayer = this._map.editTools.startPolygon();
  },

  _setMoveTooltipContent: function(e) {
    var text;
    var latlngs = e.layer.editor.getLatLngs()[0];
    var nPoints = latlngs.length;
    switch (nPoints) {
    case 0: text = 'Кликните по карте, чтобы добавить начальную вершину.';
      break;
    case 1: text = 'Кликните по карте, чтобы добавить новую вершину.' + '<br>';
      break;
    default:
      var square = this._getLabelContent(e);
      if (this.isDragging) {
//         alert("nPoints=" + nPoints + 'square=' + square);
        text = 'Переместите маркер и отпустите кнопку мыши.' + '<br>' + square;
        this.lastLatLng = latlngs;
      } else {
        text = 'Кликните по карте, чтобы добавить новую вершину'  + '<br>' + square;
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
    this.showLabel(e);
    this.isDragging = false;

  },

  setVertexDeleted: function(e) {
    this.vertexDeleted = true;
    this.showLabel(e);
    this.vertexDeleted = false;
  },

  _setCommitContent: function(e) {
    var latlngs = e.layer.editor.getLatLngs()[0];
    if (latlngs.length <= 1) return;
    var text = "Кликните на текущую вершину, чтобы зафиксировать фигуру";
    this.measurePopup.setContent(text);
    if (!this.measurePopup.isOpen()) {
      this.measurePopup.openOn(this._map);
    }
    this.measurePopup.update();
  },

  showLabel: function(e) {
    var latlngs = e.layer.editor.getLatLngs()[0];
    if (latlngs.length <= 0) return;
    this._map.closePopup();
    var text = '<b>' + this._getLabelContent(e) + '</b>';
    if (this.measureLayer.centerTooltip) {
      var center = this.measureLayer.getCenter();
      this.measureLayer.centerTooltip.setLatLng(center).setContent(text);
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
