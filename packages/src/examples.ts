#!/usr/bin/env bun

/**
 * TUI Library Examples
 * Demonstrates all available UI components
 */

import { showBannerExamples } from "./components/ui/banner";
import { showChatExamples } from "./components/ui/chat";
import { showCodeBlockExamples } from "./components/ui/codeblock";
import { showIntroExamples } from "./components/ui/intro";
import { showLineExamples } from "./components/ui/line";
import { showLogExamples } from "./components/ui/log";
import { showNoteExamples } from "./components/ui/note";
import { showPanelExamples } from "./components/ui/panel";
import { showProgressExamples } from "./components/ui/progress";
import { showSpinnerExamples } from "./components/ui/spinner";
import { showTableExamples } from "./components/ui/table";
import { showToastExamples } from "./components/ui/toast";

/**
 * Run all component examples
 */
export async function runAllExamples(): Promise<void> {
	console.log("🚀 TUI Library - Component Showcase");
	console.log("=====================================\n");

	try {
		// Core UI Components
		await showBannerExamples();
		await showPanelExamples();
		await showIntroExamples();
		await showLineExamples();
		await showLogExamples();
		await showNoteExamples();
		await showToastExamples();

		// Data Display Components
		await showTableExamples();
		await showCodeBlockExamples();

		// Interactive Components
		await showProgressExamples();
		await showSpinnerExamples();
		await showChatExamples();

		console.log("✨ All examples completed successfully!");
		console.log(
			"\n📚 For more information, check individual component files in src/components/ui/",
		);
	} catch (error) {
		console.error("❌ Error running examples:", error);
		process.exit(1);
	}
}

// Run examples if this file is executed directly
if (import.meta.main) {
	runAllExamples().catch(console.error);
}
