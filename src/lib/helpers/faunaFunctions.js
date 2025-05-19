import faunadb, { query as q } from "faunadb";
import instanceVariables from "../../config/instance.json";
import { createClient } from '@supabase/supabase-js'

const client = new faunadb.Client({
    secret: instanceVariables.faunaConfiguration.secret,
    domain: instanceVariables.faunaConfiguration.domain
})

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const sb = createClient(supabaseUrl, supabaseAnonKey)

export const writeAnnotation = async (extent, body, email, layerID) => {

    return new Promise((resolve, reject) => {

        client.query(
            q.Create(
                q.Collection('user-annotations'),
                { data: { body: body, extent: extent, email: email, layer: layerID, cX: extent[0] + ((extent[2] - extent[0]) / 2), cY: extent[1] + ((extent[3] - extent[1]) / 2) } },
            )
        )
            .then(() => { resolve(); })
            .catch((err) => {
                console.error(
                    'Error: [%s] %s: %s',
                    err.name,
                    err.message,
                    err.errors()[0].description,
                );
                reject();
            })
    });

}

export const getSbData = async () => {
    const { data, error } = await sb
    .from('tours')
    .select()
}

export const loadAllTours = async () => {

    return new Promise((resolve, reject) => {
        sb
        .from('tours')
        .select()
        .eq('published',true)
        .order('id', {ascending: true})
        .then((d) => { resolve(d); })
    })
}

export const loadSingleTour = async (ref) => {
    console.log(ref)

    return new Promise((resolve, reject) => {
        sb
        .from('tours')
        .select()
        .eq('id', ref)
        .then((d) => {resolve(d); })
    });

}

export const getAnnotationsWithinExtent = async (extent) => {

    return new Promise((resolve, reject) => {
        client.query(
            q.Paginate(
                q.Intersection(
                    q.Join(
                        q.Range(q.Match(q.Index("annotations-centroids-by-y")), [extent[1]], [extent[3]]),
                        q.Lambda(
                            ["value", "ref"],
                            q.Match(q.Index("annotations-ref-by-ref"), q.Var("ref"))
                        )
                    ),
                    q.Join(
                        q.Range(q.Match(q.Index("annotations-centroids-by-x")), [extent[0]], [extent[2]]),
                        q.Lambda(
                            ["value", "ref"],
                            q.Match(q.Index("annotations-ref-by-ref"), q.Var("ref"))
                        )
                    )
                )
            ))
            .then((d) => { resolve(d); })
            .catch((err) => {
                console.error(err);
                reject();
            });
    });

}

export const getSingleAnnotation = async(ref) => {

    return new Promise((resolve, reject) => {

        client.query(
            q.Get(q.Ref(q.Collection('user-annotations'), ref)),
        )
            .then((d) => { resolve(d); })
            .catch((err) => {
                console.error(err);
                reject();
            })
    });


}