// AIDEV-NOTE: 키보드 내비게이션 React Hook - 마우스 없는 빌더 제어
// 포커스 관리, 영역 간 내비게이션, 접근성 개선

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type FocusableArea,
  type FocusState,
  keyboardNavigationManager,
  type NavigationDirection,
  NavigationUtils,
} from "@/lib/keyboard/navigation";

/**
 * 키보드 내비게이션 Hook 반환 타입
 */
export interface UseKeyboardNavigationReturn {
  // 상태
  focusState: FocusState;
  isNavigating: boolean;

  // 액션
  focusArea: (area: FocusableArea) => void;
  navigateStructureTree: (direction: NavigationDirection) => void;
  navigateBetweenAreas: (direction: NavigationDirection) => void;

  // 유틸리티
  isFocusable: (element: HTMLElement) => boolean;
  ensureVisible: (element: HTMLElement) => void;
  moveFocusWithinContainer: (container: HTMLElement, direction: "next" | "prev") => boolean;
}

/**
 * 메인 키보드 내비게이션 Hook
 */
export function useKeyboardNavigation(): UseKeyboardNavigationReturn {
  const [focusState, setFocusState] = useState<FocusState>(keyboardNavigationManager.getFocusState());
  const [isNavigating, setIsNavigating] = useState(false);

  // 포커스 상태 변경 리스너 등록
  useEffect(() => {
    const unsubscribe = keyboardNavigationManager.addListener(setFocusState);
    return unsubscribe;
  }, []);

  // 특정 영역으로 포커스 이동
  const focusArea = useCallback((area: FocusableArea) => {
    setIsNavigating(true);
    keyboardNavigationManager.focusArea(area);

    // 내비게이션 완료 후 상태 리셋
    setTimeout(() => setIsNavigating(false), 100);
  }, []);

  // 구조 트리 내 내비게이션
  const navigateStructureTree = useCallback((direction: NavigationDirection) => {
    setIsNavigating(true);
    keyboardNavigationManager.navigateStructureTree(direction);
    setTimeout(() => setIsNavigating(false), 100);
  }, []);

  // 영역 간 내비게이션
  const navigateBetweenAreas = useCallback((direction: NavigationDirection) => {
    setIsNavigating(true);
    keyboardNavigationManager.navigateBetweenAreas(direction);
    setTimeout(() => setIsNavigating(false), 100);
  }, []);

  return {
    // 상태
    focusState,
    isNavigating,

    // 액션
    focusArea,
    navigateStructureTree,
    navigateBetweenAreas,

    // 유틸리티
    isFocusable: NavigationUtils.isFocusable,
    ensureVisible: NavigationUtils.ensureElementVisible,
    moveFocusWithinContainer: NavigationUtils.moveFocusWithinContainer,
  };
}

/**
 * 특정 영역의 포커스 관리를 위한 Hook
 */
export function useAreaFocus(area: FocusableArea) {
  const { focusState, focusArea } = useKeyboardNavigation();

  const isActive = focusState.currentArea === area;
  const activate = useCallback(() => focusArea(area), [area, focusArea]);

  return { isActive, activate };
}

/**
 * 포커스 트랩을 위한 Hook (모달, 드롭다운 등)
 */
export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, isActive: boolean = true) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = NavigationUtils.getFocusableElements(container);

    if (focusableElements.length === 0) return;

    // 첫 번째 요소에 포커스
    focusableElements[0].focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

      if (event.shiftKey) {
        // Shift+Tab: 이전 요소
        const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
        focusableElements[prevIndex].focus();
      } else {
        // Tab: 다음 요소
        const nextIndex = (currentIndex + 1) % focusableElements.length;
        focusableElements[nextIndex].focus();
      }

      event.preventDefault();
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [containerRef, isActive]);
}

/**
 * 구조 트리 항목의 키보드 내비게이션을 위한 Hook
 */
export function useStructureTreeNavigation(nodeId: string) {
  const { focusState, navigateStructureTree } = useKeyboardNavigation();

  const isSelected = focusState.selectedNodeId === nodeId;
  const isFocused = focusState.currentArea === "structure-tree";

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isFocused) return;

      switch (event.key) {
        case "ArrowUp":
          navigateStructureTree("up");
          event.preventDefault();
          break;
        case "ArrowDown":
          navigateStructureTree("down");
          event.preventDefault();
          break;
        case "ArrowLeft":
          navigateStructureTree("left");
          event.preventDefault();
          break;
        case "ArrowRight":
          navigateStructureTree("right");
          event.preventDefault();
          break;
      }
    },
    [isFocused, navigateStructureTree],
  );

  return {
    isSelected,
    isFocused,
    handleKeyDown,
    tabIndex: isSelected ? 0 : -1,
    "data-structure-node": nodeId,
  };
}

