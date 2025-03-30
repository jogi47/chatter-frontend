/**
 * Utility for debugging in development
 * 
 * Provides consistent logging with prefixes, colors, and control
 * through environment variables
 */

// Check if we're in development mode
const isDev = process.env.NODE_ENV === 'development';

// Define debug modes that can be enabled
export type DebugMode = 'api' | 'socket' | 'ui' | 'state' | 'all';

// Define log levels
export type LogLevel = 'log' | 'info' | 'warn' | 'error';

// Object to hold enabled debug modes
const enabledModes: Record<DebugMode, boolean> = {
  api: isDev,
  socket: isDev,
  ui: isDev,
  state: isDev,
  all: isDev,
};

// Colors for different debug modes
const colors: Record<DebugMode, string> = {
  api: '#3498db',      // Blue
  socket: '#9b59b6',   // Purple
  ui: '#2ecc71',       // Green
  state: '#e67e22',    // Orange
  all: '#7f8c8d',      // Gray
};

/**
 * Debug logger function
 * 
 * @param mode - The debug mode (api, socket, ui, state, all)
 * @param level - Log level (log, info, warn, error)
 * @param args - Arguments to log
 */
export function debug(mode: DebugMode, level: LogLevel = 'log', ...args: any[]) {
  // Skip if not in development or the mode is not enabled
  if (!isDev || !enabledModes[mode]) return;
  
  // Prepare the prefix
  const prefix = `%c[${mode.toUpperCase()}]`;
  const style = `color: ${colors[mode]}; font-weight: bold;`;
  
  // Log with appropriate level
  switch (level) {
    case 'info':
      console.info(prefix, style, ...args);
      break;
    case 'warn':
      console.warn(prefix, style, ...args);
      break;
    case 'error':
      console.error(prefix, style, ...args);
      break;
    default:
      console.log(prefix, style, ...args);
  }
}

/**
 * Enable specific debug modes
 * 
 * @param modes - The debug modes to enable
 */
export function enableDebugModes(...modes: DebugMode[]) {
  modes.forEach(mode => {
    enabledModes[mode] = true;
  });
}

/**
 * Disable specific debug modes
 * 
 * @param modes - The debug modes to disable
 */
export function disableDebugModes(...modes: DebugMode[]) {
  modes.forEach(mode => {
    enabledModes[mode] = false;
  });
}

// Create convenience functions for each mode
export const debugApi = (...args: any[]) => debug('api', 'log', ...args);
export const debugSocket = (...args: any[]) => debug('socket', 'log', ...args);
export const debugUi = (...args: any[]) => debug('ui', 'log', ...args);
export const debugState = (...args: any[]) => debug('state', 'log', ...args);

// Create a debug time measuring function
export function debugTime(mode: DebugMode, label: string) {
  if (!isDev || !enabledModes[mode]) return { end: () => {} };
  
  const timeLabel = `[${mode.toUpperCase()}] ${label}`;
  console.time(timeLabel);
  
  return {
    end: () => console.timeEnd(timeLabel)
  };
} 