export function requestChangeToMapState(mapState, requestedMapState) {
    if (mapState.requestedMapState.requested) {
        console.log("cannot request change to map state since a request is already pending");
        return;
    } else {
        mapState.requestedMapState.requested = true;
        mapState.requestedMapState.dropPin = requestedMapState.dropPin ? requestedMapState.dropPin : false;
        mapState.requestedMapState.viewMode = requestedMapState.viewMode ? requestedMapState.viewMode : null;
        mapState.requestedMapState.center = requestedMapState.center ? requestedMapState.center : null;
        mapState.requestedMapState.zoom = requestedMapState.zoom ? requestedMapState.zoom : null;
        mapState.requestedMapState.extent = requestedMapState.extent ? requestedMapState.extent : null;
        mapState.requestedMapState.rotation = (requestedMapState.rotation !== null) ? requestedMapState.rotation : null;
        mapState.requestedMapState.base = requestedMapState.base ? requestedMapState.base : null;
        mapState.requestedMapState.overlay = requestedMapState.overlay ? requestedMapState.overlay : null;
        mapState.requestedMapState.animate = requestedMapState.animate ? requestedMapState.animate : 0;
    }
}