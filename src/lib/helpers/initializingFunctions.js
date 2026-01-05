import * as topojson from "topojson-client";
import instanceVariables from "../../config/instance.json";

export function parseUrlParams(initialUrl) {
    let urlParams = {};
    initialUrl
      .split("$")
      .map((kv) => {
        const i = kv.indexOf(":");
        const k = kv.slice(0, i);
        const v = kv.slice(i + 1);
        urlParams[k] = v
      })
    return urlParams;
}


export async function fetchLayerData() {
    let d = await fetch(instanceVariables.historicLayersFootprintsFile)
      .then((r) => r.json())
      .then((d) => {
        let al = topojson.feature(d, "boston-volume-extents-with-reference").features;
        console.log(al)
        al.sort((a, b) => {
          return +a.properties.year - b.properties.year;
        });
        return al;
      })
      .catch(() => {
        window.alert(
          "Unable to load map data. Check your internet connection and try reloading the page."
        );
      });
    return d;
  }