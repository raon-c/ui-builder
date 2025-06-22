// AIDEV-NOTE: Material-UI 어댑터 구현
// MUI 컴포넌트들을 빌더 시스템에 통합하는 어댑터 클래스

import React from "react";
import { getComponentRegistry } from "@/lib/component-registry";
import type {
  AdapterConfig,
  AdapterEvent,
  AdapterEventListener,
  AdapterEventType,
  AdapterMetadata,
  AdapterStatus,
  DesignLibraryAdapter,
} from "@/types/adapter";
import type { BuilderComponentType, ComponentWrapper } from "@/types/component";
import { muiComponents } from "./components";
import { type MuiComponentType, muiSchemas } from "./schema";

/**
 * Material-UI 어댑터 클래스
 */
export class MuiAdapter implements DesignLibraryAdapter {
  public readonly metadata: AdapterMetadata = {
    id: "mui",
    name: "Material-UI",
    version: "7.1.2",
    description: "Google의 Material Design을 구현한 React UI 라이브러리",
    author: "MUI Team",
    homepage: "https://mui.com/",
    repository: "https://github.com/mui/material-ui",
    license: {
      type: "MIT",
      url: "https://github.com/mui/material-ui/blob/master/LICENSE",
    },
    tags: ["material-design", "google", "components", "react"],
    icon: "🎨",
    screenshots: [],
    dependencies: [
      { name: "@mui/material", version: "^7.1.2" },
      { name: "@emotion/react", version: "^11.14.0" },
      { name: "@emotion/styled", version: "^11.14.0" },
    ],
    compatibility: {
      builderVersion: ">=0.1.0",
      reactVersion: ">=18.0.0",
      typescriptVersion: ">=4.5.0",
      browsers: ["Chrome >= 90", "Firefox >= 88", "Safari >= 14"],
    },
    experimental: false,
    permissions: ["theme-provider"],
  };

  public status: AdapterStatus = "unloaded";
  public readonly registry: ReturnType<typeof getComponentRegistry>;
  public config: AdapterConfig = {
    theme: {
      palette: {
        mode: "light",
        primary: {
          main: "#1976d2",
        },
        secondary: {
          main: "#dc004e",
        },
      },
    },
    cssVariables: {},
    defaultProps: {},
    features: {
      darkMode: true,
      customTheme: true,
      iconSupport: true,
    },
  };

  private eventListeners = new Map<AdapterEventType, AdapterEventListener[]>();

  constructor() {
    this.registry = getComponentRegistry();
  }

  // === 라이프사이클 메서드 ===

  async load(): Promise<void> {
    if (this.status === "loaded" || this.status === "loading") return;

    this.status = "loading";
    this.emit({
      type: "status-changed",
      adapterId: this.metadata.id,
      timestamp: Date.now(),
      data: { status: "loading" },
    });

    try {
      // MUI 컴포넌트들을 레지스트리에 등록
      this.registerComponents();

      this.status = "loaded";
      this.emit({
        type: "status-changed",
        adapterId: this.metadata.id,
        timestamp: Date.now(),
        data: { status: "loaded" },
      });
    } catch (error) {
      this.status = "error";
      this.emit({
        type: "error",
        adapterId: this.metadata.id,
        timestamp: Date.now(),
        error: error as Error,
      });
      throw error;
    }
  }

  async unload(): Promise<void> {
    if (this.status === "unloaded") return;

    this.status = "unloaded";
    this.registry.clear();

    this.emit({
      type: "status-changed",
      adapterId: this.metadata.id,
      timestamp: Date.now(),
      data: { status: "unloaded" },
    });
  }

  async activate(): Promise<void> {
    if (this.status !== "loaded") {
      await this.load();
    }

    this.status = "active";
    this.injectStyles?.();

    this.emit({
      type: "status-changed",
      adapterId: this.metadata.id,
      timestamp: Date.now(),
      data: { status: "active" },
    });
  }

  async deactivate(): Promise<void> {
    if (this.status === "active") {
      this.status = "loaded";
      this.removeStyles?.();

      this.emit({
        type: "status-changed",
        adapterId: this.metadata.id,
        timestamp: Date.now(),
        data: { status: "loaded" },
      });
    }
  }

  // === 설정 관리 ===

  updateConfig(config: Partial<AdapterConfig>): void {
    this.config = { ...this.config, ...config };

    this.emit({
      type: "config-updated",
      adapterId: this.metadata.id,
      timestamp: Date.now(),
      data: { config: this.config },
    });
  }

  resetConfig(): void {
    this.config = {
      theme: {
        palette: {
          mode: "light",
          primary: { main: "#1976d2" },
          secondary: { main: "#dc004e" },
        },
      },
      cssVariables: {},
      defaultProps: {},
      features: {
        darkMode: true,
        customTheme: true,
        iconSupport: true,
      },
    };

    this.emit({
      type: "config-updated",
      adapterId: this.metadata.id,
      timestamp: Date.now(),
      data: { config: this.config },
    });
  }

  // === 이벤트 시스템 ===

  addEventListener(type: AdapterEventType, listener: AdapterEventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(listener);
  }

