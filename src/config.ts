import pc from "picocolors";

export const defaultConfig = {
  box: {
    border: true,
    padding: 1,
    width: 50,
  },
  codeblock: {
    showLineNumbers: false,
    highlightLines: [],
  },
  progress: {
    width: 20,
    color: "cyan",
    showPercentage: true,
    labelPosition: "right",
    animated: false,
  },
  spinner: {
    size: "md",
    color: "cyan",
    speed: "normal",
  },
  table: {
    headerColor: "cyan",
    borderColor: "gray",
  },
  text: {
    color: "white",
    bold: false,
    italic: false,
    underline: false,
    align: "left",
    wrap: true,
  },
  confirm: {
    initialValue: true,
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  },
  autocomplete: {
    initialValue: "",
    placeholder: "Type to filter options"
  }
} as {
  box: {
    border: boolean;
    padding: number;
    width: number;
  };
  codeblock: {
    showLineNumbers: boolean;
    highlightLines: number[];
  };
  progress: {
    width: number;
    color: string;
    showPercentage: boolean;
    labelPosition: string;
    animated: boolean;
  };
  spinner: {
    size: string;
    color: string;
    speed: string;
  };
  table: {
    headerColor: string;
    borderColor: string;
  };
  text: {
    color: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    align: string;
    wrap: boolean;
  };
  confirm: ConfirmPromptOptions;
  autocomplete: AutocompleteOptions;
};