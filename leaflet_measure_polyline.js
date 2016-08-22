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
          deleted: this.setVertexDeleted
        },
        drawing: {
          move: this._setMoveTooltipContent,
          clicked: this.showLabel,
          end: this._fireCreatedEvent
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

//       if (e.layer && e.layer.editor && e.layer.editor.getLatLngs) {
//         latlngs = e.layer.editor.getLatLngs().slice();
//         if (!this.isDragging && !this.vertexDeleted && e.latlng) {
//           var layerContainsLatLng = latlngs.filter(function(latlng) {
//             return latlng.equals(e.latlng);
//           }).length > 0;
//
//           if (!layerContainsLatLng) {
//             latlngs.push(e.latlng);
//           }
//         }
//       } else {
//         latlngs = this.lastLatLng;
//       }
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

      return L.Measure.getMeasureText({
        value: distance,
        dimension: 1
      }) +
      '<br><span class="measure-path-label-incdistance">+' +
      L.Measure.getMeasureText({
        value: currentInc,
        dimension: 1
      }) +
      '</span>';
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

//     /**
//      * Метод для получения маркеров инструмента редактирования.
//      * @param {Object} editor Инструмент редактирования.
//      * @returns {Object[]} Массив маркеров инструмента редактирования.
//      */
//     _getEditToolMarkers: function(editor) {
//       var latlngs = editor.getLatLngs();
//       var markers = [];
//       for(var i = 0, len = latlngs.length; i < len; i++) {
//         markers.push(latlngs[i].__vertex);
//       }
//       return markers;
//     },
//
//     /**
//      * Метод для привязки обработчиков событий редактирования отрисованного слоя.
//      * @param {Object} editor Инструмент редактирования.
//      * @returns {Object[]} Массив маркеров редактируемого слоя, для которых не нужно отображать лейблы.
//      */
//     _getEditToolHiddenMarkers: function(editor) {
//       var latlngs = editor.getLatLngs();
//       if (latlngs.length <=0) return [];
//       return [latlngs[0].__vertex];
//     },


    enable: function () {
//       this._latlng = this._map.getCenter();
      this.editTool = this.enableEdit();
      this.eventOffByPrefix('editable:');
      this.eventsOn( 'editable:', this.editableEventTree, true);
//      this._onActionsTest();
      this.isDrawing = false;
//       this._map.on('editable:drawing:move', this._setMoveTooltipContent, this);
//       this._map.on('editable:drawing:mousedown', this.showLabel, this);
      this.measureLayer = this._map.editTools.startPolyline();
    },

    disable: function() {
//       this.eventsOff( 'editable:', this.editableEventTree);
    },

    _setMoveTooltipContent: function(e) {
      var text;
      var latlngs = e.layer.editor.getLatLngs();
      var nPoints = latlngs.length;
      if (this.isDragging) {
        var layer = e.layer;
        var editor = layer.editor;
        this._updateLabels(layer);
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
      }
    },

    showLabel: function(e) {
      var latlngs = e.layer.editor.getLatLngs();
      if (latlngs.length <= 1) return;
      this._map.closePopup();
      var text = '<b>' + this._getLabelContent(e.layer, e.latlng) + '</b>';
      var vertex = e.latlng.__vertex;
      vertex.bindTooltip(text, {permanent: true, opacity: 0.75});
      vertex._tooltip.setLatLng(e.latlng);
      vertex.addTo(this._map);
//       this.labels.push(this._tooltip);

      var text = "Кликните на текущую вершину, чтобы зафиксировать линию";
      var latlng = e.latlng? e.latlng : e.vertex.latlng;
      this.measurePopup.setLatLng(e.latlng).setContent(text);
      if (!this.measurePopup.isOpen()) {
        this.measurePopup.openOn(this._map);
      }

    },

    _setDragStart: function(e) {
      this.measureLayer = e.layer;
      this.isDragging = true;

    },

    _setDragEnd: function(e) {
      var layer = e.layer;
      this._updateLabels(layer);
      this.isDragging = false;

    },

    setVertexDeleted: function(e) {
      this.vertexDeleted = true;
      this.showLabel(e);
      this.vertexDeleted = false;
    },

  });

  /**
   * Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.polyline = function(map, options) {
    return new L.Measure.Polyline(map, options);
  };

})(L);
