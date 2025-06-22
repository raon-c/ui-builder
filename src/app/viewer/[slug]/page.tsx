"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { PreviewRenderer } from "@/components/builder/PreviewRenderer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProjectStore } from "@/store/projectStore";
import type { Project } from "@/types/project";

interface ViewerPageProps {
  params: {
    slug: string;
  };
}

type ViewerError = "expired" | "version-mismatch" | null;

export default function ViewerPage({ params }: ViewerPageProps) {
  const { projects, loadProjects, isLoading } = useProjectStore();
  const [project, setProject] = useState<Project | null>(null);
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [error, setError] = useState<ViewerError>(null);

  // 프로젝트 로드
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // shareSlug로 프로젝트 찾기 및 유효성 검사
  useEffect(() => {
    if (!isLoading && projects.length > 0) {
      const foundProject = projects.find(
        (p) => p.settings.shareSlug === params.slug,
      );

      if (foundProject) {
        // 만료 시간 체크
          const expiryDate = new Date(foundProject.settings.shareExpiresAt);
          if (expiryDate < new Date()) {
            setError("expired");
            return;
          }
        }

        if (
          foundProject.settings.shareVersion &&
          foundProject.settings.shareVersion !== foundProject.version
        ) {
          // 버전 체크
          setError("version-mismatch");
          return;
        }

        setProject(foundProject);
        if (foundProject.screens.length > 0) {
          setSelectedScreenId(foundProject.screens[0].id);
        }
      } else {
        // 프로젝트를 찾을 수 없는 경우
        notFound();
      }
    }
  }, [projects, params.slug, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg font-medium">로딩 중...</div>
          <div className="text-sm text-muted-foreground mt-2">
            잠시만 기다려주세요.
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 표시
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md w-full mx-4 p-8">
          <div className="text-center">
            {error === "expired" ? (
              <>
                <div className="text-6xl mb-4">⏰</div>
                <h2 className="text-2xl font-bold mb-2">
                  링크가 만료되었습니다
                </h2>
                <p className="text-muted-foreground mb-6">
                  이 공유 링크는 만료되어 더 이상 사용할 수 없습니다. 프로젝트
                  소유자에게 새로운 링크를 요청해주세요.
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🔄</div>
                <h2 className="text-2xl font-bold mb-2">
                  프로젝트가 업데이트되었습니다
                </h2>
                <p className="text-muted-foreground mb-6">
                  이 링크가 생성된 이후 프로젝트가 수정되었습니다. 최신 버전을
                  보려면 프로젝트 소유자에게 새로운 링크를 요청해주세요.
                </p>
              </>
            )}
            <Button onClick={() => (window.location.href = "/")}>
              홈으로 이동
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!project) {
    return null; // notFound()가 처리함
  }

  const currentScreen = project.screens.find((s) => s.id === selectedScreenId);

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="h-14 border-b bg-card flex items-center justify-between px-4">
        <div>
          <h1 className="font-semibold text-lg">{project.name}</h1>
          <p className="text-xs text-muted-foreground">
            읽기 전용 모드
            {project.settings.shareVersion &&
              ` • 버전 ${project.settings.shareVersion}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {project.screens.length > 1 && (
            <div className="flex items-center gap-1">
              {project.screens.map((screen) => (
                <Button
                  key={screen.id}
                  variant={
                    screen.id === selectedScreenId ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedScreenId(screen.id)}
                >
                  {screen.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* 콘텐츠 영역 */}
      <div className="container mx-auto py-8">
        <Card className="max-w-6xl mx-auto bg-white shadow-lg">
          <div className="p-8">
            {currentScreen ? (
              <PreviewRenderer node={currentScreen.content} isRoot={true} />
            ) : (
              <div className="text-center text-muted-foreground py-16">
                <div className="text-lg font-medium mb-2">화면이 없습니다</div>
                <div className="text-sm">
                  이 프로젝트에는 아직 화면이 추가되지 않았습니다.
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 푸터 */}
      <footer className="mt-16 py-8 border-t bg-muted/20">
        <div className="container mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            이 페이지는 읽기 전용입니다. 편집 권한이 필요하신 경우 프로젝트
            소유자에게 문의하세요.
          </p>
          {project.settings.shareExpiresAt && (
            <p className="text-xs text-muted-foreground mt-1">
              만료일:{" "}
              {new Date(project.settings.shareExpiresAt).toLocaleDateString(
                "ko-KR",
              )}
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
