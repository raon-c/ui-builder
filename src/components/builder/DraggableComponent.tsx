"use client";

// AIDEV-NOTE: 드래그 가능한 컴포넌트 팔레트 아이템
// @dnd-kit을 사용하여 컴포넌트를 캔버스로 드래그할 수 있게 함
// 제공된 코드의 시각적 피드백 개선사항 적용

import { useDraggable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { useComponentPaletteNavigation } from "@/hooks/useKeyboardNavigation";
import type { BuilderComponentType } from "@/types/component";

interface DraggableComponentProps {
  componentType: BuilderComponentType;
  name: string;
  icon: string;
  category: string;
}

export function DraggableComponent({ componentType, name, icon, category }: DraggableComponentProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${componentType}`,
    data: {
      type: "component",
      componentType,
      category,
    },
  });

  const { isFocused, handleKeyDown, ...navigationProps } = useComponentPaletteNavigation(componentType);

  return (
    <Button
      ref={setNodeRef}
      variant="outline"
      className={`p-2 h-auto cursor-grab active:cursor-grabbing transition-all duration-200 ${
        isDragging ? "opacity-50 scale-95 shadow-lg" : "hover:shadow-md hover:scale-105 hover:bg-gray-50"
      }`}
      onKeyDown={handleKeyDown}
      {...listeners}
      {...attributes}
      {...navigationProps}
    >
      <div className="text-center">
        <div className="text-lg mb-1">{icon}</div>
        <div className="text-xs font-medium text-gray-700">{name}</div>
      </div>
    </Button>
  );
}
