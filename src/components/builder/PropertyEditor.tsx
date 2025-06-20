"use client";

// AIDEV-NOTE: 간소화된 속성 편집기 - 기본 속성들을 편집할 수 있는 폼
// 타입 안전성을 보장하면서 점진적으로 기능 확장

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useBuilderStore } from "@/store/builderStore";
import type { BuilderComponentType } from "@/types/component";
import type { CanvasNode } from "@/types/project";

interface PropertyEditorProps {
  node: CanvasNode;
}

// 컴포넌트별 편집 가능한 속성 정의
const COMPONENT_PROPERTIES: Record<
  BuilderComponentType,
  Array<{
    key: string;
    label: string;
    type: "text" | "number" | "select" | "boolean";
    options?: Array<{ label: string; value: string }>;
  }>
> = {
  // Basic Components
  Text: [
    { key: "text", label: "텍스트", type: "text" },
    { key: "className", label: "CSS 클래스", type: "text" },
  ],
  Heading: [
    { key: "text", label: "제목 텍스트", type: "text" },
    {
      key: "level",
      label: "제목 레벨",
      type: "select",
      options: [
        { label: "H1", value: "1" },
        { label: "H2", value: "2" },
        { label: "H3", value: "3" },
        { label: "H4", value: "4" },
        { label: "H5", value: "5" },
        { label: "H6", value: "6" },
      ],
    },
    { key: "className", label: "CSS 클래스", type: "text" },
  ],
  Button: [
    { key: "text", label: "버튼 텍스트", type: "text" },
    {
      key: "variant",
      label: "스타일",
      type: "select",
      options: [
        { label: "Default", value: "default" },
        { label: "Secondary", value: "secondary" },
        { label: "Destructive", value: "destructive" },
        { label: "Outline", value: "outline" },
        { label: "Ghost", value: "ghost" },
        { label: "Link", value: "link" },
      ],
    },
    {
      key: "size",
      label: "크기",
      type: "select",
      options: [
        { label: "Small", value: "sm" },
        { label: "Default", value: "default" },
        { label: "Large", value: "lg" },
        { label: "Icon", value: "icon" },
      ],
    },
    { key: "className", label: "CSS 클래스", type: "text" },
  ],
  Link: [
    { key: "text", label: "링크 텍스트", type: "text" },
    { key: "href", label: "URL", type: "text" },
    { key: "className", label: "CSS 클래스", type: "text" },
  ],

  // Layout Components
  Container: [{ key: "className", label: "CSS 클래스", type: "text" }],
  Card: [{ key: "className", label: "CSS 클래스", type: "text" }],
  Grid: [
    { key: "cols", label: "열 개수", type: "number" },
    { key: "gap", label: "간격", type: "number" },
    { key: "className", label: "CSS 클래스", type: "text" },
  ],
  Flex: [
    {
      key: "direction",
      label: "방향",
      type: "select",
      options: [
        { label: "Row", value: "row" },
        { label: "Column", value: "column" },
      ],
    },
    { key: "gap", label: "간격", type: "number" },
    { key: "className", label: "CSS 클래스", type: "text" },
  ],

  // Form Components
  Input: [
    { key: "placeholder", label: "플레이스홀더", type: "text" },
    {
      key: "type",
      label: "입력 타입",
      type: "select",
      options: [
        { label: "Text", value: "text" },
        { label: "Email", value: "email" },
        { label: "Password", value: "password" },
        { label: "Number", value: "number" },
      ],
    },
    { key: "className", label: "CSS 클래스", type: "text" },
  ],

  // 나머지 컴포넌트들은 기본 속성만
  Modal: [{ key: "title", label: "제목", type: "text" }],
  Drawer: [{ key: "title", label: "제목", type: "text" }],
  Tabs: [{ key: "defaultValue", label: "기본 탭", type: "text" }],
  Divider: [{ key: "className", label: "CSS 클래스", type: "text" }],
  Icon: [
    { key: "name", label: "아이콘 이름", type: "text" },
    { key: "size", label: "크기", type: "number" },
  ],
  Textarea: [
    { key: "placeholder", label: "플레이스홀더", type: "text" },
    { key: "rows", label: "행 수", type: "number" },
  ],
  Select: [{ key: "placeholder", label: "플레이스홀더", type: "text" }],
  Radio: [
    { key: "name", label: "그룹명", type: "text" },
    { key: "value", label: "값", type: "text" },
    { key: "label", label: "라벨", type: "text" },
  ],
  Checkbox: [
    { key: "label", label: "라벨", type: "text" },
    { key: "checked", label: "체크됨", type: "boolean" },
  ],
  Switch: [
    { key: "label", label: "라벨", type: "text" },
    { key: "checked", label: "활성화", type: "boolean" },
  ],
  NumberInput: [
    { key: "placeholder", label: "플레이스홀더", type: "text" },
    { key: "min", label: "최솟값", type: "number" },
  ],
  DatePicker: [{ key: "placeholder", label: "플레이스홀더", type: "text" }],
  Label: [
    { key: "text", label: "라벨 텍스트", type: "text" },
    { key: "htmlFor", label: "대상 ID", type: "text" },
  ],
  Table: [{ key: "className", label: "CSS 클래스", type: "text" }],
  Tag: [
    { key: "text", label: "태그 텍스트", type: "text" },
    { key: "variant", label: "스타일", type: "text" },
  ],
  Badge: [
    { key: "text", label: "배지 텍스트", type: "text" },
    { key: "variant", label: "스타일", type: "text" },
  ],
  Avatar: [
    { key: "src", label: "이미지 URL", type: "text" },
    { key: "alt", label: "대체 텍스트", type: "text" },
    { key: "fallback", label: "대체 문자", type: "text" },
  ],
  Alert: [
    { key: "title", label: "제목", type: "text" },
    { key: "description", label: "설명", type: "text" },
    { key: "variant", label: "스타일", type: "text" },
  ],
  Toast: [
    { key: "title", label: "제목", type: "text" },
    { key: "description", label: "설명", type: "text" },
  ],
  Spinner: [{ key: "size", label: "크기", type: "text" }],
  Progress: [
    { key: "value", label: "값", type: "number" },
    { key: "max", label: "최댓값", type: "number" },
  ],
};

