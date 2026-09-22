export interface StatusCount {
    status: string;
    count: number;
    percentage: number;
  }
  
  export interface TypeCount {
    asset_type: string;
    total: number;
    available: number;
    percentage: number;
  }
  
  export interface DashboardStatsResponse {
    ready_to_assign: number;
    assigned: number;
    in_repair: number;
    hardware_issue: number;
    total_assets: number;
    by_status: StatusCount[];
    by_type: TypeCount[];
  }
  
  export interface RecentActivityItem {
    id: number;
    action: string;
    timestamp: string;
    notes?: string | null;
    asset_name: string;
    asset_tag: string;
    employee_name?: string | null;
  }