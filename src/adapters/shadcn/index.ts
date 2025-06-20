// AIDEV-NOTE: shadcn/ui 어댑터 엔트리포인트 - DesignLibraryAdapter 구현
// 어댑터 패턴의 최상위 인터페이스, 컴포넌트 등록 및 초기화 관리

import { ComponentRegistryImpl } from "@/lib/component-registry";
import type { DesignLibraryAdapter } from "@/types/component";
import { allShadcnComponents } from "./components";

/**
 * shadcn/ui 디자인 라이브러리 어댑터
 * DesignLibraryAdapter 인터페이스 구현
 */
export class ShadcnAdapter implements DesignLibraryAdapter {
  public readonly name = "shadcn";
  public readonly version = "1.0.0";
  public readonly description = "shadcn/ui 기반 디자인 시스템 어댑터";
  public readonly registry = new ComponentRegistryImpl();

  /**
   * 어댑터 초기화
   * 모든 shadcn/ui 컴포넌트를 레지스트리에 등록
   */
  initialize(): void {
    // 기존 컴포넌트 모두 제거
    this.registry.clear();

    // shadcn/ui 컴포넌트들 등록
    for (const componentWrapper of allShadcnComponents) {
      this.registry.register(componentWrapper);
    }

    console.log(
      `[ShadcnAdapter] ${this.registry.size()}개 컴포넌트 등록 완료:`,
      this.registry.getTypes(),
    );
  }

  /**
   * 어댑터 정리
   * 메모리 누수 방지를 위한 정리 작업
   */
  cleanup(): void {
    this.registry.clear();
    console.log("[ShadcnAdapter] 정리 완료");
  }

  /**
   * 카테고리별 컴포넌트 조회 헬퍼
   */
  getComponentsByCategory() {
    return {
      Layout: this.registry.getByCategory("Layout"),
      Basic: this.registry.getByCategory("Basic"),
      Form: this.registry.getByCategory("Form"),
      DataDisplay: this.registry.getByCategory("DataDisplay"),
      Feedback: this.registry.getByCategory("Feedback"),
    };
  }
}

/**
 * shadcn/ui 어댑터 싱글톤 인스턴스
 */
export const shadcnAdapter = new ShadcnAdapter();

/**
 * 어댑터 초기화 헬퍼 함수
 * 애플리케이션 시작 시 호출
 */
export function initializeShadcnAdapter(): ShadcnAdapter {
  shadcnAdapter.initialize();
  return shadcnAdapter;
}

// 편의를 위한 re-export
export { allShadcnComponents } from "./components";
export { type ButtonProps, buttonPropsSchema } from "./schema";
