import intersect from "@turf/intersect";
import bboxPolygon from "@turf/bbox-polygon";
import area from "@turf/area";
import {transformExtent} from 'ol/proj';


export const intersector = (footprint, extent) => {
    let extentPolygon = bboxPolygon(transformExtent(extent,'EPSG:3857','EPSG:4326'));
    let intersection = intersect(footprint, extentPolygon);
    if(intersection == null) {
        return 0;
    } else {
        return area(intersection)/area(extentPolygon);
    }
}