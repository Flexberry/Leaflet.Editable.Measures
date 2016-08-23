(function(L, undefined) {
  L.Measure = L.Measure || {};

  /**
   Класс инструмента для измерения координат.
   */
  L.Measure.Polygon = L.Polygon.extend({
    includes: L.Measure.Mixin,

    setEvents: function (map, options) {
      this.editableEventTree = {
        vertex: {
          dragstart: this._setDragStart,
          dragend: this._setDragEnd,
          deleted: this.setVertexDeleted
        },
        drawing: {
          move: this._setMove,
          commit: this._setCommit,
          mousedown: this._setMouseDown,
          end: this.disable
        }
      };
    },

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
    _getLabelContent: function(layer, latlng, eventLatlng) {
      var latlngs = layer.editor.getLatLngs()[0].slice();
      if (eventLatlng) {
        for (var index=0; index < latlngs.length && !latlngs[index].equals(eventLatlng); index++);
        if (index === latlngs.length) {
          latlngs.push(eventLatlng);
        }
      }
      var distance = 0;
      var inc = 0;
      var currentInc = 0;
      for(var i = 1; i < latlngs.length; i++) {
        var prevLatLng = latlngs[i - 1];
        var currentLatLng = latlngs[i];
        currentInc = L.Measure.getDistance({
          latlng1: prevLatLng,
          latlng2: currentLatLng
        });
        distance += currentInc;
      }
      var ret = '<b>Периметр: ' + L.Measure.getMeasureText({
      value: distance,
      dimension: 1
    }) + '</b>';
      return ret;
    },


    _getMeasurelabelContext: function(layer, latlng) {
      var latlngs = layer.editor.getLatLngs()[0].slice();
      if (latlng) {
        for (var index=0; index < latlngs.length && !latlngs[index].equals(latlng); index++);
        if (index === latlngs.length) {
          latlngs.push(latlng);
        }
      }
      var ret = 'Площадь: ' + L.Measure.getAreaText({latlngs: latlngs});
      ret = '<b>' + ret + '</b>';
      return ret;
    },

    /**
    Метод обновления основного лейбла измеряемого объекта
    @param {Object} layer Редактируемый слой.
    */
    _updateMeasureLabel: function(layer, e) {
      var areaText = this._getMeasurelabelContext(layer, e.latlng);
      var center;
      var latlngs = layer.editor.getLatLngs()[0];
      if (latlngs.length ==2) {
        center = L.latLng((latlngs[0].lat + latlngs[1].lat)/2, (latlngs[0].lng + latlngs[1].lng)/2);
      } else {
        center = layer.getCenter();
      }

      this._showLabel(layer, areaText, center);
    },

    /*
      Метод для получения маркеров инструмента редактирования, имеющих метки
      @param {Object} editor Инструмент редактирования
      @returns {Object[]} Массив помеченных маркеров инструмента редактирования.
    */
    _labelledMarkers: function(editor) {
      var latlngs = editor.getLatLngs()[0];
      var markers = [];
      markers.push(latlngs[0].__vertex);
      return markers;
    },

    /*
      Метод для получения маркеров инструмента редактирования, не имеющих меток
      @param {Object} editor Инструмент редактирования
      @returns {Object[]} Массив не помеченных маркеров инструмента редактирования.
    */
    _unlabelledMarkers: function(editor) {
      var latlngs = editor.getLatLngs()[0];
      var markers = [];
      for(var i = 1, len = latlngs.length; i < len; i++) {
        markers.push(latlngs[i].__vertex);
      }
      return markers;
    },


  enable: function () {
    this.editTool = this.enableEdit();
    this.measureLayer = this._map.editTools.startPolygon();
    //     this._onActionsTest();
    this.isDragging = false;
//     this.eventOffByPrefix('editable:');
    this.eventsOn( 'editable:', this.editableEventTree, true);
  },

  disable: function() {
//     this.eventsOff( 'editable:', this.editableEventTree);
  },

  _setMove: function(e) {
    var text;
    var latlngs = e.layer.editor.getLatLngs()[0];
    var nPoints = latlngs.length;
    if (nPoints < 2) {
      text = nPoints == 0 ? 'Кликните по карте, чтобы добавить начальную вершину.' : 'Кликните по карте, чтобы добавить новую вершину.';
      this._onMouseMove(e, text);
    } else {
      this._fireEvent(e, 'edit');
    }
//     switch (nPoints) {
//     case 0: text = 'Кликните по карте, чтобы добавить начальную вершину.';
//       break;
//     case 1: text = 'Кликните по карте, чтобы добавить новую вершину.' + '<br>';
//       break;
//     default:
//       var square = this._getLabelContent(e.layer);
//       if (this.isDragging) {
// //         alert("nPoints=" + nPoints + 'square=' + square);
//         text = 'Переместите маркер и отпустите кнопку мыши.' + '<br>' + square;
//         this.lastLatLng = latlngs;
//       } else {
//         text = 'Кликните по карте, чтобы добавить новую вершину'  + '<br>' + square;
//       }
//     }

//     if (this.measurePopup) {
//       if (!this.measurePopup.isOpen()) {
//         this.measurePopup.openOn(this._map);
//       }
//       this.measurePopup.setLatLng(e.latlng).setContent(text);
//     } else {
//       this.measurePopup = L.popup()
//       this.measurePopup.setLatLng(e.latlng).setContent(text);
//       this.measurePopup.openOn(this._map);
//     }

  },

  _setDragStart: function(e) {
    this.measureLayer = e.layer;
    this.isDragging = true;

  },
  _setDragEnd: function(e) {
    this._fireEvent(e, 'editend');
//     this.showLabel(e);
    this.isDragging = false;

  },

  setVertexDeleted: function(e) {
    this.vertexDeleted = true;
    this._fireEvent(e, 'editend');
//     this.showLabel(e);
    this.vertexDeleted = false;
  },

  _setMouseDown: function(e) {
    var latlngs = e.layer.editor.getLatLngs()[0];
    if (latlngs.length <= 1) return;
    var text = "Кликните на текущую вершину, чтобы зафиксировать фигуру";
    var latlng = e.latlng? e.latlng : e.vertex.latlng;
    this._showPopup(text, latlng);
  },

  _setCommit: function(e) {
    this._fireEvent(e, 'created');
  },

//   showLabel: function(e) {
//     var latlngs = e.layer.editor.getLatLngs()[0];
//     if (latlngs.length <= 0) return;
//     this._map.closePopup();
//     var text = '<b>' + this._getLabelContent(e) + '</b>';
//     if (this.measureLayer.centerTooltip) {
//       var center = this.measureLayer.getCenter();
//       this.measureLayer.centerTooltip.setLatLng(center).setContent(text);
//     } else {
//      this.measureLayer.bindTooltip(text, {permanent: true, opacity: 0.75});
//      this.measureLayer.centerTooltip = this.measureLayer._tooltip;
//     }
// //     this.measureLayer._tooltip.setLatLng(e.latlng);
//     this.measureLayer.addTo(this._map);
//
//
//   },


  });

  /**
   Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.polygon = function(map, options) {
    return new L.Measure.Polygon(map, options);
  };

})(L);
