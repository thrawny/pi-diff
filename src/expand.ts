import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

/**
 * Default tool blocks expanded (Ctrl+O / app.tools.expand still toggles per block).
 * pi-diff still renders compact summaries when `!ctx.expanded` (new file, write overwrite, edit).
 */
export function registerDefaultExpandedToolOutput(pi: ExtensionAPI): void {
	pi.on("session_start", (_event, ctx) => {
		(ctx as { setConfig?: (c: { toolOutputExpanded?: boolean }) => void }).setConfig?.({
			toolOutputExpanded: true,
		});
	});
}