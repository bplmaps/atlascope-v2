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

// annotation functions

export const getAnnotationsWithinExtent = async (extent) => {
  const { data, error } = await sb.from("annotations").select();
  if (error) {
    console.log(error)
  }
  const filtered = data.filter((x) => {
    return intersects(x.extent, extent);
  });
  return filtered;
};

export const getSingleAnnotation = async (ref) => {
    const { data, error } = await sb.from("annotations").select().eq('id', ref);
    if (error) {
        console.log(error)
      }
    return data[0];
};

export const writeAnnotation = async (extent, body, email, layerID) => {
  return new Promise((resolve, reject) => {
    client
      .query(
        q.Create(q.Collection("user-annotations"), {
          data: {
            body: body,
            extent: extent,
            email: email,
            layer: layerID,
            cX: extent[0] + (extent[2] - extent[0]) / 2,
            cY: extent[1] + (extent[3] - extent[1]) / 2,
          },
        })
      )
      .then(() => {
        resolve();
      })
      .catch((err) => {
        console.error(
          "Error: [%s] %s: %s",
          err.name,
          err.message,
          err.errors()[0].description
        );
        reject();
      });
  });
};
