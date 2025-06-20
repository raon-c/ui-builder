"use client";

// AIDEV-NOTE: 드래그 가능한 컴포넌트 팔레트 아이템
// @dnd-kit을 사용하여 컴포넌트를 캔버스로 드래그할 수 있게 함

import { useDraggable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import type { BuilderComponentType } from "@/types/component";

interface DraggableComponentProps {
  componentType: BuilderComponentType;
  name: string;
  icon: string;
  category: string;
}

export function DraggableComponent({
  componentType,
  name,
  icon,
  category,
}: DraggableComponentProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${componentType}`,
    data: {
      type: "component",
      componentType,
      category,
    },
  });

  return (
    <Button
      ref={setNodeRef}
      variant="outline"
      className={`p-2 h-auto cursor-grab active:cursor-grabbing transition-all ${
        isDragging
          ? "opacity-50 scale-95 shadow-lg"
          : "hover:shadow-md hover:scale-105"
      }`}
      {...listeners}
      {...attributes}
    >
      <div className="text-center">
        <div className="text-lg mb-1">{icon}</div>
        <div className="text-xs font-medium">{name}</div>
      </div>
    </Button>
  );
} 