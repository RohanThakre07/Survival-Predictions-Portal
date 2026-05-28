export interface Task {
  id: string;
  title: string;
  notebook: string;
  dataset: string;
  file?: string;
  description: string;
  features?: string[];
}

export interface JupyterCell {
  cell_type: "markdown" | "code" | "raw";
  metadata: any;
  source: string[];
  execution_count?: number | null;
  outputs?: any[];
}

export interface JupyterNotebook {
  cells: JupyterCell[];
  metadata: any;
  nbformat: number;
  nbformat_minor: number;
}

export interface DatasetPreview {
  filename: string;
  truncated: boolean;
  totalLines: number;
  content: string; // CSV string
}

export interface PredictionRequest {
  task: string;
  inputs: Record<string, any>;
}

export interface PredictionResponse {
  prediction: string | number;
  confidence: number;
  explanation: string;
  featuresAnalyzed: Record<string, any>;
}
