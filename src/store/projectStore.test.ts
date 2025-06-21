import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDefaultStorage } from "@/lib/storage/index";
import type { Project } from "@/types/project";
import { useProjectStore } from "./projectStore";

// createDefaultStorage 모킹
vi.mock("@/lib/storage/index", () => ({
  createDefaultStorage: vi.fn(),
}));

const mockedCreateDefaultStorage = vi.mocked(createDefaultStorage);

const mockAdapter = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  getAllKeys: vi.fn(),
  clear: vi.fn(),
  getAvailableSpace: vi.fn(),
  getUsageStats: vi.fn(),
};

const mockProjectStorage = {
  getAllProjects: vi.fn(),
  getProject: vi.fn(),
  saveProject: vi.fn(),
  deleteProject: vi.fn(),
  getRecentProjectId: vi.fn(),
  setRecentProjectId: vi.fn(),
  getStorageUsage: vi.fn(),
};

// 테스트용 모크 프로젝트 데이터
const mockProject: Project = {
  schemaVersion: 1,
  id: "test-project-1",
  name: "테스트 프로젝트",
  version: "1.0.0",
  screens: [
    {
      id: "screen-1",
      name: "메인 화면",
      order: 1,
      viewport: "desktop",
      background: "#ffffff",
      content: {
        id: "root-1",
        type: "Container",
        props: { className: "p-4" },
        children: [],
      },
    },
  ],
  collaborators: [],
  settings: {
    designLibrary: "shadcn",
    theme: "default",
  },
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
};

