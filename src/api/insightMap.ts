import { apiClient } from './client'

export type InsightMapMode = 'research' | 'current_patient' | 'my_soap'

export interface InsightMapNode {
  id: string
  type: string
  label: string
  source_layer: string
  summary: string | null
  data: Record<string, unknown>
}

export interface InsightMapEdge {
  source: string
  target: string
  relation: string
}

export interface InsightMapResponse {
  nodes: InsightMapNode[]
  edges: InsightMapEdge[]
}

export interface SourceLinkResponse {
  url: string
}

export const DEFAULT_INSIGHT_MAP_MODE: InsightMapMode[] = ['research', 'current_patient', 'my_soap']

export const insightMapApi = {
  get: (reportDraftId: string | null, mode: InsightMapMode[] = DEFAULT_INSIGHT_MAP_MODE) =>
    apiClient.get<InsightMapResponse>('/insight-map', {
      params: { report_draft_id: reportDraftId ?? undefined, mode },
      paramsSerializer: { indexes: null },
    }),

  search: (query: string, reportDraftId: string | null, mode: InsightMapMode[] = DEFAULT_INSIGHT_MAP_MODE) =>
    apiClient.post<InsightMapResponse>('/insight-map/search', {
      query,
      report_draft_id: reportDraftId,
      mode,
    }),

  getSourceLink: (caseIndexId: string) =>
    apiClient.get<SourceLinkResponse>(`/soap-case-indexes/${caseIndexId}/source-link`),
}
