export enum UserType {
  EXISTING_OWNER = 'EXISTING_OWNER',
  NEW_BUILDER = 'NEW_BUILDER',
}

export type InputType = 'selection' | 'text' | 'multi-selection' | 'number';

export interface FormStep {
  id: string;
  question: string;
  subtext?: string;
  type: InputType;
  key: string;
  options?: string[];
  placeholder?: string;
}

export interface ExistingOwnerContext {
  capacity: string;
  location: string;
  variety: string;
  purpose: string;
  issues: string[];
}

export interface NewBuilderContext {
  location: string;
  targetCapacity: string;
  targetUsers: string;
  budget: string;
  purpose: string;
}

export type AppStep = 'INTAKE' | 'CHAT';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}