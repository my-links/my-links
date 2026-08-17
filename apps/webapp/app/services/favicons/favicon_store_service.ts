import { join } from 'node:path';
import { createHash } from 'node:crypto';
import app from '@adonisjs/core/services/app';
import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises';

const CONTENT_HASH_PATTERN = /^[0-9a-f]{64}$/;

// Content-addressed: the filename is the sha256 of the bytes, never anything derived from the source URL.
export class FaviconStoreService {
	private readonly storageDir: string;

	constructor(storageDir: string = app.makePath('storage/favicons')) {
		this.storageDir = storageDir;
	}

	async write(buffer: Buffer): Promise<string> {
		const hash = this.hashOf(buffer);
		await mkdir(this.storageDir, { recursive: true });
		await writeFile(this.pathForHash(hash), buffer);
		return hash;
	}

	async read(hash: string): Promise<Buffer | undefined> {
		try {
			return await readFile(this.pathForHash(hash));
		} catch (error) {
			if (this.isNotFound(error)) {
				return undefined;
			}
			throw error;
		}
	}

	async delete(hash: string): Promise<void> {
		try {
			await unlink(this.pathForHash(hash));
		} catch (error) {
			if (!this.isNotFound(error)) {
				throw error;
			}
		}
	}

	async listStoredHashes(): Promise<string[]> {
		try {
			const entries = await readdir(this.storageDir);
			return entries.filter((entry) => CONTENT_HASH_PATTERN.test(entry));
		} catch (error) {
			if (this.isNotFound(error)) {
				return [];
			}
			throw error;
		}
	}

	private pathForHash(hash: string): string {
		if (!CONTENT_HASH_PATTERN.test(hash)) {
			throw new Error(`Invalid favicon content hash: ${hash}`);
		}
		return join(this.storageDir, hash);
	}

	private hashOf(buffer: Buffer): string {
		return createHash('sha256').update(buffer).digest('hex');
	}

	private isNotFound(error: unknown): boolean {
		return (
			error instanceof Error &&
			'code' in error &&
			(error as { code?: string }).code === 'ENOENT'
		);
	}
}
