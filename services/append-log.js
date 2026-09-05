/**
 * Append-Only Log Storage Service
 * Progressive writes with durability guarantees
 * Supports compaction and crash recovery
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const LOGS_DIR = path.join(DATA_DIR, 'logs');

// Operation types
export const OpType = {
    SET: 'SET',
    DELETE: 'DELETE',
    CHECKPOINT: 'CHECKPOINT'
};

/**
 * Ensure directories exist
 */
async function ensureDirectories() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
    try {
        await fs.access(LOGS_DIR);
    } catch {
        await fs.mkdir(LOGS_DIR, { recursive: true });
    }
}

/**
 * Append log entry to file with safe serialization
 * Uses atomic append operations
 * @param {string} logName - Name of the log file
 * @param {Object} entry - Log entry to append
 */
export async function appendLogEntry(logName, entry) {
    await ensureDirectories();
    
    const logPath = path.join(LOGS_DIR, `${logName}.log`);
    const logEntry = {
        timestamp: new Date().toISOString(),
        ...entry
    };
    
    // Convert to single-line JSON for append-only format
    const logLine = JSON.stringify(logEntry) + '\n';
    
    // Use append mode with fsync for durability
    // The 'a' flag ensures atomic append operations
    // Open file, write, fsync, and close for durability
    const fd = fsSync.openSync(logPath, 'a');
    try {
        fsSync.writeSync(fd, logLine, null, 'utf8');
        fsSync.fsyncSync(fd);
    } finally {
        fsSync.closeSync(fd);
    }
}

/**
 * Read all log entries from a file
 * @param {string} logName - Name of the log file
 * @returns {Promise<Array>} Array of log entries
 */
export async function readLogEntries(logName) {
    const logPath = path.join(LOGS_DIR, `${logName}.log`);
    
    try {
        const content = await fs.readFile(logPath, 'utf8');
        const lines = content.trim().split('\n').filter(line => line.length > 0);
        return lines.map(line => JSON.parse(line));
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

/**
 * Rebuild current state from log entries
 * Applies SET and DELETE operations in order
 * @param {string} logName - Name of the log file
 * @returns {Promise<Object>} Current state
 */
export async function rebuildStateFromLog(logName) {
    const entries = await readLogEntries(logName);
    const state = {};
    
    for (const entry of entries) {
        if (entry.op === OpType.SET) {
            if (entry.key) {
                state[entry.key] = entry.value;
            } else if (entry.data) {
                // For full data replacement (like tokens)
                Object.assign(state, entry.data);
            }
        } else if (entry.op === OpType.DELETE) {
            delete state[entry.key];
        } else if (entry.op === OpType.CHECKPOINT) {
            // Checkpoint contains full state snapshot
            Object.assign(state, entry.state);
        }
    }
    
    return state;
}

/**
 * Compact log file by creating a checkpoint
 * Reduces log size by merging all operations into current state
 * @param {string} logName - Name of the log file
 */
export async function compactLog(logName) {
    await ensureDirectories();
    
    // Rebuild current state
    const currentState = await rebuildStateFromLog(logName);
    
    // Create checkpoint entry
    const checkpoint = {
        op: OpType.CHECKPOINT,
        state: currentState,
        compactedAt: new Date().toISOString()
    };
    
    // Create new log file with just the checkpoint
    const logPath = path.join(LOGS_DIR, `${logName}.log`);
    const backupPath = path.join(LOGS_DIR, `${logName}.log.backup.${Date.now()}`);
    
    // Backup old log
    try {
        await fs.copyFile(logPath, backupPath);
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }
    
    // Write new compacted log
    const logLine = JSON.stringify(checkpoint) + '\n';
    await fs.writeFile(logPath, logLine, 'utf8');
    
    // Clean up old backup files (keep only last 3)
    const files = await fs.readdir(LOGS_DIR);
    const backupFiles = files
        .filter(f => f.startsWith(`${logName}.log.backup.`))
        .sort()
        .reverse();
    
    for (let i = 3; i < backupFiles.length; i++) {
        await fs.unlink(path.join(LOGS_DIR, backupFiles[i]));
    }
}

/**
 * Get log file size in bytes
 * @param {string} logName - Name of the log file
 * @returns {Promise<number>} File size in bytes
 */
export async function getLogSize(logName) {
    const logPath = path.join(LOGS_DIR, `${logName}.log`);
    
    try {
        const stats = await fs.stat(logPath);
        return stats.size;
    } catch (error) {
        if (error.code === 'ENOENT') {
            return 0;
        }
        throw error;
    }
}

/**
 * Check if log needs compaction based on size threshold
 * @param {string} logName - Name of the log file
 * @param {number} threshold - Size threshold in bytes (default 1MB)
 * @returns {Promise<boolean>} True if compaction needed
 */
export async function needsCompaction(logName, threshold = 1024 * 1024) {
    const size = await getLogSize(logName);
    return size > threshold;
}

/**
 * Background compaction scheduler
 * Periodically checks and compacts logs that exceed threshold
 */
export class CompactionScheduler {
    constructor(intervalMs = 3600000) { // Default 1 hour
        this.intervalMs = intervalMs;
        this.intervalId = null;
        this.isRunning = false;
    }
    
    /**
     * Start the scheduler
     * @param {Array<string>} logNames - Names of logs to monitor
     */
    start(logNames = ['players', 'tokens', 'game_state', 'ignored_contracts']) {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.intervalId = setInterval(async () => {
            for (const logName of logNames) {
                try {
                    if (await needsCompaction(logName)) {
                        console.log(`🗜️ Compacting ${logName} log...`);
                        await compactLog(logName);
                        console.log(`✅ Compacted ${logName} log`);
                    }
                } catch (error) {
                    console.error(`❌ Error compacting ${logName}:`, error);
                }
            }
        }, this.intervalMs);
        
        console.log(`✅ Compaction scheduler started (interval: ${this.intervalMs}ms)`);
    }
    
    /**
     * Stop the scheduler
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('⏹️ Compaction scheduler stopped');
    }
}
