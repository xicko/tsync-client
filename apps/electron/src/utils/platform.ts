type OS = 'macos' | 'windows' | 'linux' | 'unknown';

function getOS(): OS {
  // Read from Electron IPC if in Renderer, or process directly if in Main/Preload
  const rawPlatform =
    typeof window !== 'undefined' && window.electronAPI.platform
      ? window.electronAPI.platform
      : typeof process !== 'undefined'
        ? process.platform
        : '';

  if (rawPlatform === 'darwin') return 'macos';
  if (rawPlatform === 'win32') return 'windows';
  if (rawPlatform === 'linux') return 'linux';

  // Fallback check using navigator (if API bridge isn't loaded yet)
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Mac')) return 'macos';
    if (userAgent.includes('Win')) return 'windows';
    if (userAgent.includes('Linux')) return 'linux';
  }

  return 'unknown';
}

const currentOS = getOS();

export const Platform = {
  OS: currentOS,
  isMacOS: currentOS === 'macos',
  isWindows: currentOS === 'windows',
  isLinux: currentOS === 'linux',

  // Optional: Select values based on OS (like React Native's Platform.select)
  select: <T>(options: { macos?: T; windows?: T; linux?: T; default?: T }): T | undefined => {
    if (currentOS === 'unknown') return options.default;
    return options[currentOS] ?? options.default;
  },
};
