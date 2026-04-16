export interface Asset {
  id: string;
  path: string;
  url: string; // Signed URL (resolved by backend)
  filename: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  fileType: string;
  tags: string[];
  altText: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListAssetsResponse {
  files: Asset[];
  total: number;
}

export interface UpdateAssetRequest {
  tags: string[];
  altText: string | null;
  fileType?: string;
}

export type FileTypeFilter = 'logo' | 'hero_image' | 'plan_image' | 'pdf' | 'general' | '';
