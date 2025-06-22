"use client";

import { ComponentRegistryImpl } from "@/lib/component-registry";
import type {
  AdapterConfig,
  AdapterEvent,
  AdapterEventListener,
  AdapterEventType,
  AdapterMetadata,
  AdapterStatus,
  DesignLibraryAdapter,
} from "@/types/adapter";
import { allShadcnComponents } from "./components";

/**
 * shadcn/ui 어댑터 V2 (확장된 인터페이스 구현)
 */
export class ShadcnAdapterV2 implements DesignLibraryAdapter {
  private _status: AdapterStatus = "unloaded";
  private _config: AdapterConfig = {};
  private _eventListeners = new Map<AdapterEventType, AdapterEventListener[]>();
  private _registry = new ComponentRegistryImpl();

  // === 메타데이터 ===
  readonly metadata: AdapterMetadata = {
    id: "shadcn-ui",
    name: "shadcn/ui",
    version: "1.0.0",
    description: "Beautifully designed components built with Radix UI and Tailwind CSS",
    author: "shadcn",
    homepage: "https://ui.shadcn.com",
    repository: "https://github.com/shadcn-ui/ui",
    license: {
      type: "MIT",
      url: "https://github.com/shadcn-ui/ui/blob/main/LICENSE.md",
    },
    tags: ["ui", "components", "radix", "tailwind", "react"],
    icon: "🎨",
    dependencies: [
      { name: "react", version: "^18.0.0" },
      { name: "@radix-ui/react-slot", version: "^1.0.0" },
      { name: "class-variance-authority", version: "^0.7.0" },
      { name: "clsx", version: "^2.0.0" },
      { name: "tailwind-merge", version: "^2.0.0" },
    ],
    compatibility: {
      reactVersion: "^18.0.0",
      typescriptVersion: "^5.0.0",
      builderVersion: "^1.0.0",
      browsers: ["Chrome >= 90", "Firefox >= 88", "Safari >= 14"],
    },
    experimental: false,
  };

  // === Getters ===
  get status(): AdapterStatus {
    return this._status;
  }

  get registry() {
    return this._registry;
  }

  get config(): AdapterConfig {
    return { ...this._config };
  }

  set config(newConfig: AdapterConfig) {
    this._config = { ...newConfig };
    this.emit({
      type: "config-updated",
      adapterId: this.metadata.id,
      timestamp: Date.now(),
      data: this._config,
    });
  }

