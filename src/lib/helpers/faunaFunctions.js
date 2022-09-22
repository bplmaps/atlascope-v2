import faunadb, { query as q } from "faunadb";
import instanceVariables from "../../config/instance.json";

const client = new faunadb.Client({
    secret: instanceVariables.faunaConfiguration.secret,
    domain: instanceVariables.faunaConfiguration.domain
})

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

export const loadAllTours = async () => {

    return new Promise((resolve, reject) => {

        client.query(
            q.Paginate(q.Match(q.Index('tours-by-published-status'), true)),
        )
            .then((d) => { resolve(d); })
            .catch((err) => {
                console.error(err);
                reject();
            })
    });

}

export const loadSingleTour = async (ref) => {

    return new Promise((resolve, reject) => {

        client.query(
            q.Get(q.Ref(q.Collection('tours'), ref)),
        )
            .then((d) => { resolve(d); })
            .catch((err) => {
                console.error(err);
                reject();
            })
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