"use client";

// AIDEV-NOTE: 카테고리 필터 - 컴포넌트 카테고리별 탭 필터링
// 카테고리별 컴포넌트 수 표시 및 활성 상태 관리

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ComponentCategory } from "@/types/component";

interface CategoryFilterProps {
  categories: ComponentCategory[];
  selectedCategory: ComponentCategory | "all";
  categoryCounts: Record<ComponentCategory | "all", number>;
  onCategoryChange: (category: ComponentCategory | "all") => void;
}

/**
 * 컴포넌트 카테고리 필터 탭
 */
export function CategoryFilter({
  categories,
  selectedCategory,
  categoryCounts,
  onCategoryChange,
}: CategoryFilterProps) {
  // 전체 탭 + 카테고리 탭들
  const allTabs: Array<{ key: ComponentCategory | "all"; label: string }> = [
    { key: "all", label: "전체" },
    { key: "Basic", label: "기본" },
    { key: "Form", label: "폼" },
    { key: "DataDisplay", label: "데이터 표시" },
    { key: "Layout", label: "레이아웃" },
    { key: "Feedback", label: "피드백" },
  ];

  // 실제 컴포넌트가 있는 탭만 표시
  const visibleTabs = allTabs.filter(
    (tab) =>
      tab.key === "all" ||
      (categories.includes(tab.key as ComponentCategory) &&
        categoryCounts[tab.key] > 0),
  );

  return (
    <div className="flex flex-wrap gap-2">
      {visibleTabs.map((tab) => {
        const isSelected = selectedCategory === tab.key;
        const count = categoryCounts[tab.key] || 0;

        return (
          <Button
            key={tab.key}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-2"
            onClick={() => onCategoryChange(tab.key)}
          >
            <span>{tab.label}</span>
            <Badge
              variant={isSelected ? "secondary" : "outline"}
              className="text-xs"
            >
              {count}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
}
