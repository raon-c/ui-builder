// AIDEV-NOTE: 단축키 핸들러 구현체 - 키보드 이벤트 처리 및 단축키 매칭
// 컨텍스트별 단축키 관리와 우선순위 기반 실행

import type {
  KeyboardShortcut,
  KeyCombination,
  KeyMatchResult,
  ShortcutConfig,
  ShortcutContext,
  ShortcutHandler,
} from "./types";

/**
 * 단축키 핸들러 구현체
 */
export class ShortcutHandlerImpl implements ShortcutHandler {
  private shortcuts = new Map<ShortcutContext, Map<string, KeyboardShortcut>>();
  private config: ShortcutConfig = {
    enabled: true,
    context: "global",
    customShortcuts: {},
    disabledShortcuts: [],
    showHelp: false,
  };
  private listeners = new Set<() => void>();

  constructor() {
    this.initializeEventListeners();
  }

  /**
   * 단축키 등록
   */
  register(shortcut: KeyboardShortcut, context: ShortcutContext = "global"): () => void {
    if (!this.shortcuts.has(context)) {
      this.shortcuts.set(context, new Map());
    }

    const contextMap = this.shortcuts.get(context)!;
    contextMap.set(shortcut.id, shortcut);

    this.notifyListeners();

    // 등록 해제 함수 반환
    return () => {
      this.unregister(shortcut.id, context);
    };
  }

  /**
   * 단축키 해제
   */
  unregister(shortcutId: string, context: ShortcutContext = "global"): void {
    const contextMap = this.shortcuts.get(context);
    if (contextMap) {
      contextMap.delete(shortcutId);
      this.notifyListeners();
    }
  }

  /**
   * 모든 단축키 해제
   */
  unregisterAll(context?: ShortcutContext): void {
    if (context) {
      this.shortcuts.delete(context);
    } else {
      this.shortcuts.clear();
    }
    this.notifyListeners();
  }

  /**
   * 단축키 목록 조회
   */
  getShortcuts(context?: ShortcutContext): KeyboardShortcut[] {
    if (context) {
      const contextMap = this.shortcuts.get(context);
      return contextMap ? Array.from(contextMap.values()) : [];
    }

    // 모든 컨텍스트의 단축키 반환
    const allShortcuts: KeyboardShortcut[] = [];
    for (const contextMap of this.shortcuts.values()) {
      allShortcuts.push(...contextMap.values());
    }
    return allShortcuts;
  }

  /**
   * 단축키 검색
   */
  findShortcut(keys: KeyCombination, context?: ShortcutContext): KeyboardShortcut | null {
    const contextsToSearch = context ? [context] : Array.from(this.shortcuts.keys());

    for (const ctx of contextsToSearch) {
      const contextMap = this.shortcuts.get(ctx);
      if (!contextMap) continue;

      for (const shortcut of contextMap.values()) {
        if (this.matchesKeyCombination(keys, shortcut.keys)) {
          return shortcut;
        }
      }
    }

    return null;
  }

  /**
   * 활성화/비활성화
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.notifyListeners();
  }

  /**
   * 컨텍스트 변경
   */
  setContext(context: ShortcutContext): void {
    this.config.context = context;
    this.notifyListeners();
  }

  /**
   * 설정 업데이트
   */
  updateConfig(config: Partial<ShortcutConfig>): void {
    this.config = { ...this.config, ...config };
    this.notifyListeners();
  }

  /**
   * 현재 설정 조회
   */
  getConfig(): ShortcutConfig {
    return { ...this.config };
  }

  /**
   * 변경 리스너 등록
   */
  addListener(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 키 이벤트 처리
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.config.enabled) return;

    // 입력 필드에서는 일부 단축키 제외
    if (this.isInputElement(event.target as Element)) {
      // 편집 관련 단축키만 허용
      const allowedKeys = ["z", "y", "s", "f"];
      if (!allowedKeys.includes(event.key.toLowerCase()) || !event.ctrlKey) {
        return;
      }
    }

