import {
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';

import { publicProcedure, router } from '../trpc';

const s3Client = new S3Client({
	endpoint: process.env.S3_ENDPOINT!,
	region: process.env.S3_REGION!,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY!,
		secretAccessKey: process.env.S3_SECRET_KEY!,
	},
});

const S3_BUCKET = process.env.S3_BUCKET;

const FilePathSchema = z
	.string()
	.trim()
	.regex(/([^\/]+\/)*/);

export const s3fsRouter = router({
	readdir: publicProcedure
		.input(
			z.object({
				path: FilePathSchema,
				nextToken: z.string().optional(),
			}),
		)
		.query(async ({ input }) => {
			const cmd = new ListObjectsV2Command({
				Bucket: S3_BUCKET,
				Prefix: input.path,
				ContinuationToken: input.nextToken,
				Delimiter: '/',
				MaxKeys: 100,
			});

			const output = await s3Client.send(cmd);
			const data: {
				name: string;
				etag?: string;
				size?: number;
				lastModified?: Date;
			}[] = [];

			if (output.CommonPrefixes) {
				for (const dir of output.CommonPrefixes) {
					data.push({
						name: dir.Prefix!,
					});
				}
			}

			if (output.Contents) {
				for (const file of output.Contents) {
					if (file.Key === input.path) {
						continue;
					}

					data.push({
						name: file.Key!,
						etag: file.ETag,
						size: file.Size,
						lastModified: file.LastModified,
					});
				}
			}

			return {
				data,
				nextToken: output.NextContinuationToken,
			};
		}),
	uploadUrls: publicProcedure
		.input(
			z.object({
				files: z.record(
					FilePathSchema,
					z.object({
						contentType: z.string().optional(),
						contentEncoding: z.string().optional(),
					}),
				),
			}),
		)
		.query(async ({ input }) => {
			const promises: Promise<[string, string]>[] = [];
			for (const [path, meta] of Object.entries(input.files)) {
				const cmd = new PutObjectCommand({
					Bucket: S3_BUCKET,
					Key: path,
					ContentType: meta.contentType,
					ContentEncoding: meta.contentEncoding,
				});

				promises.push(
					getSignedUrl(s3Client, cmd, { expiresIn: 3600 }).then(
						(url) => [path, url],
					),
				);
			}

			return Object.fromEntries(await Promise.all(promises));
		}),
});
