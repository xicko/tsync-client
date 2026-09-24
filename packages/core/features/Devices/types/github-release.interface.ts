export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  type: string;
  site_admin: boolean;
  [key: string]: any;
}

export interface GitHubReleaseAsset {
  url: string;
  id: number;
  node_id: string;
  name: string;
  label: string | null;
  uploader: GitHubUser;
  content_type: string;
  state: 'uploaded' | 'open' | string;
  size: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  browser_download_url: string;
  digest?: string;
}

export interface GitHubRelease {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  author: GitHubUser;
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  draft: boolean;
  immutable?: boolean;
  prerelease: boolean;
  created_at: string;
  updated_at: string;
  published_at: string;
  assets: GitHubReleaseAsset[];
  tarball_url: string;
  zipball_url: string;
  body: string;
}

export interface FetchLatestReleaseParams {
  owner?: string;
  repo?: string;
  repoFullName?: string;
  timeoutMs?: number;
}