describe("projectStore", () => {
  beforeEach(async () => {
    // 모든 모킹 함수 초기화
    vi.clearAllMocks();

    // createDefaultStorage 모킹 설정
    mockedCreateDefaultStorage.mockResolvedValue({
      adapter: mockAdapter as any,
      projectStorage: mockProjectStorage as any,
    });

    // 각 테스트 전에 스토어 상태 초기화
    const { result } = renderHook(() => useProjectStore());
    act(() => {
      result.current.projects = [];
      result.current.isLoading = false;
      result.current.error = null;
    });
  });

  describe("loadProjects", () => {
    it("should load projects from storage", async () => {
      mockProjectStorage.getAllProjects.mockResolvedValue([mockProject]);

      const { result } = renderHook(() => useProjectStore());

      await act(async () => {
        await result.current.loadProjects();
      });

      expect(result.current.projects).toHaveLength(1);
      expect(result.current.projects[0]).toEqual(mockProject);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("should handle loading errors", async () => {
      mockProjectStorage.getAllProjects.mockRejectedValue(
        new Error("Storage error"),
      );

      const { result } = renderHook(() => useProjectStore());

      await act(async () => {
        await result.current.loadProjects();
      });

      expect(result.current.projects).toHaveLength(0);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe("Storage error");
    });
  });

  describe("createProject", () => {
    it("should create new project with default screen", async () => {
      mockProjectStorage.saveProject.mockResolvedValue(undefined);
      mockProjectStorage.getAllProjects.mockResolvedValue([mockProject]);

      const { result } = renderHook(() => useProjectStore());

      await act(async () => {
        await result.current.createProject("새 프로젝트", "프로젝트 설명");
      });

      expect(mockProjectStorage.saveProject).toHaveBeenCalled();
      expect(mockProjectStorage.getAllProjects).toHaveBeenCalled();
      expect(result.current.projects).toHaveLength(1);
    });

    it("should handle creation errors", async () => {
      mockProjectStorage.saveProject.mockRejectedValue(
        new Error("Storage full"),
      );

      const { result } = renderHook(() => useProjectStore());

      await act(async () => {
        await result.current.createProject("새 프로젝트");
      });

      expect(result.current.error).toBe("Storage full");
    });
  });

  describe("updateProject", () => {
    it("should update existing project", async () => {
      const updatedProject = {
        ...mockProject,
        name: "업데이트된 프로젝트",
        version: "1.1.0",
      };

      mockProjectStorage.getProject.mockResolvedValue(mockProject);
      mockProjectStorage.saveProject.mockResolvedValue(undefined);

      const { result } = renderHook(() => useProjectStore());

      // 초기 프로젝트 설정
      act(() => {
        result.current.projects = [mockProject];
      });

      await act(async () => {
        await result.current.updateProject("test-project-1", {
          name: "업데이트된 프로젝트",
          version: "1.1.0",
        });
      });

      expect(mockProjectStorage.getProject).toHaveBeenCalledWith(
        "test-project-1",
      );
      expect(mockProjectStorage.saveProject).toHaveBeenCalled();

      const updatedProjectInStore = result.current.projects[0];
      expect(updatedProjectInStore.name).toBe("업데이트된 프로젝트");
      expect(updatedProjectInStore.version).toBe("1.1.0");
    });

    it("should handle update errors for non-existent project", async () => {
      mockProjectStorage.getProject.mockResolvedValue(null);

      const { result } = renderHook(() => useProjectStore());

      await act(async () => {
        await result.current.updateProject("non-existent", { name: "Test" });
      });

      expect(result.current.error).toContain("프로젝트를 찾을 수 없습니다");
    });
  });

  describe("deleteProject", () => {
    it("should delete project from store and storage", async () => {
      mockProjectStorage.deleteProject.mockResolvedValue(undefined);

      const { result } = renderHook(() => useProjectStore());

      // 초기 프로젝트 설정
      act(() => {
        result.current.projects = [mockProject];
      });

      await act(async () => {
        await result.current.deleteProject("test-project-1");
      });

      expect(mockProjectStorage.deleteProject).toHaveBeenCalledWith(
        "test-project-1",
      );
      expect(result.current.projects).toHaveLength(0);
    });

    it("should handle deletion errors", async () => {
      mockProjectStorage.deleteProject.mockRejectedValue(
        new Error("Delete failed"),
      );

      const { result } = renderHook(() => useProjectStore());
      act(() => {
        result.current.projects = [mockProject];
      });

      await act(async () => {
        await result.current.deleteProject("test-project-1");
      });

      expect(result.current.error).toBe("Delete failed");
    });
  });

  describe("addScreen", () => {
    it("should add new screen to project", async () => {
      const projectWithNewScreen = {
        ...mockProject,
        screens: [
          ...mockProject.screens,
          {
            id: "screen-2",
            name: "새 화면",
            order: 2,
            viewport: "desktop" as const,
            background: "#ffffff",
            content: {
              id: "root-2",
              type: "Container" as const,
              props: { padding: "lg", className: "min-h-screen bg-background" },
              children: [],
            },
          },
        ],
      };

      mockProjectStorage.getProject.mockResolvedValue(mockProject);
      mockProjectStorage.saveProject.mockResolvedValue(undefined);

      const { result } = renderHook(() => useProjectStore());

      // 초기 프로젝트 설정
      act(() => {
        result.current.projects = [mockProject];
      });

      await act(async () => {
        await result.current.addScreen("test-project-1", "새 화면");
      });

      expect(mockProjectStorage.getProject).toHaveBeenCalledWith(
        "test-project-1",
      );
      expect(mockProjectStorage.saveProject).toHaveBeenCalled();

      const updatedProject = result.current.projects[0];
      expect(updatedProject.screens).toHaveLength(2);
      expect(updatedProject.screens[1].name).toBe("새 화면");
    });

    it("should handle errors when project not found", async () => {
      mockProjectStorage.getProject.mockResolvedValue(null);

      const { result } = renderHook(() => useProjectStore());

      await act(async () => {
        await result.current.addScreen("non-existent", "새 화면");
      });

      expect(result.current.error).toContain("프로젝트를 찾을 수 없습니다");
    });
  });

  describe("updateScreen", () => {
    it("should update screen properties", async () => {
      const updatedProject = {
        ...mockProject,
        screens: [
          {
            ...mockProject.screens[0],
            name: "업데이트된 화면",
            background: "#f0f0f0",
          },
        ],
      };

      mockProjectStorage.getProject.mockResolvedValue(mockProject);
      mockProjectStorage.saveProject.mockResolvedValue(undefined);

      const { result } = renderHook(() => useProjectStore());

      // 초기 프로젝트 설정
      act(() => {
        result.current.projects = [mockProject];
      });

      await act(async () => {
        await result.current.updateScreen("test-project-1", "screen-1", {
          name: "업데이트된 화면",
          background: "#f0f0f0",
        });
      });

      expect(mockProjectStorage.getProject).toHaveBeenCalledWith(
        "test-project-1",
      );
      expect(mockProjectStorage.saveProject).toHaveBeenCalled();

      const project = result.current.projects[0];
      const updatedScreen = project.screens[0];
      expect(updatedScreen.name).toBe("업데이트된 화면");
      expect(updatedScreen.background).toBe("#f0f0f0");
    });

    it("should handle errors when screen not found", async () => {
      mockProjectStorage.getProject.mockResolvedValue(mockProject);

      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.projects = [mockProject];
      });

      await act(async () => {
        await result.current.updateScreen("test-project-1", "non-existent", {
          name: "Test",
        });
      });

      expect(result.current.error).toContain("화면을 찾을 수 없습니다");
    });
  });

  describe("deleteScreen", () => {
    it("should delete screen and reorder remaining screens", async () => {
      // 완전히 새로운 객체로 생성하여 읽기 전용 문제 해결
      const projectWithTwoScreens: Project = {
        schemaVersion: 1,
        id: "test-project-1",
        name: "테스트 프로젝트",
        version: "1.0.0",
        screens: [
          {
            id: "screen-1",
            name: "메인 화면",
            order: 1,
            viewport: "desktop",
            background: "#ffffff",
            content: {
              id: "root-1",
              type: "Container",
              props: { className: "p-4" },
              children: [],
            },
          },
          {
            id: "screen-2",
            name: "두 번째 화면",
            order: 2,
            viewport: "desktop",
            background: "#ffffff",
            content: {
              id: "root-2",
              type: "Container",
              props: {},
              children: [],
            },
          },
        ],
        collaborators: [],
        settings: {
          designLibrary: "shadcn",
          theme: "default",
        },
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      // 모킹 초기화 및 재설정
      vi.clearAllMocks();
      mockedCreateDefaultStorage.mockResolvedValue({
        adapter: mockAdapter as any,
        projectStorage: mockProjectStorage as any,
      });
      mockProjectStorage.getProject.mockResolvedValue(projectWithTwoScreens);
      mockProjectStorage.saveProject.mockResolvedValue(undefined);

      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.projects = [projectWithTwoScreens];
      });

      await act(async () => {
        await result.current.deleteScreen("test-project-1", "screen-1");
      });

      expect(mockProjectStorage.getProject).toHaveBeenCalledWith(
        "test-project-1",
      );
      expect(mockProjectStorage.saveProject).toHaveBeenCalled();

      const updatedProject = result.current.projects[0];
      expect(updatedProject.screens).toHaveLength(1);
      expect(updatedProject.screens[0].id).toBe("screen-2");
      expect(updatedProject.screens[0].order).toBe(1); // 순서 재정렬됨
    });

    it("should prevent deleting last screen", async () => {
      mockProjectStorage.getProject.mockResolvedValue(mockProject);

      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.projects = [mockProject];
      });

      await act(async () => {
        await result.current.deleteScreen("test-project-1", "screen-1");
      });

      expect(result.current.error).toContain(
        "최소 하나의 화면은 유지되어야 합니다",
      );
    });
  });

  describe("duplicateScreen", () => {
    it("should create a copy of existing screen with new IDs", async () => {
      mockProjectStorage.getProject.mockResolvedValue(mockProject);
      mockProjectStorage.saveProject.mockResolvedValue(undefined);

      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.projects = [mockProject];
      });

      await act(async () => {
        await result.current.duplicateScreen("test-project-1", "screen-1");
      });

      expect(mockProjectStorage.getProject).toHaveBeenCalledWith(
        "test-project-1",
      );
      expect(mockProjectStorage.saveProject).toHaveBeenCalled();

      const updatedProject = result.current.projects[0];
      expect(updatedProject.screens).toHaveLength(2);

      const duplicatedScreen = updatedProject.screens[1];
      expect(duplicatedScreen.name).toBe("메인 화면 복사본");
      expect(duplicatedScreen.order).toBe(2);
      expect(duplicatedScreen.id).not.toBe("screen-1"); // 새로운 ID
      expect(duplicatedScreen.content.id).not.toBe("root-1"); // 새로운 content ID
    });
  });

  describe("reorderScreens", () => {
    it("should reorder screens and update order values", async () => {
      // 완전히 새로운 객체로 생성하여 읽기 전용 문제 해결
      const projectWithThreeScreens: Project = {
        schemaVersion: 1,
        id: "test-project-1",
        name: "테스트 프로젝트",
        version: "1.0.0",
        screens: [
          {
            id: "screen-1",
            name: "첫 번째",
            order: 1,
            viewport: "desktop",
            background: "#ffffff",
            content: {
              id: "root-1",
              type: "Container",
              props: { className: "p-4" },
              children: [],
            },
          },
          {
            id: "screen-2",
            name: "두 번째",
            order: 2,
            viewport: "desktop",
            background: "#ffffff",
            content: {
              id: "root-2",
              type: "Container",
              props: {},
              children: [],
            },
          },
          {
            id: "screen-3",
            name: "세 번째",
            order: 3,
            viewport: "desktop",
            background: "#ffffff",
            content: {
              id: "root-3",
              type: "Container",
              props: {},
              children: [],
            },
          },
        ],
        collaborators: [],
        settings: {
          designLibrary: "shadcn",
          theme: "default",
        },
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      // 모킹 초기화 및 재설정
      vi.clearAllMocks();
      mockedCreateDefaultStorage.mockResolvedValue({
        adapter: mockAdapter as any,
        projectStorage: mockProjectStorage as any,
      });
      mockProjectStorage.getProject.mockResolvedValue(projectWithThreeScreens);
      mockProjectStorage.saveProject.mockResolvedValue(undefined);

      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.projects = [projectWithThreeScreens];
      });

      // 첫 번째(index 0)를 마지막(index 2)으로 이동
      await act(async () => {
        await result.current.reorderScreens("test-project-1", 0, 2);
      });

      expect(mockProjectStorage.getProject).toHaveBeenCalledWith(
        "test-project-1",
      );
      expect(mockProjectStorage.saveProject).toHaveBeenCalled();

      const updatedProject = result.current.projects[0];
      expect(updatedProject.screens[0].name).toBe("두 번째");
      expect(updatedProject.screens[1].name).toBe("세 번째");
      expect(updatedProject.screens[2].name).toBe("첫 번째");

      // order 값이 올바르게 재정렬되었는지 확인
      expect(updatedProject.screens[0].order).toBe(1);
      expect(updatedProject.screens[1].order).toBe(2);
      expect(updatedProject.screens[2].order).toBe(3);
    });
  });

  describe("clearError", () => {
    it("should clear error state", () => {
      const { result } = renderHook(() => useProjectStore());

      act(() => {
        result.current.error = "Test error";
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
