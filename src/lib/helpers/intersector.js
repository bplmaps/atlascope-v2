import intersect from "@turf/intersect";
import bboxPolygon from "@turf/bbox-polygon";
import area from "@turf/area";
import { featureCollection, multiPolygon, point} from "@turf/turf";
import {transformExtent} from 'ol/proj';
import { pointsWithinPolygon } from "@turf/points-within-polygon";
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

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

// export const insideChecker = (ll,poly) => {
//     let result = point(Object.values(ll))
//     let searchWithin = multiPolygon(poly.coordinates)
//     let ptsWithin = pointsWithinPolygon(result, searchWithin);
//     if (ptsWithin.features.length > 0) {
//         return true;
//     } else {
//         return false
//     }
// }

export const insideChecker = (ll, poly) => {
    const pt = point(ll); // assume [lon, lat]
    const polygon = multiPolygon(poly.coordinates);
    return booleanPointInPolygon(pt, polygon);
  };