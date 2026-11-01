import { UploadFileInput } from '@/features/Storage/types/upload-file-input';
import * as FileSystem from 'expo-file-system/legacy';

export async function nativeUploadFn(
  url: string,
  fileInput: UploadFileInput
): Promise<{ status: number; body?: string }> {
  return await FileSystem.uploadAsync(url, fileInput.uri, {
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: 'file',
    mimeType: fileInput.type,
  });
}
