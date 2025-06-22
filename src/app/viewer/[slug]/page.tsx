"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { PreviewRenderer } from "@/components/builder/PreviewRenderer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProjectStore } from "@/store/projectStore";
import type { Project, Screen } from "@/types/project";

interface ViewerPageProps {
  params: {
    slug: string;
  };
}

export default function ViewerPage({ params }: ViewerPageProps) {
  const { projects, loadProjects, isLoading } = useProjectStore();
  const [project, setProject] = useState<Project | null>(null);
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);

  // 프로젝트 로드
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // shareSlug로 프로젝트 찾기
  useEffect(() => {
    if (!isLoading && projects.length > 0) {
      const foundProject = projects.find(
        (p) => p.settings.shareSlug === params.slug,
      );

      if (foundProject) {
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
          <p className="text-xs text-muted-foreground">읽기 전용 모드</p>
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
        </div>
      </footer>
    </div>
  );
}
