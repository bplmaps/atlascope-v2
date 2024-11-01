import intersect from "@turf/intersect";
import bboxPolygon from "@turf/bbox-polygon";
import area from "@turf/area";
import { featureCollection, multiPolygon } from "@turf/turf";
import {transformExtent} from 'ol/proj';


export const intersector = (footprint, extent) => {
    let extent4326 = transformExtent(extent,'EPSG:3857','EPSG:4326')
    let extentPolygon = bboxPolygon(extent4326);
    let intersection = intersect(featureCollection([multiPolygon(footprint.coordinates), extentPolygon]));
    if(intersection == null) {
        return 0;
    } else {
        return area(intersection)/area(extentPolygon);
    }
}