// AIDEV-NOTE: 확장된 ComponentRegistry 구현체 - 어댑터 패턴의 핵심
// 이벤트 시스템, 의존성 관리, 성능 최적화, 검증 기능 포함

import type {
  BuilderComponentType,
  ComponentCategory,
  ComponentDependency,
  ComponentRegistry,
  ComponentRegistryEvent,
  ComponentRegistryEventListener,
  ComponentRegistryEventType,
  ComponentRegistryStats,
  ComponentValidationResult,
  ComponentWrapper,
} from "@/types/component";

/**
 * 확장된 ComponentRegistry 구현체
 * 이벤트 시스템, 의존성 관리, 성능 최적화 기능 포함
 */
export class AdvancedComponentRegistry implements ComponentRegistry {
  public components: Map<BuilderComponentType, ComponentWrapper> = new Map();

  // 이벤트 시스템
  private eventListeners: Map<ComponentRegistryEventType, ComponentRegistryEventListener[]> = new Map();

  // 성능 최적화용 인덱스
  private categoryIndex: Map<ComponentCategory, Set<BuilderComponentType>> = new Map();

  // 의존성 관리
  private dependencies: Map<BuilderComponentType, ComponentDependency> = new Map();

  // 등록 순서 추적
  private registrationOrder: BuilderComponentType[] = [];

  // 통계 정보
  private lastModified: number = Date.now();

  constructor() {
    this.initializeCategoryIndex();
  }

  // === 기본 CRUD 작업 ===

  /**
   * 컴포넌트 등록
   */
  register(wrapper: ComponentWrapper): void {
    const { type } = wrapper;

    // 검증
    const validation = this.validateComponent(wrapper);
    if (!validation.isValid) {
      console.warn(`Component validation failed for ${type}:`, validation.errors);
    }

    // 기존 컴포넌트 교체 여부 확인
    const isUpdate = this.components.has(type);

    // 등록
    this.components.set(type, wrapper);

    // 인덱스 업데이트
    this.updateCategoryIndex(type, wrapper.metadata.category);

    if (!isUpdate) {
      // 등록 순서 추적
      this.registrationOrder.push(type);
    }

    // 통계 업데이트
    this.lastModified = Date.now();

    // 이벤트 발생
    this.emitEvent({
      type: isUpdate ? "component-updated" : "component-registered",
      component: wrapper,
      timestamp: this.lastModified,
    });
  }

  /**
   * 컴포넌트 조회
   */
  get(type: BuilderComponentType): ComponentWrapper | undefined {
    return this.components.get(type);
  }

  /**
   * 모든 컴포넌트 조회
   */
  getAll(): ComponentWrapper[] {
    return Array.from(this.components.values());
  }

  /**
   * 카테고리별 컴포넌트 조회 (최적화된 버전)
   */
  getByCategory(category: ComponentCategory): ComponentWrapper[] {
    const types = this.categoryIndex.get(category);
    if (!types) return [];

    const components: ComponentWrapper[] = [];
    for (const type of types) {
      const wrapper = this.components.get(type);
      if (wrapper) {
        components.push(wrapper);
      }
    }

    return components;
  }

  /**
   * 컴포넌트 존재 여부 확인
   */
  has(type: BuilderComponentType): boolean {
    return this.components.has(type);
  }

  /**
   * 컴포넌트 제거
   */
  unregister(type: BuilderComponentType): boolean {
    const wrapper = this.components.get(type);
    if (!wrapper) return false;

    // 컴포넌트 제거
    const success = this.components.delete(type);

    if (success) {
      // 인덱스 업데이트
      this.removeCategoryIndex(type, wrapper.metadata.category);

      // 등록 순서에서 제거
      const orderIndex = this.registrationOrder.indexOf(type);
      if (orderIndex !== -1) {
        this.registrationOrder.splice(orderIndex, 1);
      }

      // 의존성 정보 제거
      this.dependencies.delete(type);

      // 통계 업데이트
      this.lastModified = Date.now();

      // 이벤트 발생
      this.emitEvent({
        type: "component-unregistered",
        component: wrapper,
        timestamp: this.lastModified,
      });
    }

    return success;
  }

