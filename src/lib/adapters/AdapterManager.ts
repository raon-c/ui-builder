// AIDEV-NOTE: 어댑터 매니저 구현 - 다중 어댑터 지원의 핵심
// 어댑터 등록, 로딩, 활성화, 이벤트 관리를 담당하는 중앙 관리자

import type {
  AdapterLoadResult,
  AdapterManager,
  AdapterManagerEvent,
  AdapterManagerEventListener,
  AdapterRegistration,
  DesignLibraryAdapter,
} from "@/types/adapter";

/**
 * 어댑터 매니저 구현체
 * 다중 어댑터 지원을 위한 중앙 관리 시스템
 */
export class AdapterManagerImpl implements AdapterManager {
  private _registrations = new Map<string, AdapterRegistration>();
  private _instances = new Map<string, DesignLibraryAdapter>();
  private _activeAdapterId: string | null = null;
  private _eventListeners = new Map<string, AdapterManagerEventListener[]>();

  constructor() {
    console.log("[AdapterManager] 초기화 완료");
  }

  // === Getters ===
  get registrations(): Map<string, AdapterRegistration> {
    return new Map(this._registrations);
  }

  get instances(): Map<string, DesignLibraryAdapter> {
    return new Map(this._instances);
  }

  get activeAdapterId(): string | null {
    return this._activeAdapterId;
  }

  // === 어댑터 등록/해제 ===
  register(registration: AdapterRegistration): void {
    const { metadata } = registration;

    if (this._registrations.has(metadata.id)) {
      console.warn(`[AdapterManager] 어댑터 이미 등록됨: ${metadata.id}`);
      return;
    }

    // 호환성 기본 검증
    if (!this._validateRegistration(registration)) {
      throw new Error(`어댑터 등록 실패: ${metadata.id} - 호환성 검증 실패`);
    }

    this._registrations.set(metadata.id, registration);

    console.log(`[AdapterManager] 어댑터 등록: ${metadata.name} (${metadata.id})`);

    this._emit({
      type: "adapter-registered",
      adapterId: metadata.id,
      timestamp: Date.now(),
    });
  }

  unregister(adapterId: string): void {
    if (!this._registrations.has(adapterId)) {
      console.warn(`[AdapterManager] 등록되지 않은 어댑터: ${adapterId}`);
      return;
    }

    // 활성 어댑터인 경우 비활성화
    if (this._activeAdapterId === adapterId) {
      this._setActiveInternal(null);
    }

    // 인스턴스가 로드되어 있으면 언로드
    if (this._instances.has(adapterId)) {
      this.unload(adapterId).catch((error) => {
        console.error(`[AdapterManager] 어댑터 언로드 실패: ${adapterId}`, error);
      });
    }

    this._registrations.delete(adapterId);

    console.log(`[AdapterManager] 어댑터 등록 해제: ${adapterId}`);

    this._emit({
      type: "adapter-unregistered",
      adapterId,
      timestamp: Date.now(),
    });
  }

  getRegistered(): AdapterRegistration[] {
    return Array.from(this._registrations.values());
  }

  // === 어댑터 로딩/관리 ===
  async load(adapterId: string): Promise<AdapterLoadResult> {
    const registration = this._registrations.get(adapterId);
    if (!registration) {
      return {
        success: false,
        error: new Error(`등록되지 않은 어댑터: ${adapterId}`),
      };
    }

    // 이미 로드된 경우
    if (this._instances.has(adapterId)) {
      const adapter = this._instances.get(adapterId)!;
      return {
        success: true,
        adapter,
        warnings: ["어댑터가 이미 로드되어 있습니다."],
      };
    }

    try {
      console.log(`[AdapterManager] 어댑터 로딩 시작: ${adapterId}`);

      // 팩토리 함수로 어댑터 인스턴스 생성
      const adapter = await registration.factory();

      // 호환성 검사
      const isCompatible = await adapter.checkCompatibility();
      if (!isCompatible) {
        throw new Error("호환성 검사 실패");
      }

      // 의존성 검사
      const dependenciesOk = await adapter.checkDependencies();
      if (!dependenciesOk) {
        throw new Error("의존성 검사 실패");
      }

      // 어댑터 로드
      await adapter.load();

      this._instances.set(adapterId, adapter);

      console.log(`[AdapterManager] 어댑터 로딩 완료: ${adapterId}`);

      return {
        success: true,
        adapter,
      };
    } catch (error) {
      console.error(`[AdapterManager] 어댑터 로딩 실패: ${adapterId}`, error);

      return {
        success: false,
        error: error as Error,
      };
    }
  }

  async unload(adapterId: string): Promise<void> {
    const adapter = this._instances.get(adapterId);
    if (!adapter) {
      console.warn(`[AdapterManager] 로드되지 않은 어댑터: ${adapterId}`);
      return;
    }

    try {
      console.log(`[AdapterManager] 어댑터 언로드 시작: ${adapterId}`);

      // 활성 어댑터인 경우 비활성화
      if (this._activeAdapterId === adapterId) {
        await adapter.deactivate();
        this._setActiveInternal(null);
      }

      // 어댑터 언로드
      await adapter.unload();

      this._instances.delete(adapterId);

      console.log(`[AdapterManager] 어댑터 언로드 완료: ${adapterId}`);
    } catch (error) {
      console.error(`[AdapterManager] 어댑터 언로드 실패: ${adapterId}`, error);
      throw error;
    }
  }

