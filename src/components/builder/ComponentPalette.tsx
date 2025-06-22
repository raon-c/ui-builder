"use client";

// AIDEV-NOTE: 동적 컴포넌트 팔레트 - 선택된 라이브러리에 따라 컴포넌트 표시
// 다중 라이브러리 시스템과 통합

import { useEffect, useState } from "react";
import { DraggableComponent } from "@/components/builder/DraggableComponent";
import { Skeleton } from "@/components/ui/skeleton";
import { useNamespaceFilter } from "@/hooks/useMultiLibrary";
import { useBuilderStore } from "@/store/builderStore";
import type { BuilderComponentType, ComponentWrapper } from "@/types/component";
import type { LibraryNamespace } from "@/types/multi-library";

interface ComponentPaletteProps {
  className?: string;
}

export function ComponentPalette({ className }: ComponentPaletteProps) {
  const activeLibrary = useBuilderStore((state) => state.activeLibrary);
  const [groupedComponents, setGroupedComponents] = useState<Record<string, ComponentWrapper[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // 선택된 라이브러리의 컴포넌트만 필터링
  const { components } = useNamespaceFilter(activeLibrary === "all" ? {} : { include: [activeLibrary] });

  useEffect(() => {
    setIsLoading(true);

    // 카테고리별로 컴포넌트 그룹화
    const grouped = components.reduce(
      (acc, component) => {
        const category = component.metadata.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(component);
        return acc;
      },
      {} as Record<string, ComponentWrapper[]>,
    );

    setGroupedComponents(grouped);
    setIsLoading(false);
  }, [components]);

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {["Layout", "Basic", "Form"].map((category) => (
          <div key={category}>
            <Skeleton className="h-4 w-20 mb-2" />
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (components.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-sm text-muted-foreground">선택된 라이브러리에 사용 가능한 컴포넌트가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {Object.entries(groupedComponents).map(([category, categoryComponents]) => (
        <div key={category}>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
          <div className="grid grid-cols-2 gap-2">
            {categoryComponents.map((component) => (
              <DraggableComponent
                key={`${component.namespace}-${component.type}`}
                componentType={component.type}
                name={component.metadata.displayName}
                icon={component.metadata.icon}
                category={category}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
