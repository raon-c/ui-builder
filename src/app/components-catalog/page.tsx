"use client";

// AIDEV-NOTE: 컴포넌트 카탈로그 페이지 - 독립적인 카탈로그 탐색 페이지
// 빌더와 분리된 컴포넌트 탐색 및 미리보기 환경

import { ArrowLeft, Home, Layers } from "lucide-react";
import Link from "next/link";
import { ComponentCatalog } from "@/components/catalog/ComponentCatalog";
import { Button } from "@/components/ui/button";
import type { ComponentWrapper } from "@/types/component";

export default function ComponentCatalogPage() {
  const handleComponentSelect = (component: ComponentWrapper) => {
    console.log("🎯 Selected component:", component.type);
    // TODO: 향후 빌더로 이동하거나 다른 액션 처리
  };

  const handleComponentPreview = (component: ComponentWrapper) => {
    console.log("👀 Preview component:", component.type);
    // TODO: 향후 미리보기 모달이나 상세 페이지 표시
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 네비게이션 헤더 */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  홈으로
                </Button>
              </Link>

              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold">UI Builder</h1>
              </div>
            </div>

            <nav className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="h-4 w-4" />홈
                </Button>
              </Link>

              <Link href="/projects">
                <Button variant="ghost" size="sm">
                  프로젝트
                </Button>
              </Link>

              <Button variant="outline" size="sm" disabled>
                컴포넌트 카탈로그
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="container mx-auto px-4 py-8">
        <ComponentCatalog
          onComponentSelect={handleComponentSelect}
          onComponentPreview={handleComponentPreview}
        />
      </main>

      {/* 푸터 */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="h-4 w-4" />
              <span>UI Builder - 기획자를 위한 노코드 빌더</span>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Sprint 2 - 컴포넌트 시스템</span>
              <span>•</span>
              <span>shadcn/ui 기반</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