  async setActive(adapterId: string): Promise<void> {
    // 동일한 어댑터인 경우 스킵
    if (this._activeAdapterId === adapterId) {
      return;
    }

    const previousAdapterId = this._activeAdapterId;

    try {
      // 기존 활성 어댑터 비활성화
      if (previousAdapterId) {
        const previousAdapter = this._instances.get(previousAdapterId);
        if (previousAdapter) {
          await previousAdapter.deactivate();
        }
      }

      // 새 어댑터 로드 (필요한 경우)
      let adapter = this._instances.get(adapterId);
      if (!adapter) {
        const loadResult = await this.load(adapterId);
        if (!loadResult.success) {
          throw loadResult.error || new Error("어댑터 로드 실패");
        }
        adapter = loadResult.adapter!;
      }

      // 새 어댑터 활성화
      await adapter.activate();

      this._setActiveInternal(adapterId);

      console.log(`[AdapterManager] 활성 어댑터 변경: ${previousAdapterId} → ${adapterId}`);

      this._emit({
        type: "active-adapter-changed",
        adapterId,
        previousAdapterId: previousAdapterId || undefined,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error(`[AdapterManager] 활성 어댑터 변경 실패: ${adapterId}`, error);
      throw error;
    }
  }

  getActive(): DesignLibraryAdapter | null {
    if (!this._activeAdapterId) {
      return null;
    }
    return this._instances.get(this._activeAdapterId) || null;
  }

  // === 이벤트 시스템 ===
  addEventListener(
    type: "adapter-registered" | "adapter-unregistered" | "active-adapter-changed",
    listener: AdapterManagerEventListener,
  ): void {
    if (!this._eventListeners.has(type)) {
      this._eventListeners.set(type, []);
    }
    this._eventListeners.get(type)!.push(listener);
  }

  removeEventListener(
    type: "adapter-registered" | "adapter-unregistered" | "active-adapter-changed",
    listener: AdapterManagerEventListener,
  ): void {
    const listeners = this._eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // === 유틸리티 ===
  async checkCompatibility(adapterId: string): Promise<boolean> {
    const registration = this._registrations.get(adapterId);
    if (!registration) {
      return false;
    }

    try {
      // 기본 메타데이터 검증
      if (!this._validateRegistration(registration)) {
        return false;
      }

      // 어댑터 인스턴스가 있으면 직접 검사
      const adapter = this._instances.get(adapterId);
      if (adapter) {
        return await adapter.checkCompatibility();
      }

      // 인스턴스가 없으면 메타데이터만으로 검사
      return this._checkMetadataCompatibility(registration.metadata.compatibility);
    } catch (error) {
      console.error(`[AdapterManager] 호환성 검사 실패: ${adapterId}`, error);
      return false;
    }
  }

  async cleanup(): Promise<void> {
    console.log("[AdapterManager] 정리 시작");

    try {
      // 모든 어댑터 언로드
      const unloadPromises = Array.from(this._instances.keys()).map((adapterId) =>
        this.unload(adapterId).catch((error) => {
          console.error(`어댑터 정리 실패: ${adapterId}`, error);
        }),
      );

      await Promise.all(unloadPromises);

      // 상태 초기화
      this._registrations.clear();
      this._instances.clear();
      this._activeAdapterId = null;
      this._eventListeners.clear();

      console.log("[AdapterManager] 정리 완료");
    } catch (error) {
      console.error("[AdapterManager] 정리 중 오류:", error);
      throw error;
    }
  }

  // === Private 메서드 ===
  private _validateRegistration(registration: AdapterRegistration): boolean {
    const { metadata } = registration;

    // 필수 필드 검증
    if (!metadata.id || !metadata.name || !metadata.version) {
      return false;
    }

    // 호환성 정보 검증
    if (!metadata.compatibility || !metadata.compatibility.builderVersion) {
      return false;
    }

    return true;
  }

  private _checkMetadataCompatibility(compatibility: any): boolean {
    // 간단한 버전 호환성 검사
    // 실제로는 semver 같은 라이브러리를 사용해야 함
    const currentBuilderVersion = "1.0.0"; // 실제로는 package.json에서 가져와야 함

    return (
      compatibility.builderVersion === currentBuilderVersion ||
      compatibility.builderVersion === "*" ||
      compatibility.builderVersion.startsWith("^1.0")
    );
  }

  private _setActiveInternal(adapterId: string | null): void {
    this._activeAdapterId = adapterId;
  }

  private _emit(event: AdapterManagerEvent): void {
    const listeners = this._eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error("[AdapterManager] 이벤트 리스너 오류:", error);
        }
      });
    }
  }
}

/**
 * 전역 어댑터 매니저 인스턴스
 */
export const adapterManager = new AdapterManagerImpl();

/**
 * 어댑터 매니저 초기화 헬퍼
 */
export function initializeAdapterManager(): AdapterManagerImpl {
  console.log("[AdapterManager] 시스템 초기화");
  return adapterManager;
}
