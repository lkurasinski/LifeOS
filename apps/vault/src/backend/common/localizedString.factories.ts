export type LocalizedString = {
	en?: string;
	pl?: string;
};

export function createLocalizedString(params: {
	en?: string;
	pl?: string;
	required?: 'en' | 'pl'; // opcjonalnie
}): LocalizedString {
	const en = params.en?.trim();
	const pl = params.pl?.trim();

	if (params.required === 'en' && !en) {
		throw new Error('English value is required');
	}
	if (params.required === 'pl' && !pl) {
		throw new Error('Polish value is required');
	}

	return { en, pl };
}

export function getLocalized(value: LocalizedString, lang: 'pl' | 'en'): string | undefined {
	return lang === 'pl' ? (value.pl ?? value.en) : (value.en ?? value.pl);
}
