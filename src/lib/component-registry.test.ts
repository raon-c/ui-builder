import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ComponentRegistryEvent, ComponentWrapper } from "@/types/component";
import {
  AdvancedComponentRegistry,
  getComponentRegistry,
  resetComponentRegistry,
  setComponentRegistry,
} from "./component-registry";

// 테스트용 모크 컴포넌트 래퍼
const mockButtonWrapper: ComponentWrapper = {
  type: "Button",
  component: () => null, // React 컴포넌트 모크
  metadata: {
    type: "Button",
    displayName: "버튼",
    description: "클릭 가능한 버튼 컴포넌트",
    category: "Basic",
    icon: "mouse-pointer",
    defaultProps: { text: "버튼", variant: "default" },
    canHaveChildren: false,
    draggable: true,
    deletable: true,
  },
  propsSchema: {
    type: "Button",
    schema: {} as any, // Zod 스키마 모크
    fields: [],
  },
};

const mockInputWrapper: ComponentWrapper = {
  type: "Input",
  component: () => null,
  metadata: {
    type: "Input",
    displayName: "입력",
    description: "텍스트 입력 필드",
    category: "Form",
    icon: "type",
    defaultProps: { placeholder: "입력하세요" },
    canHaveChildren: false,
    draggable: true,
    deletable: true,
  },
  propsSchema: {
    type: "Input",
    schema: {} as any,
    fields: [],
  },
};

const mockCardWrapper: ComponentWrapper = {
  type: "Card",
  component: () => null,
  metadata: {
    type: "Card",
    displayName: "카드",
    description: "카드 레이아웃 컴포넌트",
    category: "Layout",
    icon: "square",
    defaultProps: {},
    canHaveChildren: true,
    draggable: true,
    deletable: true,
  },
  propsSchema: {
    type: "Card",
    schema: {} as any,
    fields: [],
  },
};