  // === 라이프사이클 메서드 ===
  async load(): Promise<void> {
    if (this._status !== "unloaded") {
      console.warn(`[ShadcnAdapter] 이미 로드됨: ${this._status}`);
      return;
    }

    try {
      this._setStatus("loading");

      // 컴포넌트 등록
      this._registry.clear();
      for (const componentWrapper of allShadcnComponents) {
        this._registry.register(componentWrapper);

        this.emit({
          type: "component-registered",
          adapterId: this.metadata.id,
          timestamp: Date.now(),
          data: componentWrapper,
        });
      }

      // CSS 스타일 주입 (필요한 경우)
      this.injectStyles();

      this._setStatus("loaded");
      console.log(`[ShadcnAdapter] 로드 완료: ${this._registry.size()}개 컴포넌트`);
    } catch (error) {
      this._setStatus("error");
      console.error("[ShadcnAdapter] 로드 실패:", error);

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
    if (this._status === "unloaded") {
      return;
    }

    try {
      // 컴포넌트 정리
      this._registry.clear();

      // CSS 스타일 제거
      this.removeStyles();

      // 이벤트 리스너 정리
      this._eventListeners.clear();

      this._setStatus("unloaded");
      console.log("[ShadcnAdapter] 언로드 완료");
    } catch (error) {
      this._setStatus("error");
      console.error("[ShadcnAdapter] 언로드 실패:", error);
      throw error;
    }
  }

  async activate(): Promise<void> {
    if (this._status !== "loaded") {
      await this.load();
    }

    try {
      this._setStatus("active");
      console.log("[ShadcnAdapter] 활성화 완료");
    } catch (error) {
      this._setStatus("error");
      console.error("[ShadcnAdapter] 활성화 실패:", error);
      throw error;
    }
  }

  async deactivate(): Promise<void> {
    if (this._status === "active") {
      this._setStatus("loaded");
      console.log("[ShadcnAdapter] 비활성화 완료");
    }
  }

  // === 설정 관리 ===
  updateConfig(config: Partial<AdapterConfig>): void {
    this._config = {
      ...this._config,
      ...config,
    };

    // 테마 변경 시 CSS 변수 업데이트
    if (config.cssVariables) {
      this._updateCssVariables(config.cssVariables);
    }

    this.emit({
      type: "config-updated",
      adapterId: this.metadata.id,
      timestamp: Date.now(),
      data: this._config,
    });
  }

  resetConfig(): void {
    this._config = {};
    this._removeCssVariables();

    this.emit({
      type: "config-updated",
      adapterId: this.metadata.id,
      timestamp: Date.now(),
      data: this._config,
    });
  }

  // === 이벤트 시스템 ===
  addEventListener(type: AdapterEventType, listener: AdapterEventListener): void {
    if (!this._eventListeners.has(type)) {
      this._eventListeners.set(type, []);
    }
    this._eventListeners.get(type)!.push(listener);
  }

  removeEventListener(type: AdapterEventType, listener: AdapterEventListener): void {
    const listeners = this._eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event: AdapterEvent): void {
    const listeners = this._eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error("[ShadcnAdapter] 이벤트 리스너 오류:", error);
        }
      });
    }
  }

  // === 호환성 검사 ===
  async checkCompatibility(): Promise<boolean> {
    try {
      // React 버전 검사
      const reactVersion = React.version;
      if (!this._isVersionCompatible(reactVersion, this.metadata.compatibility.reactVersion!)) {
        console.warn(`[ShadcnAdapter] React 버전 호환성 경고: ${reactVersion}`);
        return false;
      }

      // 브라우저 지원 검사 (간단한 버전)
      if (typeof window !== "undefined") {
        const isModernBrowser = "IntersectionObserver" in window && "ResizeObserver" in window;
        if (!isModernBrowser) {
          console.warn("[ShadcnAdapter] 브라우저 호환성 경고");
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("[ShadcnAdapter] 호환성 검사 실패:", error);
      return false;
    }
  }

  async checkDependencies(): Promise<boolean> {
    try {
      // 필수 의존성 확인
      const requiredDeps = ["react", "clsx"];

      for (const dep of requiredDeps) {
        try {
          // 동적 import로 의존성 확인
          await import(dep);
        } catch {
          console.error(`[ShadcnAdapter] 필수 의존성 누락: ${dep}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("[ShadcnAdapter] 의존성 검사 실패:", error);
      return false;
    }
  }

  // === 유틸리티 ===
  injectStyles(): void {
    // shadcn/ui는 Tailwind CSS를 사용하므로 별도 스타일 주입이 필요 없음
    // 필요한 경우 여기서 커스텀 CSS 변수 설정
    if (this._config.cssVariables) {
      this._updateCssVariables(this._config.cssVariables);
    }
  }

  removeStyles(): void {
    this._removeCssVariables();
  }

  getConfigComponent(): React.ComponentType<any> | undefined {
    // shadcn/ui 전용 설정 컴포넌트 (추후 구현)
    return undefined;
  }

  // === Private 메서드 ===
  private _setStatus(status: AdapterStatus): void {
    const previousStatus = this._status;
    this._status = status;

    this.emit({
      type: "status-changed",
      adapterId: this.metadata.id,
      timestamp: Date.now(),
      data: { previousStatus, currentStatus: status },
    });
  }

  private _isVersionCompatible(current: string, required: string): boolean {
    // 간단한 버전 호환성 검사
    // 실제로는 semver 라이브러리 사용 권장
    const currentMajor = parseInt(current.split(".")[0], 10);
    const requiredMajor = parseInt(required.replace("^", "").split(".")[0], 10);

    return currentMajor >= requiredMajor;
  }

  private _updateCssVariables(variables: Record<string, string>): void {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key.startsWith("--") ? key : `--${key}`, value);
    });
  }

  private _removeCssVariables(): void {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const configVars = this._config.cssVariables || {};

    Object.keys(configVars).forEach((key) => {
      root.style.removeProperty(key.startsWith("--") ? key : `--${key}`);
    });
  }
}

/**
 * shadcn/ui 어댑터 팩토리 함수
 */
export async function createShadcnAdapter(): Promise<DesignLibraryAdapter> {
  return new ShadcnAdapterV2();
}

// React import (호환성 검사용)
import React from "react";
