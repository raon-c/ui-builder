"use client";

// AIDEV-NOTE: 고도화된 속성 편집기 - 실시간 검증, 그룹화, 에러 표시 지원
// 기존 하드코딩된 속성 정의를 유지하면서 UX 개선

import { AlertCircle, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { usePropertiesNavigation } from "@/hooks/useKeyboardNavigation";
import { useBuilderStore } from "@/store/builderStore";
import type { BuilderComponentType } from "@/types/component";
import type { CanvasNode } from "@/types/project";

interface PropertyEditorProps {
  node: CanvasNode;
}

interface PropertyDefinition {
  key: string;
  label: string;
  description?: string;
  type: "text" | "number" | "select" | "boolean";
  options?: Array<{ label: string; value: string }>;
  group?: "content" | "style" | "behavior" | "layout";
  order?: number;
}

interface ValidationError {
  field: string;
  message: string;
}

// 컴포넌트별 편집 가능한 속성 정의 (그룹화 및 설명 추가)
const COMPONENT_PROPERTIES: Record<BuilderComponentType, PropertyDefinition[]> = {
  // Basic Components
  Text: [
    {
      key: "text",
      label: "텍스트",
      description: "표시할 텍스트 내용",
      type: "text",
      group: "content",
      order: 1,
    },
    {
      key: "className",
      label: "CSS 클래스",
      description: "추가 스타일링을 위한 CSS 클래스",
      type: "text",
      group: "style",
      order: 2,
    },
  ],
  Heading: [
    {
      key: "text",
      label: "제목 텍스트",
      description: "제목으로 표시할 텍스트",
      type: "text",
      group: "content",
      order: 1,
    },
    {
      key: "level",
      label: "제목 레벨",
      description: "HTML 제목 태그 레벨",
      type: "select",
      group: "style",
      order: 2,
      options: [
        { label: "H1 (가장 큰 제목)", value: "1" },
        { label: "H2", value: "2" },
        { label: "H3", value: "3" },
        { label: "H4", value: "4" },
        { label: "H5", value: "5" },
        { label: "H6 (가장 작은 제목)", value: "6" },
      ],
    },
    {
      key: "className",
      label: "CSS 클래스",
      description: "추가 스타일링",
      type: "text",
      group: "style",
      order: 3,
    },
  ],
  Button: [
    {
      key: "children",
      label: "버튼 텍스트",
      description: "버튼에 표시될 텍스트",
      type: "text",
      group: "content",
      order: 1,
    },
    {
      key: "variant",
      label: "스타일 변형",
      description: "버튼의 시각적 스타일",
      type: "select",
      group: "style",
      order: 2,
      options: [
        { label: "기본 (Primary)", value: "default" },
        { label: "보조 (Secondary)", value: "secondary" },
        { label: "위험 (Destructive)", value: "destructive" },
        { label: "외곽선 (Outline)", value: "outline" },
        { label: "고스트 (Ghost)", value: "ghost" },
        { label: "링크 (Link)", value: "link" },
      ],
    },
    {
      key: "size",
      label: "크기",
      description: "버튼의 크기",
      type: "select",
      group: "style",
      order: 3,
      options: [
        { label: "작게 (Small)", value: "sm" },
        { label: "기본 (Default)", value: "default" },
        { label: "크게 (Large)", value: "lg" },
        { label: "아이콘 (Icon)", value: "icon" },
      ],
    },
    {
      key: "disabled",
      label: "비활성화",
      description: "버튼을 비활성화 상태로 설정",
      type: "boolean",
      group: "behavior",
      order: 4,
    },
  ],
  Link: [
    {
      key: "text",
      label: "링크 텍스트",
      description: "링크에 표시될 텍스트",
      type: "text",
      group: "content",
      order: 1,
    },
    {
      key: "href",
      label: "URL",
      description: "링크 대상 URL",
      type: "text",
      group: "behavior",
      order: 2,
    },
    {
      key: "className",
      label: "CSS 클래스",
      type: "text",
      group: "style",
      order: 3,
    },
  ],

  // Layout Components
  Container: [
    {
      key: "className",
      label: "CSS 클래스",
      description: "컨테이너 스타일링",
      type: "text",
      group: "style",
      order: 1,
    },
  ],
  Card: [
    {
      key: "className",
      label: "CSS 클래스",
      description: "카드 스타일링",
      type: "text",
      group: "style",
      order: 1,
    },
  ],
  Grid: [
    {
      key: "cols",
      label: "열 개수",
      description: "그리드의 열 개수",
      type: "number",
      group: "layout",
      order: 1,
    },
    {
      key: "gap",
      label: "간격",
      description: "그리드 아이템 간 간격",
      type: "number",
      group: "layout",
      order: 2,
    },
    {
      key: "className",
      label: "CSS 클래스",
      type: "text",
      group: "style",
      order: 3,
    },
  ],
  Flex: [
    {
      key: "direction",
      label: "방향",
      description: "플렉스 아이템 배치 방향",
      type: "select",
      group: "layout",
      order: 1,
      options: [
        { label: "가로 (Row)", value: "row" },
        { label: "세로 (Column)", value: "column" },
      ],
    },
    {
      key: "gap",
      label: "간격",
      description: "플렉스 아이템 간 간격",
      type: "number",
      group: "layout",
      order: 2,
    },
    {
      key: "className",
      label: "CSS 클래스",
      type: "text",
      group: "style",
      order: 3,
    },
  ],

  // Form Components
  Input: [
    {
      key: "placeholder",
      label: "플레이스홀더",
      description: "입력 필드의 힌트 텍스트",
      type: "text",
      group: "content",
      order: 1,
    },
    {
      key: "type",
      label: "입력 타입",
      description: "입력 필드의 타입",
      type: "select",
      group: "behavior",
      order: 2,
      options: [
        { label: "텍스트", value: "text" },
        { label: "이메일", value: "email" },
        { label: "비밀번호", value: "password" },
        { label: "숫자", value: "number" },
      ],
    },
    {
      key: "disabled",
      label: "비활성화",
      description: "입력 필드를 비활성화",
      type: "boolean",
      group: "behavior",
      order: 3,
    },
    {
      key: "className",
      label: "CSS 클래스",
      type: "text",
      group: "style",
      order: 4,
    },
  ],

  // 나머지 컴포넌트들은 기본 정의 유지
  Modal: [
    {
      key: "title",
      label: "모달 제목",
      type: "text",
      group: "content",
      order: 1,
    },
    {
      key: "className",
      label: "CSS 클래스",
      type: "text",
      group: "style",
      order: 2,
    },
  ],
  Drawer: [
    {
      key: "title",
      label: "드로어 제목",
      type: "text",
      group: "content",
      order: 1,
    },
    {
      key: "className",
      label: "CSS 클래스",
      type: "text",
      group: "style",
      order: 2,
    },
  ],
  Tabs: [
    {
      key: "defaultValue",
      label: "기본 탭",
      type: "text",
      group: "behavior",
      order: 1,
    },
    {
      key: "className",
      label: "CSS 클래스",
      type: "text",
      group: "style",
      order: 2,
    },
  ],
  Divider: [
    {
      key: "className",
      label: "CSS 클래스",
      type: "text",
      group: "style",
      order: 1,
    },
  ],
  Icon: [
    {
      key: "name",
      label: "아이콘 이름",
      type: "text",
      group: "content",
      order: 1,
    },
    { key: "size", label: "크기", type: "number", group: "style", order: 2 },
  ],
  Textarea: [
    {
      key: "placeholder",
      label: "플레이스홀더",
      type: "text",
      group: "content",
      order: 1,
    },
    {
      key: "rows",
      label: "행 수",
      type: "number",
      group: "layout",
      order: 2,
    },
  ],
  Select: [
    {
      key: "placeholder",
      label: "플레이스홀더",
      type: "text",
      group: "content",
      order: 1,
    },
  ],
  Radio: [
    {
      key: "name",
      label: "그룹명",
      type: "text",
      group: "behavior",
      order: 1,
    },
    { key: "value", label: "값", type: "text", group: "content", order: 2 },
    { key: "label", label: "라벨", type: "text", group: "content", order: 3 },
  ],
  Checkbox: [
    { key: "label", label: "라벨", type: "text", group: "content", order: 1 },
    {
      key: "checked",
      label: "체크됨",
      type: "boolean",
      group: "behavior",
      order: 2,
    },
  ],
  Switch: [
    { key: "label", label: "라벨", type: "text", group: "content", order: 1 },
    {
      key: "checked",
      label: "활성화",
      type: "boolean",
      group: "behavior",
      order: 2,
    },
  ],
  NumberInput: [
    {
      key: "placeholder",
      label: "플레이스홀더",
      type: "text",
      group: "content",
      order: 1,
    },
    {
      key: "min",
      label: "최솟값",
      type: "number",
      group: "behavior",
      order: 2,
    },
  ],
  DatePicker: [
    {
      key: "placeholder",
      label: "플레이스홀더",
      type: "text",
      group: "content",
      order: 1,
    },
  ],
  Label: [
    {
      key: "children",
      label: "라벨 텍스트",
      type: "text",
      group: "content",
      order: 1,
    },
    {
      key: "htmlFor",
      label: "대상 ID",
      type: "text",
      group: "behavior",
      order: 2,
    },
  ],
  Table: [
    {
      key: "className",
      label: "CSS 클래스",
      type: "text",
      group: "style",
      order: 1,
    },
  ],
  Tag: [
    {
      key: "text",
      label: "태그 텍스트",
      type: "text",
      group: "content",
      order: 1,
    },
    {
      key: "variant",
      label: "스타일",
      type: "text",
      group: "style",
      order: 2,
    },
  ],
  Badge: [
    {
      key: "children",
      label: "배지 텍스트",
      type: "text",
      group: "content",
      order: 1,
    },
    {
      key: "variant",
      label: "스타일 변형",
      type: "select",
      group: "style",
      order: 2,
      options: [
        { label: "기본 (Primary)", value: "default" },
        { label: "보조 (Secondary)", value: "secondary" },
        { label: "위험 (Destructive)", value: "destructive" },
        { label: "외곽선 (Outline)", value: "outline" },
      ],
    },
  ],
  Avatar: [
    {
      key: "src",
      label: "이미지 URL",
      type: "text",
      group: "content",
      order: 1,
    },
    {
      key: "alt",
      label: "대체 텍스트",
      type: "text",
      group: "content",
      order: 2,
    },
    {
      key: "fallback",
      label: "대체 문자",
      type: "text",
      group: "content",
      order: 3,
    },
  ],
  Alert: [
    { key: "title", label: "제목", type: "text", group: "content", order: 1 },
    {
      key: "description",
      label: "설명",
      type: "text",
      group: "content",
      order: 2,
    },
    {
      key: "variant",
      label: "스타일",
      type: "text",
      group: "style",
      order: 3,
    },
  ],
  Toast: [
    { key: "title", label: "제목", type: "text", group: "content", order: 1 },
    {
      key: "description",
      label: "설명",
      type: "text",
      group: "content",
      order: 2,
    },
  ],
  Spinner: [{ key: "size", label: "크기", type: "text", group: "style", order: 1 }],
  Progress: [
    { key: "value", label: "값", type: "number", group: "content", order: 1 },
    {
      key: "max",
      label: "최댓값",
      type: "number",
      group: "behavior",
      order: 2,
    },
  ],
};

export function PropertyEditor({ node }: PropertyEditorProps) {
  const { updateNodeProps } = useBuilderStore();
  const [formData, setFormData] = useState<Record<string, unknown>>(node.props);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const properties = COMPONENT_PROPERTIES[node.type as BuilderComponentType] || [];
  const navigationProps = usePropertiesNavigation();

  // 속성을 그룹별로 분류
  const groupedProperties = properties.reduce(
    (groups, property) => {
      const group = property.group || "general";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(property);
      return groups;
    },
    {} as Record<string, PropertyDefinition[]>,
  );

  // 그룹 순서 정의
  const groupOrder = ["content", "style", "layout", "behavior", "general"];
  const groupLabels = {
    content: "콘텐츠",
    style: "스타일",
    layout: "레이아웃",
    behavior: "동작",
    general: "일반",
  };

  // 노드 변경 시 폼 데이터 동기화
  useEffect(() => {
    setFormData(node.props);
    setHasUnsavedChanges(false);
    setValidationErrors([]);
  }, [node.props]);

  // 기본 검증 함수
  const validateField = (key: string, value: unknown, type: string): string | null => {
    if (type === "number" && value !== "" && value !== null && value !== undefined) {
      const num = Number(value);
      if (isNaN(num)) {
        return "유효한 숫자를 입력해주세요.";
      }
    }
    return null;
  };

  // 속성 값 변경 핸들러
  const handlePropertyChange = (key: string, value: unknown, type: string) => {
    const newFormData = { ...formData, [key]: value };
    setFormData(newFormData);
    setHasUnsavedChanges(true);

    // 필드 검증
    const error = validateField(key, value, type);
    setValidationErrors((prev) => {
      const filtered = prev.filter((err) => err.field !== key);
      if (error) {
        filtered.push({ field: key, message: error });
      }
      return filtered;
    });

    if (!error) {
      // 실시간으로 캔버스 업데이트 (검증 통과 시에만)
      updateNodeProps(node.id, newFormData);
    }
  };

  // 변경사항 되돌리기
  const revertChanges = () => {
    setFormData(node.props);
    setHasUnsavedChanges(false);
    setValidationErrors([]);
  };

  // 기본값으로 재설정
  const resetToDefaults = () => {
    const defaults: Record<string, unknown> = {};
    properties.forEach((prop) => {
      switch (prop.type) {
        case "text":
          defaults[prop.key] = "";
          break;
        case "number":
          defaults[prop.key] = 0;
          break;
        case "boolean":
          defaults[prop.key] = false;
          break;
        case "select":
          defaults[prop.key] = prop.options?.[0]?.value || "";
          break;
      }
    });

    setFormData(defaults);
    updateNodeProps(node.id, defaults);
    setHasUnsavedChanges(false);
    setValidationErrors([]);
  };

  // 필드별 입력 컴포넌트 렌더링
  const renderField = (property: PropertyDefinition) => {
    const value = formData[property.key];
    const error = validationErrors.find((err) => err.field === property.key);
    const fieldId = `field-${property.key}`;

    switch (property.type) {
      case "text":
        return (
          <div key={property.key} className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {property.label}
              {property.description && (
                <span className="text-xs text-muted-foreground block">{property.description}</span>
              )}
            </Label>
            <Input
              id={fieldId}
              type="text"
              value={(value as string) || ""}
              onChange={(e) => handlePropertyChange(property.key, e.target.value, property.type)}
              className={error ? "border-destructive" : ""}
            />
            {error && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {error.message}
              </div>
            )}
          </div>
        );

      case "number":
        return (
          <div key={property.key} className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {property.label}
              {property.description && (
                <span className="text-xs text-muted-foreground block">{property.description}</span>
              )}
            </Label>
            <Input
              id={fieldId}
              type="number"
              value={(value as number) || ""}
              onChange={(e) => handlePropertyChange(property.key, parseFloat(e.target.value) || 0, property.type)}
              className={error ? "border-destructive" : ""}
            />
            {error && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {error.message}
              </div>
            )}
          </div>
        );

      case "select":
        return (
          <div key={property.key} className="space-y-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {property.label}
              {property.description && (
                <span className="text-xs text-muted-foreground block">{property.description}</span>
              )}
            </Label>
            <Select
              value={(value as string) || ""}
              onValueChange={(newValue) => handlePropertyChange(property.key, newValue, property.type)}
            >
              <SelectTrigger id={fieldId} className={error ? "border-destructive" : ""}>
                <SelectValue placeholder="선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {property.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {error.message}
              </div>
            )}
          </div>
        );

      case "boolean":
        return (
          <div key={property.key} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id={fieldId}
                checked={(value as boolean) || false}
                onCheckedChange={(checked) => handlePropertyChange(property.key, checked, property.type)}
              />
              <Label htmlFor={fieldId} className="text-sm font-medium">
                {property.label}
              </Label>
            </div>
            {property.description && <p className="text-xs text-muted-foreground ml-6">{property.description}</p>}
            {error && (
              <div className="flex items-center gap-1 text-xs text-destructive ml-6">
                <AlertCircle className="h-3 w-3" />
                {error.message}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4" {...navigationProps}>
      {/* 컴포넌트 정보 헤더 */}
      <div className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-sm">{node.type} 속성</h3>
            <p className="text-xs text-muted-foreground">ID: {node.id}</p>
          </div>
          <div className="flex items-center gap-1">
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="text-xs">
                변경됨
              </Badge>
            )}
            {validationErrors.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {validationErrors.length}개 오류
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={resetToDefaults} className="flex-1">
          <RotateCcw className="h-3 w-3 mr-1" />
          기본값
        </Button>
        {hasUnsavedChanges && (
          <Button variant="outline" size="sm" onClick={revertChanges} className="flex-1">
            되돌리기
          </Button>
        )}
      </div>

      {/* 그룹화된 속성 필드들 */}
      {properties.length > 0 ? (
        <>
          {groupOrder.map((groupKey, groupIndex) => {
            const groupProperties = groupedProperties[groupKey];
            if (!groupProperties || groupProperties.length === 0) return null;

            // 속성을 order에 따라 정렬
            const sortedProperties = groupProperties.sort((a, b) => (a.order || 999) - (b.order || 999));

            return (
              <Card key={groupKey} className="border-none shadow-none bg-muted/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    {groupLabels[groupKey as keyof typeof groupLabels] || groupKey}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">{sortedProperties.map(renderField)}</CardContent>
                {groupIndex < groupOrder.length - 1 && groupedProperties[groupOrder[groupIndex + 1]]?.length > 0 && (
                  <Separator className="mt-4" />
                )}
              </Card>
            );
          })}
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-sm text-muted-foreground">이 컴포넌트에 대한 편집 가능한 속성이 없습니다.</div>
        </div>
      )}

      {/* 전체 검증 오류 표시 */}
      {validationErrors.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              검증 오류
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {validationErrors.map((error, index) => (
              <div key={`error-${error.field}-${index}`} className="text-xs text-destructive">
                <strong>{error.field}:</strong> {error.message}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 디버그 정보 (개발 환경에서만) */}
      {process.env.NODE_ENV === "development" && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground">디버그 정보</summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
            {JSON.stringify(
              {
                nodeType: node.type,
                currentProps: formData,
                validationErrors,
                hasUnsavedChanges,
                availableProperties: properties.length,
              },
              null,
              2,
            )}
          </pre>
        </details>
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
