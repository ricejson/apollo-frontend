
export enum Operator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  IN = 'in',
  BETWEEN = 'between',
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt'
}

export interface Rule {
  id: string;
  attribute: string; // e.g., 'city', 'user_id', 'traffic'
  customAttribute?: string; // used if attribute is 'custom'
  operator: Operator;
  value: string;
}

export interface Audience {
  id: string;
  name: string;
  rules: Rule[];
}

export interface Toggle {
  id: string;
  key: string;
  name: string;
  description: string;
  status: 'enabled' | 'disabled';
  audiences: Audience[];
  createdAt: string;
  updatedAt: string;
}

export type Language = 'zh' | 'en';
