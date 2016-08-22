(function(L, undefined) {
  L.Measure = L.Measure || {};

  /**
   * Класс инструмента для измерения координат.
   */
  L.Measure.Polyline = L.Polyline.extend({
    includes: L.Measure.Mixin,

    labels: [],

    setEvents: function (map, options) {
      this.editableEventTree = {
        vertex: {
          dragstart: this._setDragStart,
          dragend: this._setDragEnd,
          deleted: this._setVertexDeleted
        },
        drawing: {
          move: this._setMove,
          clicked: this._setClicked,
          mousedown: this._setMouseDown,
          end: this._setDrawingEnd
        },
      };
    },

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
    _getLabelContent: function(layer, latlng) {
      var latlngs = layer.editor.getLatLngs().slice();
      for (var index=0; index < latlngs.length && !latlngs[index].equals(latlng); index++);
      if (index === latlngs.length) {
        latlngs.push(latlng);
      }
      var distance = 0;
      var inc = 0;
      var currentInc = 0;
      for(var i = 1; i <= index; i++) {
        var prevLatLng = latlngs[i - 1];
        var currentLatLng = latlngs[i];
        currentInc = L.Measure.getDistance({
          latlng1: prevLatLng,
          latlng2: currentLatLng
        });
        distance += currentInc;
      }

      return '<b>' + L.Measure.getMeasureText({
        value: distance,
        dimension: 1
      }) +
      '<br><span class="measure-path-label-incdistance">+' +
      L.Measure.getMeasureText({
        value: currentInc,
        dimension: 1
      }) +
      '</span></b>';
    },


    /*
      Метод для получения маркеров инструмента редактирования, имеющих метки
      @param {Object} editor Инструмент редактирования
      @returns {Object[]} Массив помеченных маркеров инструмента редактирования.
    */
    _labelledMarkers: function(editor) {
      var latlngs = editor.getLatLngs();
      var markers = [];
      for(var i = 1, len = latlngs.length; i < len; i++) {
        markers.push(latlngs[i].__vertex);
      }
      return markers;
    },

    /*
      Метод для получения маркеров инструмента редактирования, не имеющих меток
      @param {Object} editor Инструмент редактирования
      @returns {Object[]} Массив не помеченных маркеров инструмента редактирования.
    */
    _unlabelledMarkers: function(editor) {
      var latlngs = editor.getLatLngs();
      var markers = [];
      markers.push(latlngs[0].__vertex)
      return markers;
    },

    enable: function () {
      this.editTool = this.enableEdit();
      this.eventOffByPrefix('editable:');
      this.eventsOn( 'editable:', this.editableEventTree, true);
      this.isDrawing = false;
      this.measureLayer = this._map.editTools.startPolyline();
    },

    disable: function() {
//       this.eventsOff( 'editable:', this.editableEventTree);
    },

    _setMove: function(e) {
      var text;
      var latlngs = e.layer.editor.getLatLngs();
      var nPoints = latlngs.length;
      if (this.isDragging) {
        this._fireEvent(e, 'edit');
      } else {
        if (nPoints > 0) {
          var distances = this._getLabelContent(e.layer, e.latlng);
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
        this._onMouseMove(e, text);
      }
    },

    _setMouseDown: function(e) {
      if (e.layer.getLatLngs().length < 1) return;
      var text = "Кликните на текущую вершину, чтобы зафиксировать линию";
      var latlng = e.latlng? e.latlng : e.vertex.latlng;
      this._showPopup(text, latlng);
//       this.measurePopup.setLatLng(e.latlng).setContent(text);
//       if (!this.measurePopup.isOpen()) {
//         this.measurePopup.openOn(this._map);
//       }
    },

    _setClicked: function(e) {
      if (e.layer.getLatLngs().length < 2) return;
      this._map.closePopup();
      var text = this._getLabelContent(e.layer, e.latlng);
      var vertex = e.latlng.__vertex;
      this._showLabel(vertex, text, e.latlng);
    },

    _setDrawingEnd: function(e) {
      this._fireEvent(e, 'created');
    },

    _setDragStart: function(e) {
      this.measureLayer = e.layer;
      this.isDragging = true;
    },

    _setDragEnd: function(e) {
      this.isDragging = false;
      this._fireEvent(e, 'editend');
    },

    _setVertexDeleted: function(e) {
      this._fireEvent(e, 'editend');
    },

  });

  /**
   * Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.polyline = function(map, options) {
    return new L.Measure.Polyline(map, options);
  };

})(L);
