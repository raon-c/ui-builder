"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useProjectStore } from "@/store/projectStore";
import type { Project } from "@/types/project";

/**
 * 빌더 메인 페이지
 * 4-패널 레이아웃: 좌측(컴포넌트 팔레트) + 중앙(캔버스) + 우측(구조/속성)
 */
export default function BuilderPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const { projects, loadProjects, isLoading } = useProjectStore();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);

  // 프로젝트 로드
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // 현재 프로젝트 찾기
  useEffect(() => {
    if (projects.length > 0 && projectId) {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        setCurrentProject(project);
        // 첫 번째 화면을 기본 선택
        if (project.screens.length > 0) {
          setSelectedScreenId(project.screens[0].id);
        }
      }
    }
  }, [projects, projectId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg font-medium">프로젝트 로딩 중...</div>
          <div className="text-sm text-muted-foreground mt-2">
            잠시만 기다려주세요.
          </div>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg font-medium">프로젝트를 찾을 수 없습니다</div>
          <div className="text-sm text-muted-foreground mt-2">
            프로젝트 ID: {projectId}
          </div>
          <Button className="mt-4" onClick={() => window.history.back()}>
            이전으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const currentScreen = currentProject.screens.find(
    (s) => s.id === selectedScreenId,
  );

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* 상단 헤더 */}
      <header className="h-14 border-b bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
          >
            ← 프로젝트 목록
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="font-semibold text-lg">{currentProject.name}</h1>
            <p className="text-xs text-muted-foreground">
              {currentScreen?.name || "화면 없음"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            미리보기
          </Button>
          <Button size="sm">저장</Button>
        </div>
      </header>

      {/* 메인 빌더 영역 */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* 좌측 패널: 화면 목록 + 컴포넌트 팔레트 */}
          <Panel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full flex flex-col border-r bg-card">
              {/* 화면 목록 */}
              <div className="p-4 border-b">
                <h3 className="font-medium mb-3">화면 목록</h3>
                <div className="space-y-1">
                  {currentProject.screens.map((screen) => (
                    <Button
                      key={screen.id}
                      variant={
                        selectedScreenId === screen.id ? "default" : "ghost"
                      }
                      onClick={() => setSelectedScreenId(screen.id)}
                      className="w-full justify-start px-3 py-2 h-auto text-sm"
                    >
                      {screen.name}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => {
                    // TODO: 화면 추가 기능 구현
                    console.log("화면 추가 기능 구현 예정");
                  }}
                >
                  + 화면 추가
                </Button>
              </div>

              {/* 컴포넌트 팔레트 */}
              <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="font-medium mb-3">컴포넌트</h3>
                <div className="space-y-2">
                  {/* 카테고리별 컴포넌트 목록 */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Layout
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <ComponentPaletteItem name="Container" icon="📦" />
                      <ComponentPaletteItem name="Card" icon="🃏" />
                      <ComponentPaletteItem name="Grid" icon="⚏" />
                      <ComponentPaletteItem name="Flex" icon="↔" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Basic
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <ComponentPaletteItem name="Text" icon="📝" />
                      <ComponentPaletteItem name="Button" icon="🔘" />
                      <ComponentPaletteItem name="Heading" icon="📰" />
                      <ComponentPaletteItem name="Link" icon="🔗" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Form
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <ComponentPaletteItem name="Input" icon="📝" />
                      <ComponentPaletteItem name="Select" icon="📋" />
                      <ComponentPaletteItem name="Checkbox" icon="☑" />
                      <ComponentPaletteItem name="Switch" icon="🔄" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-border hover:bg-border/80 transition-colors" />

          {/* 중앙 패널: 캔버스 */}
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full flex flex-col bg-muted/20">
              {/* 캔버스 툴바 */}
              <div className="h-12 border-b bg-card flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">캔버스</span>
                  <Separator orientation="vertical" className="h-4" />
                  <Button variant="ghost" size="sm">
                    100%
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    💻
                  </Button>
                  <Button variant="ghost" size="sm">
                    📱
                  </Button>
                  <Button variant="ghost" size="sm">
                    🖥
                  </Button>
                </div>
              </div>

              {/* 캔버스 영역 */}
              <div className="flex-1 p-8 overflow-auto">
                <div className="max-w-4xl mx-auto">
                  <Card className="min-h-[600px] bg-white shadow-lg">
                    <div className="p-8">
                      {currentScreen ? (
                        <CanvasRenderer screen={currentScreen} />
                      ) : (
                        <div className="text-center text-muted-foreground">
                          <div className="text-lg font-medium mb-2">
                            화면을 선택하세요
                          </div>
                          <div className="text-sm">
                            좌측 패널에서 편집할 화면을 선택해주세요.
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-border hover:bg-border/80 transition-colors" />

          {/* 우측 패널: 구조 트리 + 속성 편집기 */}
          <Panel defaultSize={30} minSize={20} maxSize={40}>
            <div className="h-full flex flex-col border-l bg-card">
              {/* 탭 헤더 */}
              <div className="h-12 border-b flex">
                <Button
                  variant="ghost"
                  className="flex-1 px-4 py-3 text-sm font-medium bg-primary text-primary-foreground rounded-none"
                >
                  구조
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1 px-4 py-3 text-sm font-medium hover:bg-muted rounded-none"
                >
                  속성
                </Button>
              </div>

              {/* 구조 트리 */}
              <div className="flex-1 p-4 overflow-y-auto">
                <h3 className="font-medium mb-3">화면 구조</h3>
                {currentScreen ? (
                  <StructureTree node={currentScreen.content} />
                ) : (
                  <div className="text-sm text-muted-foreground">
                    화면을 선택하세요
                  </div>
                )}
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

/**
 * 컴포넌트 팔레트 아이템
 */
function ComponentPaletteItem({ name, icon }: { name: string; icon: string }) {
  return (
    <Button
      variant="outline"
      className="p-2 h-auto cursor-grab active:cursor-grabbing"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("component-type", name);
      }}
    >
      <div className="text-center">
        <div className="text-lg mb-1">{icon}</div>
        <div className="text-xs font-medium">{name}</div>
      </div>
    </Button>
  );
}

/**
 * 캔버스 렌더러 (임시 구현)
 */
function CanvasRenderer({ screen }: { screen: any }) {
  return (
    <div className="space-y-4">
      <div className="text-center text-muted-foreground">
        <div className="text-lg font-medium mb-2">{screen.name}</div>
        <div className="text-sm">캔버스 렌더링 엔진 구현 예정</div>
        <div className="mt-4 p-4 border-2 border-dashed rounded-lg">
          <div className="text-sm">
            드래그 앤 드롭으로 컴포넌트를 추가하세요
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 구조 트리 (임시 구현)
 */
function StructureTree({ node }: { node: any }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium p-2 bg-muted rounded">
        📦 {node.type || "Root"}
      </div>
      {node.children && node.children.length > 0 && (
        <div className="ml-4 space-y-1">
          {node.children.map((child: any, index: number) => (
            <StructureTree key={child.id || index} node={child} />
          ))}
        </div>
      )}
      {(!node.children || node.children.length === 0) && (
        <div className="ml-4 text-xs text-muted-foreground">자식 요소 없음</div>
      )}
    </div>
  );
} 