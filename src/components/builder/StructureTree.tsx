"use client";

// AIDEV-NOTE: 드래그앤드롭 지원 구조 트리 컴포넌트
// 계층 구조를 시각적으로 표시하면서 노드 간 재배치를 지원

import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, GripVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { isContainerComponent } from "@/lib/utils";
import { useBuilderStore } from "@/store/builderStore";
import type { CanvasNode } from "@/types/project";

interface StructureTreeNodeProps {
  node: CanvasNode;
  depth?: number;
  isRoot?: boolean;
}

function StructureTreeNode({ node, depth = 0, isRoot = false }: StructureTreeNodeProps) {
  const { selectedNodeId, setSelectedNode, removeNode } = useBuilderStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const isSelected = selectedNodeId === node.id;
  const hasChildren = node.children && node.children.length > 0;
  const canHaveChildren = isContainerComponent(node.type);

  // Sortable 훅 (루트 노드는 드래그 불가)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: node.id,
    disabled: isRoot,
    data: {
      type: "structure-node",
      nodeId: node.id,
      canAcceptChildren: canHaveChildren,
    },
  });

  // Droppable 훅 (컨테이너 타입만 드롭 가능)
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `drop-${node.id}`,
    data: {
      type: "structure-node",
      nodeId: node.id,
      canAcceptChildren: canHaveChildren,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSelect = () => {
    setSelectedNode(isSelected ? null : node.id);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNode(node.id);
  };

  // 노드 타입에 따른 아이콘
  const getNodeIcon = () => {
    switch (node.type) {
      case "Container":
        return "📦";
      case "Card":
        return "🃏";
      case "Grid":
        return "⚏";
      case "Flex":
        return "↔";
      case "Modal":
        return "🪟";
      case "Drawer":
        return "📄";
      case "Tabs":
        return "📑";
      case "Heading":
        return "📰";
      case "Text":
        return "📝";
      case "Button":
        return "🔘";
      case "Input":
        return "📝";
      default:
        return "📦";
    }
  };

  // ref 결합 함수
  const setRefs = (element: HTMLElement | null) => {
    setNodeRef(element);
    setDropRef(element);
  };

  return (
    <div
      ref={setRefs}
      style={style}
      className={`
        ${isDragging ? "opacity-50 z-50" : ""}
        ${isOver && canHaveChildren ? "bg-blue-50 border-l-2 border-blue-400" : ""}
      `}
    >
      <button
        type="button"
        className={`
          flex items-center group hover:bg-gray-50 rounded-md px-2 py-1 cursor-pointer w-full text-left
          ${isSelected ? "bg-blue-100 border border-blue-300" : ""}
          ${isDragging ? "rotate-2 scale-95" : ""}
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleSelect}
      >
        {/* 확장/축소 버튼 */}
        {hasChildren && (
          <Button variant="ghost" size="sm" className="h-4 w-4 p-0 mr-1" onClick={handleToggleExpand}>
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        )}

        {/* 들여쓰기 공간 (자식이 없는 경우) */}
        {!hasChildren && <div className="w-5" />}

        {/* 드래그 핸들 */}
        {!isRoot && (
          <div
            {...attributes}
            {...listeners}
            className="flex items-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-3 w-3 text-gray-400 mr-1" />
          </div>
        )}

        {/* 노드 아이콘 */}
        <span className="mr-2 text-sm">{getNodeIcon()}</span>

        {/* 노드 이름 */}
        <span className="flex-1 text-sm font-medium truncate">
          {node.type || "Root"}
          {canHaveChildren && hasChildren && (
            <span className="text-xs text-gray-500 ml-1">({node.children?.length})</span>
          )}
        </span>

        {/* 삭제 버튼 */}
        {!isRoot && isSelected && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </button>

      {/* 자식 노드들 */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children?.map((child) => (
            <StructureTreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

interface StructureTreeProps {
  node: CanvasNode;
}

export function StructureTree({ node }: StructureTreeProps) {
  return (
    <div className="space-y-1">
      <StructureTreeNode node={node} isRoot={true} />
    </div>
  );
}
