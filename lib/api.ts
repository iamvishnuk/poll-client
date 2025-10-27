import API from './axios-client';
import { APIResponse, ICreatePollPayload, IPoll } from '@/definition/interface';

export const healthCheckMutationFn = async () => await API.get('/health');

export const createPollMutationFn = async (data: ICreatePollPayload) =>
  await API.post('/poll/', data);

export const getAllPollsMutationFn = async (): Promise<APIResponse<IPoll[]>> =>
  await API.get('/poll/');

export const getPollByIdMutationFn = async (
  pollId: string
): Promise<APIResponse<IPoll>> => await API.get(`/poll/${pollId}`);

export interface VoteRequest {
  option_id: string;
}

export interface VoteResponse {
  option_id: string;
  new_vote_count: number;
  option_value: string;
}

export const voteOnPollMutationFn = async (
  pollId: string,
  voteData: VoteRequest
): Promise<APIResponse<VoteResponse>> =>
  await API.post(`/poll/${pollId}/vote`, voteData);