export function PropertyEditor({ node }: PropertyEditorProps) {
  const { updateNodeProps } = useBuilderStore();
  const [formData, setFormData] = useState<Record<string, unknown>>(node.props);

  const properties =
    COMPONENT_PROPERTIES[node.type as BuilderComponentType] || [];

  // 노드 변경 시 폼 데이터 동기화
  useEffect(() => {
    setFormData(node.props);
  }, [node.props]);

  // 속성 값 변경 핸들러
  const handlePropertyChange = (key: string, value: unknown) => {
    const newFormData = { ...formData, [key]: value };
    setFormData(newFormData);

    // 실시간으로 캔버스 업데이트
    updateNodeProps(node.id, newFormData);
  };

  // 필드별 입력 컴포넌트 렌더링
  const renderField = (property: (typeof properties)[0]) => {
    const value = formData[property.key];

    switch (property.type) {
      case "text":
        return (
          <div key={property.key} className="space-y-2">
            <Label htmlFor={property.key}>{property.label}</Label>
            <Input
              id={property.key}
              value={(value as string) || ""}
              onChange={(e) =>
                handlePropertyChange(property.key, e.target.value)
              }
              placeholder={`${property.label}을 입력하세요`}
            />
          </div>
        );

      case "number":
        return (
          <div key={property.key} className="space-y-2">
            <Label htmlFor={property.key}>{property.label}</Label>
            <Input
              id={property.key}
              type="number"
              value={(value as number) || ""}
              onChange={(e) =>
                handlePropertyChange(
                  property.key,
                  parseFloat(e.target.value) || 0,
                )
              }
              placeholder="숫자를 입력하세요"
            />
          </div>
        );

      case "select":
        return (
          <div key={property.key} className="space-y-2">
            <Label htmlFor={property.key}>{property.label}</Label>
            <Select
              value={(value as string) || ""}
              onValueChange={(newValue) =>
                handlePropertyChange(property.key, newValue)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {property.options?.map(
                  (option: { label: string; value: string }) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          </div>
        );

      case "boolean":
        return (
          <div key={property.key} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id={property.key}
                checked={(value as boolean) || false}
                onCheckedChange={(checked) =>
                  handlePropertyChange(property.key, checked)
                }
              />
              <Label htmlFor={property.key}>{property.label}</Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* 컴포넌트 정보 헤더 */}
      <div className="pb-3 border-b">
        <h3 className="font-medium text-sm">{node.type} 속성</h3>
        <p className="text-xs text-muted-foreground">ID: {node.id}</p>
      </div>

      {/* 속성 필드들 */}
      {properties.length > 0 ? (
        <Card className="border-none shadow-none bg-muted/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">기본 속성</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {properties.map(renderField)}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-8">
          <div className="text-sm text-muted-foreground">
            이 컴포넌트에 대한 편집 가능한 속성이 없습니다.
          </div>
        </div>
      )}

      {/* 디버그 정보 (개발 환경에서만) */}
      {process.env.NODE_ENV === "development" && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-xs">디버그 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs font-mono">
              <div className="mb-2">
                <strong>현재 Props:</strong>
              </div>
              <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * 선택된 노드가 없을 때 표시할 빈 상태 컴포넌트
 */
export function PropertyEditorEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="text-4xl mb-4">🎨</div>
      <div className="text-sm font-medium mb-2">컴포넌트를 선택하세요</div>
      <div className="text-xs text-muted-foreground">
        캔버스에서 컴포넌트를 클릭하면
        <br />
        여기에 속성 편집기가 표시됩니다
      </div>
    </div>
  );
}
