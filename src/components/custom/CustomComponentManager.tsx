"use client";

// AIDEV-NOTE: 커스텀 컴포넌트 관리 UI - 등록된 컴포넌트 목록 관리
// 검색, 필터링, 수정, 삭제, 상태 관리 기능 포함

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Code2,
  Edit2,
  Eye,
  Filter,
  Package,
  Search,
  Tag,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { customComponentManager } from "@/lib/custom-components/CustomComponentManager";
import type { ComponentCategory } from "@/types/component";
import type { CustomComponentDefinition, CustomComponentFilter, CustomComponentStatus } from "@/types/custom-component";
import { RegisterCustomComponent } from "./RegisterCustomComponent";

interface CustomComponentManagerUIProps {
  onSelectComponent?: (componentId: string) => void;
}

export function CustomComponentManagerUI({ onSelectComponent }: CustomComponentManagerUIProps) {
  const [components, setComponents] = useState<CustomComponentDefinition[]>([]);
  const [filter, setFilter] = useState<CustomComponentFilter>({
    sortBy: "updatedAt",
    sortOrder: "desc",
  });
  const [showRegister, setShowRegister] = useState(false);
  const [editingComponent, setEditingComponent] = useState<string | null>(null);

  // 컴포넌트 목록 로드
  const loadComponents = () => {
    const results = customComponentManager.search(filter);
    setComponents(results);
  };

  useEffect(() => {
    loadComponents();

    // 이벤트 리스너 등록
    const handleUpdate = () => loadComponents();
    customComponentManager.addEventListener("registered", handleUpdate);
    customComponentManager.addEventListener("updated", handleUpdate);
    customComponentManager.addEventListener("deleted", handleUpdate);

    return () => {
      customComponentManager.removeEventListener("registered", handleUpdate);
      customComponentManager.removeEventListener("updated", handleUpdate);
      customComponentManager.removeEventListener("deleted", handleUpdate);
    };
  }, [filter]);

  // 컴포넌트 삭제
  const handleDelete = (id: string) => {
    if (confirm("정말로 이 컴포넌트를 삭제하시겠습니까?")) {
      customComponentManager.delete(id);
    }
  };

  // 상태 아이콘 반환
  const getStatusIcon = (status: CustomComponentStatus) => {
    switch (status) {
      case "valid":
      case "published":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "invalid":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "validating":
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  // 상태 색상 반환
  const getStatusVariant = (status: CustomComponentStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "valid":
      case "published":
        return "default";
      case "invalid":
        return "destructive";
      case "draft":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (showRegister) {
    return (
      <RegisterCustomComponent
        onSuccess={(id) => {
          setShowRegister(false);
          loadComponents();
          onSelectComponent?.(id);
        }}
        onCancel={() => setShowRegister(false)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6" />
            커스텀 컴포넌트
          </h2>
          <p className="text-muted-foreground">
            등록된 커스텀 컴포넌트를 관리하고 새로운 컴포넌트를 추가할 수 있습니다.
          </p>
        </div>
        <Button onClick={() => setShowRegister(true)}>
          <Package className="w-4 h-4 mr-2" />새 컴포넌트
        </Button>
      </div>

      {/* 필터 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-4 h-4" />
            필터 및 정렬
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="검색..."
                value={filter.query || ""}
                onChange={(e) => setFilter({ ...filter, query: e.target.value })}
                className="pl-10"
              />
            </div>

            <Select
              value={filter.categories?.[0] || "all"}
              onValueChange={(value) =>
                setFilter({
                  ...filter,
                  categories: value === "all" ? undefined : [value as ComponentCategory],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 카테고리</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Layout">Layout</SelectItem>
                <SelectItem value="Form">Form</SelectItem>
                <SelectItem value="DataDisplay">Data Display</SelectItem>
                <SelectItem value="Feedback">Feedback</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filter.status?.[0] || "all"}
              onValueChange={(value) =>
                setFilter({
                  ...filter,
                  status: value === "all" ? undefined : [value as CustomComponentStatus],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="draft">작성 중</SelectItem>
                <SelectItem value="valid">유효함</SelectItem>
                <SelectItem value="invalid">오류</SelectItem>
                <SelectItem value="published">게시됨</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filter.sortBy || "updatedAt"}
              onValueChange={(value) =>
                setFilter({
                  ...filter,
                  sortBy: value as CustomComponentFilter["sortBy"],
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">이름순</SelectItem>
                <SelectItem value="createdAt">생성일순</SelectItem>
                <SelectItem value="updatedAt">수정일순</SelectItem>
                <SelectItem value="usage">사용횟수순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 컴포넌트 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {components.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">등록된 컴포넌트가 없습니다.</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowRegister(true)}>
                첫 컴포넌트 등록하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          components.map((component) => (
            <Card
              key={component.metadata.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onSelectComponent?.(component.metadata.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(component.status)}
                    <CardTitle className="text-lg">{component.metadata.displayName}</CardTitle>
                  </div>
                  <Badge variant={getStatusVariant(component.status)}>{component.status}</Badge>
                </div>
                <CardDescription className="mt-2">{component.metadata.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* 메타 정보 */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {component.metadata.author.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(component.metadata.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* 태그 */}
                {component.metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {component.metadata.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* 사용 통계 */}
                {component.usage && (
                  <div className="text-sm text-muted-foreground">사용 횟수: {component.usage.count}회</div>
                )}

                {/* 액션 버튼 */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: 프리뷰 기능
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingComponent(component.metadata.id);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(component.metadata.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
 