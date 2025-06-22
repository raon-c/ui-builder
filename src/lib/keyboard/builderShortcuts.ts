// AIDEV-NOTE: 빌더 단축키 정의 - 빌더에서 사용할 모든 키보드 단축키 구성
// Command 시스템과 통합하여 편집 작업의 생산성 향상

import { Commands, createAddNodeCommand, createRemoveNodeCommand } from "@/lib/commands";
import { useBuilderStore } from "@/store/builderStore";
import { useProjectStore } from "@/store/projectStore";
import type { CanvasNode } from "@/types/project";
import type { KeyboardShortcut, ShortcutGroup } from "./types";

/**
 * 클립보드 데이터 (복사/붙여넣기용)
 */
interface ClipboardData {
  type: "component";
  data: CanvasNode;
  timestamp: number;
}

let clipboardData: ClipboardData | null = null;

/**
 * 편집 관련 단축키
 */
export const editingShortcuts: KeyboardShortcut[] = [
  // Undo/Redo (A1에서 구현된 것을 재사용)
  {
    id: "undo",
    name: "실행 취소",
    description: "마지막 작업을 실행 취소합니다",
    keys: { key: "z", ctrl: true },
    category: "editing",
    action: () => Commands.undo(),
    condition: () => Commands.canUndo(),
    priority: 100,
  },
  {
    id: "redo",
    name: "다시 실행",
    description: "취소된 작업을 다시 실행합니다",
    keys: { key: "y", ctrl: true },
    category: "editing",
    action: () => Commands.redo(),
    condition: () => Commands.canRedo(),
    priority: 100,
  },
  {
    id: "redo-alt",
    name: "다시 실행 (대체)",
    description: "취소된 작업을 다시 실행합니다",
    keys: { key: "z", ctrl: true, shift: true },
    category: "editing",
    action: () => Commands.redo(),
    condition: () => Commands.canRedo(),
    priority: 99,
  },

  // 복사/붙여넣기/잘라내기
  {
    id: "copy",
    name: "복사",
    description: "선택된 컴포넌트를 복사합니다",
    keys: { key: "c", ctrl: true },
    category: "editing",
    action: () => {
      const store = useBuilderStore.getState();
      if (store.selectedNodeId && store.currentScreen) {
        const node = store.findNode(store.selectedNodeId);
        if (node) {
          clipboardData = {
            type: "component",
            data: JSON.parse(JSON.stringify(node)), // 깊은 복사
            timestamp: Date.now(),
          };

          // 사용자에게 피드백 제공 (토스트 등)
          console.log("Component copied to clipboard");
        }
      }
    },
    condition: () => {
      const store = useBuilderStore.getState();
      return !!store.selectedNodeId;
    },
    priority: 90,
  },
  {
    id: "paste",
    name: "붙여넣기",
    description: "복사된 컴포넌트를 붙여넣습니다",
    keys: { key: "v", ctrl: true },
    category: "editing",
    action: () => {
      if (!clipboardData || clipboardData.type !== "component") return;

      const store = useBuilderStore.getState();
      if (!store.currentScreen) return;

      // 선택된 노드가 있으면 그 부모에, 없으면 루트에 추가
      let parentId = store.currentScreen.content.id;
      let index = 0;

      if (store.selectedNodeId) {
        const selectedNode = store.findNode(store.selectedNodeId);
        if (selectedNode) {
          // 선택된 노드의 부모를 찾아서 그 다음에 삽입
          const parent = findParentOfNode(store.currentScreen.content, store.selectedNodeId);
          if (parent) {
            parentId = parent.id;
            index = parent.children.findIndex((child) => child.id === store.selectedNodeId) + 1;
          }
        }
      }

      // Command를 통해 붙여넣기 실행
      const command = createAddNodeCommand(parentId, clipboardData.data.type, index, clipboardData.data.props);
      Commands.execute(command);
    },
    condition: () => {
      return !!clipboardData && clipboardData.type === "component";
    },
    priority: 90,
  },
  {
    id: "cut",
    name: "잘라내기",
    description: "선택된 컴포넌트를 잘라냅니다",
    keys: { key: "x", ctrl: true },
    category: "editing",
    action: () => {
      const store = useBuilderStore.getState();
      if (store.selectedNodeId && store.currentScreen) {
        const node = store.findNode(store.selectedNodeId);
        if (node) {
          // 먼저 복사
          clipboardData = {
            type: "component",
            data: JSON.parse(JSON.stringify(node)),
            timestamp: Date.now(),
          };

          // 그다음 삭제
          const command = Commands.createRemoveNodeCommand(store.selectedNodeId);
          if (command) {
            Commands.execute(command);
          }
        }
      }
    },
    condition: () => {
      const store = useBuilderStore.getState();
      return !!store.selectedNodeId;
    },
    priority: 90,
  },

  // 삭제
  {
    id: "delete",
    name: "삭제",
    description: "선택된 컴포넌트를 삭제합니다",
    keys: { key: "delete" },
    category: "editing",
    action: () => {
      const store = useBuilderStore.getState();
      if (store.selectedNodeId) {
        const command = Commands.createRemoveNodeCommand(store.selectedNodeId);
        if (command) {
          Commands.execute(command);
        }
      }
    },
    condition: () => {
      const store = useBuilderStore.getState();
      return !!store.selectedNodeId;
    },
    priority: 80,
  },

  // 복제
  {
    id: "duplicate",
    name: "복제",
    description: "선택된 컴포넌트를 복제합니다",
    keys: { key: "d", ctrl: true },
    category: "editing",
    action: () => {
      const store = useBuilderStore.getState();
      if (store.selectedNodeId && store.currentScreen) {
        const node = store.findNode(store.selectedNodeId);
        const parent = findParentOfNode(store.currentScreen.content, store.selectedNodeId);

        if (node && parent) {
          const index = parent.children.findIndex((child) => child.id === store.selectedNodeId) + 1;
          const command = Commands.createAddNodeCommand(parent.id, node.type, index, node.props);
          Commands.execute(command);
        }
      }
    },
    condition: () => {
      const store = useBuilderStore.getState();
      return !!store.selectedNodeId;
    },
    priority: 80,
  },
];

