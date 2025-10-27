import { TOption } from './type';

export type { TOption } from './type';

export interface APIResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

export interface IPoll {
  id: string;
  question: string;
  description?: string;
  options: TOption[];
}

export interface ICreatePollPayload {
  question: string;
  description?: string;
  options: string[];
}
