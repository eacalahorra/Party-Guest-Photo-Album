import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const required = (name) => {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
};

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${required("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: required("R2_ACCESS_KEY_ID"),
    secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
  },
});

export const BUCKET = required("R2_BUCKET");
export const EVENT_PREFIX = process.env.EVENT_PREFIX || "uploads";
export const ADMIN_PASSPHRASE = required("ADMIN_PASSPHRASE");

export const assertAdmin = (headers) => {
  const token = headers["x-admin-pass"] || headers["X-Admin-Pass"];
  if (token !== ADMIN_PASSPHRASE) return false;
  return true;
};

export const signPut = async (Key, contentType) => {
  const command = new PutObjectCommand({ Bucket: BUCKET, Key, ContentType: contentType });
  return getSignedUrl(r2, command, { expiresIn: 60 * 5 });
};

export const signGet = async (Key) => {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key });
  return getSignedUrl(r2, command, { expiresIn: 60 * 30 });
};

export const listKeys = async (Prefix) => {
  let keys = [];
  let ContinuationToken;
  do {
    const res = await r2.send(new ListObjectsV2Command({ Bucket: BUCKET, Prefix, ContinuationToken }));
    (res.Contents || []).forEach((o) => keys.push({ key: o.Key, size: o.Size, lastModified: o.LastModified }));
    ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return keys;
};