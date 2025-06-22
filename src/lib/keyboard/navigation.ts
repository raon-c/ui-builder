// AIDEV-NOTE: 키보드 내비게이션 시스템 - 마우스 없이 빌더 완전 제어
// 구조 트리, 속성 편집기, 캔버스 간의 원활한 키보드 탐색 지원

import { useBuilderStore } from "@/store/builderStore";
import type { CanvasNode } from "@/types/project";

/**
 * 포커스 가능한 영역 정의
 */
export type FocusableArea =
  | "canvas" // 캔버스 영역
  | "structure-tree" // 구조 트리
  | "properties" // 속성 편집기
  | "component-palette" // 컴포넌트 팔레트
  | "toolbar" // 상단 툴바
  | "screen-tabs"; // 화면 탭

/**
 * 내비게이션 방향
 */
export type NavigationDirection = "up" | "down" | "left" | "right" | "next" | "prev";

/**
 * 포커스 상태 관리
 */
export interface FocusState {
  currentArea: FocusableArea | null;
  selectedNodeId: string | null;
  lastFocusedElement: HTMLElement | null;
}

/**
 * 키보드 내비게이션 매니저
 */
export class KeyboardNavigationManager {
  private focusState: FocusState = {
    currentArea: null,
    selectedNodeId: null,
    lastFocusedElement: null,
  };

  private listeners = new Set<(state: FocusState) => void>();

