#!/usr/bin/env bun

import { 
  // Core utilities
  colors, 
  SYMBOLS,
  isValidEmail,
  formatBytes,
  formatDuration,
  
  // UI Components
  intro, 
  outro, 
  note, 
  info, 
  warn, 
  error, 
  success,
  progress, 
  spinner, 
  table, 
  markdown,
  
  // Utilities
  isCancel 
} from "./index";

async function runShowcase() {
  // Intro
  intro({ title: "TUI Components Showcase", tagLine: "Demonstrating all available components" });
  
  // Note
  note({ title: "Showcase Overview", body: "This script demonstrates all TUI components without user interaction." });
  
  // Info, warning, error, success logs
  info("This is an info message");
  warn("This is a warning message");
  error("This is an error message");
  success("This is a success message");
  
  console.log(); // Empty line
  
  // Colors demo
  console.log("Colors:");
  console.log(colors.primary("Primary color"));
  console.log(colors.success("Success color"));
  console.log(colors.error("Error color"));
  console.log(colors.warning("Warning color"));
  console.log(colors.info("Info color"));
  console.log(colors.dim("Dim color"));
  console.log(colors.bold("Bold text"));
  
  console.log(); // Empty line
  
  // Symbols demo
  console.log("Symbols:");
  console.log(`${SYMBOLS.CHECKMARK} Checkmark`);
  console.log(`${SYMBOLS.CROSS} Cross`);
  console.log(`${SYMBOLS.WARNING} Warning`);
  console.log(`${SYMBOLS.INFO} Info`);
  
  console.log(); // Empty line
  
  // Utils demo
  console.log("Utilities:");
  console.log(`Valid email test@example.com: ${isValidEmail("test@example.com")}`);
  console.log(`Valid email invalid-email: ${isValidEmail("invalid-email")}`);
  console.log(`Format 1024 bytes: ${formatBytes(1024)}`);
  console.log(`Format 5000ms: ${formatDuration(5000)}`);
  
  console.log(); // Empty line
  
  // Markdown demo
  console.log("Markdown Component:");
  markdown({
    content: `
# Markdown Rendering
## Features

- **Bold text**
- *Italic text*  
- \`Inline code\`
- Headers and lists
`
  });
  
  // Table demo
  console.log("Table Component:");
  table({
    data: [
      { Component: "intro", Type: "UI", Description: "Display introduction" },
      { Component: "note", Type: "UI", Description: "Show note message" },
      { Component: "table", Type: "UI", Description: "Display tabular data" },
      { Component: "text", Type: "Prompt", Description: "Text input" },
      { Component: "select", Type: "Prompt", Description: "Single selection" },
    ],
    columns: [
      { key: "Component", label: "Component", width: 10 },
      { key: "Type", label: "Type", width: 10 },
      { key: "Description", label: "Description", width: 25 }
    ]
  });
  
  // Progress demo
  console.log("Progress Component:");
  const progressBar = progress();
  progressBar.update({ message: "Loading...", current: 50, total: 100 });
  // In a real app, you would update this over time
  progressBar.stop();
  
  // Spinner demo
  console.log("Spinner Component:");
  const spin = spinner();
  spin.start("Processing...");
  // In a real app, you would do some work here
  spin.stop("Processing complete!");
  
  // Summary
  console.log();
  markdown({
    content: `
# Showcase Complete

This showcase demonstrated all available TUI components:

## UI Components
- \`intro\` / \`outro\` - Introduction and conclusion
- \`note\` - Informational notes
- \`log\` - Colored log messages (info, warn, error, success)
- \`markdown\` - Markdown rendering
- \`table\` - Tabular data display
- \`progress\` - Progress bars
- \`spinner\` - Loading indicators

## Core Utilities
- Colors and symbols for styling
- Validation and formatting utilities

For interactive components (text, select, confirm, etc.), see the demo.ts file.
`
  });
  
  outro("Showcase completed! Thanks for viewing TUI components.");
}

runShowcase().catch(console.error);