// AIDEV-NOTE: 다중 라이브러리 매니저 - 여러 디자인 라이브러리 동시 관리
// 네임스페이스, 충돌 해결, 우선순위, 동적 로딩, 테마 격리 기능 제공

import { getComponentRegistry } from "@/lib/component-registry";
import type { AdapterLoadResult, DesignLibraryAdapter } from "@/types/adapter";
import type { BuilderComponentType, ComponentWrapper } from "@/types/component";
import type {
  AdapterPriority,
  ComponentConflict,
  ConflictResolutionStrategy,
  DynamicLoadOptions,
  LibraryNamespace,
  LibraryTheme,
  MultiLibraryAdapterLoadResult,
  MultiLibraryConfig,
  MultiLibraryEvent,
  MultiLibraryEventListener,
  MultiLibraryStats,
  NamespacedComponentId,
  NamespacedComponentResult,
  NamespaceFilter,
  NamespaceUtils,
} from "@/types/multi-library";

/**
 * 다중 라이브러리 매니저
 * 여러 디자인 라이브러리를 동시에 관리하고 충돌을 해결
 */
export class MultiLibraryManager implements NamespaceUtils {
  private adapters = new Map<LibraryNamespace, DesignLibraryAdapter>();
  private config: MultiLibraryConfig;
  private eventListeners = new Map<string, MultiLibraryEventListener[]>();
  private conflicts = new Map<BuilderComponentType, ComponentConflict>();
  private loadingStates = new Map<LibraryNamespace, "idle" | "loading" | "loaded" | "error">();

  constructor(initialConfig?: Partial<MultiLibraryConfig>) {
    this.config = {
      adapterPriorities: [
        { namespace: "shadcn", priority: 100, enabled: true, autoLoad: true },
        { namespace: "mui", priority: 90, enabled: false, autoLoad: false },
        { namespace: "antd", priority: 80, enabled: false, autoLoad: false },
        { namespace: "chakra", priority: 70, enabled: false, autoLoad: false },
        { namespace: "custom", priority: 60, enabled: true, autoLoad: true },
        { namespace: "native", priority: 10, enabled: true, autoLoad: true },
      ],
      defaultConflictResolution: "priority",
      themes: [],
      showNamespaces: true,
      autoResolveConflicts: true,
      fallbackChain: ["shadcn", "native"],
      ...initialConfig,
    };

    this.loadFromStorage();
  }

  // === 어댑터 관리 ===

  /**
   * 어댑터 등록
   */
  async registerAdapter(
    namespace: LibraryNamespace,
    adapter: DesignLibraryAdapter,
    options?: DynamicLoadOptions,
  ): Promise<MultiLibraryAdapterLoadResult> {
    const startTime = Date.now();
    this.setLoadingState(namespace, "loading");

    try {
      // 기존 어댑터 제거
      if (this.adapters.has(namespace)) {
        await this.unregisterAdapter(namespace);
      }

      // 어댑터 등록
      this.adapters.set(namespace, adapter);

      // 컴포넌트 등록 (네임스페이스 포함)
      const registry = getComponentRegistry();
      const components = adapter.registry.getAll();
      let componentCount = 0;

      for (const wrapper of components) {
        const namespacedWrapper = this.createNamespacedWrapper(namespace, wrapper);
        registry.register(namespacedWrapper);
        componentCount++;
      }

      // 충돌 감지 및 해결
      this.detectAndResolveConflicts();

      // 로딩 상태 업데이트
      this.setLoadingState(namespace, "loaded");

      const loadTime = Date.now() - startTime;
      const result: MultiLibraryAdapterLoadResult = {
        namespace,
        success: true,
        adapter,
        loadTime,
        componentCount,
      };

      // 이벤트 발생
      this.emit({
        type: "adapter-loaded",
        namespace,
        timestamp: Date.now(),
        data: result,
      });

      return result;
    } catch (error) {
      this.setLoadingState(namespace, "error");

      const result: MultiLibraryAdapterLoadResult = {
        namespace,
        success: false,
        error: error as Error,
        loadTime: Date.now() - startTime,
      };

      this.emit({
        type: "adapter-loaded",
        namespace,
        timestamp: Date.now(),
        error: error as Error,
      });

      return result;
    }
  }

