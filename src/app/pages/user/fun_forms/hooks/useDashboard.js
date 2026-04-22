import { useState, useEffect, useCallback, useRef } from 'react';
import FunManageDashboardService from '../../../../services/funmanage_dashboard.service';
import { serializeFilters } from '../utils/filters';

export function useDashboard(filters) {
  const [kpis, setKpis] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [table, setTable] = useState({ data: [], total: 0, page: 1, limit: 12 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const reqIdRef = useRef(0);

  const refetch = useCallback(async () => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    const params = serializeFilters(filters);
    try {
      const [kpisResp, chartResp, tableResp] = await Promise.all([
        FunManageDashboardService.getKpis(params),
        FunManageDashboardService.getChartData(params),
        FunManageDashboardService.getTable(params),
      ]);
      if (reqId !== reqIdRef.current) return;
      setKpis(kpisResp.data?.kpis ?? kpisResp.data ?? null);
      setChartData(chartResp.data?.chartData ?? chartResp.data ?? []);
      setTable({
        data: tableResp.data?.data ?? [],
        total: tableResp.data?.total ?? 0,
        page: tableResp.data?.page ?? 1,
        limit: tableResp.data?.limit ?? 12,
      });
    } catch (err) {
      if (reqId !== reqIdRef.current) return;
      setError(err);
    } finally {
      if (reqId === reqIdRef.current) setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { kpis, chartData, table, loading, error, refetch };
}
