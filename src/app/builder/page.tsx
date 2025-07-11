"use client";

import {
  closestCenter,
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  defaultDropAnimationSideEffects,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { MuiAdapter } from "@/adapters/mui";
import { shadcnAdapter } from "@/adapters/shadcn";
import { DraggableComponent } from "@/components/builder/DraggableComponent";
import { DroppableCanvasNode } from "@/components/builder/DroppableCanvasNode";
import { ImportExportManager } from "@/components/builder/ImportExportManager";
import { LibrarySelector } from "@/components/builder/LibrarySelector";
import { PreviewModal } from "@/components/builder/PreviewModal";
import { PropertyEditor, PropertyEditorEmpty } from "@/components/builder/PropertyEditor";
import { ScreenManager } from "@/components/builder/ScreenManager";
import { ShareModal } from "@/components/builder/ShareModal";
import { MultiLibraryErrorBoundary } from "@/components/error/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  useAccessibilityEnhancements,
  useComponentPaletteNavigation,
  useGlobalNavigationShortcuts,
  useKeyboardNavigation,
  usePropertiesNavigation,
} from "@/hooks/useKeyboardNavigation";
import { useMultiLibrary } from "@/hooks/useMultiLibrary";
import { useBuilderStore } from "@/store/builderStore";
import { useProjectStore } from "@/store/projectStore";
import type { BuilderComponentType } from "@/types/component";
import type { Project } from "@/types/project";

// 컴포넌트 팔레트 데이터
const COMPONENT_PALETTE = [
  // Layout
  {
    category: "Layout",
    componentType: "Container" as BuilderComponentType,
    name: "Container",
    icon: "📦",
  },
  {
    category: "Layout",
    componentType: "Card" as BuilderComponentType,
    name: "Card",
    icon: "🃏",
  },
  {
    category: "Layout",
    componentType: "Grid" as BuilderComponentType,
    name: "Grid",
    icon: "⚏",
  },
  {
    category: "Layout",
    componentType: "Flex" as BuilderComponentType,
    name: "Flex",
    icon: "↔",
  },

  // Basic
  {
    category: "Basic",
    componentType: "Text" as BuilderComponentType,
    name: "Text",
    icon: "📝",
  },
  {
    category: "Basic",
    componentType: "Heading" as BuilderComponentType,
    name: "Heading",
    icon: "📰",
  },
  {
    category: "Basic",
    componentType: "Button" as BuilderComponentType,
    name: "Button",
    icon: "🔘",
  },
  {
    category: "Basic",
    componentType: "Link" as BuilderComponentType,
    name: "Link",
    icon: "🔗",
  },

  // Form
  {
    category: "Form",
    componentType: "Input" as BuilderComponentType,
    name: "Input",
    icon: "📝",
  },
  {
    category: "Form",
    componentType: "Select" as BuilderComponentType,
    name: "Select",
    icon: "📋",
  },
  {
    category: "Form",
    componentType: "Checkbox" as BuilderComponentType,
    name: "Checkbox",
    icon: "☑",
  },
  {
    category: "Form",
    componentType: "Switch" as BuilderComponentType,
    name: "Switch",
    icon: "🔄",
  },
];

/**
 * 빌더 메인 컴포넌트 (Suspense 내부)
 * 4-패널 레이아웃 + 드래그 앤 드롭 기능
 */
function BuilderPageContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id");

  const { projects, loadProjects, isLoading } = useProjectStore();
  const { registerAdapter } = useMultiLibrary();
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"structure" | "properties">("structure");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const {
    currentScreen,
    setCurrentScreen,
    selectedNodeId,
    activeLibrary,
    setActiveLibrary,
    findNode,
    addNode,
    moveNode,
    reorderNodes,
    setDraggedComponentType,
    setDragOverNode,
  } = useBuilderStore();

  // 키보드 내비게이션 Hook들
  const { focusState } = useKeyboardNavigation();
  const { liveRegionProps } = useAccessibilityEnhancements();

  // 전역 내비게이션 단축키 등록
  useGlobalNavigationShortcuts();

  // 드래그 앤 드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 프로젝트 로드
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // 기본 어댑터 등록
  useEffect(() => {
    const initializeAdapters = async () => {
      try {
        // shadcn 어댑터 등록 (임시 타입 단언)
        await registerAdapter("shadcn", shadcnAdapter as any);

        // mui 어댑터 등록
        const muiAdapterInstance = new MuiAdapter();
        await registerAdapter("mui", muiAdapterInstance);

        console.log("기본 어댑터 등록 완료");
      } catch (error) {
        console.error("어댑터 등록 실패:", error);
      }
    };

    initializeAdapters();
  }, [registerAdapter]);

  // 현재 프로젝트 찾기
  useEffect(() => {
    if (projects.length > 0 && projectId) {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        setCurrentProject(project);
        if (project.screens.length > 0) {
          setSelectedScreenId(project.screens[0].id);
        }
      }
    }
  }, [projects, projectId]);

  // 현재 화면이 변경되면 빌더 스토어에 반영
  useEffect(() => {
    if (currentProject && selectedScreenId) {
      const screen = currentProject.screens.find((s) => s.id === selectedScreenId);
      if (screen) {
        setCurrentScreen(screen);
      }
    }
  }, [currentProject, selectedScreenId, setCurrentScreen]);

  // 노드 선택 시 속성 탭으로 자동 전환
  useEffect(() => {
    if (selectedNodeId) {
      setActiveTab("properties");
    }
  }, [selectedNodeId]);

  // 드래그 시작
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    const data = active.data.current;
    if (data?.type === "component") {
      setDraggedComponentType(data.componentType);
    }
  };

  // 드래그 오버
  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;

    if (!over) {
      setDragOverNode(null);
      return;
    }

    if (over.data.current?.type === "canvas-node") {
      setDragOverNode(over.data.current.nodeId);
    }
  };

  // 드래그 종료
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setDraggedComponentType(null);
    setDragOverNode(null);

    if (!over || !currentScreen) {
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type === "component" && overData?.type === "canvas-node") {
      // 컴포넌트 팔레트에서 캔버스로 드래그
      addNode(overData.nodeId, activeData.componentType);
    }

    // 캔버스 내에서 노드 재배치
    else if (activeData?.type === "canvas-node" && overData?.type === "canvas-node") {
      const activeNodeId = activeData.nodeId;
      const overNodeId = overData.nodeId;

      if (activeNodeId !== overNodeId) {
        moveNode(activeNodeId, overNodeId, 0);
      }
    }
  };

  if (!projectId) {
    // 로딩 및 에러 상태 처리
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg font-medium">프로젝트 ID가 필요합니다</div>
          <div className="text-sm text-muted-foreground mt-2">URL에 ?id=프로젝트ID 파라미터를 추가해주세요.</div>
          <Button
            className="mt-4"
            onClick={() => {
              window.location.href = "/projects";
            }}
          >
            프로젝트 목록으로 이동
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg font-medium">프로젝트 로딩 중...</div>
          <div className="text-sm text-muted-foreground mt-2">잠시만 기다려주세요.</div>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg font-medium">프로젝트를 찾을 수 없습니다</div>
          <div className="text-sm text-muted-foreground mt-2">프로젝트 ID: {projectId}</div>
          <Button
            className="mt-4"
            onClick={() => {
              window.location.href = "/projects";
            }}
          >
            프로젝트 목록으로 이동
          </Button>
        </div>
      </div>
    );
  }

  const currentScreenData = currentProject.screens.find((s) => s.id === selectedScreenId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex flex-col bg-background">
        {/* 접근성을 위한 ARIA live region */}
        <div {...liveRegionProps} />

        {/* 상단 헤더 */}
        <header
          className="h-14 border-b bg-card flex items-center justify-between px-4"
          data-toolbar="true"
          tabIndex={focusState.currentArea === "toolbar" ? 0 : -1}
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                window.location.href = "/projects";
              }}
            >
              ← 프로젝트 목록
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="font-semibold text-lg">{currentProject.name}</h1>
              <p className="text-xs text-muted-foreground">{currentScreenData?.name || "화면 없음"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ImportExportManager project={currentProject} />
            <Button variant="outline" size="sm" onClick={() => setIsShareOpen(true)}>
              공유
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)}>
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
                <ScreenManager
                  project={currentProject}
                  selectedScreenId={selectedScreenId}
                  onScreenSelect={setSelectedScreenId}
                />

                {/* 컴포넌트 팔레트 */}
                <div
                  className="flex-1 p-4 overflow-y-auto"
                  data-component-palette="true"
                  tabIndex={focusState.currentArea === "component-palette" ? 0 : -1}
                >
                  <h3 className="font-medium mb-3">컴포넌트</h3>

                  {/* 라이브러리 선택기 */}
                  <LibrarySelector
                    className="mb-4"
                    onLibraryChange={(library) => {
                      setActiveLibrary(library);
                      console.log("라이브러리 변경됨:", library);
                    }}
                  />

                  <div className="space-y-4">
                    {["Layout", "Basic", "Form"].map((category) => (
                      <div key={category}>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {COMPONENT_PALETTE.filter((comp) => comp.category === category).map((comp) => (
                            <DraggableComponent
                              key={comp.componentType}
                              componentType={comp.componentType}
                              name={comp.name}
                              icon={comp.icon}
                              category={comp.category}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
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
                    <Card
                      className="min-h-[600px] bg-white shadow-lg"
                      data-canvas="true"
                      tabIndex={focusState.currentArea === "canvas" ? 0 : -1}
                    >
                      <div className="p-8">
                        {currentScreen ? (
                          <SortableContext items={[currentScreen.content.id]} strategy={verticalListSortingStrategy}>
                            <DroppableCanvasNode node={currentScreen.content} isRoot={true} />
                          </SortableContext>
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <div className="text-lg font-medium mb-2">화면을 선택하세요</div>
                            <div className="text-sm">좌측 패널에서 편집할 화면을 선택해주세요.</div>
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
                    onClick={() => setActiveTab("structure")}
                    className={`flex-1 px-4 py-3 text-sm font-medium rounded-none ${
                      activeTab === "structure" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    구조
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab("properties")}
                    className={`flex-1 px-4 py-3 text-sm font-medium rounded-none ${
                      activeTab === "properties" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                  >
                    속성
                  </Button>
                </div>

                {/* 탭 콘텐츠 */}
                <div className="flex-1 overflow-y-auto">
                  {activeTab === "structure" ? (
                    <div
                      className="p-4"
                      data-structure-tree="true"
                      tabIndex={focusState.currentArea === "structure-tree" ? 0 : -1}
                    >
                      <h3 className="font-medium mb-3">화면 구조</h3>
                      {currentScreen ? (
                        <StructureTree node={currentScreen.content} />
                      ) : (
                        <div className="text-sm text-muted-foreground">화면을 선택하세요</div>
                      )}
                    </div>
                  ) : (
                    <div
                      className="p-4"
                      data-properties="true"
                      tabIndex={focusState.currentArea === "properties" ? 0 : -1}
                    >
                      {selectedNodeId && currentScreen ? (
                        (() => {
                          const selectedNode = findNode(selectedNodeId);
                          return selectedNode ? <PropertyEditor node={selectedNode} /> : <PropertyEditorEmpty />;
                        })()
                      ) : (
                        <PropertyEditorEmpty />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>

        {/* 드래그 오버레이 */}
        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: "0.5",
                },
              },
            }),
          }}
        >
          {activeId
            ? (() => {
                // 팔레트 아이템인지 확인
                if (activeId.startsWith("palette-")) {
                  const componentType = activeId.replace("palette-", "") as BuilderComponentType;
                  const paletteItem = COMPONENT_PALETTE.find((c) => c.componentType === componentType);

                  if (paletteItem) {
                    return (
                      <div className="flex items-center p-3 bg-white rounded-lg shadow-lg border-2 border-blue-500 cursor-grabbing">
                        <div className="text-lg mr-3">{paletteItem.icon}</div>
                        <span className="text-sm font-medium text-gray-700">{paletteItem.name}</span>
                      </div>
                    );
                  }
                }

                // 캔버스 노드인 경우
                const node = findNode(activeId);
                if (node) {
                  return (
                    <div className="bg-white border-2 border-blue-500 rounded-lg p-2 shadow-lg opacity-90">
                      <div className="text-xs text-gray-500 mb-1">📦 {node.type}</div>
                      <div className="text-sm font-medium">이동 중...</div>
                    </div>
                  );
                }

                // 기본 fallback
                return (
                  <div className="bg-white border-2 border-blue-500 rounded-lg p-2 shadow-lg">
                    <div className="text-sm font-medium">드래그 중...</div>
                  </div>
                );
              })()
            : null}
        </DragOverlay>

        {/* 미리보기 모달 */}
        <PreviewModal screen={currentScreen} isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />

        {/* 공유 모달 */}
        <ShareModal project={currentProject} isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
      </div>
    </DndContext>
  );
}

/**
 * 구조 트리 (업데이트된 버전)
 */
function StructureTree({ node }: { node: any }) {
  const { selectedNodeId, setSelectedNode } = useBuilderStore();

  const isSelected = selectedNodeId === node.id;

  return (
    <div className="space-y-1">
      <Button
        variant={isSelected ? "default" : "ghost"}
        size="sm"
        className="w-full justify-start p-2 h-auto text-sm"
        onClick={() => setSelectedNode(isSelected ? null : node.id)}
      >
        <span className="mr-2">📦</span>
        {node.type || "Root"}
      </Button>

      {node.children && node.children.length > 0 && (
        <div className="ml-4 space-y-1">
          {node.children.map((child: any) => (
            <StructureTree key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 빌더 페이지 (Suspense 래퍼 + 에러 경계)
 * AIDEV-NOTE: 성능 & 안정성 - MultiLibraryErrorBoundary로 다중 라이브러리 시스템 에러 처리
 */
export default function BuilderPage() {
  return (
    <MultiLibraryErrorBoundary>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="text-lg font-medium">빌더 로딩 중...</div>
              <div className="text-sm text-muted-foreground mt-2">잠시만 기다려주세요.</div>
            </div>
          </div>
        }
      >
        <BuilderPageContent />
      </Suspense>
    </MultiLibraryErrorBoundary>
  );
}
