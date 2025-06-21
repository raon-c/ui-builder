"use client";

// AIDEV-NOTE: 미리보기 전용 렌더러 - 편집 UI 없이 실제 컴포넌트만 렌더링
// DroppableCanvasNode와 달리 드래그앤드롭, 선택, 편집 기능 제거

import { Button } from "@/components/ui/button";
import type { CanvasNode } from "@/types/project";

interface PreviewRendererProps {
  node: CanvasNode;
  isRoot?: boolean;
}

export function PreviewRenderer({
  node,
  isRoot = false,
}: PreviewRendererProps) {
  // 노드 렌더링 함수 - 편집 UI 제거된 순수 컴포넌트
  const renderNodeContent = () => {
    switch (node.type) {
      case "Container":
        return (
          <div className={`${node.props.className || ""}`}>
            {/* 자식 노드들 렌더링 */}
            {node.children.length > 0 && (
              <div className="space-y-2">
                {node.children.map((child) => (
                  <PreviewRenderer key={child.id} node={child} />
                ))}
              </div>
            )}
          </div>
        );

      case "Card":
        return (
          <div
            className={`border rounded-lg shadow-sm ${node.props.className || ""}`}
          >
            {/* 자식 노드들 렌더링 */}
            {node.children.length > 0 && (
              <div className="space-y-2">
                {node.children.map((child) => (
                  <PreviewRenderer key={child.id} node={child} />
                ))}
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
            } ${node.props.className || ""}`}
          >
            {node.children.map((child) => (
              <PreviewRenderer key={child.id} node={child} />
            ))}
          </div>
        );
      }

      case "Flex": {
        const direction = (node.props.direction as string) || "row";
        return (
          <div
            className={`flex ${
              direction === "column" ? "flex-col" : "flex-row"
            } gap-2 ${node.props.className || ""}`}
          >
            {node.children.map((child) => (
              <PreviewRenderer key={child.id} node={child} />
            ))}
          </div>
        );
      }

      case "Modal":
        return (
          <div
            className={`bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto ${node.props.className || ""}`}
          >
            <h3 className="text-lg font-semibold mb-4">
              {(node.props.title as string) || "모달"}
            </h3>
            {node.children.length > 0 && (
              <div className="space-y-2">
                {node.children.map((child) => (
                  <PreviewRenderer key={child.id} node={child} />
                ))}
              </div>
            )}
          </div>
        );

      case "Drawer":
        return (
          <div
            className={`bg-white border-r shadow-lg p-4 min-h-screen w-64 ${node.props.className || ""}`}
          >
            <h3 className="text-lg font-semibold mb-4">
              {(node.props.title as string) || "드로어"}
            </h3>
            {node.children.length > 0 && (
              <div className="space-y-2">
                {node.children.map((child) => (
                  <PreviewRenderer key={child.id} node={child} />
                ))}
              </div>
            )}
          </div>
        );

      case "Tabs":
        return (
          <div className={`${node.props.className || ""}`}>
            <div className="border-b">
              <div className="flex space-x-4">
                <button className="py-2 px-4 border-b-2 border-blue-500 text-blue-600 font-medium">
                  탭 1
                </button>
                <button className="py-2 px-4 text-gray-500 hover:text-gray-700">
                  탭 2
                </button>
              </div>
            </div>
            <div className="p-4">
              {node.children.length > 0 && (
                <div className="space-y-2">
                  {node.children.map((child) => (
                    <PreviewRenderer key={child.id} node={child} />
                  ))}
                </div>
              )}
            </div>
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

      case "Link":
        return (
          <a
            href={(node.props.href as string) || "#"}
            className={`text-blue-600 hover:text-blue-800 underline ${node.props.className || ""}`}
          >
            {(node.props.text as string) || "링크"}
          </a>
        );

      case "Input":
        return (
          <input
            type={(node.props.type as string) || "text"}
            placeholder={(node.props.placeholder as string) || "입력하세요"}
            className={`border rounded px-3 py-2 w-full ${node.props.className || ""}`}
          />
        );

      case "Textarea":
        return (
          <textarea
            placeholder={
              (node.props.placeholder as string) || "내용을 입력하세요"
            }
            rows={(node.props.rows as number) || 3}
            className={`border rounded px-3 py-2 w-full resize-y ${node.props.className || ""}`}
          />
        );

      case "Select":
        return (
          <select
            className={`border rounded px-3 py-2 w-full ${node.props.className || ""}`}
          >
            <option>
              {(node.props.placeholder as string) || "선택하세요"}
            </option>
          </select>
        );

      case "Checkbox":
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={(node.props.checked as boolean) || false}
              readOnly
            />
            <span>{(node.props.label as string) || "체크박스"}</span>
          </label>
        );

      case "Switch":
        return (
          <label className="flex items-center space-x-2">
            <div
              className={`w-11 h-6 rounded-full transition-colors ${
                (node.props.checked as boolean) ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  (node.props.checked as boolean)
                    ? "translate-x-5"
                    : "translate-x-0.5"
                } mt-0.5`}
              />
            </div>
            <span>{(node.props.label as string) || "스위치"}</span>
          </label>
        );

      case "Badge":
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${node.props.className || ""}`}
          >
            {(node.props.text as string) || "배지"}
          </span>
        );

      case "Avatar": {
        const src = node.props.src as string;
        const fallback = (node.props.fallback as string) || "A";
        return src ? (
          <img
            src={src}
            alt={(node.props.alt as string) || "아바타"}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium">
            {fallback}
          </div>
        );
      }

      case "Alert":
        return (
          <div
            className={`border rounded-lg p-4 ${
              (node.props.variant as string) === "destructive"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-blue-200 bg-blue-50 text-blue-800"
            } ${node.props.className || ""}`}
          >
            <h4 className="font-medium">
              {(node.props.title as string) || "알림"}
            </h4>
            {(() => {
              const description = node.props.description;
              return description ? (
                <p className="text-sm mt-1">{String(description)}</p>
              ) : null;
            })()}
          </div>
        );

      case "Progress": {
        const value = (node.props.value as number) || 0;
        const max = (node.props.max as number) || 100;
        const percentage = (value / max) * 100;
        return (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
        );
      }

      case "Divider":
        return (
          <hr className={`border-gray-300 ${node.props.className || ""}`} />
        );

      default:
        return (
          <div
            className={`p-2 border border-gray-300 rounded bg-gray-50 ${node.props.className || ""}`}
          >
            <div className="text-xs text-gray-500">{node.type}</div>
          </div>
        );
    }
  };

  return <div>{renderNodeContent()}</div>;
}
