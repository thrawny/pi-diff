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

function stripAnsi(line: string) {
	// biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape sequences are the value under test.
	return line.replace(/\u001b\[[0-9;]*m/g, "");
}

function expectNeutralBlankLine(line: string) {
	expect(line).toContain("\x1b[48;2;34;34;34m");
	expect(stripAnsi(line).trim()).toBe("");
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

		const callText = writeTool.renderCall({ path: "created.ts", content: "const value = 1;\n" }, theme, {
			argsComplete: false,
			state: {},
			invalidate: () => {},
		});
		const callLines = callText.render(80);
		expect(callLines).toHaveLength(3);
		expectNeutralBlankLine(callLines[0]);
		expect(callLines[1]).toContain("← create");

		const completedState: Record<string, string> = {};
		const completedText = writeTool.renderCall({ path: "created.ts", content: "const value = 1;\n" }, theme, {
			argsComplete: true,
			state: completedState,
			invalidate: () => {},
		});
		await vi.waitFor(() => expect(completedState._previewBody).toBeDefined());
		expectNeutralBlankLine(completedText.render(80).at(-1) ?? "");

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
		const renderedResult = await text.__piDiffTask.render(80);
		expectNeutralBlankLine(renderedResult.split("\n").at(-1) ?? "");

		const actualPath = join(tempDir, "actual-created.ts");
		const params = { path: actualPath, content: "export const created = true;\n" };
		await writeTool.execute("new-file-call", params, undefined, undefined, {});
		const postExecuteCall = writeTool.renderCall(params, theme, {
			argsComplete: true,
			executionStarted: true,
			toolCallId: "new-file-call",
			state: {},
			invalidate: () => {},
		});
		const postExecuteLines = postExecuteCall.render(80);
		expect(postExecuteLines).toHaveLength(3);
		expect(postExecuteLines.join("\n")).toContain("← create");
		expect(stripAnsi(postExecuteLines.join("\n"))).not.toContain("export const created");
	});

	it("renders edit headers without extra top or bottom rows", async () => {
		let editTool: any;
		await diffRendererExtension({
			registerTool: (tool: { name: string }) => {
				if (tool.name === "edit") editTool = tool;
			},
		} as never);

		const filePath = join(tempDir, "edit.ts");
		writeFileSync(filePath, "const value = 1;\n", "utf-8");
		const text = editTool.renderCall({ path: filePath, oldText: "value = 1", newText: "value = 2" }, theme, {
			argsComplete: true,
			state: {},
			invalidate: () => {},
		});

		expect(text.render(196)).toHaveLength(1);
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
			{ isError: false, state: {}, invalidate: () => {} },
		);

		expectExplicitBackground(text);
		const errorLines = text.render(196);
		expectNeutralBlankLine(errorLines[0]);
		expect(errorLines[1]).toContain("← apply_patch");
		expect(stripAnsi(errorLines[2])).toContain("Failed 1 change(s)");

		await expect(
			applyPatchTool.execute("failing-patch", {
				changes: [{ path: join(tempDir, "missing.ts"), action: "update", oldText: "absent", newText: "next" }],
			}),
		).rejects.toThrow(/Failed 1 change/);
	});

	it("renders apply_patch diffs directly below their header", async () => {
		let applyPatchTool: any;
		await diffRendererExtension({
			registerTool: (tool: { name: string }) => {
				if (tool.name === "apply_patch") applyPatchTool = tool;
			},
		} as never);

		const filePath = join(tempDir, "patched.ts");
		writeFileSync(filePath, "const value = 1;\n", "utf-8");
		const result = await applyPatchTool.execute("successful-patch", {
			changes: [{ path: filePath, action: "update", oldText: "value = 1", newText: "value = 2" }],
		});
		const text = applyPatchTool.renderResult(result, {}, theme, {
			isError: false,
			state: {},
			invalidate: () => {},
		});
		const lines = (await text.__piDiffTask.render(196)).split("\n");

		expectNeutralBlankLine(lines[0]);
		expect(stripAnsi(lines[1])).toContain("← apply_patch");
		expect(stripAnsi(lines[2]).trim()).not.toBe("");
		expectNeutralBlankLine(lines.at(-1) ?? "");
	});

	it("renders no row when completed apply_patch call output is hidden", async () => {
		let applyPatchTool: any;
		await diffRendererExtension({
			registerTool: (tool: { name: string }) => {
				if (tool.name === "apply_patch") applyPatchTool = tool;
			},
		} as never);

		const args = {
			changes: [{ path: join(tempDir, "file.ts"), action: "update", oldText: "a", newText: "b" }],
		};
		const pendingText = applyPatchTool.renderCall(args, theme, {
			argsComplete: false,
			state: {},
			invalidate: () => {},
		});
		const pendingLines = pendingText.render(196);
		expectNeutralBlankLine(pendingLines[0]);
		expect(pendingLines[1]).toContain("← apply_patch");
		expect(pendingLines).toHaveLength(2);

		const text = applyPatchTool.renderCall(args, theme, {
			argsComplete: true,
			state: {},
			invalidate: () => {},
		});
		expect(text.render(196)).toEqual([]);
	});
});
