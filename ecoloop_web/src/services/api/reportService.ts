import { apiClient } from './client';

export interface IllegalDumpReport {
  id: string;
  reporter_id: string;
  description: string;
  latitude: number;
  longitude: number;
  photo_url: string | null;
  status: string;
  created_at: string;
  validated_at: string | null;
}

export interface CreateReportData {
  description: string;
  latitude: number;
  longitude: number;
  photo_url?: string;
}

export const reportService = {
  getMyReports: async (): Promise<IllegalDumpReport[]> => {
    const response = await apiClient.get('/reports/');
    return response.data;
  },

  createReport: async (data: CreateReportData): Promise<IllegalDumpReport> => {
    const response = await apiClient.post('/reports/', data);
    return response.data;
  },
};
