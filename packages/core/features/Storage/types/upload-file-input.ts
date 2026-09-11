export interface UploadFileInput {
  uri: string;
  name: string;
  type?: string;
  size?: number;
  file?: File | Blob;
}