  /**
   * 어댑터 제거
   */
  async unregisterAdapter(namespace: LibraryNamespace): Promise<boolean> {
    const adapter = this.adapters.get(namespace);
    if (!adapter) return false;

    try {
      this.setLoadingState(namespace, "loading");

      // 레지스트리에서 컴포넌트 제거
      const registry = getComponentRegistry();
      const components = adapter.registry.getAll();

      for (const wrapper of components) {
        const fullId = this.createFullId(namespace, wrapper.type);
        registry.unregister(fullId as BuilderComponentType);
      }

      // 어댑터 제거
      this.adapters.delete(namespace);
      this.setLoadingState(namespace, "idle");

      // 충돌 재계산
      this.detectAndResolveConflicts();

      // 이벤트 발생
      this.emit({
        type: "adapter-unloaded",
        namespace,
        timestamp: Date.now(),
      });

      return true;
    } catch (error) {
      console.error(`Failed to unregister adapter ${namespace}:`, error);
      return false;
    }
  }

  /**
   * 어댑터 가져오기
   */
  getAdapter(namespace: LibraryNamespace): DesignLibraryAdapter | undefined {
    return this.adapters.get(namespace);
  }

  /**
   * 모든 어댑터 가져오기
   */
  getAllAdapters(): Array<{ namespace: LibraryNamespace; adapter: DesignLibraryAdapter }> {
    return Array.from(this.adapters.entries()).map(([namespace, adapter]) => ({
      namespace,
      adapter,
    }));
  }

  // === 네임스페이스 유틸리티 ===

  /**
   * 전체 ID 생성
   */
  createFullId(namespace: LibraryNamespace, componentType: BuilderComponentType): string {
    return `${namespace}:${componentType}`;
  }

  /**
   * 전체 ID 파싱
   */
  parseFullId(fullId: string): NamespacedComponentId | null {
    const parts = fullId.split(":");
    if (parts.length !== 2) return null;

    const [namespaceStr, componentType] = parts;
    if (!this.validateNamespace(namespaceStr)) return null;

    return {
      namespace: namespaceStr,
      componentType: componentType as BuilderComponentType,
      fullId,
    };
  }

  /**
   * 네임스페이스 검증
   */
  validateNamespace(namespace: string): namespace is LibraryNamespace {
    const validNamespaces: LibraryNamespace[] = ["shadcn", "mui", "antd", "chakra", "mantine", "custom", "native"];
    return validNamespaces.includes(namespace as LibraryNamespace);
  }

  /**
   * 네임스페이스가 포함된 컴포넌트 래퍼 생성
   */
  private createNamespacedWrapper(namespace: LibraryNamespace, wrapper: ComponentWrapper): ComponentWrapper {
    const fullId = this.createFullId(namespace, wrapper.type);

    return {
      ...wrapper,
      type: fullId as BuilderComponentType,
      metadata: {
        ...wrapper.metadata,
        type: fullId as BuilderComponentType,
        displayName: this.config.showNamespaces
          ? `[${namespace}] ${wrapper.metadata.displayName}`
          : wrapper.metadata.displayName,
      },
    };
  }

  // === 충돌 관리 ===

  /**
   * 충돌 감지
   */
  detectConflicts(adapters?: DesignLibraryAdapter[]): ComponentConflict[] {
    const targetAdapters = adapters || Array.from(this.adapters.values());
    const conflicts: ComponentConflict[] = [];
    const componentMap = new Map<
      BuilderComponentType,
      Array<{
        namespace: LibraryNamespace;
        adapter: DesignLibraryAdapter;
        priority: number;
      }>
    >();

    // 컴포넌트별로 어댑터 그룹화
    for (const [namespace, adapter] of this.adapters.entries()) {
      const priority = this.getPriority(namespace);
      const components = adapter.registry.getAll();

      for (const wrapper of components) {
        if (!componentMap.has(wrapper.type)) {
          componentMap.set(wrapper.type, []);
        }
        componentMap.get(wrapper.type)!.push({
          namespace,
          adapter,
          priority,
        });
      }
    }

    // 충돌 감지
    for (const [componentType, adapters] of componentMap.entries()) {
      if (adapters.length > 1) {
        const conflict: ComponentConflict = {
          componentType,
          conflictingAdapters: adapters,
          resolutionStrategy: this.config.defaultConflictResolution,
        };
        conflicts.push(conflict);
      }
    }

    return conflicts;
  }

