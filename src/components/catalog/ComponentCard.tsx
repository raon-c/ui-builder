"use client";

// AIDEV-NOTE: 컴포넌트 카드 - 개별 컴포넌트 미리보기 및 정보 표시
// 드래그 앤 드롭, 클릭 이벤트, 컴포넌트 실제 렌더링 포함

import * as LucideIcons from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ComponentWrapper } from "@/types/component";

interface ComponentCardProps {
  component: ComponentWrapper;
  onSelect?: (component: ComponentWrapper) => void;
  onPreview?: (component: ComponentWrapper) => void;
  showPreview?: boolean;
}

/**
 * 개별 컴포넌트를 표시하는 카드 컴포넌트
 */
export function ComponentCard({ component, onSelect, onPreview, showPreview = true }: ComponentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { metadata, type } = component;

  // Lucide 아이콘 동적 로드
  const IconComponent = (LucideIcons as any)[metadata.icon] || LucideIcons.Package;

  // 컴포넌트 미리보기 렌더링
  const renderPreview = () => {
    if (!showPreview) return null;

    try {
      const Component = component.component;
      const defaultProps = metadata.defaultProps;

      // 컴포넌트별 특별한 미리보기 처리
      switch (type) {
        case "Button":
          return <Component {...defaultProps} size="sm" />;

        case "Input":
          return <Component {...defaultProps} className="w-full max-w-[120px]" />;

        case "Badge":
          return <Component {...defaultProps} />;

        case "Checkbox":
          return (
            <div className="flex items-center space-x-2">
              <Component {...defaultProps} id={`preview-${type}`} />
              <label htmlFor={`preview-${type}`} className="text-sm">
                체크박스
              </label>
            </div>
          );

        case "Switch":
          return (
            <div className="flex items-center space-x-2">
              <Component {...defaultProps} id={`preview-${type}`} />
              <label htmlFor={`preview-${type}`} className="text-sm">
                스위치
              </label>
            </div>
          );

        case "Avatar": {
          const { Avatar, AvatarFallback } = require("@/components/ui/avatar");
          return (
            <Avatar className="h-8 w-8">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          );
        }

        case "Label":
          return <Component {...defaultProps} />;

        default:
          return <Component {...defaultProps} />;
      }
    } catch (error) {
      console.warn(`Failed to render preview for ${type}:`, error);
      return <div className="text-xs text-muted-foreground">미리보기 불가</div>;
    }
  };

  // 카테고리별 색상 매핑
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Basic":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Form":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "DataDisplay":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "Layout":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "Feedback":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <Card
      className={`
        relative cursor-pointer transition-all duration-200 hover:shadow-md
        ${isHovered ? "ring-2 ring-primary ring-offset-2" : ""}
        ${metadata.draggable ? "hover:scale-[1.02]" : ""}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect?.(component)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <IconComponent className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm font-medium truncate">{metadata.displayName}</CardTitle>
              <div className="mt-1">
                <Badge variant="secondary" className={`text-xs ${getCategoryColor(metadata.category)}`}>
                  {metadata.category}
                </Badge>
              </div>
            </div>
          </div>

          {metadata.draggable && <div className="text-xs text-muted-foreground">드래그 가능</div>}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* 컴포넌트 미리보기 */}
        {showPreview && (
          <div className="mb-3 p-3 bg-muted/50 rounded-md min-h-[60px] flex items-center justify-center">
            {renderPreview()}
          </div>
        )}

        {/* 설명 */}
        <CardDescription className="text-xs leading-relaxed mb-3">{metadata.description}</CardDescription>

        {/* 액션 버튼들 */}
        <div className="flex gap-2">
          {onPreview && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(component);
              }}
            >
              미리보기
            </Button>
          )}

          <Button
            size="sm"
            className="flex-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(component);
            }}
          >
            선택
          </Button>
        </div>

        {/* 메타 정보 */}
        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>타입:</span>
            <span className="font-mono">{type}</span>
          </div>
          <div className="flex justify-between">
            <span>자식 요소:</span>
            <span>{metadata.canHaveChildren ? "가능" : "불가능"}</span>
          </div>
          <div className="flex justify-between">
            <span>삭제:</span>
            <span>{metadata.deletable ? "가능" : "불가능"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
