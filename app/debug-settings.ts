import { enableDebugModes, disableDebugModes } from '@/lib/utils/debug';

// Set this to true to enable debugging
const DEBUG_ENABLED = true;

// Initial debug configuration
if (DEBUG_ENABLED) {
  // Enable all debug modes by default in development
  enableDebugModes('api', 'socket', 'ui', 'state');
  
  // Alternatively, enable only specific modes:
  // enableDebugModes('api', 'socket');
  
  console.log('%c🛠️ DEBUG MODE ENABLED', 'color: white; background: purple; font-size: 14px; padding: 4px 8px; border-radius: 4px;');
} else {
  // Disable all debug modes
  disableDebugModes('api', 'socket', 'ui', 'state', 'all');
}

export default DEBUG_ENABLED; 