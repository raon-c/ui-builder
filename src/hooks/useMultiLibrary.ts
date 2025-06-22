// AIDEV-NOTE: 다중 라이브러리 Hook - 다중 라이브러리 시스템과의 상호작용
// 어댑터 관리, 충돌 해결, 네임스페이스 필터링 등의 기능을 React Hook으로 제공
// 성능 최적화: 선택적 상태 업데이트, 메모이제이션, 이벤트별 핸들러 분리

import { useCallback, useEffect, useMemo, useState } from "react";
import { multiLibraryManager } from "@/lib/adapters/MultiLibraryManager";
import type { AdapterLoadResult, DesignLibraryAdapter } from "@/types/adapter";
import type {
  ComponentConflict,
  LibraryNamespace,
  MultiLibraryAdapterLoadResult,
  MultiLibraryConfig,
  MultiLibraryEvent,
  MultiLibraryStats,
  NamespacedComponentResult,
  NamespaceFilter,
} from "@/types/multi-library";

/**
 * 다중 라이브러리 시스템 Hook
 * 여러 디자인 라이브러리의 관리와 상호작용 기능 제공
 */
export function useMultiLibrary() {
  const [adapters, setAdapters] = useState<Array<{ namespace: LibraryNamespace; adapter: DesignLibraryAdapter }>>([]);
  const [config, setConfig] = useState<MultiLibraryConfig>(multiLibraryManager.getConfig());
  const [stats, setStats] = useState<MultiLibraryStats | null>(null);
  const [conflicts, setConflicts] = useState<ComponentConflict[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // AIDEV-NOTE: 성능 최적화 - 이벤트별 선택적 상태 업데이트로 불필요한 리렌더링 방지
  // 전체 상태 새로고침
  const refresh = useCallback(() => {
    setAdapters(multiLibraryManager.getAllAdapters());
    setConfig(multiLibraryManager.getConfig());
    setStats(multiLibraryManager.getStats());
    setConflicts(multiLibraryManager.detectConflicts());
  }, []);

  // 부분 상태 업데이트 함수들
  const refreshAdapters = useCallback(() => {
    setAdapters(multiLibraryManager.getAllAdapters());
    setStats(multiLibraryManager.getStats());
  }, []);

  const refreshConfig = useCallback(() => {
    setConfig(multiLibraryManager.getConfig());
  }, []);

  const refreshConflicts = useCallback(() => {
    setConflicts(multiLibraryManager.detectConflicts());
  }, []);

  // 초기 로드 및 이벤트 리스너 설정
  useEffect(() => {
    refresh();

    // 이벤트별 최적화된 핸들러
    const handleAdapterEvent = (event: MultiLibraryEvent) => {
      refreshAdapters();
      refreshConflicts(); // 어댑터 변경 시 충돌도 재계산
    };

    const handleConflictEvent = (event: MultiLibraryEvent) => {
      refreshConflicts();
    };

    const handleConfigEvent = (event: MultiLibraryEvent) => {
      refreshConfig();
      refreshConflicts(); // 설정 변경 시 충돌 재계산
    };

    // 선택적 이벤트 리스너 등록
    multiLibraryManager.addEventListener("adapter-loaded", handleAdapterEvent);
    multiLibraryManager.addEventListener("adapter-unloaded", handleAdapterEvent);
    multiLibraryManager.addEventListener("conflict-detected", handleConflictEvent);
    multiLibraryManager.addEventListener("conflict-resolved", handleConflictEvent);
    multiLibraryManager.addEventListener("priority-changed", handleConfigEvent);
    multiLibraryManager.addEventListener("theme-changed", handleConfigEvent);

    return () => {
      multiLibraryManager.removeEventListener("adapter-loaded", handleAdapterEvent);
      multiLibraryManager.removeEventListener("adapter-unloaded", handleAdapterEvent);
      multiLibraryManager.removeEventListener("conflict-detected", handleConflictEvent);
      multiLibraryManager.removeEventListener("conflict-resolved", handleConflictEvent);
      multiLibraryManager.removeEventListener("priority-changed", handleConfigEvent);
      multiLibraryManager.removeEventListener("theme-changed", handleConfigEvent);
    };
  }, [refresh, refreshAdapters, refreshConfig, refreshConflicts]);

  // 어댑터 등록
  const registerAdapter = useCallback(
    async (namespace: LibraryNamespace, adapter: DesignLibraryAdapter): Promise<MultiLibraryAdapterLoadResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await multiLibraryManager.registerAdapter(namespace, adapter);
        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // 어댑터 제거
  const unregisterAdapter = useCallback(async (namespace: LibraryNamespace): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await multiLibraryManager.unregisterAdapter(namespace);
      return result;
    } catch (err) {
      setError(err as Error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 설정 업데이트
  const updateConfig = useCallback((newConfig: Partial<MultiLibraryConfig>) => {
    multiLibraryManager.updateConfig(newConfig);
  }, []);

  // 우선순위 설정
  const setPriority = useCallback((namespace: LibraryNamespace, priority: number) => {
    multiLibraryManager.setPriority(namespace, priority);
  }, []);

  // 컴포넌트 검색
  const searchComponents = useCallback((filter?: NamespaceFilter): NamespacedComponentResult[] => {
    return multiLibraryManager.searchComponents(filter);
  }, []);

  // 어댑터 가져오기
  const getAdapter = useCallback((namespace: LibraryNamespace): DesignLibraryAdapter | undefined => {
    return multiLibraryManager.getAdapter(namespace);
  }, []);

  // 충돌 감지
  const detectConflicts = useCallback((): ComponentConflict[] => {
    return multiLibraryManager.detectConflicts();
  }, []);

  return {
    // 상태
    adapters,
    config,
    stats,
    conflicts,
    isLoading,
    error,

    // 액션
    registerAdapter,
    unregisterAdapter,
    updateConfig,
    setPriority,
    searchComponents,
    getAdapter,
    detectConflicts,
    refresh,
  };
}

/**
 * 네임스페이스 필터링 Hook
 * 특정 네임스페이스의 컴포넌트만 사용하는 Hook
 * 성능 최적화: useMemo를 사용하여 불필요한 재계산 방지
 */
export function useNamespaceFilter(filter: NamespaceFilter) {
  const { adapters, conflicts } = useMultiLibrary();

  // AIDEV-NOTE: 성능 최적화 - useMemo로 필터링 결과 메모이제이션
  const filteredComponents = useMemo(() => {
    return multiLibraryManager.searchComponents(filter);
  }, [filter, adapters, conflicts]); // 어댑터나 충돌 상태 변경 시에만 재계산

  return {
    components: filteredComponents,
    count: filteredComponents.length,
  };
}

/**
 * 어댑터 상태 Hook
 * 특정 어댑터의 상태와 액션 제공
 */
export function useAdapter(namespace: LibraryNamespace) {
  const { adapters, getAdapter, registerAdapter, unregisterAdapter } = useMultiLibrary();
  const [adapter, setAdapter] = useState<DesignLibraryAdapter | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const foundAdapter = getAdapter(namespace);
    setAdapter(foundAdapter || null);
    setIsRegistered(!!foundAdapter);
  }, [namespace, getAdapter, adapters]);

  // 어댑터 등록
  const register = useCallback(
    async (adapterInstance: DesignLibraryAdapter): Promise<MultiLibraryAdapterLoadResult> => {
      return registerAdapter(namespace, adapterInstance);
    },
    [namespace, registerAdapter],
  );

  // 어댑터 제거
  const unregister = useCallback(async () => {
    return unregisterAdapter(namespace);
  }, [namespace, unregisterAdapter]);

  return {
    adapter,
    isRegistered,
    register,
    unregister,
  };
}

/**
 * 충돌 관리 Hook
 * 컴포넌트 충돌 상태와 해결 기능 제공
 */
export function useConflictResolution() {
  const { conflicts, config, updateConfig } = useMultiLibrary();
  const [unresolvedConflicts, setUnresolvedConflicts] = useState<ComponentConflict[]>([]);

  useEffect(() => {
    const unresolved = conflicts.filter((conflict) => !conflict.resolvedAdapter);
    setUnresolvedConflicts(unresolved);
  }, [conflicts]);

  // 충돌 해결 전략 변경
  const setResolutionStrategy = useCallback(
    (strategy: MultiLibraryConfig["defaultConflictResolution"]) => {
      updateConfig({ defaultConflictResolution: strategy });
    },
    [updateConfig],
  );

  // 자동 충돌 해결 토글
  const toggleAutoResolve = useCallback(() => {
    updateConfig({ autoResolveConflicts: !config.autoResolveConflicts });
  }, [config.autoResolveConflicts, updateConfig]);

  return {
    conflicts,
    unresolvedConflicts,
    conflictCount: conflicts.length,
    unresolvedCount: unresolvedConflicts.length,
    resolutionStrategy: config.defaultConflictResolution,
    autoResolveEnabled: config.autoResolveConflicts,
    setResolutionStrategy,
    toggleAutoResolve,
  };
}

/**
 * 라이브러리 통계 Hook
 * 다중 라이브러리 시스템의 통계 정보 제공
 * 성능 최적화: useMemo를 사용하여 통계 계산 최적화
 */
export function useLibraryStats() {
  const { stats, adapters } = useMultiLibrary();

  // AIDEV-NOTE: 성능 최적화 - 상세 통계 계산을 useMemo로 메모이제이션
  const detailedStats = useMemo(() => {
    if (!stats) return null;

    const totalAdapters = adapters.length;
    const activeAdapters = adapters.filter(({ adapter }) => adapter.status === "active").length;
    const totalComponents = stats.totalComponents;
    const averageComponentsPerAdapter = totalAdapters > 0 ? totalComponents / totalAdapters : 0;

    // 가장 많이 사용되는 네임스페이스 찾기
    let mostUsedNamespace: LibraryNamespace | null = null;
    let maxComponents = 0;

    for (const [namespace, count] of Object.entries(stats.componentsByNamespace)) {
      if (count > maxComponents) {
        maxComponents = count;
        mostUsedNamespace = namespace as LibraryNamespace;
      }
    }

    return {
      totalAdapters,
      activeAdapters,
      totalComponents,
      averageComponentsPerAdapter,
      mostUsedNamespace,
    };
  }, [stats, adapters]);

  return {
    stats,
    detailedStats,
  };
}
