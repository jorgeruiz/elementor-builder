export interface ProjectConfig {
  projectName: string;
  pageType: 'home' | 'landing' | 'service' | 'contact' | 'product' | 'corporate';
  outputPreference: 'full' | 'sections' | 'both';
  fidelity: 'high' | 'medium';
  style: 'native' | 'rich';
  maxFileSizeKb: number;
  usePlaceholders: boolean;
  language: string;
}

export interface UploadedFiles {
  htmlFile: File | null;
  htmlContent: string;
  imageFile: File | null;
}

export interface SectionMetadata {
  id: string;
  name: string;
  type: string;
  elementCount: number;
  tokensEstimated: number;
  status: 'pending' | 'success' | 'warning' | 'error';
  warnings: string[];
}

export interface ConversionState {
  step: number;
  files: UploadedFiles;
  config: ProjectConfig;
  sections: SectionMetadata[];
  isProcessing: boolean;
  progress: number;
  logs: string[];
}
