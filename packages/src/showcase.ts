#!/usr/bin/env bun

import {
	banner,
	chatDemo,
	clamp,
	codeblock,
	// Core utilities
	colors,
	divider,
	error,
	formatBytes,
	formatDuration,
	info,
	// UI Components
	intro,
	isValidEmail,
	KEYS,
	line,
	markdown,
	note,
	outro,
	panel,
	progress,
	SYMBOLS,
	section,
	spinner,
	success,
	table,
	toast,
	tree,
	warn,
} from "./index";

async function runComprehensiveShowcase() {
	// Welcome section with beautiful intro
	intro({
		title: "🚀 TUI Library Comprehensive Showcase",
		tagLine:
			"Interactive demonstration of all components, utilities, and constants",
	});

	note({
		title: "Welcome to the Complete Demo!",
		body: "This interactive showcase will demonstrate every single component in the TUI library.\nSit back and watch the magic happen! ✨",
	});

	section("🔔 LOG COMPONENTS");
	console.log(colors.dim("📁 Source: components/ui/log.ts"));
	console.log();

	note({
		title: "Log Messages Demo",
		body: "Different types of log messages with their appropriate icons and colors:",
	});

	info("System initialization complete - all services are running");
	success("Database connection established successfully");
	warn("High memory usage detected - consider optimizing");
	error("Failed to connect to external API - retrying...");

	await new Promise((resolve) => setTimeout(resolve, 1000));

	divider();

	section("🎨 COLORS & STYLING");
	console.log(colors.dim("📁 Source: components/core/colors.ts"));
	console.log();

	note({
		title: "Color Palette Demo",
		body: "All available color functions for consistent UI styling:",
	});

	console.log("🌈 Available Colors:");
	console.log(
		`  ${colors.primary("primary")} - Main brand color for headers and important text`,
	);
	console.log(
		`  ${colors.success("success")} - For positive actions and confirmations`,
	);
	console.log(`  ${colors.error("error")} - For errors and critical warnings`);
	console.log(`  ${colors.warning("warning")} - For cautions and alerts`);
	console.log(`  ${colors.info("info")} - For informational messages`);
	console.log(`  ${colors.dim("dim")} - For secondary text and metadata`);
	console.log(`  ${colors.bold("bold")} - For emphasis and headings`);

	await new Promise((resolve) => setTimeout(resolve, 800));

	section("🔤 SYMBOLS & CONSTANTS");
	console.log(colors.dim("📁 Source: components/core/constants.ts"));
	console.log();

	note({
		title: "Symbol Library",
		body: "Unicode symbols for creating beautiful CLI interfaces:",
	});

	console.log("✨ Available Symbols:");
	console.log(
		`  ${SYMBOLS.CHECKMARK} ${colors.success("CHECKMARK")} - For success states`,
	);
	console.log(`  ${SYMBOLS.CROSS} ${colors.error("CROSS")} - For error states`);
	console.log(
		`  ${SYMBOLS.WARNING} ${colors.warning("WARNING")} - For warnings`,
	);
	console.log(`  ${SYMBOLS.INFO} ${colors.info("INFO")} - For information`);
	console.log(`  ${SYMBOLS.BULLET} ${colors.dim("BULLET")} - For list items`);
	console.log(`  ${SYMBOLS.RADIO_ON}/${SYMBOLS.RADIO_OFF} Radio buttons`);
	console.log(`  ${SYMBOLS.CHECKBOX_ON}/${SYMBOLS.CHECKBOX_OFF} Checkboxes`);

	await new Promise((resolve) => setTimeout(resolve, 500));

	divider();

	note({
		title: "Keyboard Constants",
		body: "Key identifiers for handling user input:",
	});

	console.log("⌨️  Key Constants:");
	console.log(
		`  Navigation: ${colors.primary(KEYS.UP)}, ${colors.primary(KEYS.DOWN)}, ${colors.primary(KEYS.LEFT)}, ${colors.primary(KEYS.RIGHT)}`,
	);
	console.log(
		`  Actions: ${colors.primary(KEYS.ENTER)}, ${colors.primary(KEYS.ESCAPE)}, ${colors.primary(KEYS.TAB)}, ${colors.primary(KEYS.SPACE)}`,
	);
	console.log(
		`  Control: ${colors.primary(KEYS.CTRL_C)}, ${colors.primary(KEYS.CTRL_D)}`,
	);

	await new Promise((resolve) => setTimeout(resolve, 500));

	section("🛠️ UTILITY FUNCTIONS");
	console.log(colors.dim("📁 Source: components/core/utils.ts"));
	console.log();

	note({
		title: "Helper Functions Demo",
		body: "Utility functions for validation, formatting, and data manipulation:",
	});

	console.log("🔧 Validation & Formatting:");
	console.log(
		`  Email validation: ${colors.success("test@example.com")} → ${isValidEmail("test@example.com") ? colors.success("✓ valid") : colors.error("✗ invalid")}`,
	);
	console.log(
		`  Email validation: ${colors.error("invalid-email")} → ${isValidEmail("invalid-email") ? colors.success("✓ valid") : colors.error("✗ invalid")}`,
	);
	console.log(
		`  Number clamping: clamp(15, 10-20) → ${colors.primary(String(clamp(15, 10, 20)))}`,
	);
	console.log(
		`  Number clamping: clamp(5, 10-20) → ${colors.primary(String(clamp(5, 10, 20)))}`,
	);
	console.log(
		`  Byte formatting: 1024 bytes → ${colors.info(formatBytes(1024))}`,
	);
	console.log(
		`  Duration formatting: 5000ms → ${colors.info(formatDuration(5000))}`,
	);

	await new Promise((resolve) => setTimeout(resolve, 800));

	divider();

	section("📝 MARKDOWN COMPONENT");
	console.log(colors.dim("📁 Source: components/ui/markdown.ts"));
	console.log();

	note({
		title: "Rich Text Rendering",
		body: "Support for markdown formatting including headers, emphasis, and code:",
	});

	await markdown({
		content: `# 🎯 Markdown Features Demo

## What's Supported:
- **Bold text** for emphasis
- *Italic text* for subtle emphasis  
- \`Inline code\` for technical terms
- Multiple header levels
- Lists with bullets

### Example Usage:
\`\`\`typescript
await markdown({ content: "# Your markdown here" });
\`\`\`

### 🎨 Syntax Highlighting:
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return \`Welcome to TUI library!\`;
}

greet("Developer");
\`\`\`

\`\`\`typescript
interface User {
  id: number;
  name: string;
  role: 'admin' | 'user';
}

const createUser = (data: Partial<User>): User => {
  return {
    id: Math.random(),
    name: data.name || 'Unknown',
    role: data.role || 'user'
  };
};
\`\`\`

This component now supports **syntax highlighting** for code blocks!`,
		theme: "vitesse-dark",
	});

	await new Promise((resolve) => setTimeout(resolve, 1000));

	section("💻 CODEBLOCK COMPONENT");
	console.log(colors.dim("📁 Source: components/ui/codeblock.ts"));
	console.log();

	note({
		title: "Standalone Code Blocks",
		body: "Beautiful code blocks with syntax highlighting, filenames, and line numbers:",
	});

	console.log("🎨 Different styles and features:");

	// Basic code block
	await codeblock({
		code: `function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const message = greet("TUI Library");
console.log(message);`,
		language: "typescript",
		filename: "example.ts",
	});

	await new Promise((resolve) => setTimeout(resolve, 500));

	// Code block with line numbers
	await codeblock({
		code: `{
  "name": "tui-library", 
  "version": "1.0.0",
  "scripts": {
    "dev": "bun run showcase.ts",
    "build": "tsc"
  },
  "dependencies": {
    "@shikijs/cli": "^3.13.0"
  }
}`,
		language: "json",
		filename: "package.json",
		showLineNumbers: true,
	});

	await new Promise((resolve) => setTimeout(resolve, 500));

	// Python example
	await codeblock({
		code: `def fibonacci(n):
    """Generate fibonacci sequence up to n numbers."""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib

# Generate first 10 fibonacci numbers
result = fibonacci(10)
print(f"Fibonacci sequence: {result}")`,
		language: "python",
		filename: "fibonacci.py",
		showLineNumbers: true,
	});

	await new Promise((resolve) => setTimeout(resolve, 800));

	section("📊 TABLE COMPONENT");
	console.log(colors.dim("📁 Source: components/ui/table.ts"));
	console.log();

	note({
		title: "Tabular Data Display",
		body: "Perfect for displaying structured data with automatic column alignment and truncation:",
	});

	console.log("🗂️  Component Library Overview:");
	table({
		data: [
			// UI Components
			{
				Component: "intro/outro",
				Type: "UI",
				Category: "Layout",
				Description: "Welcome & farewell messages",
			},
			{
				Component: "note",
				Type: "UI",
				Category: "Content",
				Description: "Information blocks with icons",
			},
			{
				Component: "log (i/w/e/s)",
				Type: "UI",
				Category: "Feedback",
				Description: "Colored status messages",
			},
			{
				Component: "markdown",
				Type: "UI",
				Category: "Content",
				Description: "Rich text formatting",
			},
			{
				Component: "table",
				Type: "UI",
				Category: "Data",
				Description: "Structured data display",
			},
			{
				Component: "progress",
				Type: "UI",
				Category: "Feedback",
				Description: "Loading progress bars",
			},
			{
				Component: "spinner",
				Type: "UI",
				Category: "Feedback",
				Description: "Animated loading indicators",
			},
			{
				Component: "line/divider",
				Type: "UI",
				Category: "Layout",
				Description: "Visual separators",
			},
			// Prompts
			{
				Component: "text",
				Type: "Prompt",
				Category: "Input",
				Description: "Text input with validation",
			},
			{
				Component: "number",
				Type: "Prompt",
				Category: "Input",
				Description: "Numeric input with ranges",
			},
			{
				Component: "password",
				Type: "Prompt",
				Category: "Input",
				Description: "Hidden text input",
			},
			{
				Component: "confirm",
				Type: "Prompt",
				Category: "Choice",
				Description: "Yes/No confirmation",
			},
			{
				Component: "toggle",
				Type: "Prompt",
				Category: "Choice",
				Description: "Boolean switch",
			},
			{
				Component: "select",
				Type: "Prompt",
				Category: "Choice",
				Description: "Single selection",
			},
			{
				Component: "multiselect",
				Type: "Prompt",
				Category: "Choice",
				Description: "Multiple selection",
			},
			{
				Component: "fzf",
				Type: "Prompt",
				Category: "Choice",
				Description: "Fuzzy search selection",
			},
		],
		columns: [
			{ key: "Component", label: "Component", width: 15 },
			{ key: "Type", label: "Type", width: 8 },
			{ key: "Category", label: "Category", width: 10 },
			{ key: "Description", label: "Description", width: 25 },
		],
	});

	await new Promise((resolve) => setTimeout(resolve, 1500));

	section("📈 PROGRESS COMPONENT");
	console.log(colors.dim("📁 Source: components/ui/progress.ts"));
	console.log();

	note({
		title: "Progress Tracking",
		body: "Visual progress bars with customizable messages and completion states:",
	});

	console.log("🚀 Simulating file download...");
	const progressBar = progress();

	const tasks = [
		"Connecting to server...",
		"Downloading files...",
		"Extracting archive...",
		"Installing dependencies...",
		"Finalizing setup...",
	];

	for (let i = 0; i <= 100; i += 20) {
		const taskIndex = Math.floor(i / 20);
		progressBar.update({
			message: tasks[taskIndex] || "Complete!",
			current: i,
			total: 100,
		});
		await new Promise((resolve) => setTimeout(resolve, 400));
	}
	progressBar.stop();

	success("Download completed successfully!");

	await new Promise((resolve) => setTimeout(resolve, 500));

	section("⏳ SPINNER COMPONENT");
	console.log(colors.dim("📁 Source: components/ui/spinner.ts"));
	console.log();

	note({
		title: "Loading Indicators",
		body: "Animated spinners for indefinite loading states with dynamic messages:",
	});

	console.log("🔄 Processing operations...");
	const spin = spinner();

	const operations = [
		"Initializing system...",
		"Loading configuration...",
		"Connecting to database...",
		"Authenticating user...",
		"Preparing workspace...",
	];

	for (const operation of operations) {
		spin.start(operation);
		await new Promise((resolve) => setTimeout(resolve, 800));
	}

	spin.stop("All operations completed successfully!");

	section("💬 INTERACTIVE PROMPTS");
	console.log(colors.dim("📁 Source: components/prompts/*.ts"));
	console.log();

	note({
		title: "User Input Components",
		body: "Interactive prompts for gathering user input with validation, filtering, and rich UI:",
	});

	await markdown({
		content: `## 📝 Input Prompts
- **text()** - Single line text input with custom validation
- **number()** - Numeric input with min/max constraints  
- **password()** - Hidden text input for sensitive data

## ✅ Choice Prompts
- **confirm()** - Yes/No confirmation dialogs
- **toggle()** - Boolean switch with custom labels
- **select()** - Single choice from option list
- **multiselect()** - Multiple selections with requirements
- **fzf()** - Fuzzy search selection with filtering

### Example Usage:
\`\`\`typescript
const name = await text({ 
  message: "What's your name?",
  validate: value => value.length > 0 || "Name is required"
});

const age = await number({
  message: "Enter your age:",
  min: 13,
  max: 120
});

const confirmed = await confirm({
  message: "Continue with installation?",
  initialValue: true
});
\`\`\`

${colors.warning("⚠️  Note:")} Prompts require user interaction - this demo shows API usage only.`,
	});

	await new Promise((resolve) => setTimeout(resolve, 1000));

	section("🔔 TOAST NOTIFICATIONS");
	console.log(colors.dim("📁 Source: components/ui/toast.ts"));
	console.log();

	note({
		title: "Toast Notifications Demo",
		body: "Temporary notification messages with auto-dismiss:",
	});

	console.log("Showing different toast types:");
	toast({ message: "Info notification", type: "info", autoDismiss: false });
	await new Promise((resolve) => setTimeout(resolve, 500));
	toast({
		message: "Success notification",
		type: "success",
		autoDismiss: false,
	});
	await new Promise((resolve) => setTimeout(resolve, 500));
	toast({
		message: "Warning notification",
		type: "warning",
		autoDismiss: false,
	});
	await new Promise((resolve) => setTimeout(resolve, 500));
	toast({ message: "Error notification", type: "error", autoDismiss: false });

	await new Promise((resolve) => setTimeout(resolve, 1000));

	section("🎭 BANNER COMPONENT");
	console.log(colors.dim("📁 Source: components/ui/banner.ts"));
	console.log();

	note({
		title: "Decorative Banners",
		body: "Eye-catching headers and sections with various border styles:",
	});

	console.log("Different banner styles:");
	banner({ text: "Simple Banner", style: "simple", color: colors.info });
	banner({ text: "Bordered Banner", style: "bordered", color: colors.success });
	banner({
		text: "Double Line Banner",
		style: "double",
		color: colors.primary,
	});
	banner({ text: "Rounded Banner", style: "rounded", color: colors.warning });

	await new Promise((resolve) => setTimeout(resolve, 1000));

	section("📦 PANEL COMPONENT");
	console.log(colors.dim("📁 Source: components/ui/panel.ts"));
	console.log();

	note({
		title: "Content Panels",
		body: "Boxed content areas perfect for highlighting important information:",
	});

	panel({
		title: "System Information",
		content: `Operating System: ${process.platform}
Node Version: ${process.version}
Architecture: ${process.arch}
Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
		border: "double",
		titleColor: colors.primary,
		borderColor: colors.success,
	});

	await new Promise((resolve) => setTimeout(resolve, 800));

	section("🌳 TREE COMPONENT");
	console.log(colors.dim("📁 Source: components/ui/tree.ts"));
	console.log();

	note({
		title: "Tree Structure Display",
		body: "Perfect for showing file systems, hierarchies, and nested data:",
	});

	tree({
		data: [
			{
				name: "src",
				type: "folder",
				children: [
					{
						name: "components",
						type: "folder",
						children: [
							{
								name: "ui",
								type: "folder",
								children: [
									{ name: "intro.ts", type: "file", meta: { size: "1.2KB" } },
									{ name: "note.ts", type: "file", meta: { size: "800B" } },
									{ name: "table.ts", type: "file", meta: { size: "2.1KB" } },
								],
							},
							{
								name: "prompts",
								type: "folder",
								children: [
									{ name: "text.ts", type: "file", meta: { size: "1.8KB" } },
									{ name: "select.ts", type: "file", meta: { size: "2.5KB" } },
								],
							},
						],
					},
					{ name: "index.ts", type: "file", meta: { size: "1.5KB" } },
				],
			},
			{ name: "package.json", type: "file", meta: { size: "892B" } },
			{ name: "README.md", type: "file", meta: { size: "3.2KB" } },
		],
		showMeta: true,
	});

	await new Promise((resolve) => setTimeout(resolve, 1200));

	section("💬 CHAT COMPONENT");
	console.log(colors.dim("📁 Source: components/ui/chat.ts"));
	console.log();

	note({
		title: "Interactive Chat Interface",
		body: "Full-featured chat with @ mentions, markdown support, and real-time messaging:",
	});

	console.log("🎯 Key Features:");
	console.log(`  ${colors.success("✓")} @ mention system with fuzzy search`);
	console.log(`  ${colors.success("✓")} Markdown rendering in messages`);
	console.log(`  ${colors.success("✓")} User avatars and roles`);
	console.log(`  ${colors.success("✓")} Timestamp display`);
	console.log(`  ${colors.success("✓")} Message history management`);
	console.log();

	console.log("Demo conversation:");
	chatDemo();

	await markdown({
		content: `### 💡 Usage Example:
\`\`\`typescript
const users: ChatUser[] = [
  { id: "alice", name: "Alice", avatar: "👩‍💻", role: "Developer" },
  { id: "bob", name: "Bob", avatar: "👨‍🎨", role: "Designer" }
];

const chatInstance = new Chat({
  title: "Team Chat",
  currentUser: users[0],
  users: users,
  enableMarkdown: true
});

await chatInstance.start(); // Interactive chat begins
\`\`\`

**Interactive Features:**
- Type \`@\` to trigger user search and selection
- Use **bold**, *italic*, and \`code\` markdown
- Real-time message rendering with user avatars
- Message history with timestamps`,
	});

	await new Promise((resolve) => setTimeout(resolve, 1500));

	section("📏 LINE COMPONENTS");
	console.log(colors.dim("📁 Source: components/ui/line.ts"));
	console.log();

	note({
		title: "Visual Separators",
		body: "Components for creating visual breaks and sections in your CLI:",
	});

	console.log("Available line types:");
	console.log();
	console.log(colors.dim("• line() - Basic horizontal line:"));
	line({ title: "🌟 Beautiful Section Title" });

	console.log();
	console.log(
		colors.dim(
			"• section() - Styled section separator (used throughout this demo)",
		),
	);
	console.log(
		colors.dim("• divider() - Simple divider (also used throughout this demo)"),
	);

	await new Promise((resolve) => setTimeout(resolve, 800));
	console.log();

	section("🎯 SHOWCASE COMPLETE");

	note({
		title: "Demo Summary",
		body: "You've just seen every single component in the TUI library in action!",
	});

	await markdown({
		content: `# 🎉 TUI Library Complete Reference

Thank you for exploring the TUI library! This showcase demonstrated **${colors.primary("30+ components")}** and **${colors.primary("20+ utilities")}** available for building beautiful CLI applications.

## 📦 What You've Seen:

### 🎨 UI Components (13 total)
- \`intro/outro\` - Welcome & farewell messages with styling
- \`note\` - Information blocks with icons and formatting  
- \`info/warn/error/success\` - Colored status messages with symbols
- \`markdown\` - Rich text rendering with **syntax highlighting** support
- \`codeblock\` - Standalone code blocks with filenames and line numbers
- \`table\` - Structured data display with auto-sizing
- \`progress\` - Animated progress bars with custom messages
- \`spinner\` - Loading indicators with dynamic text
- \`line/section/divider\` - Visual separators and section headers
- \`toast\` - Notification messages with auto-dismiss
- \`banner\` - Decorative headers with multiple border styles
- \`panel\` - Boxed content areas with titles
- \`tree\` - Hierarchical data display (files, folders, etc.)
- \`chat\` - Interactive chat with @ mentions and markdown

### 💬 Interactive Prompts (11 total)  
- \`text\` - Validated text input
- \`number\` - Numeric input with constraints
- \`password\` - Hidden sensitive input
- \`confirm\` - Yes/No confirmations
- \`toggle\` - Boolean switches
- \`select\` - Single-choice menus
- \`multiselect\` - Multiple-choice selections
- \`fzf\` - Fuzzy search selection
- \`autocomplete\` - Text input with suggestions
- \`slider\` - Range slider for numeric values
- \`file\` - File/directory browser

### 🛠️ Core Utilities & Constants
- **Colors** (7): primary, success, error, warning, info, dim, bold
- **Symbols** (15+): checkmarks, crosses, spinners, boxes, arrows
- **Keys** (10+): navigation, actions, control combinations
- **Helpers** (10+): validation, formatting, data manipulation

## 🚀 Next Steps:
- Check the individual component files in \`components/\`
- See \`examples.ts\` for interactive demos
- Read the documentation for detailed usage
- Start building your own CLI applications!

${colors.success("Happy coding! ✨")}`,
	});

	await new Promise((resolve) => setTimeout(resolve, 1000));

	outro(
		"🎊 Showcase complete! Thanks for exploring the TUI library - now go build something amazing!",
	);
}

runComprehensiveShowcase().catch(console.error);
