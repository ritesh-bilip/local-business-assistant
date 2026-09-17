import { api } from "./client";

export type ProposalStatus = "draft" | "sent" | "won" | "lost" | "archived";

export type SavedProposal = {
  id: number;
  client_name: string;
  client_info: Record<string, string>;
  draft_text: string;
  sources: any[];
  status: ProposalStatus;
  notes: string;
  created_at: string;
  updated_at: string;
};

export const proposalsApi = {
  list: (status?: ProposalStatus, q?: string) =>
    api
      .get<SavedProposal[]>("/rag/proposals/", { params: { status, q } })
      .then((r) => r.data),

  get: (id: number) =>
    api.get<SavedProposal>(`/rag/proposals/${id}/`).then((r) => r.data),

  create: (payload: {
    client_name: string;
    client_info: Record<string, string>;
    draft_text: string;
    sources: any[];
    notes?: string;
  }) =>
    api.post<SavedProposal>("/rag/proposals/", payload).then((r) => r.data),

  update: (id: number, payload: Partial<SavedProposal>) =>
    api
      .patch<SavedProposal>(`/rag/proposals/${id}/`, payload)
      .then((r) => r.data),

  setStatus: (id: number, status: ProposalStatus) =>
    api
      .post<SavedProposal>(`/rag/proposals/${id}/status/`, { status })
      .then((r) => r.data),

  remove: (id: number) =>
    api.delete(`/rag/proposals/${id}/`).then((r) => r.data),
};