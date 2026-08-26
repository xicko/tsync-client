import {
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
} from '@tamagui/lucide-icons';
import {
  ARCHIVE_EXTENSIONS,
  AUDIO_EXTENSIONS,
  CODE_EXTENSIONS,
  DOCUMENT_EXTENSIONS,
  IMAGE_EXTENSIONS,
  SPREADSHEET_EXTENSIONS,
  VIDEO_EXTENSIONS,
} from '../constants/file-types.constant';
import { FileTypeInfo } from '../types/storage-file.interface';

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function getFileTypeInfo(name: string, mimetype?: string): FileTypeInfo {
  const mime = (mimetype || '').toLowerCase();
  const ext = (name.split('.').pop() || '').toLowerCase();

  if (mime.startsWith('image/') || (IMAGE_EXTENSIONS as readonly string[]).includes(ext)) {
    return { Icon: FileImage, color: '$blue10', bgColor: '$blue3' };
  }

  if (mime.startsWith('video/') || (VIDEO_EXTENSIONS as readonly string[]).includes(ext)) {
    return { Icon: FileVideo, color: '$purple10', bgColor: '$purple3' };
  }

  if (mime.startsWith('audio/') || (AUDIO_EXTENSIONS as readonly string[]).includes(ext)) {
    return { Icon: FileAudio, color: '$orange10', bgColor: '$orange3' };
  }

  if (
    mime.includes('json') ||
    mime.includes('javascript') ||
    mime.includes('typescript') ||
    mime.includes('xml') ||
    mime.includes('html') ||
    (CODE_EXTENSIONS as readonly string[]).includes(ext)
  ) {
    return { Icon: FileCode, color: '$cyan10', bgColor: '$cyan3' };
  }

  if (
    mime.includes('spreadsheet') ||
    mime.includes('csv') ||
    (SPREADSHEET_EXTENSIONS as readonly string[]).includes(ext)
  ) {
    return { Icon: FileSpreadsheet, color: '$green10', bgColor: '$green3' };
  }

  if (
    mime.includes('zip') ||
    mime.includes('tar') ||
    mime.includes('gzip') ||
    mime.includes('compressed') ||
    (ARCHIVE_EXTENSIONS as readonly string[]).includes(ext)
  ) {
    return { Icon: FileArchive, color: '$yellow10', bgColor: '$yellow3' };
  }

  if (mime.includes('pdf') || mime.startsWith('text/') || (DOCUMENT_EXTENSIONS as readonly string[]).includes(ext)) {
    const isPdf = ext === 'pdf' || mime.includes('pdf');
    return {
      Icon: FileText,
      color: isPdf ? '$red10' : '$color11',
      bgColor: isPdf ? '$red3' : '$color3',
    };
  }

  return { Icon: File, color: '$color11', bgColor: '$color3' };
}
