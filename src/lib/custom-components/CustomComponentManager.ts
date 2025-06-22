// AIDEV-NOTE: 커스텀 컴포넌트 매니저 - 사용자 정의 컴포넌트 관리 시스템
// 컴포넌트 등록, 검증, 컴파일, 저장, 로드 등 전체 라이프사이클 관리

import { z } from "zod";
import { nanoid } from "@/lib/nanoid";
import type {
  BuilderComponentType,
  ComponentMetadata,
  ComponentPropsSchema,
  ComponentWrapper,
} from "@/types/component";
import type {
  CustomComponentDefinition,
  CustomComponentEvent,
  CustomComponentEventListener,
  CustomComponentFilter,
  CustomComponentLoadResult,
  CustomComponentRegistrationRequest,
  CustomComponentStatus,
  CustomComponentUpdateRequest,
  CustomComponentValidation,
} from "@/types/custom-component";

/**
 * 커스텀 컴포넌트 매니저
 * 사용자 정의 컴포넌트의 전체 라이프사이클 관리
 */
export class CustomComponentManager {
  private components = new Map<string, CustomComponentDefinition>();
  private eventListeners = new Map<string, CustomComponentEventListener[]>();
  private compiledCache = new Map<string, ComponentWrapper>();

  constructor() {
    this.loadFromStorage();
  }

  // === 컴포넌트 등록 ===
  async register(request: CustomComponentRegistrationRequest): Promise<CustomComponentDefinition> {
    try {
      // ID 생성
      const id = `custom-${nanoid()}`;

      // 기본 메타데이터 생성
      const metadata = {
        id,
        name: request.name,
        displayName: request.displayName,
        description: request.description,
        version: "1.0.0",
        author: {
          name: "User", // 실제로는 현재 사용자 정보 사용
        },
        category: request.category,
        tags: request.tags || [],
        icon: request.icon,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: request.isPublic || false,
        experimental: request.experimental || false,
      };

      // 컴포넌트 정의 생성
      const definition: CustomComponentDefinition = {
        metadata,
        sourceType: request.sourceType,
        code: {
          source: request.code,
          styles: request.styles,
          dependencies: request.dependencies,
        },
        props: {
          schema: request.propsSchema || "z.object({})",
          defaults: request.defaultProps,
        },
        status: "draft",
      };

      // 검증 수행
      const validation = await this.validateComponent(definition);
      definition.validation = validation;
      definition.status = validation.isValid ? "valid" : "invalid";

      // 저장
      this.components.set(id, definition);
      this.saveToStorage();

      // 이벤트 발생
      this.emit({
        type: "registered",
        componentId: id,
        timestamp: Date.now(),
        data: definition,
      });

      return definition;
    } catch (error) {
      console.error("컴포넌트 등록 실패:", error);
      throw error;
    }
  }

  // === 컴포넌트 업데이트 ===
  async update(id: string, request: CustomComponentUpdateRequest): Promise<CustomComponentDefinition> {
    const component = this.components.get(id);
    if (!component) {
      throw new Error(`컴포넌트를 찾을 수 없습니다: ${id}`);
    }

    // 메타데이터 업데이트
    if (request.metadata) {
      Object.assign(component.metadata, request.metadata, {
        updatedAt: new Date().toISOString(),
      });
    }

    // 코드 업데이트
    if (request.code) {
      Object.assign(component.code, request.code);
    }

    // Props 업데이트
    if (request.props) {
      Object.assign(component.props, request.props);
    }

    // 상태 업데이트
    if (request.status) {
      component.status = request.status;
    }

    // 재검증
    if (request.code || request.props) {
      const validation = await this.validateComponent(component);
      component.validation = validation;
      component.status = validation.isValid ? "valid" : "invalid";

      // 캐시 무효화
      this.compiledCache.delete(id);
    }

    // 저장
    this.saveToStorage();

    // 이벤트 발생
    this.emit({
      type: "updated",
      componentId: id,
      timestamp: Date.now(),
      data: component,
    });

    return component;
  }

  // === 컴포넌트 삭제 ===
  delete(id: string): boolean {
    const component = this.components.get(id);
    if (!component) {
      return false;
    }

    this.components.delete(id);
    this.compiledCache.delete(id);
    this.saveToStorage();

    this.emit({
      type: "deleted",
      componentId: id,
      timestamp: Date.now(),
      data: component,
    });

    return true;
  }

