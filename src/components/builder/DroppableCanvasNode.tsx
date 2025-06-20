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
import { Eye, EyeOff, Move, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useBuilderStore } from "@/store/builderStore";
import type { CanvasNode } from "@/types/project";

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
  const { selectedNodeId, setSelectedNode, removeNode, dragOverNodeId } =
    useBuilderStore();
  const [isHovered, setIsHovered] = useState(false);

  const isSelected = selectedNodeId === node.id;
  const isDraggedOver = dragOverNodeId === node.id;

  // 드롭 가능한 영역 설정
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `droppable-${node.id}`,
    data: {
      type: "canvas-node",
      nodeId: node.id,
      accepts: ["component", "canvas-node"],
    },
  });

  // 정렬 가능한 아이템 설정 (루트가 아닌 경우)
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
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(isSelected ? null : node.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNode(node.id);
  };

  // 노드 렌더링 함수
  const renderNodeContent = () => {
    switch (node.type) {
      case "Container":
        return (
          <div
            className={`border-2 border-dashed border-gray-300 ${
              node.children.length === 0 ? "min-h-[60px] p-3" : "p-2"
            } ${node.props.className || ""}`}
          >
            <div className="text-xs text-gray-500 mb-1">📦 Container</div>
            {node.children.length === 0 && (
              <div className="text-center text-gray-400 text-xs">
                컴포넌트를 드롭하세요
              </div>
            )}
          </div>
        );

      case "Heading": {
        const level = (node.props.level as number) || 1;
        const headingProps = {
          className: `font-bold ${node.props.className || ""}`,
          children: (node.props.text as string) || "제목",
        };

        switch (level) {
          case 1:
            return <h1 {...headingProps} />;
          case 2:
            return <h2 {...headingProps} />;
          case 3:
            return <h3 {...headingProps} />;
          case 4:
            return <h4 {...headingProps} />;
          case 5:
            return <h5 {...headingProps} />;
          case 6:
            return <h6 {...headingProps} />;
          default:
            return <h2 {...headingProps} />;
        }
      }

      case "Text":
        return (
          <p className={(node.props.className as string) || ""}>
            {(node.props.text as string) || "텍스트"}
          </p>
        );

      case "Button":
        return (
          <Button
            variant={(node.props.variant as any) || "default"}
            size={(node.props.size as any) || "default"}
            className={(node.props.className as string) || ""}
          >
            {(node.props.text as string) || "버튼"}
          </Button>
        );

      case "Card":
        return (
          <div
            className={`border rounded-lg shadow-sm ${
              node.children.length === 0 ? "min-h-[50px] p-3" : "p-2"
            } ${node.props.className || ""}`}
          >
            <div className="text-xs text-gray-500 mb-1">🃏 Card</div>
            {node.children.length === 0 && (
              <div className="text-center text-gray-400 text-xs">
                컴포넌트를 드롭하세요
              </div>
            )}
          </div>
        );

      case "Grid": {
        const cols = (node.props.cols as number) || 2;
        const gap = (node.props.gap as number) || 4;
        return (
          <div
            className={`grid gap-${gap} ${
              cols === 1
                ? "grid-cols-1"
                : cols === 2
                  ? "grid-cols-2"
                  : cols === 3
                    ? "grid-cols-3"
                    : cols === 4
                      ? "grid-cols-4"
                      : "grid-cols-2"
            } border-2 border-dashed border-blue-300 ${
              node.children.length === 0 ? "min-h-[50px] p-3" : "p-2"
            } ${node.props.className || ""}`}
          >
            <div className="text-xs text-gray-500 mb-1 col-span-full">
              ⚏ Grid ({cols}열)
            </div>
            {node.children.length === 0 && (
              <div className="text-center text-gray-400 text-xs col-span-full">
                컴포넌트를 드롭하세요
              </div>
            )}
          </div>
        );
      }

      case "Flex": {
        const direction = (node.props.direction as string) || "row";
        return (
          <div
            className={`flex ${
              direction === "column" ? "flex-col" : "flex-row"
            } gap-2 border-2 border-dashed border-purple-300 ${
              node.children.length === 0 ? "min-h-[50px] p-3" : "p-2"
            } ${node.props.className || ""}`}
          >
            <div className="text-xs text-gray-500 mb-1">
              ↔ Flex ({direction})
            </div>
            {node.children.length === 0 && (
              <div className="text-center text-gray-400 text-xs">
                컴포넌트를 드롭하세요
              </div>
            )}
          </div>
        );
      }

      case "Modal":
        return (
          <div
            className={`border-2 border-dashed border-indigo-300 rounded-lg ${
              node.children.length === 0 ? "min-h-[50px] p-3" : "p-2"
            } ${node.props.className || ""}`}
          >
            <div className="text-xs text-gray-500 mb-1">
              🪟 Modal: {(node.props.title as string) || "모달"}
            </div>
            {node.children.length === 0 && (
              <div className="text-center text-gray-400 text-xs">
                모달 컨텐츠를 드롭하세요
              </div>
            )}
          </div>
        );

      case "Drawer":
        return (
          <div
            className={`border-2 border-dashed border-orange-300 rounded ${
              node.children.length === 0 ? "min-h-[50px] p-3" : "p-2"
            } ${node.props.className || ""}`}
          >
            <div className="text-xs text-gray-500 mb-1">
              📄 Drawer: {(node.props.title as string) || "드로어"}
            </div>
            {node.children.length === 0 && (
              <div className="text-center text-gray-400 text-xs">
                드로어 컨텐츠를 드롭하세요
              </div>
            )}
          </div>
        );

      case "Tabs":
        return (
          <div
            className={`border-2 border-dashed border-green-300 rounded ${
              node.children.length === 0 ? "min-h-[50px] p-3" : "p-2"
            } ${node.props.className || ""}`}
          >
            <div className="text-xs text-gray-500 mb-1">📑 Tabs</div>
            {node.children.length === 0 && (
              <div className="text-center text-gray-400 text-xs">
                탭 컨텐츠를 드롭하세요
              </div>
            )}
          </div>
        );

      case "Input":
        return (
          <div
            className={`border rounded px-3 py-2 bg-gray-50 text-gray-700 ${node.props.className || ""}`}
          >
            {(node.props.placeholder as string) || "입력하세요"}
          </div>
        );

      default:
        return (
          <div
            className={`p-2 border border-gray-300 rounded ${node.props.className || ""}`}
          >
            <div className="text-xs text-gray-500">{node.type} (미구현)</div>
          </div>
        );
    }
  };

  // 자식 노드가 있는 컨테이너 타입인지 확인
  const isContainer = [
    "Container",
    "Card",
    "Grid",
    "Flex",
    "Modal",
    "Drawer",
    "Tabs",
  ].includes(node.type);

  return (
    <div
      ref={isRoot ? setDropRef : setSortableRef}
      style={isRoot ? undefined : style}
      className={`relative group ${isDragging ? "opacity-50" : ""} ${
        isSelected ? "ring-2 ring-blue-500" : ""
      } ${isOver || isDraggedOver ? "ring-2 ring-green-400 ring-dashed" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      {...(isRoot ? {} : attributes)}
    >
      {/* 노드 컨트롤 (호버 시 표시) */}
      {!isRoot && (isHovered || isSelected) && (
        <div className="absolute -top-8 left-0 flex items-center gap-1 bg-white border rounded shadow-sm p-1 z-10">
          <span className="text-xs font-medium text-gray-600">{node.type}</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            {...listeners}
          >
            <Move className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* 노드 콘텐츠 */}
      <div ref={setDropRef}>{renderNodeContent()}</div>

      {/* 자식 노드들 (컨테이너인 경우) */}
      {isContainer && node.children.length > 0 && (
        <SortableContext
          items={node.children.map((child) => child.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 mt-2">
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
}
