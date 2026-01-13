/**
 * UI Configuration Constants
 *
 * Centralized configuration for UI-related values.
 * Prevents magic numbers and ensures consistency.
 */

export const SEARCH_CONFIG = {
	MIN_QUERY_LENGTH: 2,
	DEFAULT_PAGE_SIZE: 10,
	EXTERNAL_PAGE_SIZE: 25
} as const;

export const ANIMATION = {
	STAGGER_DELAY: 50,
	DURATION: {
		FAST: 200,
		NORMAL: 300,
		SLOW: 400
	}
} as const;

export const LAYOUT = {
	MODAL_MAX_HEIGHT: 'calc(85vh - 200px)',
	DRAWER_MAX_HEIGHT: 'calc(90vh - 200px)'
} as const;
