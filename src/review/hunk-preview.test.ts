import { stripVTControlCharacters } from "node:util";
import { visibleWidth } from "@earendil-works/pi-tui";
import { describe, expect, it } from "vitest";
import { parseDiff } from "../core/diff.js";
import { renderSplit, renderUnified } from "./hunk-preview.js";

const colors = { fgAdd: "", fgDel: "", fgCtx: "" };
const paragraph = `${"Markdown paragraphs must remain readable without losing words at the right edge. ".repeat(10)}END_OF_PARAGRAPH`;

function expectComplete(output: string, source: string, width: number, gutterWidth: number) {
	const lines = output.split("\n");
	for (const line of lines) expect(visibleWidth(line)).toBeLessThanOrEqual(width);
	const text = lines.map((line) => stripVTControlCharacters(line).slice(gutterWidth).trim()).join(" ");
	expect(text.replace(/\s/g, "")).toBe(source.replace(/\s/g, ""));
	expect(text).not.toContain("›");
}

describe("Markdown diff wrapping", () => {
	for (const width of [40, 80, 120, 180]) {
		for (const compactGutter of [false, true]) {
			it(`keeps full added, removed, and context paragraphs at ${width} columns, compact=${compactGutter}`, async () => {
				for (const type of ["add", "del", "ctx"] as const) {
					const diff = {
						lines: [{ type, content: paragraph, oldNum: type === "add" ? null : 1, newNum: type === "del" ? null : 1 }],
						added: type === "add" ? 1 : 0,
						removed: type === "del" ? 1 : 0,
						chars: paragraph.length,
					};
					const output = await renderUnified(diff, "markdown", 10, colors, width, { compactGutter });
					expectComplete(output, paragraph, width, compactGutter ? 5 : 6);
				}
			});
		}
	}

	it("wraps long links and wide Unicode without losing characters", async () => {
		for (const source of [`https://example.com/${"long-path/".repeat(50)}`, "界🙂e\u0301".repeat(100)]) {
			const output = await renderUnified(parseDiff("", source), "markdown", 10, colors, 80);
			expectComplete(output, source, 80, 6);
		}
	});

	it("keeps the tail of both sides of a word-highlighted edit", async () => {
		const output = await renderSplit(
			parseDiff(paragraph, paragraph.replace("readable", "visible")),
			"markdown",
			10,
			colors,
			80,
		);
		expect(stripVTControlCharacters(output).match(/END_OF_PARAGRAPH/g)).toHaveLength(2);
		for (const line of output.split("\n")) expect(visibleWidth(line)).toBeLessThanOrEqual(80);
	});

	it("retains the compact truncation policy for code", async () => {
		const output = await renderUnified(parseDiff("", paragraph), "typescript", 10, colors, 80);
		expect(output.split("\n")).toHaveLength(1);
		expect(stripVTControlCharacters(output)).toContain("›");
	});
});
