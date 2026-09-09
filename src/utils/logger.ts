// ==========================================
// src/utils/logger.ts  -- DEFAULT EXPORT
// ==========================================
// A file may have ONE default export. Use it when the file has a single,
// obvious main thing (a class, a component, a config object).

export default class Logger {
    constructor(private readonly prefix: string) {}

    log(message: string): void {
        console.log(`[${this.prefix}] ${message}`);
    }
}

// A file can mix both: one default + any number of named exports.
export type LogLevel = "info" | "warn" | "error";
