import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

export type ShikiLanguage = string;
export type ShikiTheme = string;

const highlighterPromise = createHighlighterCore({
	langs: [],
	themes: [],
	engine: createJavaScriptRegexEngine(),
});

const loadedLanguages = new Map<string, Promise<void>>();
const loadedThemes = new Map<string, Promise<void>>();
const SAFE_BUNDLED_NAME = /^[a-z0-9-]+$/;

function loadLanguage(language: string): Promise<void> {
	const existing = loadedLanguages.get(language);
	if (existing) return existing;

	const pending = (async () => {
		if (!SAFE_BUNDLED_NAME.test(language)) throw new Error(`Invalid Shiki language: ${language}`);
		const modulePath = `@shikijs/langs/${language}`;
		const [highlighter, languageModule] = await Promise.all([
			highlighterPromise,
			import(/* @vite-ignore */ modulePath),
		]);
		await highlighter.loadLanguage(languageModule.default);
	})();
	loadedLanguages.set(language, pending);
	return pending;
}

function loadTheme(theme: string): Promise<void> {
	const existing = loadedThemes.get(theme);
	if (existing) return existing;

	const pending = (async () => {
		if (!SAFE_BUNDLED_NAME.test(theme)) throw new Error(`Invalid Shiki theme: ${theme}`);
		const modulePath = `@shikijs/themes/${theme}`;
		const [highlighter, themeModule] = await Promise.all([highlighterPromise, import(/* @vite-ignore */ modulePath)]);
		await highlighter.loadTheme(themeModule.default);
	})();
	loadedThemes.set(theme, pending);
	return pending;
}

function foregroundAnsi(color: string, themeType: string): string {
	let hex = color.replace(/^#/, "");
	if (hex.length === 3 || hex.length === 4) {
		hex = [...hex].map((character) => character.repeat(2)).join("");
	}
	if (hex.length === 6) hex += "ff";
	if (!/^[0-9a-f]{8}$/i.test(hex)) return "";

	const alpha = Number.parseInt(hex.slice(6, 8), 16) / 255;
	const background = themeType === "light" ? 255 : 0;
	const channel = (offset: number) => {
		const value = Number.parseInt(hex.slice(offset, offset + 2), 16);
		return Math.round(value * alpha + background * (1 - alpha));
	};
	return `\x1b[38;2;${channel(0)};${channel(2)};${channel(4)}m`;
}

/**
 * Highlight code without Shiki's bundled lazy loaders.
 *
 * Pi's standalone Bun binary cannot resolve the lazy imports used by
 * `@shikijs/cli`, so languages and themes are imported from their public
 * package entry points and loaded into a shared JavaScript-regex highlighter.
 */
export async function codeToAnsi(code: string, language: ShikiLanguage, theme: ShikiTheme): Promise<string> {
	await Promise.all([loadLanguage(language), loadTheme(theme)]);
	const highlighter = await highlighterPromise;
	const themeRegistration = highlighter.getTheme(theme);
	const lines = highlighter.codeToTokensBase(code, { lang: language, theme });
	const output: string[] = [];

	for (const line of lines) {
		let rendered = "";
		for (const token of line) {
			const color = token.color || themeRegistration.fg;
			const fontStyle = token.fontStyle ?? 0;
			const opens: string[] = [];
			const closes: string[] = [];
			if (color) {
				opens.push(foregroundAnsi(color, themeRegistration.type));
				closes.unshift("\x1b[39m");
			}
			if (fontStyle & 1) {
				opens.push("\x1b[3m");
				closes.unshift("\x1b[23m");
			}
			if (fontStyle & 2) {
				opens.push("\x1b[1m");
				closes.unshift("\x1b[22m");
			}
			if (fontStyle & 4) {
				opens.push("\x1b[4m");
				closes.unshift("\x1b[24m");
			}
			if (fontStyle & 8) {
				opens.push("\x1b[9m");
				closes.unshift("\x1b[29m");
			}
			rendered += opens.join("") + token.content + closes.join("");
		}
		output.push(rendered);
	}

	return `${output.join("\n")}\n`;
}
