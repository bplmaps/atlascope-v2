// Hands the browser a short-lived presigned S3 PUT URL so it can write a map
// image straight to object storage. The Wasabi secret never leaves this
// function, and the object key is generated here rather than accepted from the
// caller — so a caller can't choose a key or overwrite an existing object.
//
// This endpoint is unauthenticated, which makes it a write oracle for its
// prefix. The credential it uses should be scoped to s3:PutObject on
// <bucket>/<prefix>/* and nothing else. ALLOWED_ORIGINS is a speed bump, not
// security: origin headers are trivially forged.
import { randomBytes } from "node:crypto";
import { AwsClient } from "aws4fetch";

const REQUIRED_VARS = [
  "WASABI_ACCESS_KEY_ID",
  "WASABI_SECRET_ACCESS_KEY",
  "WASABI_REGION",
  "WASABI_BUCKET",
  "WASABI_PREFIX",
];

// Long enough to cover a slow upload of a few megabytes, short enough that a
// leaked URL is worthless quickly.
const EXPIRES_SECONDS = 300;

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export default async function handler(request) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (allowedOrigins.length) {
    const origin = request.headers.get("origin");
    if (!origin || !allowedOrigins.includes(origin)) {
      return json({ error: "Origin not allowed." }, 403);
    }
  }

  // Same posture as supabaseClient.js: forks without credentials configured
  // only fail when the feature is actually used, and they fail legibly.
  const missing = REQUIRED_VARS.filter((name) => !process.env[name]);
  if (missing.length) {
    console.error(`sign-image-upload is missing config: ${missing.join(", ")}`);
    return json(
      { error: "Image sharing isn't configured on this instance." },
      500,
    );
  }

  const hash = randomBytes(16).toString("hex");
  const prefix = process.env.WASABI_PREFIX.replace(/^\/+|\/+$/g, "");
  const key = prefix ? `${prefix}/${hash}.png` : `${hash}.png`;

  const client = new AwsClient({
    accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
    secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
    // aws4fetch guesses these from the hostname, and it can't read a
    // wasabisys.com host, so both have to be pinned explicitly.
    service: "s3",
    region: process.env.WASABI_REGION,
  });

  // Path-style addressing, which Wasabi supports and which sidesteps DNS
  // propagation issues with virtual-host style on new buckets. X-Amz-Expires
  // has to be on the URL before signing — aws4fetch reads it from there and
  // otherwise defaults to 24 hours.
  const target =
    `https://s3.${process.env.WASABI_REGION}.wasabisys.com` +
    `/${process.env.WASABI_BUCKET}/${key}` +
    `?X-Amz-Expires=${EXPIRES_SECONDS}`;

  // Content-Type is deliberately not signed (aws4fetch treats it as
  // unsignable), so SignedHeaders is just `host`. The browser still sends
  // Content-Type on the PUT and S3 stores it as object metadata.
  const signed = await client.sign(target, {
    method: "PUT",
    aws: { signQuery: true },
  });

  return json({ hash, uploadUrl: signed.url }, 200);
}
