import { usePagination } from "@/hooks";
import GroupApi from "../services/GroupApi";

export function useGroups() {
  const { ...rest } = usePagination({
    fn: GroupApi.get,
    page: 0,
    limit: 10,
  });

  return rest;
}
