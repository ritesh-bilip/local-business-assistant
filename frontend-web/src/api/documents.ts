import { api } from "./client";

export type Chunk = {
  id: number;
  text: string;
  chunk_index: number;
  page: number | null;
  tokens: number;
  metadata: Record<string, unknown>;
};

export type Document = {
  id: number;
  filename: string;
  content_type: string;
  status: "pending" | "processing" | "completed" | "failed";
  error: string;
  uploaded_at: string;
  processed_at: string | null;
  chunks?: Chunk[];
};

export const documentsApi = {
  list: () => api.get<Document[]>("/documents/").then((r) => r.data),

  get: (id: number) => api.get<Document>(`/documents/${id}/`).then((r) => r.data),

  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api
      .post<Document>("/documents/", form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  process: (id: number) =>
    api.post<{ status: string }>(`/documents/${id}/process/`).then((r) => r.data),

  remove: (id: number) => api.delete(`/documents/${id}/`).then((r) => r.data),
};