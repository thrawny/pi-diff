import { describe, expect, it } from "vitest";
import { codeToAnsi } from "./highlight.js";

describe("codeToAnsi", () => {
	it("loads bundled languages and themes without Shiki's lazy bundle loaders", async () => {
		const highlighted = await codeToAnsi('def greet(name: str = "world") -> str:', "python", "monokai");

		expect(highlighted).toContain("\x1b[38;2;102;217;239m");
		expect(highlighted).toContain("def");
		expect(highlighted).toContain("\x1b[38;2;166;226;46mgreet");
		expect(highlighted).toContain('\x1b[38;2;230;219;116m"world"');
	});

	it("can add another language and theme to the shared highlighter", async () => {
		const highlighted = await codeToAnsi("const answer = 42;", "typescript", "github-dark");

		expect(highlighted).toContain("\x1b[38;2;");
		expect(highlighted).toContain("const");
		expect(highlighted).toContain("answer");
	});
});
