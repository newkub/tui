import { password as clackPassword } from "@clack/prompts";
import type { PasswordOptions } from "@/components/prompts/base";
import pc from "picocolors";

export async function password(options: PasswordOptions): Promise<string> {
  let password = '';
  let confirmPassword = '';
  
  if (options.strengthMeter) {
    const showStrength = (pwd: string) => {
      const strength = Math.min(10, pwd.length * 2);
      return pc.gradient(['red', 'orange', 'yellow', 'green'])(
        '█'.repeat(strength) + '░'.repeat(10 - strength)
      );
    };
    
    password = await clackPassword({
      message: `${options.message} ${options.strengthMeter ? showStrength('') : ''}`,
      mask: "•",
      validate: (value) => {
        if (options.minLength && value.length < options.minLength) {
          return `Password must be at least ${options.minLength} characters`;
        }
      }
    }) as string;
    
    if (options.confirm) {
      confirmPassword = await clackPassword({
        message: "Confirm password",
        mask: "•",
        validate: (value) => {
          if (value !== password) {
            return "Passwords do not match";
          }
        }
      }) as string;
    }
  } else {
    password = await clackPassword({
      message: options.message,
      mask: "•",
    }) as string;
  }
  
  return password;
}
