import slugify from 'slugify';
import { Prisma } from '@lifeos/db/client';
import { PrismaErrorCode } from './prisma-errors';

export function createSlug(text: string): string {
	return slugify(text, {
		lower: true,
		strict: true,
		locale: 'pl'
	});
}

export function createSlugWithSuffix(text: string, suffix?: number): string {
	const baseSlug = createSlug(text);
	return suffix ? `${baseSlug}-${suffix}` : baseSlug;
}

export function isUniqueConstraintError(error: unknown): boolean {
	return (
		error instanceof Prisma.PrismaClientKnownRequestError &&
		error.code === PrismaErrorCode.UNIQUE_CONSTRAINT_VIOLATION
	);
}
