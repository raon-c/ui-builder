// AIDEV-NOTE: 키보드 단축키 시스템 진입점 - 모든 단축키 관련 exports 통합
// 종합적인 단축키 시스템의 공개 API 제공

// 빌더 단축키 정의
export {
  allBuilderShortcuts,
  builderShortcutGroups,
  editingShortcuts,
  fileShortcuts,
  helpShortcuts,
  navigationShortcuts,
  selectionShortcuts,
  viewShortcuts,
} from "./builderShortcuts";

// 단축키 핸들러
export { ShortcutHandlerImpl, shortcutHandler } from "./shortcutHandler";
// 타입 정의
export type {
  KeyboardShortcut,
  KeyCombination,
  KeyCombinationString,
  KeyMatchResult,
  ShortcutCategory,
  ShortcutConfig,
  ShortcutContext,
  ShortcutGroup,
  ShortcutHandler,
} from "./types";

// 유틸리티 함수들
export const KeyboardUtils = {
  /**
   * 키 조합을 문자열로 변환
   */
  formatKeyCombination: (keys: KeyCombination): string => {
    const parts: string[] = [];

    if (keys.ctrl) parts.push("Ctrl");
    if (keys.shift) parts.push("Shift");
    if (keys.alt) parts.push("Alt");
    if (keys.meta) parts.push("Cmd");

    // 특수 키 매핑
    const keyMap: Record<string, string> = {
      " ": "Space",
      escape: "Esc",
      delete: "Del",
      backspace: "Backspace",
      enter: "Enter",
      tab: "Tab",
      arrowup: "↑",
      arrowdown: "↓",
      arrowleft: "←",
      arrowright: "→",
      f1: "F1",
      f2: "F2",
      f3: "F3",
      f4: "F4",
      f5: "F5",
      f6: "F6",
      f7: "F7",
      f8: "F8",
      f9: "F9",
      f10: "F10",
      f11: "F11",
      f12: "F12",
    };

    const key = keyMap[keys.key.toLowerCase()] || keys.key.toUpperCase();
    parts.push(key);

    return parts.join("+");
  },

  /**
   * 문자열을 키 조합으로 파싱
   */
  parseKeyCombination: (keyString: string): KeyCombination => {
    const parts = keyString
      .toLowerCase()
      .split("+")
      .map((part) => part.trim());
    const key = parts[parts.length - 1];

    return {
      key,
      ctrl: parts.includes("ctrl"),
      shift: parts.includes("shift"),
      alt: parts.includes("alt"),
      meta: parts.includes("cmd") || parts.includes("meta"),
    };
  },

  /**
   * 두 키 조합이 같은지 비교
   */
  areKeyCombinationsEqual: (a: KeyCombination, b: KeyCombination): boolean => {
    return (
      a.key === b.key &&
      !!a.ctrl === !!b.ctrl &&
      !!a.shift === !!b.shift &&
      !!a.alt === !!b.alt &&
      !!a.meta === !!b.meta
    );
  },

  /**
   * 키 조합이 유효한지 검사
   */
  isValidKeyCombination: (keys: KeyCombination): boolean => {
    // 빈 키는 유효하지 않음
    if (!keys.key || keys.key.trim() === "") {
      return false;
    }

    // 수정자 키만으로는 유효하지 않음
    const modifierOnlyKeys = ["ctrl", "shift", "alt", "meta", "cmd"];
    if (modifierOnlyKeys.includes(keys.key.toLowerCase())) {
      return false;
    }

    return true;
  },

  /**
   * 단축키 그룹을 카테고리별로 정렬
   */
  sortShortcutsByCategory: (shortcuts: KeyboardShortcut[]): Record<ShortcutCategory, KeyboardShortcut[]> => {
    const grouped: Record<ShortcutCategory, KeyboardShortcut[]> = {
      editing: [],
      navigation: [],
      selection: [],
      view: [],
      file: [],
      help: [],
      custom: [],
    };

    shortcuts.forEach((shortcut) => {
      grouped[shortcut.category].push(shortcut);
    });

    // 각 카테고리 내에서 우선순위로 정렬
    Object.keys(grouped).forEach((category) => {
      grouped[category as ShortcutCategory].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    });

    return grouped;
  },

  /**
   * 단축키 검색
   */
  searchShortcuts: (shortcuts: KeyboardShortcut[], query: string): KeyboardShortcut[] => {
    const lowerQuery = query.toLowerCase();

    return shortcuts.filter(
      (shortcut) =>
        shortcut.name.toLowerCase().includes(lowerQuery) ||
        shortcut.description.toLowerCase().includes(lowerQuery) ||
        KeyboardUtils.formatKeyCombination(shortcut.keys).toLowerCase().includes(lowerQuery),
    );
  },
} as const;

// 편의 상수
export const COMMON_SHORTCUTS = {
  UNDO: { key: "z", ctrl: true } as KeyCombination,
  REDO: { key: "y", ctrl: true } as KeyCombination,
  REDO_ALT: { key: "z", ctrl: true, shift: true } as KeyCombination,
  COPY: { key: "c", ctrl: true } as KeyCombination,
  PASTE: { key: "v", ctrl: true } as KeyCombination,
  CUT: { key: "x", ctrl: true } as KeyCombination,
  DELETE: { key: "delete" } as KeyCombination,
  DUPLICATE: { key: "d", ctrl: true } as KeyCombination,
  SAVE: { key: "s", ctrl: true } as KeyCombination,
  NEW: { key: "n", ctrl: true } as KeyCombination,
  SEARCH: { key: "f", ctrl: true } as KeyCombination,
  SELECT_ALL: { key: "a", ctrl: true } as KeyCombination,
  ESCAPE: { key: "escape" } as KeyCombination,
  HELP: { key: "?", shift: true } as KeyCombination,
  HELP_F1: { key: "f1" } as KeyCombination,
} as const;

import type { KeyboardShortcut, KeyCombination, ShortcutCategory } from "./types";
