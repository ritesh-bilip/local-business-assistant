import { api } from "./client";

export type User = {
  id: number;
  email: string;
  role: "admin" | "staff" | "viewer";
  business_name: string;
};

export const authApi = {
  register: (business_name: string, email: string, password: string) =>
    api
      .post<{ user: User; access: string; refresh: string }>("/auth/register/", {
        business_name,
        email,
        password,
      })
      .then((r) => r.data),

  login: (email: string, password: string) =>
    api
      .post<{ access: string; refresh: string }>("/auth/token/", {
        username: email,
        password,
      })
      .then((r) => r.data),

  me: () => api.get<User>("/auth/me/").then((r) => r.data),
};