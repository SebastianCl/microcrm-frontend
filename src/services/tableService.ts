import { apiClient } from "./apiClient";
import type { Table } from "../models/table.model";

export const getTables = async (): Promise<Table[]> => {
    const response = await apiClient.get('/mesas');
    return response as Table[];
};
