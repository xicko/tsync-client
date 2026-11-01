import React from 'react';

export interface StorageFile {
  _id: string;
  tailscaleId: string;
  name: string;
  sizeBytes: number;
  mimetype?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileTypeInfo {
  Icon: React.ComponentType<any>;
  color: any;
  bgColor: any;
}
