import { visibleWidth, wrapTextWithAnsi } from "@earendil-works/pi-tui";

/** Wrap prose without the code preview's row cap, preserving styles and cell widths. */
export function wrapMarkdownLine(content: string, width: number, fillBg: string): string[] {
	return wrapTextWithAnsi(content, width).map(
		(row) => `${row}${fillBg}${" ".repeat(Math.max(0, width - visibleWidth(row)))}\x1b[0m`,
	);
}
