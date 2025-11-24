import intersect from "@turf/intersect";
import buffer from "@turf/buffer";
import bboxPolygon from "@turf/bbox-polygon";
import area from "@turf/area";
import { featureCollection, multiPolygon, point} from "@turf/turf";
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

export const intersector = (footprint, extent) => {
    const extentPolygon = buffer(bboxPolygon(extent), 0);
    const intersection = intersect(featureCollection([multiPolygon(footprint.coordinates), extentPolygon]));
    console.log(intersection)
    if(intersection == null) {
        return 0;
    } else {
        return area(intersection)/area(extentPolygon);
    }
}

export const insideChecker = (ll, poly) => {
    const pt = point(ll);
    const polygon = multiPolygon(poly.coordinates);
    return booleanPointInPolygon(pt, polygon);
  };