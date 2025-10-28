import * as components from "@/components";
import pc from "picocolors";

export async function main() {
  console.log(pc.bold(pc.blue("=== Welcome to TUI FZF ===")));

  // ข้อมูลทั้งหมดที่สามารถค้นหาได้
  const allItems = [
    { type: "display", name: "Text", component: components.Text },
    { type: "display", name: "CodeBlock", component: components.CodeBlock },
    { type: "display", name: "Box", component: components.Box },
    { type: "display", name: "ProgressBar", component: components.ProgressBar },
    { type: "display", name: "Spinner", component: components.Spinner },
    { type: "display", name: "Table", component: components.Table },
    { type: "display", name: "Divider", component: components.Divider },
    { type: "display", name: "Status", component: components.Status },
    { type: "prompt", name: "confirm", component: components.confirm },
    { type: "prompt", name: "multiselect", component: components.multiselect },
    { type: "prompt", name: "number", component: components.number },
    { type: "prompt", name: "password", component: components.password },
    { type: "prompt", name: "select", component: components.select },
    { type: "prompt", name: "text", component: components.text },
    { type: "prompt", name: "AutocompletePrompt", component: components.AutocompletePrompt },
  ];

  // Interactive fuzzy search
  const selectedItem = await components.AutocompletePrompt({
    message: pc.green("Search component (type to filter):"),
    options: allItems.map(item => ({
      value: item,
      label: `${item.type === 'display' ? pc.blue('Display') : pc.magenta('Prompt')}: ${item.name}`
    })),
    limit: 10,
    fuzzy: true,
    searchable: true,
    matchOnStart: false,
    highlight: true,
    keys: {
      up: ['up', 'ctrl+k'],
      down: ['down', 'ctrl+j'],
      submit: ['enter', 'right'],
      abort: ['escape', 'left']
    },
    onInput: (input, choices) => {
      console.log(pc.dim(`Found ${choices.length} matches`));
    }
  });

  console.log(pc.bold(`\nYou selected: ${pc.cyan(selectedItem.name)}\n`));

  // เรียกใช้งาน component ที่เลือก
  if (selectedItem.type === 'display') {
    console.log(pc.bold(pc.blue("\n=== Display Components ===")));
    console.log("Available display components:");
    console.log("- Text");
    console.log("- CodeBlock");
    console.log("- Box");
    console.log("- ProgressBar");
    console.log("- Spinner");
    console.log("- Table");
    console.log("- Divider");
    console.log("- Status");
  } else {
    console.log(pc.bold(pc.blue("\n=== Prompt Components ===")));
    console.log("Available prompt components:");
    console.log("- confirm");
    console.log("- multiselect");
    console.log("- number");
    console.log("- password");
    console.log("- select");
    console.log("- text");
    console.log("- AutocompletePrompt");
  }

  // Get user input
  const name = await components.text({
    message: pc.green("What is your name?"),
  });

  const age = await components.number({
    message: pc.green("How old are you?"),
    min: 0,
    max: 120,
  });

  const color = await components.select({
    message: pc.green("Choose your favorite color"),
    options: [
      { value: "red", label: pc.red("Red") },
      { value: "blue", label: pc.blue("Blue") },
      { value: "green", label: pc.green("Green") },
    ],
  });

  // Interactive search example
  const fruits = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
    { value: "durian", label: "Durian" },
    { value: "elderberry", label: "Elderberry" },
  ];

  const selectedFruit = await components.AutocompletePrompt({
    message: pc.green("Search for a fruit (type to filter):"),
    options: fruits,
    limit: 5,
  });

  console.log(pc.bold(`\nYou selected: ${pc.cyan(selectedFruit)}\n`));

  // Display summary
  console.log(pc.bold(`\nHello ${pc.cyan(name)}!`));
  console.log(pc.bold(`You are ${pc.yellow(age)} years old`));
  console.log(pc.bold(`Your favorite color is ${pc[color](color)}\n`));
}

main().catch(console.error);
