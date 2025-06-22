// AIDEV-NOTE: 커스텀 컴포넌트 Hook - 커스텀 컴포넌트 시스템과의 상호작용
// 컴포넌트 등록, 로드, 관리 기능을 React Hook으로 제공

import { useCallback, useEffect, useState } from "react";
import { getComponentRegistry } from "@/lib/component-registry";
import { customComponentManager } from "@/lib/custom-components/CustomComponentManager";
import type {
  CustomComponentDefinition,
  CustomComponentEvent,
  CustomComponentFilter,
  CustomComponentLoadResult,
  CustomComponentRegistrationRequest,
} from "@/types/custom-component";

/**
 * 커스텀 컴포넌트 시스템 Hook
 * 커스텀 컴포넌트의 등록, 로드, 관리 기능 제공
 */
export function useCustomComponents() {
  const [components, setComponents] = useState<CustomComponentDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 컴포넌트 목록 새로고침
  const refresh = useCallback(() => {
    const allComponents = customComponentManager.getAll();
    setComponents(allComponents);
  }, []);

  // 초기 로드 및 이벤트 리스너 설정
  useEffect(() => {
    refresh();

    const handleEvent = (event: CustomComponentEvent) => {
      refresh();
    };

    // 모든 이벤트 타입에 대해 리스너 등록
    const eventTypes: CustomComponentEvent["type"][] = [
      "registered",
      "updated",
      "deleted",
      "validated",
      "compiled",
      "published",
    ];

    eventTypes.forEach((type) => {
      customComponentManager.addEventListener(type, handleEvent);
    });

    return () => {
      eventTypes.forEach((type) => {
        customComponentManager.removeEventListener(type, handleEvent);
      });
    };
  }, [refresh]);

  // 컴포넌트 등록
  const registerComponent = useCallback(async (request: CustomComponentRegistrationRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await customComponentManager.register(request);

      // 유효한 컴포넌트인 경우 레지스트리에도 등록
      if (result.status === "valid" || result.status === "published") {
        await loadAndRegisterComponent(result.metadata.id);
      }

      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 로드 및 레지스트리 등록
  const loadAndRegisterComponent = useCallback(async (componentId: string): Promise<CustomComponentLoadResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await customComponentManager.loadComponent(componentId);

      if (result.success && result.wrapper) {
        // 전역 레지스트리에 등록
        const registry = getComponentRegistry();
        registry.register(result.wrapper);

        // 사용 통계 업데이트
        customComponentManager.updateUsage(componentId);
      }

      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 업데이트
  const updateComponent = useCallback(
    async (componentId: string, updates: any) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await customComponentManager.update(componentId, updates);

        // 업데이트 후 재로드
        if (result.status === "valid" || result.status === "published") {
          await loadAndRegisterComponent(componentId);
        }

        return result;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [loadAndRegisterComponent],
  );

  // 컴포넌트 삭제
  const deleteComponent = useCallback(async (componentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const success = customComponentManager.delete(componentId);

      if (success) {
        // 레지스트리에서도 제거
        const registry = getComponentRegistry();
        const component = customComponentManager.get(componentId);
        if (component) {
          registry.unregister(component.metadata.name as any);
        }
      }

      return success;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 검색
  const searchComponents = useCallback((filter: CustomComponentFilter) => {
    return customComponentManager.search(filter);
  }, []);

  // 컴포넌트 가져오기
  const getComponent = useCallback((componentId: string) => {
    return customComponentManager.get(componentId);
  }, []);

  // 모든 유효한 컴포넌트 로드
  const loadAllValidComponents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const validComponents = components.filter((comp) => comp.status === "valid" || comp.status === "published");

      const results = await Promise.all(validComponents.map((comp) => loadAndRegisterComponent(comp.metadata.id)));

      return results;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [components, loadAndRegisterComponent]);

  return {
    // 상태
    components,
    isLoading,
    error,

    // 액션
    registerComponent,
    updateComponent,
    deleteComponent,
    loadAndRegisterComponent,
    loadAllValidComponents,
    searchComponents,
    getComponent,
    refresh,
  };
}

/**
 * 단일 커스텀 컴포넌트 Hook
 * 특정 컴포넌트의 상태와 액션 제공
 */
export function useCustomComponent(componentId: string | null) {
  const [component, setComponent] = useState<CustomComponentDefinition | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { loadAndRegisterComponent, updateComponent, deleteComponent } = useCustomComponents();

  useEffect(() => {
    if (!componentId) {
      setComponent(null);
      setIsLoaded(false);
      return;
    }

    const comp = customComponentManager.get(componentId);
    setComponent(comp || null);

    // 컴포넌트 변경 감지
    const handleUpdate = (event: CustomComponentEvent) => {
      if (event.componentId === componentId) {
        const updated = customComponentManager.get(componentId);
        setComponent(updated || null);
      }
    };

    customComponentManager.addEventListener("updated", handleUpdate);
    customComponentManager.addEventListener("deleted", handleUpdate);

    return () => {
      customComponentManager.removeEventListener("updated", handleUpdate);
      customComponentManager.removeEventListener("deleted", handleUpdate);
    };
  }, [componentId]);

  // 컴포넌트 로드
  const load = useCallback(async () => {
    if (!componentId) return;

    const result = await loadAndRegisterComponent(componentId);
    setIsLoaded(result.success);
    return result;
  }, [componentId, loadAndRegisterComponent]);

  // 컴포넌트 업데이트
  const update = useCallback(
    async (updates: any) => {
      if (!componentId) return;
      return updateComponent(componentId, updates);
    },
    [componentId, updateComponent],
  );

  // 컴포넌트 삭제
  const remove = useCallback(async () => {
    if (!componentId) return;
    return deleteComponent(componentId);
  }, [componentId, deleteComponent]);

  return {
    component,
    isLoaded,
    load,
    update,
    remove,
  };
}
 