"use client";

// AIDEV-NOTE: 컴포넌트 카탈로그 관리 훅 - 검색, 필터링, 카테고리 분류
// shadcn 어댑터에서 등록된 컴포넌트들을 가져와서 UI에서 사용할 수 있도록 처리

import { useEffect, useMemo, useState } from "react";
import type { ComponentCategory, ComponentWrapper } from "@/types/component";

/**
 * 컴포넌트 카탈로그 상태 및 로직 관리 훅
 */
export function useComponentCatalog() {
  const [components, setComponents] = useState<ComponentWrapper[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ComponentCategory | "all">("all");
  const [isLoading, setIsLoading] = useState(true);

  // shadcn 어댑터에서 컴포넌트 로드
  useEffect(() => {
    const loadComponents = async () => {
      try {
        setIsLoading(true);

        // 동적으로 shadcn 어댑터 로드
        const { initializeShadcnAdapter } = await import("@/adapters/shadcn");
        const adapter = initializeShadcnAdapter();

        // 등록된 모든 컴포넌트 가져오기
        const allComponents = adapter.registry.getAll();
        setComponents(allComponents);

        console.log(
          "📦 Loaded components:",
          allComponents.map((c) => c.type),
        );
      } catch (error) {
        console.error("Failed to load components:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadComponents();
  }, []);

  // 카테고리별 컴포넌트 분류
  const componentsByCategory = useMemo(() => {
    const categorized: Record<ComponentCategory, ComponentWrapper[]> = {
      Layout: [],
      Basic: [],
      Form: [],
      DataDisplay: [],
      Feedback: [],
    };

    components.forEach((component) => {
      categorized[component.metadata.category].push(component);
    });

    return categorized;
  }, [components]);

  // 검색 및 필터링된 컴포넌트
  const filteredComponents = useMemo(() => {
    let filtered = components;

    // 카테고리 필터링
    if (selectedCategory !== "all") {
      filtered = filtered.filter((component) => component.metadata.category === selectedCategory);
    }

    // 검색 필터링 (이름, 설명에서 검색)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (component) =>
          component.metadata.displayName.toLowerCase().includes(query) ||
          component.metadata.description.toLowerCase().includes(query) ||
          component.type.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [components, selectedCategory, searchQuery]);

  // 사용 가능한 카테고리 목록 (실제 컴포넌트가 있는 카테고리만)
  const availableCategories = useMemo(() => {
    const categories = new Set<ComponentCategory>();
    components.forEach((component) => {
      categories.add(component.metadata.category);
    });
    return Array.from(categories).sort();
  }, [components]);

  // 카테고리별 컴포넌트 수
  const categoryCounts = useMemo(() => {
    const counts: Record<ComponentCategory | "all", number> = {
      all: components.length,
      Layout: 0,
      Basic: 0,
      Form: 0,
      DataDisplay: 0,
      Feedback: 0,
    };

    components.forEach((component) => {
      counts[component.metadata.category]++;
    });

    return counts;
  }, [components]);

  return {
    // 상태
    components,
    filteredComponents,
    componentsByCategory,
    searchQuery,
    selectedCategory,
    isLoading,
    availableCategories,
    categoryCounts,

    // 액션
    setSearchQuery,
    setSelectedCategory,

    // 유틸리티
    getComponentsByCategory: (category: ComponentCategory) => componentsByCategory[category],
    getTotalComponentCount: () => components.length,
    getFilteredComponentCount: () => filteredComponents.length,
  };
}
