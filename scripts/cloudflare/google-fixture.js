// Local synthetic Maps/Places SDK contract. No real Google script or request runs.
(() => {
  const calls = window.__googleFixture = { predictions: [], geocodes: [], maps: 0, polylines: [], fits: 0 };
  class LatLng { constructor(lat, lng) { this.a = Number(lat); this.b = Number(lng); } lat() { return this.a; } lng() { return this.b; } }
  class Point { constructor(x, y) { this.x = x; this.y = y; } }
  class Size { constructor(width, height) { this.width = width; this.height = height; } }
  class LatLngBounds { constructor(sw = new LatLng(51.4, -0.3), ne = new LatLng(51.6, 0)) { this.sw = sw; this.ne = ne; } extend() { return this; } getSouthWest() { return this.sw; } getNorthEast() { return this.ne; } getCenter() { return new LatLng(51.5, -0.1); } }
  const event = { addListener: () => ({ remove() {} }), addListenerOnce: () => ({ remove() {} }), addDomListener: () => ({ remove() {} }), removeListener() {}, clearInstanceListeners() {}, trigger() {} };
  class Map {
    constructor(div, options) { this.div = div; this.options = options; this.center = options.center; this.zoom = options.zoom; calls.maps++; div.dataset.syntheticMap = 'ready'; }
    addListener(...args) { return event.addListener(...args); } getDiv() { return this.div; }
    getZoom() { return this.zoom; } setZoom(zoom) { this.zoom = zoom; }
    getCenter() { return this.center instanceof LatLng ? this.center : new LatLng(this.center.lat, this.center.lng); }
    setCenter(center) { this.center = center; } panTo(center) { this.center = center; }
    getBounds() { return new LatLngBounds(); } setOptions(options) { Object.assign(this.options, options); }
    fitBounds() { calls.fits++; }
  }
  class OverlayView {
    setMap(map) { this.map = map; if (map) { this.onAdd?.(); this.draw?.(); } else this.onRemove?.(); }
    getMap() { return this.map; }
    getPanes() { return { overlayLayer: this.map.div, overlayMouseTarget: this.map.div, floatPane: this.map.div, markerLayer: this.map.div }; }
    getProjection() { return { fromLatLngToDivPixel: () => new Point(50, 50), fromDivPixelToLatLng: () => new LatLng(51.5, -0.1), fromContainerPixelToLatLng: () => new LatLng(51.5, -0.1), fromLatLngToContainerPixel: () => new Point(50, 50) }; }
  }
  const places = [{ place_id: 'synthetic-start', description: 'Synthetic Start, London', coordinates: [51.5, -0.12] }, { place_id: 'synthetic-end', description: 'Synthetic End, London', coordinates: [51.52, -0.1] }];
  class Geocoder { geocode(request, callback) { calls.geocodes.push(request); const place = places.find(p => p.place_id === request.placeId || p.description === request.address) ?? places[0]; callback([{ formatted_address: place.description, place_id: place.place_id, geometry: { location: new LatLng(...place.coordinates) } }], 'OK'); } }
  class AutocompleteService { getPlacePredictions(request, callback) { calls.predictions.push(request.input); callback(places.filter(p => p.description.toLowerCase().includes(request.input.toLowerCase())).map(p => ({ ...p, structured_formatting: { main_text: p.description.split(',')[0], secondary_text: 'London' }, matched_substrings: [{ offset: 0, length: request.input.length }], terms: [], types: ['geocode'] })), 'OK'); } }
  class Polyline { constructor(options) { calls.polylines.push(options.path); } setMap() {} }
  window.google = { maps: { version: 'synthetic-local', Map, OverlayView, LatLng, LatLngBounds, Point, Size, Geocoder, Polyline, event,
    GeocoderStatus: { OK: 'OK' }, MapTypeId: { ROADMAP: 'roadmap' }, ControlPosition: {},
    places: { AutocompleteService, AutocompleteSessionToken: class {}, PlacesServiceStatus: { OK: 'OK', ZERO_RESULTS: 'ZERO_RESULTS' } } } };
  // The application loads this as an ordinary script; no provider callback/network is used.
})();
