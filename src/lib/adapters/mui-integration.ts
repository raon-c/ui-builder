// AIDEV-NOTE: MUI 어댑터 통합 유틸리티
// Material-UI 어댑터를 다중 라이브러리 시스템에 등록하고 관리

import type { LibraryNamespace } from "@/types/multi-library";
import { multiLibraryManager } from "./MultiLibraryManager";

/**
 * MUI 어댑터를 다중 라이브러리 시스템에 등록
 */
export async function registerMuiAdapter(): Promise<boolean> {
  try {
    // 동적 import로 MUI 어댑터 로드
    const { createMuiAdapter } = await import("@/adapters/mui");

    // MUI 어댑터 인스턴스 생성
    const muiAdapter = await createMuiAdapter();

    // 다중 라이브러리 매니저에 등록
    const result = await multiLibraryManager.registerAdapter("mui" as LibraryNamespace, muiAdapter);

    if (result.success) {
      console.log("✅ MUI 어댑터가 성공적으로 등록되었습니다:", result);
      return true;
    } else {
      console.error("❌ MUI 어댑터 등록 실패:", result.error);
      return false;
    }
  } catch (error) {
    console.error("❌ MUI 어댑터 로드 실패:", error);
    return false;
  }
}

/**
 * MUI 어댑터를 다중 라이브러리 시스템에서 제거
 */
export async function unregisterMuiAdapter(): Promise<boolean> {
  try {
    const result = await multiLibraryManager.unregisterAdapter("mui" as LibraryNamespace);

    if (result) {
      console.log("✅ MUI 어댑터가 성공적으로 제거되었습니다");
      return true;
    } else {
      console.error("❌ MUI 어댑터 제거 실패");
      return false;
    }
  } catch (error) {
    console.error("❌ MUI 어댑터 제거 중 오류:", error);
    return false;
  }
}

/**
 * MUI 어댑터 등록 상태 확인
 */
export function isMuiAdapterRegistered(): boolean {
  const adapter = multiLibraryManager.getAdapter("mui" as LibraryNamespace);
  return adapter !== undefined;
}

/**
 * MUI 어댑터 자동 등록 (앱 시작 시 호출)
 */
export async function autoRegisterMuiAdapter(): Promise<void> {
  // 이미 등록되어 있으면 스킵
  if (isMuiAdapterRegistered()) {
    console.log("ℹ️ MUI 어댑터가 이미 등록되어 있습니다");
    return;
  }

  // 설정에서 자동 로드가 활성화된 경우에만 등록
  const config = multiLibraryManager.getConfig();
  const muiPriority = config.adapterPriorities.find((p) => p.namespace === "mui");

  if (muiPriority?.autoLoad) {
    console.log("🔄 MUI 어댑터 자동 등록 중...");
    await registerMuiAdapter();
  }
}
