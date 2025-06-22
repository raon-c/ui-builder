"use client";

// AIDEV-NOTE: 다중 라이브러리 관리 UI - 여러 디자인 라이브러리 관리 인터페이스
// 어댑터 목록, 우선순위 설정, 충돌 해결, 통계 등의 기능 제공

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  CheckCircle2,
  Filter,
  Layers,
  Package,
  Search,
  Settings,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConflictResolution, useLibraryStats, useMultiLibrary } from "@/hooks/useMultiLibrary";
import { isMuiAdapterRegistered, registerMuiAdapter, unregisterMuiAdapter } from "@/lib/adapters/mui-integration";
import type { LibraryNamespace } from "@/types/multi-library";

interface MultiLibraryManagerProps {
  onClose?: () => void;
}

export function MultiLibraryManager({ onClose }: MultiLibraryManagerProps) {
  const { adapters, config, stats, isLoading, error, updateConfig, setPriority } = useMultiLibrary();

  const {
    conflicts,
    conflictCount,
    unresolvedCount,
    resolutionStrategy,
    autoResolveEnabled,
    setResolutionStrategy,
    toggleAutoResolve,
  } = useConflictResolution();

  const { detailedStats } = useLibraryStats();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNamespace, setSelectedNamespace] = useState<LibraryNamespace | "all">("all");
  const [muiRegistered, setMuiRegistered] = useState(isMuiAdapterRegistered());

  // 어댑터 상태 아이콘
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "loaded":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "loading":
        return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Package className="w-4 h-4 text-gray-400" />;
    }
  };

  // 우선순위 변경
  const handlePriorityChange = (namespace: LibraryNamespace, direction: "up" | "down") => {
    const currentPriority = config.adapterPriorities.find((p) => p.namespace === namespace)?.priority || 0;
    const newPriority = direction === "up" ? currentPriority + 10 : currentPriority - 10;
    setPriority(namespace, Math.max(0, newPriority));
  };

  // 네임스페이스 표시 토글
  const toggleNamespaceDisplay = () => {
    updateConfig({ showNamespaces: !config.showNamespaces });
  };

  // MUI 어댑터 등록/해제
  const handleMuiAdapterToggle = async () => {
    if (muiRegistered) {
      const success = await unregisterMuiAdapter();
      if (success) {
        setMuiRegistered(false);
      }
    } else {
      const success = await registerMuiAdapter();
      if (success) {
        setMuiRegistered(true);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Layers className="w-6 h-6" />
            다중 라이브러리 관리
          </h2>
          <p className="text-muted-foreground">여러 디자인 라이브러리를 동시에 관리하고 충돌을 해결합니다.</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        )}
      </div>

      {/* 통계 카드 */}
      {detailedStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">어댑터</span>
              </div>
              <div className="text-2xl font-bold">{detailedStats.totalAdapters}</div>
              <div className="text-xs text-muted-foreground">활성: {detailedStats.activeAdapters}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">컴포넌트</span>
              </div>
              <div className="text-2xl font-bold">{detailedStats.totalComponents}</div>
              <div className="text-xs text-muted-foreground">
                평균: {Math.round(detailedStats.averageComponentsPerAdapter)}개
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium">충돌</span>
              </div>
              <div className="text-2xl font-bold">{conflictCount}</div>
              <div className="text-xs text-muted-foreground">미해결: {unresolvedCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">최다 사용</span>
              </div>
              <div className="text-lg font-bold">{detailedStats.mostUsedNamespace || "없음"}</div>
              <div className="text-xs text-muted-foreground">네임스페이스</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="adapters" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="adapters">어댑터</TabsTrigger>
          <TabsTrigger value="conflicts">충돌 관리</TabsTrigger>
          <TabsTrigger value="components">컴포넌트</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>

        {/* 어댑터 탭 */}
        <TabsContent value="adapters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                등록된 어댑터
              </CardTitle>
              <CardDescription>현재 로드된 디자인 라이브러리 어댑터 목록입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adapters.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">등록된 어댑터가 없습니다.</div>
                ) : (
                  adapters.map(({ namespace, adapter }) => {
                    const priority = config.adapterPriorities.find((p) => p.namespace === namespace);
                    return (
                      <div key={namespace} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(adapter.status)}
                          <div>
                            <div className="font-medium">{adapter.metadata.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {namespace} • v{adapter.metadata.version}
                            </div>
                          </div>
                          <Badge variant={adapter.status === "active" ? "default" : "secondary"}>
                            {adapter.status}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">우선순위: {priority?.priority || 0}</span>
                          <Button size="sm" variant="outline" onClick={() => handlePriorityChange(namespace, "up")}>
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handlePriorityChange(namespace, "down")}>
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* MUI 어댑터 등록 */}
              <div className="mt-6 p-4 border rounded-lg bg-blue-50">
                <h4 className="font-medium mb-2">Material-UI 어댑터</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Google Material Design 컴포넌트를 추가하여 더 다양한 UI를 구성할 수 있습니다.
                </p>
                <Button onClick={handleMuiAdapterToggle} variant={muiRegistered ? "destructive" : "default"} size="sm">
                  {muiRegistered ? "MUI 어댑터 제거" : "MUI 어댑터 등록"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 충돌 관리 탭 */}
        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                컴포넌트 충돌
              </CardTitle>
              <CardDescription>
                동일한 이름의 컴포넌트가 여러 라이브러리에 존재할 때 발생하는 충돌을 관리합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 충돌 해결 설정 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>충돌 해결 전략</Label>
                  <Select value={resolutionStrategy} onValueChange={setResolutionStrategy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="priority">우선순위 기반</SelectItem>
                      <SelectItem value="namespace">네임스페이스 명시</SelectItem>
                      <SelectItem value="user-choice">사용자 선택</SelectItem>
                      <SelectItem value="fallback">폴백 체인</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    자동 충돌 해결
                    <Switch checked={autoResolveEnabled} onCheckedChange={toggleAutoResolve} />
                  </Label>
                  <p className="text-xs text-muted-foreground">충돌 발생 시 자동으로 해결 전략을 적용합니다.</p>
                </div>
              </div>

              {/* 충돌 목록 */}
              <div className="space-y-2">
                <h4 className="font-medium">감지된 충돌 ({conflictCount}개)</h4>
                {conflicts.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">충돌이 감지되지 않았습니다.</div>
                ) : (
                  conflicts.map((conflict) => (
                    <div key={conflict.componentType} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{conflict.componentType}</div>
                          <div className="text-sm text-muted-foreground">
                            {conflict.conflictingAdapters.length}개 라이브러리에서 충돌
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {conflict.resolvedAdapter ? (
                            <Badge variant="default">해결됨</Badge>
                          ) : (
                            <Badge variant="destructive">미해결</Badge>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {conflict.conflictingAdapters.map((adapter) => (
                          <Badge
                            key={adapter.namespace}
                            variant={adapter.adapter === conflict.resolvedAdapter ? "default" : "outline"}
                          >
                            {adapter.namespace} (우선순위: {adapter.priority})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 컴포넌트 탭 */}
        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                전체 컴포넌트
              </CardTitle>
              <CardDescription>모든 라이브러리의 컴포넌트를 네임스페이스별로 확인할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 검색 및 필터 */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="컴포넌트 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={selectedNamespace}
                  onValueChange={(value) => setSelectedNamespace(value as LibraryNamespace | "all")}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 네임스페이스</SelectItem>
                    {adapters.map(({ namespace }) => (
                      <SelectItem key={namespace} value={namespace}>
                        {namespace}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 컴포넌트 목록 */}
              <div className="space-y-2">
                {stats && <div className="text-sm text-muted-foreground">총 {stats.totalComponents}개 컴포넌트</div>}

                {Object.entries(stats?.componentsByNamespace || {}).map(([namespace, count]) => (
                  <div key={namespace} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{namespace}</Badge>
                      <span className="font-medium">{count}개 컴포넌트</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 설정 탭 */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                시스템 설정
              </CardTitle>
              <CardDescription>다중 라이브러리 시스템의 전역 설정을 관리합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>네임스페이스 표시</Label>
                    <p className="text-sm text-muted-foreground">컴포넌트 이름에 [namespace] 접두사를 표시합니다.</p>
                  </div>
                  <Switch checked={config.showNamespaces} onCheckedChange={toggleNamespaceDisplay} />
                </div>

                <div className="space-y-2">
                  <Label>폴백 체인</Label>
                  <p className="text-sm text-muted-foreground">
                    컴포넌트를 찾지 못했을 때 시도할 네임스페이스 순서입니다.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {config.fallbackChain.map((namespace, index) => (
                      <Badge key={namespace} variant="outline">
                        {index + 1}. {namespace}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 로딩 및 에러 상태 */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-2">처리 중...</p>
        </div>
      )}

      {error && (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <XCircle className="w-4 h-4" />
            <span className="font-medium">오류 발생</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{error.message}</p>
        </div>
      )}
    </div>
  );
}