  /**
   * 충돌 감지 및 해결
   */
  private detectAndResolveConflicts(): void {
    const conflicts = this.detectConflicts();

    for (const conflict of conflicts) {
      this.resolveConflict(conflict);
    }
  }

  /**
   * 충돌 해결
   */
  private resolveConflict(conflict: ComponentConflict): void {
    let resolvedAdapter: DesignLibraryAdapter | undefined;

    switch (conflict.resolutionStrategy) {
      case "priority": {
        // 우선순위가 가장 높은 어댑터 선택
        const sortedAdapters = conflict.conflictingAdapters.sort((a, b) => b.priority - a.priority);
        resolvedAdapter = sortedAdapters[0]?.adapter;
        break;
      }

      case "fallback":
        // 폴백 체인 순서대로 선택
        for (const namespace of this.config.fallbackChain) {
          const adapter = conflict.conflictingAdapters.find((a) => a.namespace === namespace);
          if (adapter) {
            resolvedAdapter = adapter.adapter;
            break;
          }
        }
        break;

      case "namespace":
      case "user-choice":
      case "merge":
        // 이 전략들은 UI에서 사용자 입력이 필요
        // 현재는 우선순위 기반으로 폴백
        resolvedAdapter = conflict.conflictingAdapters.sort((a, b) => b.priority - a.priority)[0]?.adapter;
        break;
    }

    if (resolvedAdapter) {
      conflict.resolvedAdapter = resolvedAdapter;
      this.conflicts.set(conflict.componentType, conflict);

      this.emit({
        type: "conflict-resolved",
        namespace: this.getNamespaceByAdapter(resolvedAdapter)!,
        timestamp: Date.now(),
        data: conflict,
      });
    }
  }

  /**
   * 우선순위 정렬
   */
  sortByPriority(adapters: DesignLibraryAdapter[], priorities: AdapterPriority[]): DesignLibraryAdapter[] {
    return adapters.sort((a, b) => {
      const priorityA = this.getPriorityByAdapter(a, priorities);
      const priorityB = this.getPriorityByAdapter(b, priorities);
      return priorityB - priorityA;
    });
  }

  // === 컴포넌트 검색 ===

  /**
   * 네임스페이스 필터로 컴포넌트 검색
   */
  searchComponents(filter?: NamespaceFilter): NamespacedComponentResult[] {
    const results: NamespacedComponentResult[] = [];

    for (const [namespace, adapter] of this.adapters.entries()) {
      // 네임스페이스 필터 적용
      if (filter?.include && !filter.include.includes(namespace)) continue;
      if (filter?.exclude && filter.exclude.includes(namespace)) continue;

      const components = adapter.registry.getAll();
      const priority = this.getPriority(namespace);

      for (const wrapper of components) {
        // 카테고리별 필터 적용
        if (filter?.categoryFilter) {
          const category = wrapper.metadata.category;
          const allowedNamespaces = filter.categoryFilter[category as keyof typeof filter.categoryFilter];
          if (allowedNamespaces && !allowedNamespaces.includes(namespace)) continue;
        }

        const id: NamespacedComponentId = {
          namespace,
          componentType: wrapper.type,
          fullId: this.createFullId(namespace, wrapper.type),
        };

        const conflict = this.conflicts.get(wrapper.type);
        const hasConflict = conflict !== undefined;

        results.push({
          id,
          wrapper,
          adapter,
          priorityScore: priority,
          hasConflict,
        });
      }
    }

    return results.sort((a, b) => b.priorityScore - a.priorityScore);
  }

  // === 설정 관리 ===

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<MultiLibraryConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveToStorage();

