# Leaflet.Editable.Measures
Classes for measure markers, circles, rectangles, polylines, polygon  based on
* [Leaflet#1.2.0](http://leafletjs.com/reference-1.2.0.html)
* [Leaflet.Editable#1.1.0](https://github.com/Leaflet/Leaflet.Editable)


## API
Leaflet-Editable-Measures is made to be fully extendable. You have three ways to customize
the behaviour: using options, listening to events, or extending.

### L.Map
Leaflet.Editable.Measures add events to the `L.Map` object.

When an event occurs the called function takes a parameter that contains the following properties:
  * e - original event;
  * measurer - measurer , that control measured layer;
  * layer - measured layer;
  * layerType - type of layer.

layerType can contain the following values:
  * Marker
  * Circle
  * Rectangle
  * Polyline
  * Polygon

#### Events
| event name   |        usage                                                                                      |
|--------------|---------------------------------------------------------------------------------------------------|
| measure:move | Fired on mouse move before creating (choose point for marker, first vertex for Circle, Rectangle, Polyline, Polygon) figure. |
| measure:create | Fired when figure is being created (add first and following vertex, drag Circle or Rectangle vertex). |
| measure:created | Fired when figure created (mouse click for Marker, click on last vertex for Polyline/Polygon, mouseUp after dragging drag Circle or Rectangle vertex). |
| measure:edit | Fired when  fire varied (Marker dragging, vertex of Circle/Rectangle/Polyline/Polygon dragged or deleted ). |
| measure:editend | Fired when varied is complete (mouseUp after dragging, vertex deleting). |
