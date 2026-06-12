import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "./client";
import type {
  Plan,
  Subscription,
  AdminStats,
  RevenueStats,
  AdminLoginResponse,
  ListSubscriptionsResponse,
  ListSubscriptionsStatus,
} from "./types";

// ── Plans ──────────────────────────────────────────────────────────────────────

export function getGetPlanQueryKey(id: number) {
  return ["plans", id] as const;
}

export function useGetPlan(id: number, options?: { query?: { enabled?: boolean; queryKey?: readonly unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getGetPlanQueryKey(id),
    queryFn: () => apiRequest<Plan>("GET", `plans/${id}`),
    enabled: options?.query?.enabled ?? true,
  });
}

export function getAdminListPlansQueryKey() {
  return ["admin", "plans"] as const;
}

export function useAdminListPlans() {
  return useQuery({
    queryKey: getAdminListPlansQueryKey(),
    queryFn: () => apiRequest<Plan[]>("GET", "admin/plans"),
  });
}

export function useAdminCreatePlan() {
  return useMutation({
    mutationFn: ({ data }: { data: Omit<Plan, "id" | "createdAt" | "active"> & { features: string[] } }) =>
      apiRequest<Plan>("POST", "admin/plans", data),
  });
}

export function useAdminUpdatePlan() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Plan> }) =>
      apiRequest<Plan>("PATCH", `admin/plans/${id}`, data),
  });
}

export function useAdminDeletePlan() {
  return useMutation({
    mutationFn: ({ id }: { id: number }) =>
      apiRequest<Plan>("DELETE", `admin/plans/${id}`),
  });
}

// ── Subscriptions ──────────────────────────────────────────────────────────────

export function getListSubscriptionsQueryKey(params?: { status?: string; limit?: number }) {
  return ["subscriptions", params] as const;
}

export function useListSubscriptions(params?: { status?: ListSubscriptionsStatus; limit?: number; page?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.page) searchParams.set("page", String(params.page));

  const query = searchParams.toString();
  const endpoint = `subscriptions${query ? `?${query}` : ""}`;

  return useQuery({
    queryKey: getListSubscriptionsQueryKey(params),
    queryFn: () => apiRequest<ListSubscriptionsResponse>("GET", endpoint),
  });
}

export function useUpdateSubscription() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { status: string } }) =>
      apiRequest<Subscription>("PATCH", `subscriptions/${id}`, data),
  });
}

// ── Admin ──────────────────────────────────────────────────────────────────────

export function getAdminStatsQueryKey() {
  return ["admin", "stats"] as const;
}

export function useGetAdminStats() {
  return useQuery({
    queryKey: getAdminStatsQueryKey(),
    queryFn: () => apiRequest<AdminStats>("GET", "admin/stats"),
  });
}

export function getRevenueStatsQueryKey() {
  return ["admin", "revenue"] as const;
}

export function useGetRevenueStats() {
  return useQuery({
    queryKey: getRevenueStatsQueryKey(),
    queryFn: () => apiRequest<RevenueStats>("GET", "admin/revenue"),
  });
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: ({ data }: { data: { password: string } }) =>
      apiRequest<AdminLoginResponse>("POST", "admin/login", data),
  });
}
