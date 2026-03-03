import type { Polygon, MultiPolygon } from 'geojson';

export interface User {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

export type OrgRole = 'ORG_OWNER' | 'ORG_ADMIN' | 'ORG_ANALYST' | 'ORG_VIEWER';

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface OrgMember {
  org_id: string;
  user_id: string;
  role: OrgRole;
  created_at: string;
}

export interface UserProfile {
  user: User;
  organizations: Organization[];
  memberships: OrgMember[];
}

export interface Field {
  id: string;
  org_id: string;
  name: string;
  geometry: Polygon | MultiPolygon;
  area_ha: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Season {
  id: string;
  date_from: string;
  date_to: string;
  label: string;
}

export type AnalysisStatus = 'CREATED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';
export type TriggerType = 'REGISTRATION' | 'MANUAL' | 'CRON';
export type ModuleName = 'M1' | 'M2' | 'M3';

export interface AnalysisRequest {
  id: string;
  org_id: string;
  field_id: string;
  requested_by: string;
  season_id: string;
  modules: ModuleName[];
  status: AnalysisStatus;
  trigger_type: TriggerType;
  created_at: string;
  started_at?: string;
  finished_at?: string;
  error_message?: string;
  module_results?: ModuleResult[];
}

export interface ModuleResult {
  id: string;
  analysis_request_id: string;
  module: ModuleName;
  status: AnalysisStatus;
  summary_json?: Record<string, unknown>;
  artifacts_json?: Record<string, unknown>;
  created_at: string;
}

export type ReportStatus = 'CREATED' | 'GENERATING' | 'READY' | 'FAILED';

export interface Report {
  id: string;
  org_id: string;
  field_id: string;
  season_ids: string[];
  modules: ModuleName[];
  status: ReportStatus;
  file_uri?: string;
  created_by: string;
  created_at: string;
}

export interface CreateFieldPayload {
  name: string;
  geometry: Polygon | MultiPolygon;
}

export interface CreateAnalysisPayload {
  season_id?: string;
  modules?: ModuleName[];
}

export interface CreateReportPayload {
  season_ids: string[];
  modules: ModuleName[];
}
