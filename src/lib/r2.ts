/**
 * Client Cloudflare R2 (S3-compatibile) per upload file.
 * Env richieste: CF_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *                R2_BUCKET_NAME, R2_PUBLIC_URL
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function getClient(): S3Client {
  const accountId = process.env.CF_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("[r2] CF_ACCOUNT_ID, R2_ACCESS_KEY_ID o R2_SECRET_ACCESS_KEY non configurati");
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

/**
 * Carica un buffer su R2 e ritorna l'URL pubblico.
 * Richiede R2_PUBLIC_URL configurato (es. "https://pub.trionoracing.it").
 */
export async function uploadToR2(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<string> {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("[r2] R2_BUCKET_NAME non configurato");

  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, "");
  if (!publicUrl) throw new Error("[r2] R2_PUBLIC_URL non configurato");
  return `${publicUrl}/${key}`;
}