  // === 확장된 기능 ===

  /**
   * 여러 컴포넌트 일괄 등록
   */
  registerMany(wrappers: ComponentWrapper[]): void {
    const registeredComponents: ComponentWrapper[] = [];

    for (const wrapper of wrappers) {
      try {
        this.register(wrapper);
        registeredComponents.push(wrapper);
      } catch (error) {
        console.error(`Failed to register component ${wrapper.type}:`, error);
      }
    }

    // 일괄 등록 이벤트 발생
    if (registeredComponents.length > 0) {
      this.emitEvent({
        type: "component-registered",
        components: registeredComponents,
        timestamp: this.lastModified,
      });
    }
  }

  /**
   * 여러 컴포넌트 일괄 제거
   */
  unregisterMany(types: BuilderComponentType[]): boolean[] {
    return types.map((type) => this.unregister(type));
  }

  /**
   * 컴포넌트 검증
   */
  validateComponent(wrapper: ComponentWrapper): ComponentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 기본 검증
    if (!wrapper.type) {
      errors.push("Component type is required");
    }

    if (!wrapper.component) {
      errors.push("React component is required");
    }

    if (!wrapper.metadata) {
      errors.push("Component metadata is required");
    } else {
      // 메타데이터 검증
      if (!wrapper.metadata.displayName) {
        errors.push("Display name is required");
      }

      if (!wrapper.metadata.description) {
        warnings.push("Description is recommended");
      }

      if (!wrapper.metadata.icon) {
        warnings.push("Icon is recommended");
      }
    }

    if (!wrapper.propsSchema) {
      warnings.push("Props schema is recommended for better validation");
    }

    // 중복 등록 확인
    if (this.components.has(wrapper.type)) {
      warnings.push(`Component ${wrapper.type} is already registered and will be replaced`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 의존성 정보 조회
   */
  getDependencies(type: BuilderComponentType): ComponentDependency | undefined {
    return this.dependencies.get(type);
  }

  /**
   * 의존성 순서로 컴포넌트 정렬
   */
  resolveDependencyOrder(): BuilderComponentType[] {
    // 현재는 등록 순서 반환 (향후 실제 의존성 해결 로직 구현)
    return [...this.registrationOrder];
  }

  /**
   * 레지스트리 통계 조회
   */
  getStats(): ComponentRegistryStats {
    const componentsByCategory: Record<ComponentCategory, number> = {
      Layout: 0,
      Basic: 0,
      Form: 0,
      DataDisplay: 0,
      Feedback: 0,
    };

    // 카테고리별 컴포넌트 수 계산
    for (const wrapper of this.components.values()) {
      componentsByCategory[wrapper.metadata.category]++;
    }

    return {
      totalComponents: this.components.size,
      componentsByCategory,
      registrationOrder: [...this.registrationOrder],
      lastModified: this.lastModified,
    };
  }

  // === 이벤트 시스템 ===

  /**
   * 이벤트 리스너 추가
   */
  addEventListener(type: ComponentRegistryEventType, listener: ComponentRegistryEventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(listener);
  }

  /**
   * 이벤트 리스너 제거
   */
  removeEventListener(type: ComponentRegistryEventType, listener: ComponentRegistryEventListener): void {
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
  private emitEvent(event: ComponentRegistryEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          console.error("Error in registry event listener:", error);
        }
      }
    }
  }

  // === 성능 최적화 ===

  /**
   * 카테고리별 인덱스 초기화
   */
  private initializeCategoryIndex(): void {
    const categories: ComponentCategory[] = ["Layout", "Basic", "Form", "DataDisplay", "Feedback"];
    for (const category of categories) {
      this.categoryIndex.set(category, new Set());
    }
  }

