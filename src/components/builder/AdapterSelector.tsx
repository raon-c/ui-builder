"use client";

import { AlertCircle, CheckCircle, Layers, Loader2, Palette } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdapterManager } from "@/hooks/useAdapterManager";
import { useMultiLibrary } from "@/hooks/useMultiLibrary";

interface AdapterSelectorProps {
  /** 컴팩트 모드 (아이콘만 표시) */
  compact?: boolean;
  /** 클래스명 */
  className?: string;
}

/**
 * 어댑터 선택 컴포넌트
 */
export function AdapterSelector({ compact = false, className }: AdapterSelectorProps) {
  const { registrations, activeAdapterId, isLoading, error, setActiveAdapter } = useAdapterManager();
  const { adapters: multiLibraryAdapters, stats } = useMultiLibrary();

  const activeAdapter = registrations.find((reg) => reg.metadata.id === activeAdapterId);

  const handleAdapterSelect = async (adapterId: string) => {
    if (adapterId === activeAdapterId) return;

    try {
      await setActiveAdapter(adapterId);
    } catch (err) {
      console.error("어댑터 전환 실패:", err);
    }
  };

  const getStatusIcon = (adapterId: string) => {
    if (isLoading && adapterId === activeAdapterId) {
      return <Loader2 className="h-3 w-3 animate-spin" />;
    }
    if (adapterId === activeAdapterId) {
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    }
    return null;
  };

  const getStatusBadge = (registration: any) => {
    if (registration.isBuiltIn) {
      return (
        <Badge variant="secondary" className="text-xs">
          내장
        </Badge>
      );
    }
    if (registration.metadata.experimental) {
      return (
        <Badge variant="outline" className="text-xs">
          실험적
        </Badge>
      );
    }
    return null;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={compact ? "sm" : "default"} className={className} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Palette className="h-4 w-4" />
              {!compact && <span className="ml-2">{activeAdapter ? activeAdapter.metadata.name : "어댑터 선택"}</span>}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>디자인 라이브러리</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {registrations.length === 0 ? (
          <DropdownMenuItem disabled>
            <AlertCircle className="h-4 w-4 mr-2" />
            등록된 어댑터가 없습니다
          </DropdownMenuItem>
        ) : (
          registrations.map((registration) => (
            <DropdownMenuItem
              key={registration.metadata.id}
              onClick={() => handleAdapterSelect(registration.metadata.id)}
              className="flex items-center justify-between p-3 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(registration.metadata.id)}
                  <span className="text-lg">{registration.metadata.icon}</span>
                </div>

                <div className="flex-1">
                  <div className="font-medium">{registration.metadata.name}</div>
                  <div className="text-xs text-muted-foreground">
                    v{registration.metadata.version}
                    {registration.metadata.author && ` • ${registration.metadata.author}`}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{registration.metadata.description}</div>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-1">
                {getStatusBadge(registration)}
                {registration.metadata.tags && (
                  <div className="flex flex-wrap gap-1">
                    {registration.metadata.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </DropdownMenuItem>
          ))
        )}

        <DropdownMenuSeparator />
        <Link href="/multi-library">
          <DropdownMenuItem className="flex items-center justify-between p-3 cursor-pointer">
            <div className="flex items-center space-x-3">
              <Layers className="h-4 w-4" />
              <div>
                <div className="font-medium">다중 라이브러리 관리</div>
                <div className="text-xs text-muted-foreground">
                  {multiLibraryAdapters.length}개 어댑터 • {stats?.totalComponents || 0}개 컴포넌트
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              고급
            </Badge>
          </DropdownMenuItem>
        </Link>

        {error && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error.message}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * 어댑터 상태 표시 컴포넌트
 */
export function AdapterStatus() {
  const { activeAdapterId, registrations, isLoading, error } = useAdapterManager();

  const activeAdapter = registrations.find((reg) => reg.metadata.id === activeAdapterId);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>어댑터 로딩 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-sm text-destructive">
        <AlertCircle className="h-3 w-3" />
        <span>어댑터 오류</span>
      </div>
    );
  }

  if (!activeAdapter) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <AlertCircle className="h-3 w-3" />
        <span>어댑터 없음</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      <CheckCircle className="h-3 w-3 text-green-500" />
      <span className="text-lg">{activeAdapter.metadata.icon}</span>
      <span>{activeAdapter.metadata.name}</span>
      <Badge variant="secondary" className="text-xs">
        v{activeAdapter.metadata.version}
      </Badge>
    </div>
  );
}