  // === 컴포넌트 조회 ===
  get(id: string): CustomComponentDefinition | undefined {
    return this.components.get(id);
  }

  getAll(): CustomComponentDefinition[] {
    return Array.from(this.components.values());
  }

  search(filter: CustomComponentFilter): CustomComponentDefinition[] {
    let results = this.getAll();

    // 검색어 필터
    if (filter.query) {
      const query = filter.query.toLowerCase();
      results = results.filter(
        (comp) =>
          comp.metadata.name.toLowerCase().includes(query) ||
          comp.metadata.displayName.toLowerCase().includes(query) ||
          comp.metadata.description.toLowerCase().includes(query) ||
          comp.metadata.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    // 카테고리 필터
    if (filter.categories && filter.categories.length > 0) {
      results = results.filter((comp) => filter.categories!.includes(comp.metadata.category));
    }

    // 태그 필터
    if (filter.tags && filter.tags.length > 0) {
      results = results.filter((comp) => filter.tags!.some((tag) => comp.metadata.tags.includes(tag)));
    }

    // 상태 필터
    if (filter.status && filter.status.length > 0) {
      results = results.filter((comp) => filter.status!.includes(comp.status));
    }

    // 공개 여부 필터
    if (filter.isPublic !== undefined) {
      results = results.filter((comp) => comp.metadata.isPublic === filter.isPublic);
    }

    // 정렬
    if (filter.sortBy) {
      results.sort((a, b) => {
        let compareValue = 0;

        switch (filter.sortBy) {
          case "name":
            compareValue = a.metadata.name.localeCompare(b.metadata.name);
            break;
          case "createdAt":
            compareValue = new Date(a.metadata.createdAt).getTime() - new Date(b.metadata.createdAt).getTime();
            break;
          case "updatedAt":
            compareValue = new Date(a.metadata.updatedAt).getTime() - new Date(b.metadata.updatedAt).getTime();
            break;
          case "usage":
            compareValue = (a.usage?.count || 0) - (b.usage?.count || 0);
            break;
        }

        return filter.sortOrder === "desc" ? -compareValue : compareValue;
      });
    }

    return results;
  }

  // === 컴포넌트 검증 ===
  async validateComponent(definition: CustomComponentDefinition): Promise<CustomComponentValidation> {
    const errors: CustomComponentValidation["errors"] = [];
    const warnings: CustomComponentValidation["warnings"] = [];

    try {
      // 1. 기본 검증
      if (!definition.code.source.trim()) {
        errors.push({
          type: "syntax",
          message: "컴포넌트 코드가 비어있습니다.",
        });
      }

      // 2. 문법 검증 (간단한 버전)
      try {
        // React 컴포넌트 패턴 확인
        const hasComponentPattern = /(?:function|const|class)\s+\w+|export\s+(?:default|function|const|class)/i.test(
          definition.code.source,
        );
        if (!hasComponentPattern) {
          errors.push({
            type: "syntax",
            message: "유효한 React 컴포넌트 패턴을 찾을 수 없습니다.",
          });
        }

        // JSX 사용 확인
        const hasJSX = /<[A-Z]\w*|<[a-z]+/i.test(definition.code.source);
        if (!hasJSX) {
          warnings.push({
            type: "jsx",
            message: "JSX를 사용하지 않는 것 같습니다.",
          });
        }
      } catch (error) {
        errors.push({
          type: "syntax",
          message: `문법 검증 실패: ${(error as Error).message}`,
        });
      }

      // 3. Props 스키마 검증
      if (definition.props.schema) {
        try {
          // Zod 스키마 문법 간단 검증
          if (!definition.props.schema.includes("z.")) {
            errors.push({
              type: "type",
              message: "Props 스키마가 Zod 형식이 아닙니다.",
            });
          }
        } catch (error) {
          errors.push({
            type: "type",
            message: `Props 스키마 검증 실패: ${(error as Error).message}`,
          });
        }
      }

      // 4. 의존성 검증
      if (definition.code.dependencies) {
        const invalidDeps = Object.entries(definition.code.dependencies)
          .filter(([name, version]) => !name || !version)
          .map(([name]) => name);

        if (invalidDeps.length > 0) {
          errors.push({
            type: "dependency",
            message: `잘못된 의존성: ${invalidDeps.join(", ")}`,
          });
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        validatedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [
          {
            type: "runtime",
            message: `검증 중 오류 발생: ${(error as Error).message}`,
          },
        ],
        warnings,
        validatedAt: new Date().toISOString(),
      };
    }
  }

  // === 컴포넌트 로드 ===
  async loadComponent(id: string): Promise<CustomComponentLoadResult> {
    try {
      const definition = this.components.get(id);
      if (!definition) {
        return {
          success: false,
          error: new Error(`컴포넌트를 찾을 수 없습니다: ${id}`),
        };
      }

      // 캐시 확인
      if (this.compiledCache.has(id)) {
        return {
          success: true,
          wrapper: this.compiledCache.get(id),
        };
      }

      // 검증 확인
      if (definition.status !== "valid" && definition.status !== "published") {
        return {
          success: false,
          error: new Error(`컴포넌트가 유효하지 않습니다: ${definition.status}`),
        };
      }

      // 동적 컴포넌트 생성
      const wrapper = await this.createComponentWrapper(definition);

      // 캐시 저장
      this.compiledCache.set(id, wrapper);

      return {
        success: true,
        wrapper,
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  // === Private 메서드 ===
  private async createComponentWrapper(definition: CustomComponentDefinition): Promise<ComponentWrapper> {
    // 동적 컴포넌트 생성 (간단한 버전)
    // 실제로는 더 복잡한 컴파일 과정이 필요
    const componentFunction = new Function(
      "React",
      "props",
      `
      ${definition.code.source}
      return Component;
      `,
    );

    const Component = componentFunction(require("react"), {});

    // 기본 props 스키마 생성
    const propsSchema: ComponentPropsSchema = {
      type: definition.metadata.name as BuilderComponentType,
      schema: z.object({}), // 실제로는 definition.props.schema를 파싱해서 생성
      fields: [],
    };

    // 기본 메타데이터 생성
    const metadata: ComponentMetadata = {
      type: definition.metadata.name as BuilderComponentType,
      displayName: definition.metadata.displayName,
      description: definition.metadata.description,
      category: definition.metadata.category === "Custom" ? "Basic" : definition.metadata.category,
      icon: definition.metadata.icon || "Component",
      defaultProps: definition.props.defaults || {},
      canHaveChildren: false,
      draggable: true,
      deletable: true,
    };

    return {
      type: definition.metadata.name as BuilderComponentType,
      component: Component,
      metadata,
      propsSchema,
    };
  }

  // === 이벤트 시스템 ===
  addEventListener(type: CustomComponentEvent["type"], listener: CustomComponentEventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(listener);
  }

  removeEventListener(type: CustomComponentEvent["type"], listener: CustomComponentEventListener): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: CustomComponentEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error("이벤트 리스너 오류:", error);
        }
      });
    }
  }

  // === 저장/로드 ===
  private saveToStorage(): void {
    try {
      const data = Array.from(this.components.entries());
      localStorage.setItem("custom-components", JSON.stringify(data));
    } catch (error) {
      console.error("컴포넌트 저장 실패:", error);
    }
  }

  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem("custom-components");
      if (data) {
        const entries = JSON.parse(data) as Array<[string, CustomComponentDefinition]>;
        this.components = new Map(entries);
      }
    } catch (error) {
      console.error("컴포넌트 로드 실패:", error);
    }
  }

  // === 통계 ===
  updateUsage(id: string, projectId?: string): void {
    const component = this.components.get(id);
    if (!component) return;

    if (!component.usage) {
      component.usage = {
        count: 0,
        projects: [],
      };
    }

    component.usage.count++;
    component.usage.lastUsed = new Date().toISOString();

    if (projectId && !component.usage.projects?.includes(projectId)) {
      component.usage.projects?.push(projectId);
    }

    this.saveToStorage();
  }
}

/**
 * 전역 커스텀 컴포넌트 매니저 인스턴스
 */
export const customComponentManager = new CustomComponentManager();
