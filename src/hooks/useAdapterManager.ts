// AIDEV-NOTE: 어댑터 매니저 React Hook - 어댑터 상태 관리 및 전환
// 컴포넌트에서 어댑터 시스템을 쉽게 사용할 수 있는 인터페이스 제공

"use client";

import { useCallback, useEffect, useState } from "react";
import { adapterManager } from "@/lib/adapters/AdapterManager";
import type {
  AdapterLoadResult,
  AdapterManagerEvent,
  AdapterRegistration,
  DesignLibraryAdapter,
} from "@/types/adapter";

/**
 * 어댑터 매니저 Hook 반환 타입
 */
export interface UseAdapterManagerReturn {
  // 상태
  registrations: AdapterRegistration[];
  activeAdapter: DesignLibraryAdapter | null;
  activeAdapterId: string | null;
  isLoading: boolean;
  error: Error | null;

  // 액션
  setActiveAdapter: (adapterId: string) => Promise<void>;
  loadAdapter: (adapterId: string) => Promise<AdapterLoadResult>;
  unloadAdapter: (adapterId: string) => Promise<void>;
  registerAdapter: (registration: AdapterRegistration) => void;
  unregisterAdapter: (adapterId: string) => void;

  // 유틸리티
  getAdapter: (adapterId: string) => DesignLibraryAdapter | null;
  checkCompatibility: (adapterId: string) => Promise<boolean>;
  refresh: () => void;
}

/**
 * 어댑터 매니저 Hook
 */
export function useAdapterManager(): UseAdapterManagerReturn {
  const [registrations, setRegistrations] = useState<AdapterRegistration[]>([]);
  const [activeAdapter, setActiveAdapter] = useState<DesignLibraryAdapter | null>(null);
  const [activeAdapterId, setActiveAdapterId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 상태 동기화
  const syncState = useCallback(() => {
    setRegistrations(adapterManager.getRegistered());
    setActiveAdapter(adapterManager.getActive());
    setActiveAdapterId(adapterManager.activeAdapterId);
  }, []);

  // 초기 상태 설정
  useEffect(() => {
    syncState();
  }, [syncState]);

  // 어댑터 매니저 이벤트 리스너
  useEffect(() => {
    const handleAdapterEvent = (event: AdapterManagerEvent) => {
      switch (event.type) {
        case "adapter-registered":
        case "adapter-unregistered":
          setRegistrations(adapterManager.getRegistered());
          break;
        case "active-adapter-changed":
          setActiveAdapter(adapterManager.getActive());
          setActiveAdapterId(adapterManager.activeAdapterId);
          break;
      }
    };

    adapterManager.addEventListener("adapter-registered", handleAdapterEvent);
    adapterManager.addEventListener("adapter-unregistered", handleAdapterEvent);
    adapterManager.addEventListener("active-adapter-changed", handleAdapterEvent);

    return () => {
      adapterManager.removeEventListener("adapter-registered", handleAdapterEvent);
      adapterManager.removeEventListener("adapter-unregistered", handleAdapterEvent);
      adapterManager.removeEventListener("active-adapter-changed", handleAdapterEvent);
    };
  }, []);

  // 활성 어댑터 변경
  const setActiveAdapterHandler = useCallback(
    async (adapterId: string) => {
      if (isLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        await adapterManager.setActive(adapterId);
      } catch (err) {
        console.error("어댑터 활성화 실패:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  // 어댑터 로드
  const loadAdapter = useCallback(async (adapterId: string): Promise<AdapterLoadResult> => {
    setError(null);

    try {
      const result = await adapterManager.load(adapterId);
      if (!result.success && result.error) {
        setError(result.error);
      }
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      return {
        success: false,
        error,
      };
    }
  }, []);

  // 어댑터 언로드
  const unloadAdapter = useCallback(async (adapterId: string) => {
    setError(null);

    try {
      await adapterManager.unload(adapterId);
    } catch (err) {
      console.error("어댑터 언로드 실패:", err);
      setError(err as Error);
    }
  }, []);

  // 어댑터 등록
  const registerAdapter = useCallback((registration: AdapterRegistration) => {
    setError(null);

    try {
      adapterManager.register(registration);
    } catch (err) {
      console.error("어댑터 등록 실패:", err);
      setError(err as Error);
    }
  }, []);

  // 어댑터 등록 해제
  const unregisterAdapter = useCallback((adapterId: string) => {
    setError(null);

    try {
      adapterManager.unregister(adapterId);
    } catch (err) {
      console.error("어댑터 등록 해제 실패:", err);
      setError(err as Error);
    }
  }, []);

  // 어댑터 조회
  const getAdapter = useCallback((adapterId: string): DesignLibraryAdapter | null => {
    const instances = adapterManager.instances;
    return instances.get(adapterId) || null;
  }, []);

  // 호환성 검사
  const checkCompatibility = useCallback(async (adapterId: string): Promise<boolean> => {
    try {
      return await adapterManager.checkCompatibility(adapterId);
    } catch (err) {
      console.error("호환성 검사 실패:", err);
      return false;
    }
  }, []);

  // 상태 새로고침
  const refresh = useCallback(() => {
    syncState();
    setError(null);
  }, [syncState]);

  return {
    // 상태
    registrations,
    activeAdapter,
    activeAdapterId,
    isLoading,
    error,

    // 액션
    setActiveAdapter: setActiveAdapterHandler,
    loadAdapter,
    unloadAdapter,
    registerAdapter,
    unregisterAdapter,

    // 유틸리티
    getAdapter,
    checkCompatibility,
    refresh,
  };
}

/**
 * 특정 어댑터의 상태를 추적하는 Hook
 */
export function useAdapter(adapterId: string) {
  const { registrations, activeAdapterId, getAdapter } = useAdapterManager();

  const registration = registrations.find((reg) => reg.metadata.id === adapterId);
  const adapter = getAdapter(adapterId);
  const isActive = activeAdapterId === adapterId;
  const isLoaded = adapter !== null;

  return {
    registration,
    adapter,
    isActive,
    isLoaded,
    metadata: registration?.metadata,
  };
}

/**
 * 현재 활성 어댑터를 추적하는 Hook
 */
export function useActiveAdapter() {
  const { activeAdapter, activeAdapterId } = useAdapterManager();

  return {
    adapter: activeAdapter,
    adapterId: activeAdapterId,
    registry: activeAdapter?.registry,
    metadata: activeAdapter?.metadata,
  };
}

/**
 * 어댑터 상태 변경을 감지하는 Hook
 */
export function useAdapterEvents() {
  const [events, setEvents] = useState<AdapterManagerEvent[]>([]);

  useEffect(() => {
    const handleEvent = (event: AdapterManagerEvent) => {
      setEvents((prev) => [...prev.slice(-9), event]); // 최근 10개 이벤트만 유지
    };

    adapterManager.addEventListener("adapter-registered", handleEvent);
    adapterManager.addEventListener("adapter-unregistered", handleEvent);
    adapterManager.addEventListener("active-adapter-changed", handleEvent);

    return () => {
      adapterManager.removeEventListener("adapter-registered", handleEvent);
      adapterManager.removeEventListener("adapter-unregistered", handleEvent);
      adapterManager.removeEventListener("active-adapter-changed", handleEvent);
    };
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    clearEvents,
    latestEvent: events[events.length - 1] || null,
  };
} 