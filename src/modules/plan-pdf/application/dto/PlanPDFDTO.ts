export interface PlanPDFConfig {
  id?: string;
  planId: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  accentColor: string;
  footerText: string;
  showUfValue: boolean;
  customTitle: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GeneratePDFRequest {
  logo_url: string;
  hero_image_url: string;
  accent_color: string;
  footer_text: string;
  show_uf_value: boolean;
  custom_title: string | null;
}

export interface GeneratePDFResponse {
  pdf_url: string;
  generated_at: string;
}

export interface UploadAssetResponse {
  url: string;
}
