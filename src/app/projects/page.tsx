"use client";

// AIDEV-NOTE: 프로젝트 대시보드 메인 페이지 - 프로젝트 목록 및 관리
// 프로젝트 카드 그리드, 생성 모달, 빈 상태 UI 포함

import { AlertCircle, FolderOpen, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProjectStore } from "@/store/projectStore";
import type { Project } from "@/types/project";

export default function ProjectsPage() {
  const { projects, isLoading, error, loadProjects, createProject, deleteProject, clearError } = useProjectStore();

  const [deleteConfirm, setDeleteConfirm] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 페이지 로드 시 프로젝트 목록 가져오기
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreateProject = async (name: string, description?: string) => {
    await createProject(name, description);
  };

  const handleDeleteProject = async (project: Project) => {
    setDeleteConfirm(project);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    try {
      await deleteProject(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (error) {
      // 에러는 store에서 처리됨
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenProject = (project: Project) => {
    // 빌더 페이지로 이동 (실제 구현됨)
    window.location.href = `/builder?id=${project.id}`;
  };

  const handleEditProject = (project: Project) => {
    // 프로젝트 이름 변경 기능 (향후 구현 예정)
    alert(`"${project.name}" 프로젝트 편집 기능은 구현 예정입니다.`);
  };

  // 에러 상태
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold">문제가 발생했습니다</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <Button
            onClick={() => {
              clearError();
              loadProjects();
            }}
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">내 프로젝트</h1>
          <p className="text-muted-foreground mt-2">UI 프로토타입을 만들고 관리하세요</p>
        </div>
        <CreateProjectModal onCreateProject={handleCreateProject} isLoading={isLoading} />
      </div>

      {/* 로딩 상태 */}
      {isLoading && projects.length === 0 && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>프로젝트를 불러오는 중...</span>
          </div>
        </div>
      )}

      {/* 빈 상태 */}
      {!isLoading && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
          <div className="text-center space-y-4">
            <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">아직 프로젝트가 없습니다</h2>
              <p className="text-muted-foreground max-w-sm">
                첫 번째 프로젝트를 만들어서 UI 프로토타입 제작을 시작해보세요.
              </p>
            </div>
          </div>
          <CreateProjectModal onCreateProject={handleCreateProject} isLoading={isLoading} />
        </div>
      )}

      {/* 프로젝트 그리드 */}
      {projects.length > 0 && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={handleOpenProject}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
            />
          ))}
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => !isDeleting && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로젝트 삭제</DialogTitle>
            <DialogDescription>
              <strong>"{deleteConfirm?.name}"</strong> 프로젝트를 정말 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={isDeleting}>
              취소
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
