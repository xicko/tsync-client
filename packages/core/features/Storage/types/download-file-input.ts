export interface DownloadFileInput {
  url: string;
  fileName: string;
  destination?: 'downloads' | 'app_sandbox';
}

export interface DownloadFileResult {
  uri?: string;
  localFilePath?: string;
  status?: number;
  [key: string]: any;
}
