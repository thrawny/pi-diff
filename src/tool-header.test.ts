import { strict as assert } from "node:assert";
import { describe, it } from "vitest";
import { __testing } from "./index.js";

describe("tool header names", () => {
	it("prefixes write, edit, and apply_patch with a left arrow", () => {
		assert.equal(__testing.formatToolHeaderName("write"), "← write");
		assert.equal(__testing.formatToolHeaderName("create"), "← create");
		assert.equal(__testing.formatToolHeaderName("edit"), "← edit");
		assert.equal(__testing.formatToolHeaderName("apply_patch"), "← apply_patch");
		assert.equal(__testing.formatToolHeaderName("read"), "read");
	});

	it("uses toolTitle for tool header paths", () => {
		const theme = { fg: (name: string, text: string) => `${name}:${text}` };
		assert.equal(__testing.formatToolHeaderPath(theme, "src/index.ts"), "toolTitle:src/index.ts");
	});
});