describe("AdvancedComponentRegistry", () => {
  let registry: AdvancedComponentRegistry;

  beforeEach(() => {
    registry = new AdvancedComponentRegistry();
  });

  describe("basic CRUD operations", () => {
    it("should register and retrieve component", () => {
      registry.register(mockButtonWrapper);

      const retrieved = registry.get("Button");
      expect(retrieved).toEqual(mockButtonWrapper);
      expect(registry.has("Button")).toBe(true);
      expect(registry.size()).toBe(1);
    });

    it("should return undefined for non-existent component", () => {
      const retrieved = registry.get("Button"); // 등록되지 않은 상태에서 조회
      expect(retrieved).toBeUndefined();
      expect(registry.has("Button")).toBe(false);
    });

    it("should unregister component", () => {
      registry.register(mockButtonWrapper);

      const success = registry.unregister("Button");
      expect(success).toBe(true);
      expect(registry.has("Button")).toBe(false);
      expect(registry.size()).toBe(0);
    });

    it("should return false when unregistering non-existent component", () => {
      const success = registry.unregister("Button"); // 등록되지 않은 상태에서 제거 시도
      expect(success).toBe(false);
    });

    it("should get all registered components", () => {
      registry.register(mockButtonWrapper);
      registry.register(mockInputWrapper);

      const allComponents = registry.getAll();
      expect(allComponents).toHaveLength(2);
      expect(allComponents).toContain(mockButtonWrapper);
      expect(allComponents).toContain(mockInputWrapper);
    });

    it("should get all component types", () => {
      registry.register(mockButtonWrapper);
      registry.register(mockInputWrapper);

      const types = registry.getTypes();
      expect(types).toHaveLength(2);
      expect(types).toContain("Button");
      expect(types).toContain("Input");
    });
  });

  describe("category-based operations", () => {
    beforeEach(() => {
      registry.register(mockButtonWrapper); // Basic
      registry.register(mockInputWrapper); // Form
      registry.register(mockCardWrapper); // Layout
    });

    it("should get components by category", () => {
      const basicComponents = registry.getByCategory("Basic");
      expect(basicComponents).toHaveLength(1);
      expect(basicComponents[0]).toEqual(mockButtonWrapper);

      const formComponents = registry.getByCategory("Form");
      expect(formComponents).toHaveLength(1);
      expect(formComponents[0]).toEqual(mockInputWrapper);

      const layoutComponents = registry.getByCategory("Layout");
      expect(layoutComponents).toHaveLength(1);
      expect(layoutComponents[0]).toEqual(mockCardWrapper);
    });

    it("should return empty array for category with no components", () => {
      const feedbackComponents = registry.getByCategory("Feedback");
      expect(feedbackComponents).toHaveLength(0);
    });

    it("should rebuild category index correctly", () => {
      // 카테고리 인덱스 손상 시뮬레이션
      registry.rebuildCategoryIndex();

      const basicComponents = registry.getByCategory("Basic");
      expect(basicComponents).toHaveLength(1);
      expect(basicComponents[0].type).toBe("Button");
    });
  });

  describe("bulk operations", () => {
    it("should register multiple components", () => {
      const wrappers = [mockButtonWrapper, mockInputWrapper, mockCardWrapper];

      registry.registerMany(wrappers);

      expect(registry.size()).toBe(3);
      expect(registry.has("Button")).toBe(true);
      expect(registry.has("Input")).toBe(true);
      expect(registry.has("Card")).toBe(true);
    });

    it("should unregister multiple components", () => {
      registry.register(mockButtonWrapper);
      registry.register(mockInputWrapper);
      registry.register(mockCardWrapper);

      const results = registry.unregisterMany(["Button", "Input", "Card"]);

      expect(results).toEqual([true, true, true]);
      expect(registry.size()).toBe(0);
    });

    it("should clear all components", () => {
      registry.register(mockButtonWrapper);
      registry.register(mockInputWrapper);

      registry.clear();

      expect(registry.size()).toBe(0);
      expect(registry.getAll()).toHaveLength(0);
    });
  });

  describe("validation", () => {
    it("should validate valid component", () => {
      const result = registry.validateComponent(mockButtonWrapper);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect validation errors", () => {
      const invalidWrapper = {
        type: "",
        component: null,
        metadata: null,
      } as any;

      const result = registry.validateComponent(invalidWrapper);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Component type is required");
      expect(result.errors).toContain("React component is required");
      expect(result.errors).toContain("Component metadata is required");
    });

    it("should detect warnings for missing optional fields", () => {
      const wrapperWithoutOptionals: ComponentWrapper = {
        type: "Button",
        component: () => null,
        metadata: {
          type: "Button",
          displayName: "Test",
          description: "",
          category: "Basic",
          icon: "",
          defaultProps: {},
          canHaveChildren: false,
          draggable: true,
          deletable: true,
        },
        propsSchema: undefined as any, // 테스트를 위해 undefined로 설정
      };

      const result = registry.validateComponent(wrapperWithoutOptionals);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain("Description is recommended");
      expect(result.warnings).toContain("Icon is recommended");
      expect(result.warnings).toContain("Props schema is recommended for better validation");
    });

    it("should warn about duplicate registration", () => {
      registry.register(mockButtonWrapper);

      const result = registry.validateComponent(mockButtonWrapper);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain("Component Button is already registered and will be replaced");
    });
  });

  describe("event system", () => {
    it("should emit registration events", () => {
      const eventListener = vi.fn();
      registry.addEventListener("component-registered", eventListener);

      registry.register(mockButtonWrapper);

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "component-registered",
          component: mockButtonWrapper,
        }),
      );
    });

    it("should emit update events", () => {
      registry.register(mockButtonWrapper);

      const eventListener = vi.fn();
      registry.addEventListener("component-updated", eventListener);

      // 같은 타입으로 다시 등록하면 업데이트 이벤트 발생
      registry.register({
        ...mockButtonWrapper,
        metadata: {
          ...mockButtonWrapper.metadata,
          displayName: "Updated Button",
        },
      });

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "component-updated",
        }),
      );
    });

    it("should emit unregistration events", () => {
      registry.register(mockButtonWrapper);

      const eventListener = vi.fn();
      registry.addEventListener("component-unregistered", eventListener);

      registry.unregister("Button");

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "component-unregistered",
          component: mockButtonWrapper,
        }),
      );
    });

    it("should emit clear events", () => {
      registry.register(mockButtonWrapper);
      registry.register(mockInputWrapper);

      const eventListener = vi.fn();
      registry.addEventListener("registry-cleared", eventListener);

      registry.clear();

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "registry-cleared",
          components: expect.arrayContaining([mockButtonWrapper, mockInputWrapper]),
        }),
      );
    });

    it("should remove event listeners", () => {
      const eventListener = vi.fn();
      registry.addEventListener("component-registered", eventListener);
      registry.removeEventListener("component-registered", eventListener);

      registry.register(mockButtonWrapper);

      expect(eventListener).not.toHaveBeenCalled();
    });

    it("should handle listener errors gracefully", () => {
      const errorListener = vi.fn(() => {
        throw new Error("Listener error");
      });
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      registry.addEventListener("component-registered", errorListener);
      registry.register(mockButtonWrapper);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error in registry event listener:", expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe("statistics", () => {
    beforeEach(() => {
      registry.register(mockButtonWrapper); // Basic
      registry.register(mockInputWrapper); // Form
      registry.register(mockCardWrapper); // Layout
    });

    it("should provide registry statistics", () => {
      const stats = registry.getStats();

      expect(stats.totalComponents).toBe(3);
      expect(stats.componentsByCategory.Basic).toBe(1);
      expect(stats.componentsByCategory.Form).toBe(1);
      expect(stats.componentsByCategory.Layout).toBe(1);
      expect(stats.componentsByCategory.DataDisplay).toBe(0);
      expect(stats.componentsByCategory.Feedback).toBe(0);
      expect(stats.registrationOrder).toEqual(["Button", "Input", "Card"]);
      expect(stats.lastModified).toBeTypeOf("number");
    });
  });

  describe("dependency resolution", () => {
    it("should resolve dependency order", () => {
      registry.register(mockButtonWrapper);
      registry.register(mockInputWrapper);
      registry.register(mockCardWrapper);

      const order = registry.resolveDependencyOrder();

      // 현재는 등록 순서를 반환
      expect(order).toEqual(["Button", "Input", "Card"]);
    });
  });

  describe("preloading", () => {
    it("should preload components", async () => {
      registry.register(mockButtonWrapper);
      registry.register(mockInputWrapper);

      // 현재는 기본 구현이므로 에러 없이 완료되어야 함
      await expect(registry.preloadComponents(["Button", "Input"])).resolves.toBeUndefined();
    });
  });
});

describe("global registry functions", () => {
  beforeEach(() => {
    resetComponentRegistry();
  });

  it("should get global registry instance", () => {
    const registry1 = getComponentRegistry();
    const registry2 = getComponentRegistry();

    expect(registry1).toBe(registry2); // 싱글톤
    expect(registry1).toBeInstanceOf(AdvancedComponentRegistry);
  });

  it("should set custom registry", () => {
    const customRegistry = new AdvancedComponentRegistry();
    setComponentRegistry(customRegistry);

    const retrieved = getComponentRegistry();
    expect(retrieved).toBe(customRegistry);
  });

  it("should reset registry", () => {
    const registry1 = getComponentRegistry();
    resetComponentRegistry();
    const registry2 = getComponentRegistry();

    expect(registry1).not.toBe(registry2);
  });
});
