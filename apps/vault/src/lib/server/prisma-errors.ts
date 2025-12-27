export const PrismaErrorCode = {
	UNIQUE_CONSTRAINT_VIOLATION: 'P2002',
	FOREIGN_KEY_CONSTRAINT_VIOLATION: 'P2003',
	RECORD_NOT_FOUND: 'P2025',
	DEPENDENT_RECORDS_EXIST: 'P2014',
	REQUIRED_FIELD_MISSING: 'P2011',
	VALUE_TOO_LONG: 'P2000',
	INVALID_QUERY: 'P2009'
} as const;

export type PrismaErrorCode = (typeof PrismaErrorCode)[keyof typeof PrismaErrorCode];
