/**
 * Theme Management Hook
 *
 * Manages light/dark theme state with localStorage persistence.
 * Applies the theme by toggling the 'dark' class on the documentElement.
 */

import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'lifeos-theme';

function getInitialTheme(): Theme {
	if (!browser) return 'light';

	const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
	if (stored === 'light' || stored === 'dark') {
		return stored;
	}

	const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	return prefersDark ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
	if (!browser) return;

	if (theme === 'dark') {
		document.documentElement.classList.add('dark');
	} else {
		document.documentElement.classList.remove('dark');
	}
}

export function useTheme() {
	let theme = $state<Theme>(getInitialTheme());

	$effect(() => {
		applyTheme(theme);
		if (browser) {
			localStorage.setItem(STORAGE_KEY, theme);
		}
	});

	function setTheme(newTheme: Theme) {
		theme = newTheme;
	}

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
	}

	return {
		get theme() {
			return theme;
		},
		setTheme,
		toggleTheme
	};
}
