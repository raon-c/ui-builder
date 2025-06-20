// AIDEV-NOTE: ComponentRegistry 구현체 - 어댑터 패턴의 핵심
// 컴포넌트 등록, 조회, 관리를 담당하는 중앙 저장소

import type {
  BuilderComponentType,
  ComponentCategory,
  ComponentRegistry,
  ComponentWrapper,
} from "@/types/component";

/**
 * ComponentRegistry 구현체
 * Map 기반으로 컴포넌트를 저장하고 관리
 */
export class ComponentRegistryImpl implements ComponentRegistry {
  public components: Map<BuilderComponentType, ComponentWrapper> = new Map();

  /**
   * 컴포넌트 등록
   */
  register(wrapper: ComponentWrapper): void {
    this.components.set(wrapper.type, wrapper);
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
   * 카테고리별 컴포넌트 조회
   */
  getByCategory(category: ComponentCategory): ComponentWrapper[] {
    return this.getAll().filter(
      (wrapper) => wrapper.metadata.category === category,
    );
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
    return this.components.delete(type);
  }

  /**
   * 레지스트리 초기화 (모든 컴포넌트 제거)
   */
  clear(): void {
    this.components.clear();
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
 * 없으면 새로 생성
 */
export function getComponentRegistry(): ComponentRegistry {
  if (!globalRegistry) {
    globalRegistry = new ComponentRegistryImpl();
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
