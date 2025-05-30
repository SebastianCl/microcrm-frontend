import { useQuery } from "@tanstack/react-query";
import { getTables } from "../services/tableService";

export const useTables = () => {
    return useQuery({
        queryKey: ["tables"],
        queryFn: getTables,
    });
};