    const keys: KeyCombination = {
      key: event.key.toLowerCase(),
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      alt: event.altKey,
      meta: event.metaKey,
    };

    const matchResult = this.findMatchingShortcut(keys);

    if (matchResult && matchResult.canExecute) {
      const { shortcut } = matchResult;

      if (shortcut.preventDefault !== false) {
        event.preventDefault();
      }

      if (shortcut.stopPropagation) {
        event.stopPropagation();
      }

      try {
        shortcut.action();
      } catch (error) {
        console.error("Shortcut execution failed:", error);
      }
    }
  };

  /**
   * 매칭되는 단축키 찾기 (우선순위 고려)
   */
  private findMatchingShortcut(keys: KeyCombination): KeyMatchResult | null {
    const candidates: Array<{ shortcut: KeyboardShortcut; context: ShortcutContext }> = [];

    // 현재 컨텍스트 우선 검색
    const currentContext = this.config.context;
    const currentContextMap = this.shortcuts.get(currentContext);

    if (currentContextMap) {
      for (const shortcut of currentContextMap.values()) {
        if (this.matchesKeyCombination(keys, shortcut.keys)) {
          candidates.push({ shortcut, context: currentContext });
        }
      }
    }

    // 전역 컨텍스트 검색 (현재 컨텍스트가 전역이 아닌 경우)
    if (currentContext !== "global") {
      const globalContextMap = this.shortcuts.get("global");
      if (globalContextMap) {
        for (const shortcut of globalContextMap.values()) {
          if (this.matchesKeyCombination(keys, shortcut.keys)) {
            candidates.push({ shortcut, context: "global" });
          }
        }
      }
    }

    if (candidates.length === 0) {
      return null;
    }

    // 우선순위 정렬 (높은 순)
    candidates.sort((a, b) => (b.shortcut.priority || 0) - (a.shortcut.priority || 0));

    const bestMatch = candidates[0];
    const { shortcut, context } = bestMatch;

    // 비활성화된 단축키 체크
    if (this.config.disabledShortcuts.includes(shortcut.id)) {
      return {
        shortcut,
        context,
        canExecute: false,
        reason: "Shortcut is disabled",
      };
    }

    // 조건 체크
    if (shortcut.condition && !shortcut.condition()) {
      return {
        shortcut,
        context,
        canExecute: false,
        reason: "Condition not met",
      };
    }

    return {
      shortcut,
      context,
      canExecute: true,
    };
  }

  /**
   * 키 조합 매칭
   */
  private matchesKeyCombination(input: KeyCombination, target: KeyCombination): boolean {
    return (
      input.key === target.key &&
      !!input.ctrl === !!target.ctrl &&
      !!input.shift === !!target.shift &&
      !!input.alt === !!target.alt &&
      !!input.meta === !!target.meta
    );
  }

  /**
   * 입력 요소 여부 확인
   */
  private isInputElement(element: Element): boolean {
    if (!element) return false;

    const tagName = element.tagName.toLowerCase();
    const inputTypes = ["input", "textarea", "select"];

    if (inputTypes.includes(tagName)) {
      return true;
    }

    // contenteditable 요소 체크
    if (element.getAttribute("contenteditable") === "true") {
      return true;
    }

    return false;
  }

  /**
   * 이벤트 리스너 초기화
   */
  private initializeEventListeners(): void {
    document.addEventListener("keydown", this.handleKeyDown, true);
  }

  /**
   * 리스너들에게 변경 알림
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error("Shortcut listener error:", error);
      }
    });
  }

  /**
   * 정리 (컴포넌트 언마운트 시)
   */
  dispose(): void {
    document.removeEventListener("keydown", this.handleKeyDown, true);
    this.shortcuts.clear();
    this.listeners.clear();
  }
}

/**
 * 전역 단축키 핸들러 인스턴스
 */
export const shortcutHandler = new ShortcutHandlerImpl();