  /**
   * 포커스 상태 변경 리스너 등록
   */
  addListener(listener: (state: FocusState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 특정 영역으로 포커스 이동
   */
  focusArea(area: FocusableArea): void {
    this.focusState.currentArea = area;
    this.notifyListeners();

    switch (area) {
      case "canvas":
        this.focusCanvas();
        break;
      case "structure-tree":
        this.focusStructureTree();
        break;
      case "properties":
        this.focusProperties();
        break;
      case "component-palette":
        this.focusComponentPalette();
        break;
      case "toolbar":
        this.focusToolbar();
        break;
      case "screen-tabs":
        this.focusScreenTabs();
        break;
    }
  }

  /**
   * 구조 트리 내에서 내비게이션
   */
  navigateStructureTree(direction: NavigationDirection): void {
    if (this.focusState.currentArea !== "structure-tree") {
      this.focusArea("structure-tree");
      return;
    }

    const store = useBuilderStore.getState();
    if (!store.currentScreen) return;

    const currentNodeId = store.selectedNodeId;
    const nextNodeId = this.getNextNodeInDirection(store.currentScreen.content, currentNodeId, direction);

    if (nextNodeId) {
      store.setSelectedNode(nextNodeId);
      this.focusState.selectedNodeId = nextNodeId;
      this.notifyListeners();
    }
  }

  /**
   * 영역 간 내비게이션
   */
  navigateBetweenAreas(direction: NavigationDirection): void {
    const areaOrder: FocusableArea[] = ["component-palette", "canvas", "structure-tree", "properties"];

    const currentIndex = this.focusState.currentArea ? areaOrder.indexOf(this.focusState.currentArea) : -1;

    let nextIndex: number;

    switch (direction) {
      case "next":
      case "right":
        nextIndex = (currentIndex + 1) % areaOrder.length;
        break;
      case "prev":
      case "left":
        nextIndex = currentIndex <= 0 ? areaOrder.length - 1 : currentIndex - 1;
        break;
      default:
        return;
    }

    this.focusArea(areaOrder[nextIndex]);
  }

  /**
   * 현재 포커스 상태 조회
   */
  getFocusState(): FocusState {
    return { ...this.focusState };
  }

  /**
   * 캔버스 포커스
   */
  private focusCanvas(): void {
    const canvasElement = document.querySelector('[data-canvas="true"]') as HTMLElement;
    if (canvasElement) {
      canvasElement.focus();
      this.focusState.lastFocusedElement = canvasElement;
    }
  }

  /**
   * 구조 트리 포커스
   */
  private focusStructureTree(): void {
    const store = useBuilderStore.getState();

    // 선택된 노드가 있으면 해당 노드로, 없으면 첫 번째 노드로
    const targetNodeId = store.selectedNodeId || (store.currentScreen ? store.currentScreen.content.id : null);

    if (targetNodeId) {
      const nodeElement = document.querySelector(`[data-structure-node="${targetNodeId}"]`) as HTMLElement;

      if (nodeElement) {
        nodeElement.focus();
        this.focusState.lastFocusedElement = nodeElement;
      }
    }
  }

  /**
   * 속성 편집기 포커스
   */
  private focusProperties(): void {
    const firstInput = document.querySelector(
      '[data-properties="true"] input, [data-properties="true"] select, [data-properties="true"] textarea',
    ) as HTMLElement;

    if (firstInput) {
      firstInput.focus();
      this.focusState.lastFocusedElement = firstInput;
    }
  }

  /**
   * 컴포넌트 팔레트 포커스
   */
  private focusComponentPalette(): void {
    const firstComponent = document.querySelector(
      '[data-component-palette="true"] [data-component-item]',
    ) as HTMLElement;

    if (firstComponent) {
      firstComponent.focus();
      this.focusState.lastFocusedElement = firstComponent;
    }
  }

  /**
   * 툴바 포커스
   */
  private focusToolbar(): void {
    const firstButton = document.querySelector('[data-toolbar="true"] button') as HTMLElement;

    if (firstButton) {
      firstButton.focus();
      this.focusState.lastFocusedElement = firstButton;
    }
  }

  /**
   * 화면 탭 포커스
   */
  private focusScreenTabs(): void {
    const activeTab = document.querySelector('[data-screen-tabs="true"] [aria-selected="true"]') as HTMLElement;

    if (activeTab) {
      activeTab.focus();
      this.focusState.lastFocusedElement = activeTab;
    }
  }

  /**
   * 방향에 따른 다음 노드 찾기
   */
  private getNextNodeInDirection(
    root: CanvasNode,
    currentNodeId: string | null,
    direction: NavigationDirection,
  ): string | null {
    const flatNodes = this.flattenNodes(root);

    if (!currentNodeId) {
      return flatNodes.length > 0 ? flatNodes[0].id : null;
    }

    const currentIndex = flatNodes.findIndex((node) => node.id === currentNodeId);
    if (currentIndex === -1) return null;

    switch (direction) {
      case "up":
      case "prev":
        return currentIndex > 0 ? flatNodes[currentIndex - 1].id : null;

      case "down":
      case "next":
        return currentIndex < flatNodes.length - 1 ? flatNodes[currentIndex + 1].id : null;

      case "left":
        // 부모 노드로 이동
        return this.getParentNodeId(root, currentNodeId);

      case "right": {
        // 첫 번째 자식 노드로 이동
        const currentNode = flatNodes[currentIndex];
        return currentNode.children.length > 0 ? currentNode.children[0].id : null;
      }

      default:
        return null;
    }
  }

  /**
   * 노드 트리를 플랫 배열로 변환 (DFS 순서)
   */
  private flattenNodes(root: CanvasNode): CanvasNode[] {
    const result: CanvasNode[] = [];

    const traverse = (node: CanvasNode) => {
      result.push(node);
      node.children.forEach(traverse);
    };

    traverse(root);
    return result;
  }

  /**
   * 부모 노드 ID 찾기
   */
  private getParentNodeId(root: CanvasNode, targetId: string): string | null {
    const findParent = (node: CanvasNode): CanvasNode | null => {
      for (const child of node.children) {
        if (child.id === targetId) {
          return node;
        }
        const found = findParent(child);
        if (found) return found;
      }
      return null;
    };

    const parent = findParent(root);
    return parent ? parent.id : null;
  }

  /**
   * 리스너들에게 상태 변경 알림
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.focusState);
      } catch (error) {
        console.error("Navigation listener error:", error);
      }
    });
  }
}

/**
 * 전역 키보드 내비게이션 매니저 인스턴스
 */
export const keyboardNavigationManager = new KeyboardNavigationManager();

/**
 * 키보드 내비게이션을 위한 유틸리티 함수들
 */
export const NavigationUtils = {
  /**
   * 요소가 포커스 가능한지 확인
   */
  isFocusable: (element: HTMLElement): boolean => {
    const focusableSelectors = [
      "button",
      "input",
      "select",
      "textarea",
      "a[href]",
      '[tabindex]:not([tabindex="-1"])',
      '[data-focusable="true"]',
    ];

    return focusableSelectors.some((selector) => element.matches(selector) || element.querySelector(selector));
  },

  /**
   * 요소 내의 모든 포커스 가능한 요소 찾기
   */
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "a[href]",
      '[tabindex]:not([tabindex="-1"])',
      '[data-focusable="true"]',
    ].join(", ");

    return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
  },

  /**
   * 다음/이전 포커스 가능한 요소로 이동
   */
  moveFocusWithinContainer: (container: HTMLElement, direction: "next" | "prev"): boolean => {
    const focusableElements = NavigationUtils.getFocusableElements(container);
    const currentElement = document.activeElement as HTMLElement;
    const currentIndex = focusableElements.indexOf(currentElement);

    if (currentIndex === -1) {
      // 현재 포커스된 요소가 없으면 첫 번째 요소로
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
        return true;
      }
      return false;
    }

    let nextIndex: number;
    if (direction === "next") {
      nextIndex = (currentIndex + 1) % focusableElements.length;
    } else {
      nextIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
    }

    focusableElements[nextIndex].focus();
    return true;
  },

  /**
   * 요소가 화면에 보이는지 확인하고 스크롤
   */
  ensureElementVisible: (element: HTMLElement): void => {
    const rect = element.getBoundingClientRect();
    const isVisible =
      rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;

    if (!isVisible) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  },
} as const;
