// AIDEV-NOTE: 어댑터 시스템 진입점 - 모든 어댑터 관련 기능 통합
// 어댑터 등록, 초기화, 편의 함수 제공

import { createShadcnAdapter } from "@/adapters/shadcn/ShadcnAdapterV2";
import type { AdapterRegistration } from "@/types/adapter";
import { adapterManager } from "./AdapterManager";

/**
 * 기본 제공 어댑터들
 */
export const BUILTIN_ADAPTERS: AdapterRegistration[] = [
  {
    metadata: {
      id: "shadcn-ui",
      name: "shadcn/ui",
      version: "1.0.0",
      description: "Beautifully designed components built with Radix UI and Tailwind CSS",
      author: "shadcn",
      tags: ["ui", "components", "radix", "tailwind", "react"],
      icon: "🎨",
      compatibility: {
        builderVersion: "^1.0.0",
        reactVersion: "^18.0.0",
      },
    },
    factory: createShadcnAdapter,
    isBuiltIn: true,
  },
];

/**
 * 어댑터 시스템 초기화
 */
export async function initializeAdapterSystem(): Promise<void> {
  console.log("[AdapterSystem] 초기화 시작");

  try {
    // 기본 어댑터들 등록
    for (const registration of BUILTIN_ADAPTERS) {
      adapterManager.register(registration);
    }

    // 기본 어댑터 활성화 (shadcn/ui)
    const defaultAdapterId = "shadcn-ui";
    if (adapterManager.registrations.has(defaultAdapterId)) {
      await adapterManager.setActive(defaultAdapterId);
      console.log(`[AdapterSystem] 기본 어댑터 활성화: ${defaultAdapterId}`);
    }

    console.log("[AdapterSystem] 초기화 완료");
  } catch (error) {
    console.error("[AdapterSystem] 초기화 실패:", error);
    throw error;
  }
}

/**
 * 현재 활성 어댑터의 컴포넌트 레지스트리 조회
 */
export function getActiveComponentRegistry() {
  const activeAdapter = adapterManager.getActive();
  return activeAdapter?.registry || null;
}

/**
 * 현재 활성 어댑터 조회
 */
export function getActiveAdapter() {
  return adapterManager.getActive();
}

/**
 * 어댑터 시스템 정리
 */
export async function cleanupAdapterSystem(): Promise<void> {
  console.log("[AdapterSystem] 정리 시작");

  try {
    await adapterManager.cleanup();
    console.log("[AdapterSystem] 정리 완료");
  } catch (error) {
    console.error("[AdapterSystem] 정리 실패:", error);
    throw error;
  }
}

/**
 * 어댑터 등록 헬퍼
 */
export function registerAdapter(registration: AdapterRegistration): void {
  adapterManager.register(registration);
}

/**
 * 어댑터 활성화 헬퍼
 */
export async function activateAdapter(adapterId: string): Promise<void> {
  await adapterManager.setActive(adapterId);
}

/**
 * 등록된 어댑터 목록 조회
 */
export function getRegisteredAdapters(): AdapterRegistration[] {
  return adapterManager.getRegistered();
}

/**
 * 어댑터 호환성 검사 헬퍼
 */
export async function checkAdapterCompatibility(adapterId: string): Promise<boolean> {
  return await adapterManager.checkCompatibility(adapterId);
}

export type {
  AdapterConfig,
  AdapterManager,
  AdapterMetadata,
  AdapterRegistration,
  AdapterStatus,
  DesignLibraryAdapter,
} from "@/types/adapter";
// Re-exports
export { adapterManager } from "./AdapterManager";