    // 우선순위 변경 시 충돌 재해결
    if (newConfig.adapterPriorities || newConfig.defaultConflictResolution) {
      this.detectAndResolveConflicts();
    }
  }

  /**
   * 현재 설정 가져오기
   */
  getConfig(): MultiLibraryConfig {
    return { ...this.config };
  }

  /**
   * 우선순위 설정
   */
  setPriority(namespace: LibraryNamespace, priority: number): void {
    const existing = this.config.adapterPriorities.find((p) => p.namespace === namespace);
    if (existing) {
      existing.priority = priority;
    } else {
      this.config.adapterPriorities.push({
        namespace,
        priority,
        enabled: true,
        autoLoad: false,
      });
    }

    this.saveToStorage();
    this.detectAndResolveConflicts();

    this.emit({
      type: "priority-changed",
      namespace,
      timestamp: Date.now(),
      data: { priority },
    });
  }

  // === 통계 ===

  /**
   * 다중 라이브러리 통계
   */
  getStats(): MultiLibraryStats {
    const stats: MultiLibraryStats = {
      loadedAdapters: this.adapters.size,
      totalComponents: 0,
      componentsByNamespace: {} as Record<LibraryNamespace, number>,
      conflictingComponents: this.conflicts.size,
      activeThemes: this.config.themes.length,
      estimatedMemoryUsage: 0,
    };

    for (const [namespace, adapter] of this.adapters.entries()) {
      const componentCount = adapter.registry.getAll().length;
      stats.totalComponents += componentCount;
      stats.componentsByNamespace[namespace] = componentCount;
    }

    // 메모리 사용량 추정 (매우 대략적)
    stats.estimatedMemoryUsage = stats.totalComponents * 1024; // 컴포넌트당 1KB 추정

    return stats;
  }

  // === 이벤트 시스템 ===

  /**
   * 이벤트 리스너 추가
   */
  addEventListener(type: MultiLibraryEvent["type"], listener: MultiLibraryEventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(listener);
  }

  /**
   * 이벤트 리스너 제거
   */
  removeEventListener(type: MultiLibraryEvent["type"], listener: MultiLibraryEventListener): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 이벤트 발생
   */
  private emit(event: MultiLibraryEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error("Error in multi-library event listener:", error);
        }
      });
    }
  }

  // === Private 헬퍼 메서드 ===

  private getPriority(namespace: LibraryNamespace): number {
    const priority = this.config.adapterPriorities.find((p) => p.namespace === namespace);
    return priority?.priority || 0;
  }

  private getPriorityByAdapter(adapter: DesignLibraryAdapter, priorities: AdapterPriority[]): number {
    const namespace = this.getNamespaceByAdapter(adapter);
    if (!namespace) return 0;

    const priority = priorities.find((p) => p.namespace === namespace);
    return priority?.priority || 0;
  }

  private getNamespaceByAdapter(adapter: DesignLibraryAdapter): LibraryNamespace | undefined {
    for (const [namespace, registeredAdapter] of this.adapters.entries()) {
      if (registeredAdapter === adapter) {
        return namespace;
      }
    }
    return undefined;
  }

  private setLoadingState(namespace: LibraryNamespace, state: "idle" | "loading" | "loaded" | "error"): void {
    this.loadingStates.set(namespace, state);
  }

  // === 저장/로드 ===

  private saveToStorage(): void {
    // AIDEV-NOTE: SSR 호환성 - 클라이언트 사이드에서만 localStorage 접근
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem("multi-library-config", JSON.stringify(this.config));
    } catch (error) {
      console.error("Failed to save multi-library config:", error);
    }
  }

  private loadFromStorage(): void {
    // AIDEV-NOTE: SSR 호환성 - 클라이언트 사이드에서만 localStorage 접근
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem("multi-library-config");
      if (saved) {
        const config = JSON.parse(saved) as MultiLibraryConfig;
        this.config = { ...this.config, ...config };
      }
    } catch (error) {
      console.error("Failed to load multi-library config:", error);
    }
  }
}

/**
 * 전역 다중 라이브러리 매니저 인스턴스
 */
export const multiLibraryManager = new MultiLibraryManager();
