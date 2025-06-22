"use client";

// AIDEV-NOTE: 커스텀 컴포넌트 등록 UI - 사용자가 자신만의 컴포넌트를 등록하는 폼
// 코드 에디터, 메타데이터 입력, 실시간 검증, 프리뷰 기능 포함

import { AlertCircle, CheckCircle2, Code2, FileCode2, Package, Palette } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { customComponentManager } from "@/lib/custom-components/CustomComponentManager";
import type { ComponentCategory } from "@/types/component";
import type { CustomComponentRegistrationRequest, CustomComponentValidation } from "@/types/custom-component";

interface RegisterCustomComponentProps {
  onSuccess?: (componentId: string) => void;
  onCancel?: () => void;
}

const SAMPLE_CODE = `// React 컴포넌트를 작성하세요
function MyCustomButton({ children, variant = "default", onClick }) {
  const styles = {
    default: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600",
    outline: "px-4 py-2 border border-blue-500 text-blue-500 rounded hover:bg-blue-50",
  };

  return (
    <button 
      className={styles[variant]} 
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// 컴포넌트를 export default 하거나 변수명을 Component로 지정하세요
const Component = MyCustomButton;`;

const SAMPLE_PROPS_SCHEMA = `z.object({
  children: z.string().describe("버튼 텍스트"),
  variant: z.enum(["default", "outline"]).default("default").describe("버튼 스타일"),
  onClick: z.function().optional().describe("클릭 이벤트 핸들러"),
})`;

export function RegisterCustomComponent({ onSuccess, onCancel }: RegisterCustomComponentProps) {
  const [formData, setFormData] = useState<Partial<CustomComponentRegistrationRequest>>({
    name: "",
    displayName: "",
    description: "",
    category: "Basic",
    icon: "Component",
    sourceType: "code",
    code: SAMPLE_CODE,
    propsSchema: SAMPLE_PROPS_SCHEMA,
    tags: [],
  });

  const [validation, setValidation] = useState<CustomComponentValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // 실시간 검증
  const handleValidate = async () => {
    if (!formData.code || !formData.name) return;

    setIsValidating(true);
    try {
      const tempDefinition = {
        metadata: {
          id: "temp",
          name: formData.name,
          displayName: formData.displayName || formData.name,
          description: formData.description || "",
          version: "1.0.0",
          author: { name: "User" },
          category: formData.category as ComponentCategory,
          tags: formData.tags || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        sourceType: formData.sourceType || "code",
        code: {
          source: formData.code,
          styles: formData.styles,
          dependencies: formData.dependencies,
        },
        props: {
          schema: formData.propsSchema || "z.object({})",
          defaults: formData.defaultProps,
        },
        status: "draft" as const,
      };

      const result = await customComponentManager.validateComponent(tempDefinition);
      setValidation(result);
    } catch (error) {
      console.error("검증 실패:", error);
    } finally {
      setIsValidating(false);
    }
  };

  // 컴포넌트 등록
  const handleSubmit = async () => {
    if (!formData.name || !formData.displayName || !formData.code) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    setIsRegistering(true);
    try {
      const request: CustomComponentRegistrationRequest = {
        name: formData.name,
        displayName: formData.displayName,
        description: formData.description || "",
        category: formData.category as ComponentCategory,
        icon: formData.icon,
        sourceType: formData.sourceType || "code",
        code: formData.code,
        styles: formData.styles,
        dependencies: formData.dependencies,
        propsSchema: formData.propsSchema,
        defaultProps: formData.defaultProps,
        tags: formData.tags,
        isPublic: formData.isPublic,
        experimental: formData.experimental,
      };

      const result = await customComponentManager.register(request);

      if (result.status === "valid" || result.status === "published") {
        onSuccess?.(result.metadata.id);
      } else {
        alert("컴포넌트 검증에 실패했습니다. 코드를 확인해주세요.");
      }
    } catch (error) {
      console.error("등록 실패:", error);
      alert("컴포넌트 등록에 실패했습니다.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            커스텀 컴포넌트 등록
          </CardTitle>
          <CardDescription>자신만의 React 컴포넌트를 등록하여 빌더에서 사용할 수 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="basic">기본 정보</TabsTrigger>
              <TabsTrigger value="code">컴포넌트 코드</TabsTrigger>
              <TabsTrigger value="props">Props 정의</TabsTrigger>
              <TabsTrigger value="style">스타일</TabsTrigger>
            </TabsList>

            {/* 기본 정보 탭 */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">컴포넌트 이름 (영문)</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="MyCustomButton"
                    pattern="[A-Za-z][A-Za-z0-9]*"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">표시 이름</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="커스텀 버튼"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="이 컴포넌트는..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">카테고리</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Layout">Layout</SelectItem>
                      <SelectItem value="Form">Form</SelectItem>
                      <SelectItem value="DataDisplay">Data Display</SelectItem>
                      <SelectItem value="Feedback">Feedback</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">아이콘</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="Component"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
                <Input
                  id="tags"
                  value={formData.tags?.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="button, custom, ui"
                />
              </div>
            </TabsContent>

            {/* 컴포넌트 코드 탭 */}
            <TabsContent value="code" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  컴포넌트 코드
                </Label>
                <Textarea
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="React 컴포넌트 코드를 입력하세요..."
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={handleValidate} disabled={isValidating || !formData.code} variant="outline" size="sm">
                {isValidating ? "검증 중..." : "코드 검증"}
              </Button>

              {validation && (
                <div className="space-y-2">
                  {validation.isValid ? (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">코드 검증을 통과했습니다!</AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          {validation.errors.map((error, idx) => (
                            <div key={idx} className="text-sm">
                              <Badge variant="destructive" className="mr-2">
                                {error.type}
                              </Badge>
                              {error.message}
                            </div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  {validation.warnings.length > 0 && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription>
                        <div className="space-y-1">
                          {validation.warnings.map((warning, idx) => (
                            <div key={idx} className="text-sm text-yellow-800">
                              <Badge variant="outline" className="mr-2">
                                {warning.type}
                              </Badge>
                              {warning.message}
                            </div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Props 정의 탭 */}
            <TabsContent value="props" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="propsSchema" className="flex items-center gap-2">
                  <FileCode2 className="w-4 h-4" />
                  Props 스키마 (Zod)
                </Label>
                <Textarea
                  id="propsSchema"
                  value={formData.propsSchema}
                  onChange={(e) => setFormData({ ...formData, propsSchema: e.target.value })}
                  placeholder="z.object({ ... })"
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultProps">기본 Props (JSON)</Label>
                <Textarea
                  id="defaultProps"
                  value={JSON.stringify(formData.defaultProps || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const props = JSON.parse(e.target.value);
                      setFormData({ ...formData, defaultProps: props });
                    } catch {
                      // JSON 파싱 오류 무시
                    }
                  }}
                  placeholder='{ "variant": "default" }'
                  rows={5}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>

            {/* 스타일 탭 */}
            <TabsContent value="style" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="styles" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  CSS 스타일 (선택사항)
                </Label>
                <Textarea
                  id="styles"
                  value={formData.styles}
                  onChange={(e) => setFormData({ ...formData, styles: e.target.value })}
                  placeholder=".my-custom-button { ... }"
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onCancel}>
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isRegistering || !formData.name || !formData.displayName || !formData.code}
            >
              {isRegistering ? "등록 중..." : "컴포넌트 등록"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
 