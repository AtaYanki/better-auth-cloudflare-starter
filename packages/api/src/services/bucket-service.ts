import { env } from "cloudflare:workers";

type ExtractR2BucketKeys<T> = {
  [K in keyof T]: T[K] extends R2Bucket ? K : never;
}[keyof T];

type EnvType = typeof env;
export type BucketName = ExtractR2BucketKeys<EnvType>;

export const BUCKET_NAMES = Object.keys(env) as readonly BucketName[];

export type BucketFileInput =
  | File
  | Blob
  | ReadableStream
  | ArrayBuffer
  | ArrayBufferView
  | string
  | null;

export class BucketService {
  private getBucket(name: BucketName): R2Bucket {
    const bucket = env[name];
    if (!bucket) {
      throw new Error(`Bucket "${name}" not found in environment`);
    }
    return bucket;
  }

  has(name: BucketName): boolean {
    try {
      const bucket = this.getBucket(name);
      return bucket !== undefined && bucket !== null;
    } catch {
      return false;
    }
  }

  getBucketNames(): readonly BucketName[] {
    return BUCKET_NAMES;
  }

  async put(
    file: BucketFileInput,
    path: string,
    bucketName: BucketName,
    options?: R2PutOptions
  ): Promise<R2Object> {
    const bucket = this.getBucket(bucketName);
    const value = file instanceof File ? file.stream() : file;
    const result = await bucket.put(path, value, options);
    if (!result) {
      throw new Error(`Failed to put file "${path}" into bucket "${bucketName}"`);
    }
    return result;
  }

  async get(
    path: string,
    bucketName: BucketName,
    options?: R2GetOptions
  ): Promise<R2ObjectBody | null> {
    return this.getBucket(bucketName).get(path, options);
  }

  async delete(path: string | string[], bucketName: BucketName): Promise<void> {
    await this.getBucket(bucketName).delete(path);
  }

  async list(
    bucketName: BucketName,
    options?: R2ListOptions
  ): Promise<R2Objects> {
    return this.getBucket(bucketName).list(options);
  }

  async head(path: string, bucketName: BucketName): Promise<R2Object | null> {
    return this.getBucket(bucketName).head(path);
  }
}
