import { SensitivityLevel } from './detection';

export interface ProtectedFactCreate {
  fact_type: string;
  fact_value: string;
  importance: number; // 1-5
}

export interface ProtectedFactRead extends ProtectedFactCreate {
  id: number;
  created_at: string;
}

export interface ProtectedDocumentBase {
  title: string;
  department: string;
  content: string;
  sensitivity: SensitivityLevel;
  lineage_tag: string;
}

export interface ProtectedDocumentCreate extends ProtectedDocumentBase {
  facts: ProtectedFactCreate[];
}

export interface ProtectedDocumentUpdate {
  title?: string;
  department?: string;
  content?: string;
  sensitivity?: SensitivityLevel;
  lineage_tag?: string;
  facts?: ProtectedFactCreate[];
}

export interface ProtectedDocumentRead extends ProtectedDocumentBase {
  id: number;
  created_at: string;
  updated_at: string;
  facts: ProtectedFactRead[];
}
