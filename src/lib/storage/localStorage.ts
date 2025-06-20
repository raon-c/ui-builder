"use client";

// AIDEV-NOTE: localStorage 기반 StorageAdapter 구현 - MVP 기본 스토리지
// 브라우저 localStorage API를 StorageAdapter 인터페이스에 맞춰 래핑

import {
  DEFAULT_STORAGE_CONFIG,
  type StorageAdapter,
  type StorageConfig,
  StorageError,
} from "@/types/storage";

/**
 * localStorage 기반 스토리지 어댑터
 * MVP 단계의 기본 스토리지 구현체
 */
export class LocalStorageAdapter implements StorageAdapter {
  private config: StorageConfig;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = { ...DEFAULT_STORAGE_CONFIG, ...config };
    this.checkAvailability();
  }

  /**
   * localStorage 사용 가능 여부 확인
   */
  private checkAvailability(): void {
    if (typeof window === "undefined" || !window.localStorage) {
      throw new StorageError(
        "localStorage is not available",
        "STORAGE_UNAVAILABLE",
      );
    }
  }

  /**
   * 키에 접두사 추가
   */
  private getFullKey(key: string): string {
    return `${this.config.keyPrefix}.${key}`;
  }

  /**
   * 아이템 조회
   */
  async getItem<T = unknown>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);
      const raw = localStorage.getItem(fullKey);

      if (raw === null) {
        return null;
      }

      const parsed = JSON.parse(raw);

      if (this.config.debug) {
        console.log(`[LocalStorage] Get ${key}:`, parsed);
      }

      return parsed as T;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new StorageError(
          `Failed to parse JSON for key "${key}"`,
          "PARSE_ERROR",
          error,
        );
      }
      throw new StorageError(
        `Failed to get item "${key}"`,
        "UNKNOWN",
        error as Error,
      );
    }
  }

  /**
   * 아이템 저장
   */
  async setItem<T = unknown>(key: string, value: T): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      const serialized = JSON.stringify(value);

      // 용량 체크 (5MB 기준)
      const estimatedSize = new Blob([serialized]).size;
      if (estimatedSize > 5 * 1024 * 1024) {
        throw new StorageError(
          `Data size (${Math.round(estimatedSize / 1024)}KB) exceeds 5MB limit`,
          "QUOTA_EXCEEDED",
        );
      }

      localStorage.setItem(fullKey, serialized);

      if (this.config.debug) {
        console.log(`[LocalStorage] Set ${key}:`, value);
      }
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }

      // localStorage quota exceeded 에러 처리
      if (
        error instanceof DOMException &&
        error.name === "QuotaExceededError"
      ) {
        throw new StorageError(
          "Storage quota exceeded",
          "QUOTA_EXCEEDED",
          error,
        );
      }

      throw new StorageError(
        `Failed to set item "${key}"`,
        "UNKNOWN",
        error as Error,
      );
    }
  }

  /**
   * 아이템 삭제
   */
  async removeItem(key: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      localStorage.removeItem(fullKey);

      if (this.config.debug) {
        console.log(`[LocalStorage] Remove ${key}`);
      }
    } catch (error) {
      throw new StorageError(
        `Failed to remove item "${key}"`,
        "UNKNOWN",
        error as Error,
      );
    }
  }

  /**
   * 모든 키 조회
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const prefix = `${this.config.keyPrefix}.`;
      const keys: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          // 접두사 제거하여 원본 키 반환
          keys.push(key.substring(prefix.length));
        }
      }

      return keys;
    } catch (error) {
      throw new StorageError(
        "Failed to get all keys",
        "UNKNOWN",
        error as Error,
      );
    }
  }

  /**
   * 스토리지 초기화
   */
  async clear(): Promise<void> {
    try {
      const keys = await this.getAllKeys();

      for (const key of keys) {
        await this.removeItem(key);
      }

      if (this.config.debug) {
        console.log(`[LocalStorage] Cleared ${keys.length} items`);
      }
    } catch (error) {
      throw new StorageError(
        "Failed to clear storage",
        "UNKNOWN",
        error as Error,
      );
    }
  }

  /**
   * 사용 가능한 용량 확인 (추정치)
   */
  async getAvailableSpace(): Promise<number> {
    try {
      // localStorage 용량 측정 (rough estimation)
      let totalSize = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += new Blob([key + value]).size;
          }
        }
      }

      // 일반적인 localStorage 한계 (5-10MB)
      const estimatedLimit = 5 * 1024 * 1024; // 5MB
      return Math.max(0, estimatedLimit - totalSize);
    } catch (error) {
      if (this.config.debug) {
        console.warn(
          "[LocalStorage] Failed to estimate available space:",
          error,
        );
      }
      return 0;
    }
  }

  /**
   * 스토리지 사용량 통계
   */
  async getUsageStats(): Promise<{
    totalItems: number;
    totalSize: number;
    availableSpace: number;
  }> {
    const keys = await this.getAllKeys();
    let totalSize = 0;

    for (const key of keys) {
      try {
        const value = await this.getItem(key);
        if (value !== null) {
          totalSize += new Blob([JSON.stringify(value)]).size;
        }
      } catch {
        // 개별 아이템 오류는 무시
      }
    }

    const availableSpace = await this.getAvailableSpace();

    return {
      totalItems: keys.length,
      totalSize,
      availableSpace,
    };
  }
}
