import { passwordPrompt } from "./input";
import pc from "picocolors";
import { inputConfig } from "@/config/input.config";

export async function password(options: {
  message: string;
  minLength?: number;
  confirm?: boolean;
  strengthMeter?: boolean;
}): Promise<string> {
  let password = '';
  let confirmPassword = '';
  
  if (options.strengthMeter) {
    const showStrength = (pwd: string) => {
      const strength = Math.min(10, pwd.length * 2);
      return pc.gradient(['red', 'orange', 'yellow', 'green'])(
        '█'.repeat(strength) + '░'.repeat(10 - strength)
      );
    };
    
    password = await passwordPrompt({
      message: `${options.message} ${options.strengthMeter ? showStrength('') : ''}`,
      validate: (value) => {
        if (options.minLength && value.length < options.minLength) {
          return `Password must be at least ${options.minLength} characters`;
        }
      }
    });
    
    if (options.confirm) {
      confirmPassword = await passwordPrompt({
        message: "Confirm password",
        validate: (value) => {
          if (value !== password) {
            return "Passwords do not match";
          }
        }
      });
    }
  } else {
    password = await passwordPrompt({
      message: options.message
    });
  }
  
  return password;
}
