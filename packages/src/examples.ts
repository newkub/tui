#!/usr/bin/env bun

import { 
  // Core utilities
  colors, 
  KEYS, 
  SYMBOLS, 
  DEFAULTS, 
  VALIDATION,
  isValidEmail,
  clamp,
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
  
  // Prompts
  confirm, 
  multiselect, 
  number, 
  password, 
  select, 
  text, 
  toggle,
  fzf,
  
  // Utilities
  isCancel 
} from "./index";

async function runComprehensiveDemo() {
  // Intro
  intro({ title: "TUI Comprehensive Demo", tagLine: "Showcasing all components in the library" });
  
  // Note
  note({ title: "Welcome!", body: "This demo will showcase all available TUI components." });
  
  // Info, warning, error, success logs
  info("This is an info message");
  warn("This is a warning message");
  error("This is an error message");
  success("This is a success message");
  
  console.log(); // Empty line
  
  // Colors demo
  console.log("Colors demo:");
  console.log(colors.primary("Primary color"));
  console.log(colors.success("Success color"));
  console.log(colors.error("Error color"));
  console.log(colors.warning("Warning color"));
  console.log(colors.info("Info color"));
  console.log(colors.dim("Dim color"));
  console.log(colors.bold("Bold text"));
  
  console.log(); // Empty line
  
  // Symbols demo
  console.log("Symbols demo:");
  console.log(`${SYMBOLS.CHECKMARK} Checkmark`);
  console.log(`${SYMBOLS.CROSS} Cross`);
  console.log(`${SYMBOLS.WARNING} Warning`);
  console.log(`${SYMBOLS.INFO} Info`);
  
  console.log(); // Empty line
  
  // Utils demo
  console.log("Utils demo:");
  console.log(`Valid email test@example.com: ${isValidEmail("test@example.com")}`);
  console.log(`Valid email invalid-email: ${isValidEmail("invalid-email")}`);
  console.log(`Clamp 15 between 10-20: ${clamp(15, 10, 20)}`);
  console.log(`Clamp 5 between 10-20: ${clamp(5, 10, 20)}`);
  console.log(`Format 1024 bytes: ${formatBytes(1024)}`);
  console.log(`Format 5000ms: ${formatDuration(5000)}`);
  
  console.log(); // Empty line
  
  // Markdown demo
  markdown({
    content: `
# Markdown Component
## Features

This component supports:
- **Bold text**
- *Italic text*
- \`Inline code\`
- Headers and lists

Pretty useful for documentation!
`
  });
  
  // Table demo
  table({
    data: [
      { Name: "John", Age: 30, City: "New York" },
      { Name: "Jane", Age: 25, City: "San Francisco" },
      { Name: "Bob", Age: 35, City: "Chicago" },
    ],
    columns: [
      { key: "Name", label: "Name", width: 10 },
      { key: "Age", label: "Age", width: 5 },
      { key: "City", label: "City", width: 15 }
    ]
  });
  
  // Progress demo
  console.log("Progress demo:");
  const progressBar = progress();
  for (let i = 0; i <= 100; i += 10) {
    progressBar.update({ message: "Loading...", current: i, total: 100 });
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  progressBar.stop();
  
  // Spinner demo
  console.log("Spinner demo:");
  const spin = spinner();
  spin.start("Processing...");
  await new Promise(resolve => setTimeout(resolve, 3000));
  spin.stop("Processing complete!");
  
  // Text prompt demo
  const userName = await text({
    message: "What's your name?",
    placeholder: "Enter your name",
    validate: (value) => {
      if (value.length < 2) return "Name must be at least 2 characters";
      return true;
    }
  });
  
  if (isCancel(userName)) {
    outro("Demo cancelled. Goodbye!");
    return;
  }
  
  // Number prompt demo
  const age = await number({
    message: "How old are you?",
    min: 1,
    max: 120,
    placeholder: "Enter your age"
  });
  
  if (isCancel(age)) {
    outro("Demo cancelled. Goodbye!");
    return;
  }
  
  // Password prompt demo
  const secret = await password({
    message: "Enter a secret password:",
    placeholder: "Password hidden",
    validate: (value) => {
      if (value.length < 6) return "Password must be at least 6 characters";
      return true;
    }
  });
  
  if (isCancel(secret)) {
    outro("Demo cancelled. Goodbye!");
    return;
  }
  
  // Confirm prompt demo
  const confirmed = await confirm({
    message: "Do you want to continue?",
    initialValue: true
  });
  
  if (isCancel(confirmed)) {
    outro("Demo cancelled. Goodbye!");
    return;
  }
  
  // Toggle prompt demo
  const enabled = await toggle({
    message: "Enable notifications?",
    active: "Yes",
    inactive: "No",
    defaultValue: true
  });
  
  if (isCancel(enabled)) {
    outro("Demo cancelled. Goodbye!");
    return;
  }
  
  // Select prompt demo
  const choice = await select({
    message: "Choose a programming language:",
    options: [
      { label: "JavaScript", value: "js" },
      { label: "TypeScript", value: "ts" },
      { label: "Python", value: "py" },
      { label: "Go", value: "go" },
    ],
    initialValue: "ts"
  });
  
  if (isCancel(choice)) {
    outro("Demo cancelled. Goodbye!");
    return;
  }
  
  // Multiselect prompt demo
  const frameworks = await multiselect({
    message: "Select your favorite frameworks:",
    options: [
      { label: "React", value: "react" },
      { label: "Vue", value: "vue" },
      { label: "Angular", value: "angular" },
      { label: "Svelte", value: "svelte" },
    ],
    initialValues: ["react"],
    required: true
  });
  
  if (isCancel(frameworks)) {
    outro("Demo cancelled. Goodbye!");
    return;
  }
  
  // FZF prompt demo
  const tools = await fzf({
    message: "Search for a tool:",
    options: [
      { label: "Git", value: "git", hint: "Version control" },
      { label: "Docker", value: "docker", hint: "Containerization" },
      { label: "Kubernetes", value: "k8s", hint: "Container orchestration" },
      { label: "Bun", value: "bun", hint: "JavaScript runtime" },
      { label: "Node.js", value: "node", hint: "JavaScript runtime" },
      { label: "Vite", value: "vite", hint: "Build tool" },
      { label: "Webpack", value: "webpack", hint: "Module bundler" },
    ],
    placeholder: "Type to search..."
  });
  
  if (isCancel(tools)) {
    outro("Demo cancelled. Goodbye!");
    return;
  }
  
  // Summary
  console.log();
  markdown({
    content: `
# Demo Summary

Thank you ${String(userName)} for trying out the TUI library!

## Your responses:
- **Age**: ${age}
- **Secret password**: ${"*".repeat(String(secret).length)} (hidden for security)
- **Confirmed**: ${confirmed ? "Yes" : "No"}
- **Notifications**: ${enabled ? "Enabled" : "Disabled"}
- **Language**: ${choice}
- **Frameworks**: ${frameworks.join(", ")}
- **Tool**: ${tools}

We hope you enjoyed this comprehensive demo of all TUI components!
`
  });
  
  outro("Demo completed successfully! Thanks for trying out TUI.");
}

runComprehensiveDemo().catch(console.error);