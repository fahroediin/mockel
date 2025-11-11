export interface DataField {
  id: string;
  name: string;
  type: DataType;
  constraints?: FieldConstraints;
  nestedSchema?: DataField[];
}

export type DataType =
  // Basic types
  | 'string' | 'number' | 'boolean' | 'object' | 'array'
  // LLM specific types
  | 'person_name' | 'product_name' | 'address' | 'email'
  | 'image_url' | 'paragraph' | 'uuid' | 'date' | 'price';

export interface FieldConstraints {
  // String constraints
  minLength?: number;
  maxLength?: number;
  minWords?: number;
  maxWords?: number;

  // Number constraints
  min?: number;
  max?: number;
  decimal?: number;

  // Array constraints
  minItems?: number;
  maxItems?: number;
  itemType?: DataType;

  // Date constraints
  startDate?: string;
  endDate?: string;
  format?: string;
}

export interface Schema {
  id: string;
  name: string;
  description?: string;
  fields: DataField[];
}

export interface MockProject {
  id: string;
  name: string;
  baseEndpoint: string;
  schema: Schema;
  mockData?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface GenerationConfig {
  recordCount: number;
  includeNulls?: boolean;
  seed?: number;
}