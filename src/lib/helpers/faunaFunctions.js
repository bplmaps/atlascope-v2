import faunadb, { query as q } from "faunadb";
import instanceVariables from "../../config/instance.json";
import { createClient } from "@supabase/supabase-js";
import { intersects } from "ol/extent"; // replaced fauna queries with OL intersects

const client = new faunadb.Client({
  secret: instanceVariables.faunaConfiguration.secret,
  domain: instanceVariables.faunaConfiguration.domain,
});

// import supabase credentials

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const sb = createClient(supabaseUrl, supabaseAnonKey);

// tour functions

export const loadAllTours = async () => {
  return new Promise((resolve, reject) => {
    sb.from("tours")
      .select()
      .eq("published", true)
      .order("id", { ascending: true })
      .then((d) => {
        resolve(d);
      });
  });
};

export const loadSingleTour = async (ref) => {

  return new Promise((resolve, reject) => {
    sb.from("tours")
      .select()
      .eq("id", ref)
      .then((d) => {
        resolve(d);
      });
  });
};

// annotation read functions

export const getAnnotationsWithinExtent = async (extent) => {
  const { data, error } = await sb.from("annotations").select();
  if (error) {
    console.log(error)
  }
  const filtered = data.filter((x) => {
    return intersects(JSON.parse(x.extent), extent);
  });
  console.log(filtered)
  return filtered;
};

export const getSingleAnnotation = async (ref) => {
    const { data, error } = await sb.from("annotations").select().eq('id', ref);
    if (error) {
        console.log(error)
      }
    return data[0];
};

// annotation write functions

export const newAnnotationId = async () => {
    const {data, error } = await sb.from("annotations").select("id").order("id", { ascending: false }).limit(1)
    const oldId = data[0].id
    let newId = parseInt(oldId)+100
    if (error) {
        console.log(error)
    }
    return newId;
};

export const writeAnnotation = async (extent, body, email, layerID) => {
    const id = await newAnnotationId()
    console.log(id)
    let now = new Date().toISOString()
    const { data, error } = await sb
        .from("annotations")
        .insert(
            {
                id: id,
                timestamp: now,
                body: body,
                extent: extent,
                layer: layerID,
                cX: extent[0] + (extent[2] - extent[0]) / 2,
                cY: extent[1] + (extent[3] - extent[1]) / 2,
            }
        )
        .select();
    if (error) {
        console.log(error)
    }
    return data;
};
