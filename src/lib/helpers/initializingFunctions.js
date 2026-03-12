import * as topojson from "topojson-client";
import instanceVariables from "../../config/instance.json";

export function parseUrlParams(initialUrl) {
    let urlParams = {};
    const delim = "$";
    let normalizedUrl = initialUrl.replaceAll("%24", delim);
    normalizedUrl
      .split(delim)
      .forEach((kv) => {
        const i = kv.indexOf(":");
        const k = kv.slice(0, i);
        const v = kv.slice(i + 1);
        urlParams[k] = v;
      });
    return urlParams;
}


export async function fetchLayerData() {
    let d = await fetch(instanceVariables.volumeExtentsFile)
      .then((r) => r.json())
      .then((d) => {
        let al = topojson.feature(d, "boston-volume-extents").features;
        al.sort((a, b) => {
          return +a.properties.year - b.properties.year;
        });
        return al;s
      })
      .catch(() => {
        window.alert(
          "Unable to load map data. Check your internet connection and try reloading the page."
        );
      });
    return d;
  }