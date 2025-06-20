"use client";

// AIDEV-NOTE: Zustand 기반 프로젝트 상태 관리 스토어
// localStorage 스토리지와 연동하여 프로젝트 CRUD 작업 처리

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  generateNodeId,
  generateProjectId,
  generateScreenId,
} from "@/lib/nanoid";
import { createDefaultStorage } from "@/lib/storage";
import type { Project } from "@/types/project";

interface ProjectState {
  // 상태
  projects: Project[];
  isLoading: boolean;
  error: string | null;

  // 액션
  loadProjects: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>()(
  immer((set, get) => ({
    // 초기 상태
    projects: [],
    isLoading: false,
    error: null,

    // 프로젝트 목록 로드
    loadProjects: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const { projectStorage } = await createDefaultStorage();
        const projects = await projectStorage.getAllProjects();

        set((state) => {
          state.projects = projects;
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : "프로젝트를 불러오는데 실패했습니다.";
          state.isLoading = false;
        });
      }
    },

    // 새 프로젝트 생성
    createProject: async (name: string, description?: string) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const { projectStorage } = await createDefaultStorage();

        const newProject: Project = {
          schemaVersion: 1,
          id: generateProjectId(),
          name,
          version: "1.0.0",
          screens: [
            {
              id: generateScreenId(),
              name: "메인 화면",
              order: 1,
              viewport: "desktop",
              background: "#ffffff",
              content: {
                id: generateNodeId(),
                type: "Container",
                props: {
                  padding: "lg",
                  className: "min-h-screen bg-background",
                },
                children: [
                  {
                    id: generateNodeId(),
                    type: "Heading",
                    props: {
                      level: 1,
                      text: "환영합니다!",
                      className: "text-center mb-4",
                    },
                    children: [],
                  },
                  {
                    id: generateNodeId(),
                    type: "Text",
                    props: {
                      text: "이곳에 컴포넌트를 드래그 앤 드롭하여 화면을 구성하세요.",
                      className: "text-center text-muted-foreground mb-6",
                    },
                    children: [],
                  },
                  {
                    id: generateNodeId(),
                    type: "Button",
                    props: {
                      text: "시작하기",
                      variant: "default",
                      size: "lg",
                      className: "mx-auto block",
                    },
                    children: [],
                  },
                ],
              },
            },
          ],
          collaborators: [],
          settings: {
            designLibrary: "shadcn",
            theme: "default",
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await projectStorage.saveProject(newProject);

        // 업데이트된 프로젝트 목록 다시 로드
        await get().loadProjects();
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : "프로젝트 생성에 실패했습니다.";
          state.isLoading = false;
        });
      }
    },

    // 프로젝트 업데이트
    updateProject: async (id: string, updates: Partial<Project>) => {
      set((state) => {
        state.error = null;
      });

      try {
        const { projectStorage } = await createDefaultStorage();
        const existingProject = await projectStorage.getProject(id);

        if (!existingProject) {
          throw new Error("프로젝트를 찾을 수 없습니다.");
        }

        const updatedProject = {
          ...existingProject,
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        await projectStorage.saveProject(updatedProject);

        // 로컬 상태 업데이트
        set((state) => {
          const index = state.projects.findIndex((p) => p.id === id);
          if (index !== -1) {
            state.projects[index] = updatedProject;
          }
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : "프로젝트 업데이트에 실패했습니다.";
        });
      }
    },

    // 프로젝트 삭제
    deleteProject: async (id: string) => {
      set((state) => {
        state.error = null;
      });

      try {
        const { projectStorage } = await createDefaultStorage();
        await projectStorage.deleteProject(id);

        // 로컬 상태에서 제거
        set((state) => {
          state.projects = state.projects.filter((p) => p.id !== id);
        });
      } catch (error) {
        set((state) => {
          state.error =
            error instanceof Error
              ? error.message
              : "프로젝트 삭제에 실패했습니다.";
        });
      }
    },

    // 에러 초기화
    clearError: () => {
      set((state) => {
        state.error = null;
      });
    },
  })),
);
