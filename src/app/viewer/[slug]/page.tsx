"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { PreviewRenderer } from "@/components/builder/PreviewRenderer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProjectStore } from "@/store/projectStore";
import type { Project } from "@/types/project";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ViewerPage({ params }: Props) {
  const { projects, loadProjects, isLoading } = useProjectStore();
  const [project, setProject] = useState<Project | null>(null);
  const [screenId, setScreenId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    loadProjects();
    // params가 Promise이므로 await 처리
    params.then((p) => setSlug(p.slug));
  }, [loadProjects, params]);

  useEffect(() => {
    if (isLoading || projects.length === 0 || !slug) return;

    const found = projects.find((p) => p.settings.shareSlug === slug);
    if (!found) {
      notFound();
      return;
    }

    setProject(found);
    if (found.screens.length > 0) {
      setScreenId(found.screens[0].id);
    }
  }, [projects, slug, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>로딩 중...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>프로젝트를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const currentScreen = project.screens.find((s) => s.id === screenId);

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b bg-card flex items-center justify-between px-4">
        <h1 className="font-semibold text-lg">{project.name}</h1>
        {project.screens.length > 1 && (
          <div className="flex gap-2">
            {project.screens.map((screen) => (
              <Button
                key={screen.id}
                variant={screen.id === screenId ? "default" : "outline"}
                size="sm"
                onClick={() => setScreenId(screen.id)}
              >
                {screen.name}
              </Button>
            ))}
          </div>
        )}
      </header>

      <div className="container mx-auto py-8">
        <Card className="max-w-6xl mx-auto">
          <div className="p-8">
            {currentScreen ? (
              <PreviewRenderer node={currentScreen.content} isRoot={true} />
            ) : (
              <div className="text-center py-16">화면이 없습니다.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 