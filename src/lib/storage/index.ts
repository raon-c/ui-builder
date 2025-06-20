"use client";

// AIDEV-NOTE: 스토리지 모듈 통합 인덱스 - 외부에서 사용할 스토리지 API 제공

// 스토리지 타입들 재export
export type {
  ProjectStorage,
  StorageAdapter,
  StorageConfig,
  StorageError,
  StorageEvent,
  StorageEventType,
  StorageUsage,
} from "@/types/storage";

export { DEFAULT_STORAGE_CONFIG, STORAGE_KEYS } from "@/types/storage";

/**
 * 기본 스토리지 인스턴스 생성 헬퍼
 * MVP용 localStorage 기반 스토리지 구성
 */
export async function createDefaultStorage(debug = false) {
  const { LocalStorageAdapter } = await import("./localStorage");
  const { ProjectStorageImpl } = await import("./projectStorage");

  const adapter = new LocalStorageAdapter({ debug });
  const projectStorage = new ProjectStorageImpl(adapter);

  return {
    adapter,
    projectStorage,
  };
}

/**
 * 스토리지 테스트 헬퍼
 * 개발 환경에서 스토리지 기능 검증용
 */
export async function testStorage() {
  const { projectStorage } = await createDefaultStorage(true);

  try {
    // 기본 CRUD 테스트
    console.log("🧪 Storage Test Started");

    const testProject = {
      schemaVersion: 1,
      id: "test-project",
      name: "Test Project",
      version: "1.0.0",
      screens: [],
      settings: {
        designLibrary: "shadcn",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 프로젝트 저장
    await projectStorage.saveProject(testProject);
    console.log("✅ Project saved");

    // 프로젝트 조회
    const retrieved = await projectStorage.getProject("test-project");
    console.log("✅ Project retrieved:", retrieved?.name);

    // 모든 프로젝트 조회
    const all = await projectStorage.getAllProjects();
    console.log("✅ All projects:", all.length);

    // 스토리지 사용량 확인
    const usage = await projectStorage.getStorageUsage();
    console.log("✅ Storage usage:", usage);

    // 프로젝트 삭제
    await projectStorage.deleteProject("test-project");
    console.log("✅ Project deleted");

    console.log("🎉 Storage Test Completed Successfully");
    return true;
  } catch (error) {
    console.error("❌ Storage Test Failed:", error);
    return false;
  }
}
