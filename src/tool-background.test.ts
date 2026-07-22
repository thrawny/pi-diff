import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import diffRendererExtension, { __testing } from "./index.js";

describe("diff preview backgrounds", () => {
	let tempDir: string;
	let cwdSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		tempDir = mkdtempSync(join(tmpdir(), "pi-diff-bg-"));
		mkdirSync(join(tempDir, ".pi"));
		writeFileSync(
			join(tempDir, ".pi", "settings.json"),
			JSON.stringify({ diffColors: { bgEmpty: "#222222" } }),
			"utf-8",
		);
		cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(tempDir);
	});

	afterEach(() => {
		cwdSpy.mockRestore();
		rmSync(tempDir, { recursive: true, force: true });
	});

	it("uses explicit bgEmpty for edit diff preview padding instead of toolSuccessBg", async () => {
		let editTool: any;
		await diffRendererExtension({
			registerTool: (tool: { name: string }) => {
				if (tool.name === "edit") editTool = tool;
			},
		} as never);

		const theme = {
			bold: (text: string) => text,
			fg: (_color: string, text: string) => text,
			getFgAnsi: () => "\x1b[38;2;120;120;120m",
			getBgAnsi: (key: string) => (key === "toolSuccessBg" ? "\x1b[48;2;32;50;31m" : "\x1b[48;2;54;29;40m"),
		};
		const diff = __testing.parseDiff("const value = 1;\n", "const value = 2;\n");
		const text = editTool.renderResult(
			{ details: { _type: "editInfo", diff, language: "typescript" }, content: [{ type: "text", text: "Edited" }] },
			{},
			theme,
			{ isError: false, invalidate: () => {} },
		);

		expect(typeof text.customBgFn).toBe("function");
		const renderedPadding = text.customBgFn(" ");
		expect(renderedPadding).toContain("\x1b[48;2;34;34;34m");
		expect(renderedPadding).not.toContain("\x1b[48;2;32;50;31m");
	});
});
