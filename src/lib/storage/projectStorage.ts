"use client";

// AIDEV-NOTE: 프로젝트 CRUD 스토리지 구현 - StorageAdapter 기반
// Project 타입과 연동하여 프로젝트 관리 기능 제공

import { generateProjectId } from "@/lib/nanoid";
import { type Project, projectSchema } from "@/types/project";
import {
  type ProjectStorage,
  STORAGE_KEYS,
  type StorageAdapter,
  StorageError,
  type StorageUsage,
} from "@/types/storage";

/**
 * 프로젝트 스토리지 구현체
 * StorageAdapter를 사용하여 프로젝트 CRUD 기능 제공
 */
export class ProjectStorageImpl implements ProjectStorage {
  constructor(private adapter: StorageAdapter) {}

  /**
   * 모든 프로젝트 조회
   */
  async getAllProjects(): Promise<Project[]> {
    try {
      const projectsData = await this.adapter.getItem<Record<string, Project>>(
        STORAGE_KEYS.PROJECTS,
      );

      if (!projectsData) {
        return [];
      }

      // 프로젝트 배열로 변환하고 updatedAt 기준으로 정렬
      const projects = Object.values(projectsData).sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

      // 각 프로젝트 데이터 검증
      const validProjects: Project[] = [];
      for (const project of projects) {
        try {
          const validProject = projectSchema.parse(project);
          validProjects.push(validProject);
        } catch (error) {
          console.warn(`Invalid project data for ${project.id}:`, error);
        }
      }

      return validProjects;
    } catch (error) {
      throw new StorageError(
        "Failed to get all projects",
        "UNKNOWN",
        error as Error,
      );
    }
  }

  /**
   * 프로젝트 ID로 조회
   */
  async getProject(id: string): Promise<Project | null> {
    try {
      const projectsData = await this.adapter.getItem<Record<string, Project>>(
        STORAGE_KEYS.PROJECTS,
      );

      if (!projectsData || !projectsData[id]) {
        return null;
      }

      const project = projectsData[id];

      // 프로젝트 데이터 검증
      try {
        return projectSchema.parse(project);
      } catch (error) {
        throw new StorageError(
          `Invalid project data for ${id}`,
          "INVALID_DATA",
          error as Error,
        );
      }
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        `Failed to get project ${id}`,
        "UNKNOWN",
        error as Error,
      );
    }
  }

  /**
   * 프로젝트 저장 (생성/수정)
   */
  async saveProject(project: Project): Promise<void> {
    try {
      // 프로젝트 데이터 검증
      const validProject = projectSchema.parse(project);

      // 기존 프로젝트 데이터 조회
      const projectsData =
        (await this.adapter.getItem<Record<string, Project>>(
          STORAGE_KEYS.PROJECTS,
        )) || {};

      // 새 프로젝트인 경우 ID 생성
      if (!validProject.id) {
        validProject.id = generateProjectId();
      }

      // 타임스탬프 업데이트
      const now = new Date().toISOString();
      validProject.updatedAt = now;

      // 새 프로젝트인 경우 createdAt 설정
      if (!projectsData[validProject.id]) {
        validProject.createdAt = now;
      }

      // 프로젝트 저장
      projectsData[validProject.id] = validProject;
      await this.adapter.setItem(STORAGE_KEYS.PROJECTS, projectsData);

      // 최근 프로젝트 ID 업데이트
      await this.setRecentProjectId(validProject.id);
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        `Failed to save project ${project.id || "new"}`,
        "UNKNOWN",
        error as Error,
      );
    }
  }

  /**
   * 프로젝트 삭제
   */
  async deleteProject(id: string): Promise<void> {
    try {
      const projectsData = await this.adapter.getItem<Record<string, Project>>(
        STORAGE_KEYS.PROJECTS,
      );

      if (!projectsData || !projectsData[id]) {
        throw new StorageError(`Project ${id} not found`, "NOT_FOUND");
      }

      // 프로젝트 삭제
      delete projectsData[id];
      await this.adapter.setItem(STORAGE_KEYS.PROJECTS, projectsData);

      // 최근 프로젝트가 삭제된 프로젝트인 경우 초기화
      const recentProjectId = await this.getRecentProjectId();
      if (recentProjectId === id) {
        await this.adapter.removeItem(STORAGE_KEYS.RECENT_PROJECT_ID);
      }
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        `Failed to delete project ${id}`,
        "UNKNOWN",
        error as Error,
      );
    }
  }

  /**
   * 최근 프로젝트 ID 조회
   */
  async getRecentProjectId(): Promise<string | null> {
    try {
      return await this.adapter.getItem<string>(STORAGE_KEYS.RECENT_PROJECT_ID);
    } catch (error) {
      console.warn("Failed to get recent project ID:", error);
      return null;
    }
  }

  /**
   * 최근 프로젝트 ID 저장
   */
  async setRecentProjectId(id: string): Promise<void> {
    try {
      await this.adapter.setItem(STORAGE_KEYS.RECENT_PROJECT_ID, id);
    } catch (error) {
      console.warn("Failed to set recent project ID:", error);
    }
  }

  /**
   * 스토리지 사용량 조회
   */
  async getStorageUsage(): Promise<StorageUsage> {
    try {
      const projects = await this.getAllProjects();
      const projectUsages: StorageUsage["projects"] = [];

      let totalUsed = 0;

      // 각 프로젝트별 사용량 계산
      for (const project of projects) {
        const projectData = JSON.stringify(project);
        const size = new Blob([projectData]).size;

        projectUsages.push({
          id: project.id,
          name: project.name,
          size,
        });

        totalUsed += size;
      }

      // 전체 사용량 계산 (메타데이터 포함)
      const allKeys = await this.adapter.getAllKeys();
      for (const key of allKeys) {
        if (key !== STORAGE_KEYS.PROJECTS) {
          try {
            const data = await this.adapter.getItem(key);
            if (data) {
              totalUsed += new Blob([JSON.stringify(data)]).size;
            }
          } catch {
            // 개별 키 오류는 무시
          }
        }
      }

      // 사용 가능한 공간 계산
      const availableSpace = (await this.adapter.getAvailableSpace?.()) || 0;
      const totalSpace = totalUsed + availableSpace;

      return {
        used: totalUsed,
        total: totalSpace,
        usage: totalSpace > 0 ? totalUsed / totalSpace : 0,
        projects: projectUsages.sort((a, b) => b.size - a.size),
      };
    } catch (error) {
      throw new StorageError(
        "Failed to get storage usage",
        "UNKNOWN",
        error as Error,
      );
    }
  }
}
