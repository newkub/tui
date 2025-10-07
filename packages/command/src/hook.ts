/**
 * Hook system for TUI Command CLI framework (Functional Programming style)
 */

import { Effect } from "effect";
import type {
  HookType,
  HookHandler,
  HookContext,
  CommandContext
} from "./types.js";

/**
 * Create a hook context
 */
export const createHookContext = (
  command?: CommandContext,
  options: Record<string, any> = {},
  args: any[] = [],
  result?: any
): HookContext => ({
  command,
  options,
  args,
  result
});

/**
 * Execute a hook with context
 */
export const executeHook = (handler: HookHandler) =>
  (context: HookContext): Effect.Effect<any, Error, never> => {
    return Effect.gen(function* (_) {
      try {
        const result = yield* _(Effect.promise(() =>
          Promise.resolve(handler(context))
        ));
        return result;
      } catch (error) {
        return yield* _(Effect.fail(new Error(`Hook execution failed: ${error}`)));
      }
    });
  };

/**
 * Create a hook handler that runs before command initialization
 */
export const createPreInitHook = (handler: (context: HookContext) => any): HookHandler => {
  return (context: HookContext) => {
    console.log('Running pre-init hook');
    return handler(context);
  };
};

/**
 * Create a hook handler that runs after command initialization
 */
export const createPostInitHook = (handler: (context: HookContext) => any): HookHandler => {
  return (context: HookContext) => {
    console.log('Running post-init hook');
    return handler(context);
  };
};

/**
 * Create a hook handler that runs before parsing
 */
export const createPreParseHook = (handler: (context: HookContext) => any): HookHandler => {
  return (context: HookContext) => {
    console.log('Running pre-parse hook');
    return handler(context);
  };
};

/**
 * Create a hook handler that runs after parsing
 */
export const createPostParseHook = (handler: (context: HookContext) => any): HookHandler => {
  return (context: HookContext) => {
    console.log('Running post-parse hook');
    return handler(context);
  };
};

/**
 * Create a hook handler that runs before action execution
 */
export const createPreActionHook = (handler: (context: HookContext) => any): HookHandler => {
  return (context: HookContext) => {
    console.log('Running pre-action hook');
    return handler(context);
  };
};

/**
 * Create a hook handler that runs after action execution
 */
export const createPostActionHook = (handler: (context: HookContext) => any): HookHandler => {
  return (context: HookContext) => {
    console.log('Running post-action hook');
    return handler(context);
  };
};

/**
 * Create a hook handler that runs before help generation
 */
export const createPreHelpHook = (handler: (context: HookContext) => any): HookHandler => {
  return (context: HookContext) => {
    console.log('Running pre-help hook');
    return handler(context);
  };
};

/**
 * Create a hook handler that runs after help generation
 */
export const createPostHelpHook = (handler: (context: HookContext) => any): HookHandler => {
  return (context: HookContext) => {
    console.log('Running post-help hook');
    return handler(context);
  };
};

/**
 * Create a hook handler that runs on error
 */
export const createErrorHook = (handler: (context: HookContext & { error: Error }) => any): HookHandler => {
  return (context: HookContext) => {
    console.log('Running error hook');
    return handler(context as HookContext & { error: Error });
  };
};

/**
 * Hook execution pipeline
 */
export const createHookPipeline = (hooks: HookHandler[]) =>
  (context: HookContext): Effect.Effect<void, Error, never> => {
    return Effect.gen(function* (_) {
      for (const hook of hooks) {
        yield* _(executeHook(hook)(context));
      }
    });
  };

/**
 * Conditional hook execution
 */
export const createConditionalHook = (condition: (context: HookContext) => boolean) =>
  (handler: HookHandler): HookHandler => {
    return (context: HookContext) => {
      if (condition(context)) {
        return handler(context);
      }
      return undefined;
    };
  };

/**
 * Hook composition utilities
 */
export const composeHooks = (...hooks: HookHandler[]): HookHandler => {
  return (context: HookContext) => {
    return hooks.reduce((acc, hook) => {
      const result = hook(context);
      return result !== undefined ? result : acc;
    }, undefined);
  };
};

/**
 * Hook timing utilities
 */
export const withTimeout = (timeoutMs: number) =>
  (handler: HookHandler): HookHandler => {
    return async (context: HookContext) => {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Hook timeout')), timeoutMs)
      );

      return Promise.race([
        Promise.resolve(handler(context)),
        timeoutPromise
      ]);
    };
  };

/**
 * Retry hook execution
 */
export const withRetry = (maxRetries: number) =>
  (handler: HookHandler): HookHandler => {
    return async (context: HookContext) => {
      let lastError: Error;

      for (let i = 0; i <= maxRetries; i++) {
        try {
          return await Promise.resolve(handler(context));
        } catch (error) {
          lastError = error as Error;
          if (i < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
          }
        }
      }

      throw lastError!;
    };
  };
