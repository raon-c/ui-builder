import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { CanvasNode, Screen } from "@/types/project";
import { useBuilderStore } from "./builderStore";

// 테스트용 모크 화면 데이터
const mockScreen: Screen = {
  id: "screen-1",
  name: "테스트 화면",
  order: 1,
  viewport: "desktop",
  background: "#ffffff",
  content: {
    id: "root-node",
    type: "Container",
    props: { className: "p-4" },
    children: [
      {
        id: "child-1",
        type: "Text",
        props: { text: "Hello World" },
        children: [],
      },
      {
        id: "child-2",
        type: "Button",
        props: { text: "Click me" },
        children: [],
      },
    ],
  },
};

describe("builderStore", () => {
  beforeEach(() => {
    // 각 테스트 전에 스토어 상태 초기화
    const { result } = renderHook(() => useBuilderStore());
    act(() => {
      result.current.setCurrentScreen(null);
      result.current.setSelectedNode(null);
    });
  });

  describe("setCurrentScreen", () => {
    it("should set current screen and reset selected node", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.setSelectedNode("some-node");
        result.current.setCurrentScreen(mockScreen);
      });

      expect(result.current.currentScreen).toEqual(mockScreen);
      expect(result.current.selectedNodeId).toBeNull();
    });
  });

  describe("setSelectedNode", () => {
    it("should set selected node ID", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.setSelectedNode("test-node-id");
      });

      expect(result.current.selectedNodeId).toBe("test-node-id");
    });

    it("should allow setting null to deselect", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.setSelectedNode("test-node-id");
        result.current.setSelectedNode(null);
      });

      expect(result.current.selectedNodeId).toBeNull();
    });
  });

  describe("addNode", () => {
    it("should add new node to parent and select it", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.setCurrentScreen(mockScreen);
        result.current.addNode("root-node", "Input");
      });

      const rootNode = result.current.currentScreen?.content;
      expect(rootNode?.children).toHaveLength(3);

      const newNode = rootNode?.children[2];
      expect(newNode?.type).toBe("Input");
      expect(newNode?.props).toEqual({
        placeholder: "입력하세요",
        type: "text",
      });
      expect(result.current.selectedNodeId).toBe(newNode?.id);
    });

    it("should add node at specific index", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.setCurrentScreen(mockScreen);
        result.current.addNode("root-node", "Heading", 1);
      });

      const rootNode = result.current.currentScreen?.content;
      expect(rootNode?.children).toHaveLength(3);
      expect(rootNode?.children[1]?.type).toBe("Heading");
    });

    it("should not add node if no current screen", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.addNode("root-node", "Input");
      });

      expect(result.current.currentScreen).toBeNull();
    });
  });

  describe("removeNode", () => {
    it("should remove node and deselect if it was selected", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.setCurrentScreen(mockScreen);
        result.current.setSelectedNode("child-1");
        result.current.removeNode("child-1");
      });

      const rootNode = result.current.currentScreen?.content;
      expect(rootNode?.children).toHaveLength(1);
      expect(rootNode?.children[0]?.id).toBe("child-2");
      expect(result.current.selectedNodeId).toBeNull();
    });

    it("should not affect selection if different node is removed", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.setCurrentScreen(mockScreen);
        result.current.setSelectedNode("child-2");
        result.current.removeNode("child-1");
      });

      expect(result.current.selectedNodeId).toBe("child-2");
    });
  });

  describe("updateNodeProps", () => {
    it("should update node props", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.setCurrentScreen(mockScreen);
        result.current.updateNodeProps("child-1", {
          text: "Updated text",
          className: "new-class",
        });
      });

      const updatedNode = result.current.findNode("child-1");
      expect(updatedNode?.props).toEqual({
        text: "Updated text",
        className: "new-class",
      });
    });

    it("should merge with existing props", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.setCurrentScreen(mockScreen);
        result.current.updateNodeProps("child-1", { className: "new-class" });
      });

      const updatedNode = result.current.findNode("child-1");
      expect(updatedNode?.props).toEqual({
        text: "Hello World",
        className: "new-class",
      });
    });
  });

  describe("findNode", () => {
    it("should find node by ID", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.setCurrentScreen(mockScreen);
      });

      const foundNode = result.current.findNode("child-1");
      expect(foundNode).toEqual({
        id: "child-1",
        type: "Text",
        props: { text: "Hello World" },
        children: [],
      });
    });

    it("should return null for non-existent node", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.setCurrentScreen(mockScreen);
      });

      const foundNode = result.current.findNode("non-existent");
      expect(foundNode).toBeNull();
    });

    it("should return null when no current screen", () => {
      const { result } = renderHook(() => useBuilderStore());

      const foundNode = result.current.findNode("child-1");
      expect(foundNode).toBeNull();
    });
  });

  describe("getNodePath", () => {
    it("should return path to node", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.setCurrentScreen(mockScreen);
      });

      const path = result.current.getNodePath("child-1");
      expect(path).toEqual(["root-node", "child-1"]);
    });

    it("should return empty array for non-existent node", () => {
      const { result } = renderHook(() => useBuilderStore());

      act(() => {
        result.current.setCurrentScreen(mockScreen);
      });

      const path = result.current.getNodePath("non-existent");
      expect(path).toEqual([]);
    });

    it("should return empty array when no current screen", () => {
      const { result } = renderHook(() => useBuilderStore());

      const path = result.current.getNodePath("child-1");
      expect(path).toEqual([]);
    });
  });

  describe("moveNode", () => {
    it("should move node to new parent and position", () => {
      const { result } = renderHook(() => useBuilderStore());

      // 더 복잡한 트리 구조 생성
      const complexScreen: Screen = {
        ...mockScreen,
        content: {
          id: "root",
          type: "Container",
          props: {},
          children: [
            {
              id: "container-1",
              type: "Container",
              props: {},
              children: [
                {
                  id: "text-1",
                  type: "Text",
                  props: { text: "Text 1" },
                  children: [],
                },
              ],
            },
            {
              id: "container-2",
              type: "Container",
              props: {},
              children: [],
            },
          ],
        },
      };

      act(() => {
        result.current.setCurrentScreen(complexScreen);
        result.current.moveNode("text-1", "container-2", 0);
      });

      const container1 = result.current.findNode("container-1");
      const container2 = result.current.findNode("container-2");

      expect(container1?.children).toHaveLength(0);
      expect(container2?.children).toHaveLength(1);
      expect(container2?.children[0]?.id).toBe("text-1");
    });
  });
});
