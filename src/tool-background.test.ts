import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import diffRendererExtension, { __testing } from "./index.js";

const theme = {
	bold: (text: string) => text,
	fg: (_color: string, text: string) => text,
	getFgAnsi: () => "\x1b[38;2;120;120;120m",
	getBgAnsi: (key: string) => (key === "toolSuccessBg" ? "\x1b[48;2;32;50;31m" : "\x1b[48;2;54;29;40m"),
};

function expectExplicitBackground(text: { customBgFn?: (line: string) => string }) {
	expect(typeof text.customBgFn).toBe("function");
	const renderedPadding = text.customBgFn?.(" ") ?? "";
	expect(renderedPadding).toContain("\x1b[48;2;34;34;34m");
	expect(renderedPadding).not.toContain("\x1b[48;2;32;50;31m");
}

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

		const diff = __testing.parseDiff("const value = 1;\n", "const value = 2;\n");
		const text = editTool.renderResult(
			{ details: { _type: "editInfo", diff, language: "typescript" }, content: [{ type: "text", text: "Edited" }] },
			{},
			theme,
			{ isError: false, invalidate: () => {} },
		);

		expectExplicitBackground(text);
	});

	it("uses explicit bgEmpty for write new-file previews instead of toolSuccessBg", async () => {
		let writeTool: any;
		await diffRendererExtension({
			registerTool: (tool: { name: string }) => {
				if (tool.name === "write") writeTool = tool;
			},
		} as never);

		const text = writeTool.renderResult(
			{
				details: { _type: "new", lines: 1, content: "const value = 1;\n", filePath: "created.ts" },
				content: [{ type: "text", text: "Created" }],
			},
			{},
			theme,
			{ isError: false, state: {}, invalidate: () => {} },
		);

		expectExplicitBackground(text);
	});

	it("uses explicit bgEmpty for apply_patch error output instead of tool-state backgrounds", async () => {
		let applyPatchTool: any;
		await diffRendererExtension({
			registerTool: (tool: { name: string }) => {
				if (tool.name === "apply_patch") applyPatchTool = tool;
			},
		} as never);

		const text = applyPatchTool.renderResult(
			{ content: [{ type: "text", text: "Failed 1 change(s):" }], isError: true },
			{},
			theme,
			{ isError: true, state: {}, invalidate: () => {} },
		);

		expectExplicitBackground(text);
	});

	it("keeps a neutral background when apply_patch call output is hidden", async () => {
		let applyPatchTool: any;
		await diffRendererExtension({
			registerTool: (tool: { name: string }) => {
				if (tool.name === "apply_patch") applyPatchTool = tool;
			},
		} as never);

		const text = applyPatchTool.renderCall(
			{ changes: [{ path: join(tempDir, "file.ts"), action: "update", oldText: "a", newText: "b" }] },
			theme,
			{ argsComplete: true, state: {}, invalidate: () => {} },
		);

		expectExplicitBackground(text);
	});
});