/**
 * 파일 관련 단축키
 */
export const fileShortcuts: KeyboardShortcut[] = [
  {
    id: "save",
    name: "저장",
    description: "현재 프로젝트를 저장합니다",
    keys: { key: "s", ctrl: true },
    category: "file",
    action: () => {
      const projectStore = useProjectStore.getState();
      const currentProject = projectStore.projects.find((p) => p.id === projectStore.currentProjectId);

      if (currentProject) {
        // 프로젝트 저장 로직 (이미 자동 저장되지만 명시적 저장)
        projectStore.updateProject(currentProject.id, {
          ...currentProject,
          updatedAt: new Date().toISOString(),
        });

        console.log("Project saved");
        // TODO: 토스트 알림 추가
      }
    },
    condition: () => {
      const projectStore = useProjectStore.getState();
      return !!projectStore.currentProjectId;
    },
    priority: 70,
  },
  {
    id: "new-project",
    name: "새 프로젝트",
    description: "새 프로젝트를 생성합니다",
    keys: { key: "n", ctrl: true },
    category: "file",
    action: () => {
      // 새 프로젝트 생성 모달 열기
      // TODO: 모달 상태 관리와 연동
      console.log("New project shortcut triggered");
    },
    priority: 60,
  },
];

/**
 * 선택 관련 단축키
 */
export const selectionShortcuts: KeyboardShortcut[] = [
  {
    id: "select-all",
    name: "전체 선택",
    description: "모든 컴포넌트를 선택합니다",
    keys: { key: "a", ctrl: true },
    category: "selection",
    action: () => {
      // TODO: 다중 선택 기능 구현 시 활용
      console.log("Select all shortcut triggered");
    },
    priority: 50,
  },
  {
    id: "escape",
    name: "선택 해제",
    description: "현재 선택을 해제합니다",
    keys: { key: "escape" },
    category: "selection",
    action: () => {
      const store = useBuilderStore.getState();
      store.setSelectedNode(null);
    },
    priority: 40,
  },
];

/**
 * 탐색 관련 단축키
 */
