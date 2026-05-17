import type {
  SearchSystemEventsRequest,
  SystemEventDetailResponse,
  SystemEventSearchResponse,
} from "~/features/operations/types";

const systemEventRoute = (path = "") => `/system-events${path}`;

export const useSystemEventAdminApi = () => {
  const api = useApiClient();

  return {
    searchSystemEvents: (params: SearchSystemEventsRequest = {}) =>
      api.request<SystemEventSearchResponse>(systemEventRoute(toSearchParams({
        keyword: params.keyword,
        status: params.status,
        eventType: params.eventType,
        aggregateId: params.aggregateId,
        occurredFrom: params.occurredFrom,
        occurredTo: params.occurredTo,
        page: params.page ?? 1,
        size: params.size ?? 20,
      }))),

    getSystemEventById: (eventId: string) =>
      api.request<SystemEventDetailResponse>(systemEventRoute(`/${eventId}`)),
  };
};