/**
 * 컴포넌트 팔레트 항목의 키보드 내비게이션을 위한 Hook
 */
export function useComponentPaletteNavigation(componentId: string) {
  const { focusState } = useKeyboardNavigation();

  const isFocused = focusState.currentArea === "component-palette";

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isFocused) return;

      const container = event.currentTarget.closest('[data-component-palette="true"]') as HTMLElement;
      if (!container) return;

      switch (event.key) {
        case "ArrowUp":
        case "ArrowLeft":
          NavigationUtils.moveFocusWithinContainer(container, "prev");
          event.preventDefault();
          break;
        case "ArrowDown":
        case "ArrowRight":
          NavigationUtils.moveFocusWithinContainer(container, "next");
          event.preventDefault();
          break;
      }
    },
    [isFocused],
  );

  return {
    isFocused,
    handleKeyDown,
    tabIndex: isFocused ? 0 : -1,
    "data-component-item": componentId,
  };
}

/**
 * 속성 편집기의 키보드 내비게이션을 위한 Hook
 */
export function usePropertiesNavigation() {
  const { focusState } = useKeyboardNavigation();

  const isFocused = focusState.currentArea === "properties";

  const handleContainerKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isFocused) return;

      const container = event.currentTarget as HTMLElement;

      switch (event.key) {
        case "Tab":
          // Tab 내비게이션은 기본 동작 허용
          break;
        case "ArrowUp":
          NavigationUtils.moveFocusWithinContainer(container, "prev");
          event.preventDefault();
          break;
        case "ArrowDown":
          NavigationUtils.moveFocusWithinContainer(container, "next");
          event.preventDefault();
          break;
      }
    },
    [isFocused],
  );

  return {
    isFocused,
    handleContainerKeyDown,
    "data-properties": "true",
  };
}

/**
 * 전역 키보드 단축키를 위한 Hook
 */
export function useGlobalNavigationShortcuts() {
  const { focusArea, navigateBetweenAreas } = useKeyboardNavigation();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + 숫자키로 영역 직접 포커스
      if ((event.ctrlKey || event.metaKey) && event.key >= "1" && event.key <= "6") {
        const areaMap: Record<string, FocusableArea> = {
          "1": "component-palette",
          "2": "canvas",
          "3": "structure-tree",
          "4": "properties",
          "5": "toolbar",
          "6": "screen-tabs",
        };

        const area = areaMap[event.key];
        if (area) {
          focusArea(area);
          event.preventDefault();
        }
        return;
      }

      // F6: 영역 간 순환 이동
      if (event.key === "F6") {
        navigateBetweenAreas(event.shiftKey ? "prev" : "next");
        event.preventDefault();
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusArea, navigateBetweenAreas]);
}

/**
 * 접근성 개선을 위한 Hook
 */
export function useAccessibilityEnhancements() {
  const { focusState } = useKeyboardNavigation();

  // 현재 포커스된 영역을 스크린 리더에 알림
  useEffect(() => {
    if (focusState.currentArea) {
      const areaNames: Record<FocusableArea, string> = {
        canvas: "캔버스 영역",
        "structure-tree": "구조 트리",
        properties: "속성 편집기",
        "component-palette": "컴포넌트 팔레트",
        toolbar: "툴바",
        "screen-tabs": "화면 탭",
      };

      const areaName = areaNames[focusState.currentArea];

      // ARIA live region에 메시지 추가
      const liveRegion = document.getElementById("keyboard-navigation-status");
      if (liveRegion) {
        liveRegion.textContent = `${areaName}으로 이동했습니다.`;
      }
    }
  }, [focusState.currentArea]);

  return {
    // ARIA live region을 위한 props
    liveRegionProps: {
      id: "keyboard-navigation-status",
      "aria-live": "polite" as const,
      "aria-atomic": true,
      className: "sr-only", // 스크린 리더 전용
    },
  };
}
