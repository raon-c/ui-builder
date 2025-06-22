"use client";

// AIDEV-NOTE: 드롭 가능한 캔버스 노드 컴포넌트
// @dnd-kit을 사용하여 드래그된 컴포넌트를 받을 수 있고, 자식 노드들의 재배치도 지원

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { isContainerComponent } from "@/lib/utils";
import { useBuilderStore } from "@/store/builderStore";
import type { CanvasNode } from "@/types/project";
import { DropIndicator } from "./DropIndicator";

interface DroppableCanvasNodeProps {
  node: CanvasNode;
  isRoot?: boolean;
  depth?: number;
}

export function DroppableCanvasNode({
  node,
  isRoot = false,
  depth = 0,
}: DroppableCanvasNodeProps) {
  const {
    selectedNodeId,
    setSelectedNode,
    removeNode,
    dragOverNodeId,
    draggedComponentType,
    dropPosition,
  } = useBuilderStore();
  const [isHovered, setIsHovered] = useState(false);

  const isSelected = selectedNodeId === node.id;
  const isDraggedOver = dragOverNodeId === node.id;
  const canAcceptDrop = isContainerComponent(node.type);
  const isInvalidDropTarget =
    isDraggedOver && draggedComponentType && !canAcceptDrop;

  // 드롭 인디케이터 표시 여부
  const shouldShowDropIndicator =
    dropPosition && dropPosition.parentId === node.id;
  const dropIndicatorPosition = shouldShowDropIndicator
    ? dropPosition.position
    : "inside";

  // 드롭 가능한 영역 설정
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `droppable-${node.id}`,
    data: {
      type: "canvas-node",
      nodeId: node.id,
      accepts: ["component", "canvas-node"],
    },
  });

  // 정렬 가능한 아이템 설정
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: node.id,
    disabled: isRoot,
    data: {
      type: "canvas-node",
      nodeId: node.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  } as React.CSSProperties;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(isSelected ? null : node.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNode(node.id);
  };

  // 깊이에 따른 시각적 스타일 (현재는 사용하지 않음)
  const getDepthStyles = () => {
    return "";
  };

  // 노드 렌더링
  const renderNodeContent = () => {
    const baseClasses = "relative";

    switch (node.type) {
      case "Container":
        return (
          <div
            className={`${baseClasses} bg-gray-50 rounded-lg min-h-[100px] border-2 border-dashed border-gray-300 p-4 ${node.props.className || ""}`}
          >
            {node.children.length === 0 ? (
              <div className="text-center text-gray-500 text-sm">
                이곳에 컴포넌트를 놓으세요
              </div>
            ) : (
              <SortableContext
                items={node.children.map((child) => child.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {node.children.map((child) => (
                    <DroppableCanvasNode
                      key={child.id}
                      node={child}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </div>
        );

      case "Card":
        return (
          <div
            className={`${baseClasses} bg-white rounded-lg shadow-sm border p-4 min-h-[80px] ${node.props.className || ""}`}
          >
            {node.children.length === 0 ? (
              <div className="text-center text-gray-400 text-sm">
                카드 내용을 추가하세요
              </div>
            ) : (
              <SortableContext
                items={node.children.map((child) => child.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1">
                  {node.children.map((child) => (
                    <DroppableCanvasNode
                      key={child.id}
                      node={child}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </div>
        );

      case "Grid": {
        const cols = (node.props.cols as number) || 2;
        const gridCols =
          cols === 1
            ? "grid-cols-1"
            : cols === 2
              ? "grid-cols-2"
              : cols === 3
                ? "grid-cols-3"
                : cols === 4
                  ? "grid-cols-4"
                  : cols === 5
                    ? "grid-cols-5"
                    : cols === 6
                      ? "grid-cols-6"
                      : "grid-cols-2";
        return (
          <div
            className={`${baseClasses} grid ${gridCols} gap-4 bg-blue-50/20 rounded-lg border-2 border-dashed border-blue-300 p-4 min-h-[80px] ${node.props.className || ""}`}
          >
            {node.children.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 text-sm">
                그리드 아이템을 추가하세요
              </div>
            ) : (
              <SortableContext
                items={node.children.map((child) => child.id)}
                strategy={verticalListSortingStrategy}
              >
                {node.children.map((child) => (
                  <DroppableCanvasNode
                    key={child.id}
                    node={child}
                    depth={depth + 1}
                  />
                ))}
              </SortableContext>
            )}
          </div>
        );
      }

      case "Flex": {
        const direction = (node.props.direction as string) || "row";
        return (
          <div
            className={`${baseClasses} flex ${direction === "column" ? "flex-col" : "flex-row"} gap-4 bg-purple-50/20 rounded-lg border-2 border-dashed border-purple-300 p-4 min-h-[80px] ${node.props.className || ""}`}
          >
            {node.children.length === 0 ? (
              <div className="text-center text-gray-400 text-sm w-full">
                플렉스 아이템을 추가하세요
              </div>
            ) : (
              <SortableContext
                items={node.children.map((child) => child.id)}
                strategy={verticalListSortingStrategy}
              >
                {node.children.map((child) => (
                  <DroppableCanvasNode
                    key={child.id}
                    node={child}
                    depth={depth + 1}
                  />
                ))}
              </SortableContext>
            )}
          </div>
        );
      }

      case "Button":
        return (
          <Button
            variant={(node.props.variant as any) || "default"}
            size={(node.props.size as any) || "default"}
            className={`w-full ${node.props.className || ""}`}
          >
            {(node.props.text as string) || "버튼"}
          </Button>
        );

      case "Text":
        return (
          <p className={`py-2 px-1 ${node.props.className || ""}`}>
            {(node.props.text as string) || "텍스트를 입력하세요"}
          </p>
        );

      case "Heading": {
        const level = (node.props.level as number) || 2;
        const text = (node.props.text as string) || "제목";
        const className = `font-bold ${node.props.className || ""}`;

        switch (level) {
          case 1:
            return <h1 className={className}>{text}</h1>;
          case 2:
            return <h2 className={className}>{text}</h2>;
          case 3:
            return <h3 className={className}>{text}</h3>;
          case 4:
            return <h4 className={className}>{text}</h4>;
          case 5:
            return <h5 className={className}>{text}</h5>;
          case 6:
            return <h6 className={className}>{text}</h6>;
          default:
            return <h2 className={className}>{text}</h2>;
        }
      }

      case "Input":
        return (
          <input
            type={(node.props.type as string) || "text"}
            placeholder={(node.props.placeholder as string) || "입력하세요"}
            className={`w-full p-2 border border-gray-300 rounded-md ${node.props.className || ""}`}
            disabled
          />
        );

      default:
        return (
          <div
            className={`${baseClasses} p-4 bg-gray-100 rounded ${node.props.className || ""}`}
          >
            <span className="text-sm text-gray-500">{node.type}</span>
          </div>
        );
    }
  };

  const isContainer = isContainerComponent(node.type);

  return (
    <div
      ref={isRoot ? setDropRef : setSortableRef}
      style={isRoot ? undefined : style}
      className={`
        relative my-1 rounded-md
        ${getDepthStyles()}
        ${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""}
        ${!isSelected && isHovered ? "ring-1 ring-gray-300" : ""}
        ${isInvalidDropTarget ? "bg-red-50 border-red-400" : ""}
        ${!isInvalidDropTarget && (isOver || isDraggedOver) ? "bg-green-50/50" : ""}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSelect(e as any);
        }
      }}
      role="button"
      tabIndex={0}
    >
      {/* 드래그 핸들 */}
      {!isRoot && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -left-8 top-1/2 transform -translate-y-1/2 p-1.5 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical size={20} />
        </div>
      )}

      {/* 노드 컨트롤 */}
      {isSelected && !isRoot && (
        <div className="absolute -top-9 right-0 flex items-center gap-1 bg-white border rounded-md shadow-sm p-1">
          <span className="text-xs font-medium text-gray-600 px-2">
            {node.type}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
            onClick={handleDelete}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      )}

      {/* 드롭 인디케이터 */}
      <DropIndicator
        isVisible={shouldShowDropIndicator || false}
        position={dropIndicatorPosition as "top" | "bottom" | "inside"}
      />

      {/* 노드 컨텐츠 */}
      <div ref={setDropRef} className="relative group">
        {renderNodeContent()}
      </div>
    </div>
  );
}
