"use client";

// AIDEV-NOTE: 메인 컴포넌트 카탈로그 - 검색, 필터링, 카드 그리드 통합
// 사용자가 컴포넌트를 탐색하고 선택할 수 있는 핵심 UI

import { Grid3X3, List, Package, Search } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useComponentCatalog } from "@/hooks/useComponentCatalog";
import type { ComponentWrapper } from "@/types/component";
import { CategoryFilter } from "./CategoryFilter";
import { ComponentCard } from "./ComponentCard";

interface ComponentCatalogProps {
  onComponentSelect?: (component: ComponentWrapper) => void;
  onComponentPreview?: (component: ComponentWrapper) => void;
  className?: string;
}

/**
 * 메인 컴포넌트 카탈로그
 */
export function ComponentCatalog({ onComponentSelect, onComponentPreview, className = "" }: ComponentCatalogProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedComponent, setSelectedComponent] = useState<ComponentWrapper | null>(null);

  const {
    filteredComponents,
    searchQuery,
    selectedCategory,
    isLoading,
    availableCategories,
    categoryCounts,
    setSearchQuery,
    setSelectedCategory,
    getTotalComponentCount,
    getFilteredComponentCount,
  } = useComponentCatalog();

  const handleComponentSelect = (component: ComponentWrapper) => {
    setSelectedComponent(component);
    onComponentSelect?.(component);
  };

  const handleComponentPreview = (component: ComponentWrapper) => {
    onComponentPreview?.(component);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <Package className="h-8 w-8 animate-pulse mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">컴포넌트를 로드하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">컴포넌트 카탈로그</h1>
            <p className="text-muted-foreground">사용 가능한 UI 컴포넌트를 탐색하고 선택하세요</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {getFilteredComponentCount()} / {getTotalComponentCount()} 컴포넌트
            </Badge>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="space-y-4">
          {/* 검색 바 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="컴포넌트 이름이나 설명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 카테고리 필터 */}
          <CategoryFilter
            categories={availableCategories}
            selectedCategory={selectedCategory}
            categoryCounts={categoryCounts}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      </div>

      {/* 컴포넌트 그리드/리스트 */}
      {filteredComponents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-lg mb-2">컴포넌트를 찾을 수 없습니다</CardTitle>
            <CardDescription className="text-center max-w-md">
              {searchQuery || selectedCategory !== "all"
                ? "검색 조건을 변경하거나 필터를 초기화해보세요."
                : "아직 등록된 컴포넌트가 없습니다."}
            </CardDescription>
            {(searchQuery || selectedCategory !== "all") && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                필터 초기화
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-4"
          }
        >
          {filteredComponents.map((component) => (
            <ComponentCard
              key={component.type}
              component={component}
              onSelect={handleComponentSelect}
              onPreview={handleComponentPreview}
              showPreview={viewMode === "grid"}
            />
          ))}
        </div>
      )}

      {/* 선택된 컴포넌트 정보 (옵션) */}
      {selectedComponent && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              선택된 컴포넌트: {selectedComponent.metadata.displayName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">기본 정보</h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt>타입:</dt>
                    <dd className="font-mono">{selectedComponent.type}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>카테고리:</dt>
                    <dd>{selectedComponent.metadata.category}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>자식 요소:</dt>
                    <dd>{selectedComponent.metadata.canHaveChildren ? "가능" : "불가능"}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h4 className="font-medium mb-2">설명</h4>
                <p className="text-sm text-muted-foreground">{selectedComponent.metadata.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