  removeEventListener(type: AdapterEventType, listener: AdapterEventListener): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: AdapterEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error("Error in MUI adapter event listener:", error);
        }
      });
    }
  }

  // === 호환성 검사 ===

  async checkCompatibility(): Promise<boolean> {
    try {
      // React 버전 체크
      const reactVersion = React.version;
      if (!reactVersion || !this.isVersionCompatible(reactVersion, "18.0.0")) {
        return false;
      }

      // MUI 패키지 존재 여부 체크
      const muiMaterial = await import("@mui/material");
      if (!muiMaterial) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  async checkDependencies(): Promise<boolean> {
    try {
      await Promise.all([import("@mui/material"), import("@emotion/react"), import("@emotion/styled")]);
      return true;
    } catch {
      return false;
    }
  }

  // === 유틸리티 ===

  injectStyles?(): void {
    // MUI는 Emotion을 사용하므로 별도 스타일 주입 불필요
    // 필요시 테마 프로바이더 설정
  }

  removeStyles?(): void {
    // MUI 스타일 제거 (필요시)
  }

  getConfigComponent?(): React.ComponentType<any> | undefined {
    // MUI 설정 UI 컴포넌트 (향후 구현)
    return undefined;
  }

  // === Private 메서드 ===

  private registerComponents(): void {
    const componentEntries = Object.entries(muiSchemas) as Array<[MuiComponentType, any]>;

    for (const [componentType, schema] of componentEntries) {
      const component = muiComponents[componentType];
      if (!component) continue;

      const wrapper: ComponentWrapper = {
        type: componentType as BuilderComponentType,
        component,
        metadata: {
          type: componentType as BuilderComponentType,
          displayName: componentType,
          description: this.getComponentDescription(componentType),
          category: this.getComponentCategory(componentType),
          tags: this.getComponentTags(componentType),
          icon: this.getComponentIcon(componentType),
          isContainer: this.isContainerComponent(componentType),
          acceptsChildren: this.acceptsChildren(componentType),
          defaultProps: this.getDefaultProps(componentType),
          styleVariants: [],
        },
        propsSchema: schema,
        defaultProps: schema.parse({}),
      };

      this.registry.register(wrapper);

      this.emit({
        type: "component-registered",
        adapterId: this.metadata.id,
        timestamp: Date.now(),
        data: { componentType },
      });
    }
  }

  private getComponentDescription(type: MuiComponentType): string {
    const descriptions: Record<MuiComponentType, string> = {
      Button: "Material Design 버튼 컴포넌트",
      TextField: "Material Design 텍스트 입력 필드",
      Card: "Material Design 카드 컨테이너",
      CardContent: "카드 내용 영역",
      CardActions: "카드 액션 버튼 영역",
      Typography: "Material Design 텍스트 표시",
      Checkbox: "Material Design 체크박스",
      Switch: "Material Design 스위치",
      Select: "Material Design 선택 드롭다운",
      Chip: "Material Design 칩/태그",
      Avatar: "Material Design 아바타",
      Badge: "Material Design 배지",
      Paper: "Material Design 종이 표면",
      Container: "Material Design 컨테이너",
      Box: "Material Design 박스 레이아웃",
    };

    return descriptions[type];
  }

  private getComponentCategory(type: MuiComponentType): string {
    const categories: Record<MuiComponentType, string> = {
      Button: "inputs",
      TextField: "inputs",
      Card: "layout",
      CardContent: "layout",
      CardActions: "layout",
      Typography: "display",
      Checkbox: "inputs",
      Switch: "inputs",
      Select: "inputs",
      Chip: "display",
      Avatar: "display",
      Badge: "display",
      Paper: "layout",
      Container: "layout",
      Box: "layout",
    };

    return categories[type];
  }

  private getComponentTags(type: MuiComponentType): string[] {
    const baseTags = ["mui", "material-design"];
    const specificTags: Record<MuiComponentType, string[]> = {
      Button: ["button", "action"],
      TextField: ["input", "form"],
      Card: ["container", "surface"],
      CardContent: ["content"],
      CardActions: ["actions"],
      Typography: ["text", "content"],
      Checkbox: ["input", "form", "selection"],
      Switch: ["input", "form", "toggle"],
      Select: ["input", "form", "dropdown"],
      Chip: ["tag", "label"],
      Avatar: ["image", "profile"],
      Badge: ["indicator", "notification"],
      Paper: ["surface", "container"],
      Container: ["layout", "wrapper"],
      Box: ["layout", "container"],
    };

    return [...baseTags, ...specificTags[type]];
  }

  private getComponentIcon(type: MuiComponentType): string {
    const icons: Record<MuiComponentType, string> = {
      Button: "🔘",
      TextField: "📝",
      Card: "🗂️",
      CardContent: "📄",
      CardActions: "⚡",
      Typography: "📝",
      Checkbox: "☑️",
      Switch: "🔄",
      Select: "📋",
      Chip: "🏷️",
      Avatar: "👤",
      Badge: "🔔",
      Paper: "📄",
      Container: "📦",
      Box: "⬜",
    };

    return icons[type];
  }

  private isContainerComponent(type: MuiComponentType): boolean {
    return ["Card", "CardContent", "CardActions", "Paper", "Container", "Box"].includes(type);
  }

  private acceptsChildren(type: MuiComponentType): boolean {
    return ["Card", "CardContent", "CardActions", "Paper", "Container", "Box", "Badge"].includes(type);
  }

  private getDefaultProps(type: MuiComponentType): Record<string, any> {
    const schema = muiSchemas[type];
    return schema.parse({});
  }

  private isVersionCompatible(current: string, required: string): boolean {
    const currentParts = current.split(".").map(Number);
    const requiredParts = required.split(".").map(Number);

    for (let i = 0; i < Math.max(currentParts.length, requiredParts.length); i++) {
      const currentPart = currentParts[i] || 0;
      const requiredPart = requiredParts[i] || 0;

      if (currentPart > requiredPart) return true;
      if (currentPart < requiredPart) return false;
    }

    return true;
  }
}

/**
 * MUI 어댑터 팩토리 함수
 */
export const createMuiAdapter = async (): Promise<MuiAdapter> => {
  const adapter = new MuiAdapter();
  await adapter.load();
  return adapter;
};
