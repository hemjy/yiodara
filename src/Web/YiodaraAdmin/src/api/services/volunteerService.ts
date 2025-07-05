import { api } from '../client';
import { VolunteerParams, VolunteersResponse, VolunteerCountResponse } from '../../types/api';

const VOLUNTEERS_ENDPOINT = '/api/Admin/get-volunteers';
const VOLUNTEER_COUNT_ENDPOINT = '/api/Admin/get-total-volunteer-count';

export const volunteerService = {
  /* Get all volunteers with optional filtering and pagination */
  getAllVolunteers: (params?: VolunteerParams): Promise<VolunteersResponse> => {
    return api.get<VolunteersResponse>(VOLUNTEERS_ENDPOINT, { params });
  },
  
  /* Get total volunteer count */
  getTotalVolunteerCount: (): Promise<VolunteerCountResponse> => {
    return api.get<VolunteerCountResponse>(VOLUNTEER_COUNT_ENDPOINT);
  },
}; 