export const navigationShortcuts: KeyboardShortcut[] = [
  {
    id: "search",
    name: "검색",
    description: "컴포넌트 검색을 엽니다",
    keys: { key: "f", ctrl: true },
    category: "navigation",
    action: () => {
      // TODO: 검색 모달 열기
      console.log("Search shortcut triggered");
    },
    priority: 60,
  },
  {
    id: "focus-canvas",
    name: "캔버스 포커스",
    description: "캔버스에 포커스를 맞춥니다",
    keys: { key: "1", ctrl: true },
    category: "navigation",
    action: () => {
      // TODO: 캔버스 포커스 로직
      console.log("Focus canvas shortcut triggered");
    },
    priority: 30,
  },
  {
    id: "focus-structure",
    name: "구조 트리 포커스",
    description: "구조 트리에 포커스를 맞춥니다",
    keys: { key: "2", ctrl: true },
    category: "navigation",
    action: () => {
      // TODO: 구조 트리 포커스 로직
      console.log("Focus structure shortcut triggered");
    },
    priority: 30,
  },
  {
    id: "focus-properties",
    name: "속성 편집기 포커스",
    description: "속성 편집기에 포커스를 맞춥니다",
    keys: { key: "3", ctrl: true },
    category: "navigation",
    action: () => {
      // TODO: 속성 편집기 포커스 로직
      console.log("Focus properties shortcut triggered");
    },
    priority: 30,
  },
];

/**
 * 뷰 관련 단축키
 */
export const viewShortcuts: KeyboardShortcut[] = [
  {
    id: "toggle-preview",
    name: "미리보기 토글",
    description: "미리보기 모달을 토글합니다",
    keys: { key: "p", ctrl: true },
    category: "view",
    action: () => {
      // TODO: 미리보기 모달 토글
      console.log("Toggle preview shortcut triggered");
    },
    priority: 50,
  },
  {
    id: "zoom-reset",
    name: "줌 리셋",
    description: "캔버스 줌을 100%로 리셋합니다",
    keys: { key: "0", ctrl: true },
    category: "view",
    action: () => {
      // TODO: 줌 리셋 로직
      console.log("Zoom reset shortcut triggered");
    },
    priority: 40,
  },
];

/**
 * 도움말 관련 단축키
 */
export const helpShortcuts: KeyboardShortcut[] = [
  {
    id: "help",
    name: "도움말",
    description: "단축키 도움말을 표시합니다",
    keys: { key: "?", shift: true },
    category: "help",
    action: () => {
      // TODO: 도움말 모달 열기
      console.log("Help shortcut triggered");
    },
    priority: 20,
  },
  {
    id: "help-f1",
    name: "도움말 (F1)",
    description: "단축키 도움말을 표시합니다",
    keys: { key: "f1" },
    category: "help",
    action: () => {
      // TODO: 도움말 모달 열기
      console.log("Help (F1) shortcut triggered");
    },
    priority: 20,
  },
];

/**
 * 모든 빌더 단축키 그룹
 */
export const builderShortcutGroups: ShortcutGroup[] = [
  {
    name: "편집",
    description: "컴포넌트 편집 관련 단축키",
    category: "editing",
    shortcuts: editingShortcuts,
  },
  {
    name: "파일",
    description: "프로젝트 파일 관련 단축키",
    category: "file",
    shortcuts: fileShortcuts,
  },
  {
    name: "선택",
    description: "컴포넌트 선택 관련 단축키",
    category: "selection",
    shortcuts: selectionShortcuts,
  },
  {
    name: "탐색",
    description: "화면 탐색 관련 단축키",
    category: "navigation",
    shortcuts: navigationShortcuts,
  },
  {
    name: "보기",
    description: "화면 보기 관련 단축키",
    category: "view",
    shortcuts: viewShortcuts,
  },
  {
    name: "도움말",
    description: "도움말 관련 단축키",
    category: "help",
    shortcuts: helpShortcuts,
  },
];

/**
 * 모든 빌더 단축키 (플랫 배열)
 */
export const allBuilderShortcuts: KeyboardShortcut[] = [
  ...editingShortcuts,
  ...fileShortcuts,
  ...selectionShortcuts,
  ...navigationShortcuts,
  ...viewShortcuts,
  ...helpShortcuts,
];

// 헬퍼 함수들

/**
 * 노드의 부모 찾기
 */
function findParentOfNode(root: CanvasNode, targetId: string): CanvasNode | null {
  for (const child of root.children) {
    if (child.id === targetId) {
      return root;
    }
    const found = findParentOfNode(child, targetId);
    if (found) return found;
  }
  return null;
}