  /**
   * 카테고리 인덱스 업데이트
   */
  private updateCategoryIndex(type: BuilderComponentType, category: ComponentCategory): void {
    // 기존 카테고리에서 제거
    for (const [cat, types] of this.categoryIndex.entries()) {
      types.delete(type);
    }

    // 새 카테고리에 추가
    if (!this.categoryIndex.has(category)) {
      this.categoryIndex.set(category, new Set());
    }
    this.categoryIndex.get(category)!.add(type);
  }

  /**
   * 카테고리 인덱스에서 제거
   */
  private removeCategoryIndex(type: BuilderComponentType, category: ComponentCategory): void {
    const types = this.categoryIndex.get(category);
    if (types) {
      types.delete(type);
    }
  }

  /**
   * 카테고리별 인덱스 재구성
   */
  rebuildCategoryIndex(): void {
    this.initializeCategoryIndex();

    for (const [type, wrapper] of this.components.entries()) {
      this.updateCategoryIndex(type, wrapper.metadata.category);
    }
  }

  /**
   * 컴포넌트 사전 로드 (기본 구현)
   */

  async preloadComponents(types: BuilderComponentType[]): Promise<void> {
    // 현재는 기본 구현 (향후 실제 동적 로딩 구현)
    const promises = types.map(async (type) => {
      const wrapper = this.components.get(type);
      if (wrapper) {
        // 컴포넌트가 이미 로드됨
        return Promise.resolve();
      }
      // 향후 동적 로딩 로직 구현
      return Promise.resolve();
    });

    await Promise.all(promises);
  }

  // === 기존 호환성 메서드 ===

  /**
   * 레지스트리 초기화 (모든 컴포넌트 제거)
   */
  clear(): void {
    const allComponents = this.getAll();

    this.components.clear();
    this.categoryIndex.clear();
    this.dependencies.clear();
    this.registrationOrder = [];
    this.lastModified = Date.now();

    this.initializeCategoryIndex();

    // 이벤트 발생
    this.emitEvent({
      type: "registry-cleared",
      components: allComponents,
      timestamp: this.lastModified,
    });
  }

  /**
   * 등록된 컴포넌트 수 조회
   */
  size(): number {
    return this.components.size;
  }

  /**
   * 등록된 모든 컴포넌트 타입 조회
   */
  getTypes(): BuilderComponentType[] {
    return Array.from(this.components.keys());
  }
}

/**
 * 전역 컴포넌트 레지스트리 인스턴스
 * 싱글톤 패턴으로 관리
 */
let globalRegistry: ComponentRegistry | null = null;

/**
 * 전역 컴포넌트 레지스트리 조회
 * 없으면 새로 생성 (확장된 버전 사용)
 */
export function getComponentRegistry(): ComponentRegistry {
  if (!globalRegistry) {
    globalRegistry = new AdvancedComponentRegistry();
  }
  return globalRegistry;
}

/**
 * 전역 컴포넌트 레지스트리 설정
 * 어댑터 전환 시 사용
 */
export function setComponentRegistry(registry: ComponentRegistry): void {
  globalRegistry = registry;
}

/**
 * 전역 컴포넌트 레지스트리 초기화
 */
export function resetComponentRegistry(): void {
  globalRegistry = null;
}

/**
 * 확장된 레지스트리 인스턴스 생성 헬퍼
 */
export function createAdvancedRegistry(): AdvancedComponentRegistry {
  return new AdvancedComponentRegistry();
}

// === 레거시 호환성 ===

/**
 * 기존 ComponentRegistryImpl (호환성 유지)
 * @deprecated Use AdvancedComponentRegistry instead
 */
export class ComponentRegistryImpl extends AdvancedComponentRegistry {
  constructor() {
    super();
    console.warn("ComponentRegistryImpl is deprecated. Use AdvancedComponentRegistry instead.");
  }
}
