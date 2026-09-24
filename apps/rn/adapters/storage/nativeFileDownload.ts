import * as FileSystem from 'expo-file-system/legacy';

interface NativeDownloadFnOptions {
  url: string;
  fileName: string;
  destination?: 'downloads' | 'app_sandbox';
}

export async function nativeDownloadFn(
  options: NativeDownloadFnOptions
): Promise<(FileSystem.FileSystemDownloadResult & { localFilePath?: string }) | null> {
  try {
    const destination =
      options.destination === 'app_sandbox'
        ? `${FileSystem.cacheDirectory}${options.fileName}`
        : `${FileSystem.documentDirectory}${options.fileName}`;

    const result = await FileSystem.downloadAsync(options.url, destination);

    const localFilePath = result.uri.replace(/^file:\/\//, '');

    return {
      ...result,
      localFilePath,
    };
  } catch (error) {
    if (error instanceof Error && __DEV__) console.warn(`nativeDownloadFn error: ${error.message}`);
    return null;
  }
}
