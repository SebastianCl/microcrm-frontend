import { apiClient } from "./apiClient";
import type { Table } from "../models/table.model";

export const getTables = async (): Promise<Table[]> => {
    const response = await apiClient.get('/mesas');
    return response as Table[];
};

export const createTable = async (tableData: { nombre_mesa: string }): Promise<Table> => {
    const response = await apiClient.post('/mesas', tableData);
    return response as Table;
};

export const updateTable = async (id: number, tableData: { nombre_mesa: string; activa?: boolean }): Promise<Table> => {
    const response = await apiClient.put(`/mesas/${id}`, tableData);
    return response as Table;
};



export const toggleTableStatus = async (id: number): Promise<Table> => {
    const response = await apiClient.patch(`/mesas/${id}`, {});
    return response as Table;
};
