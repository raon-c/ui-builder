"use client";

// AIDEV-NOTE: 프로젝트 카드 컴포넌트 - 대시보드에서 개별 프로젝트 표시
// 프로젝트 정보, 호버 효과, 삭제 기능 포함

import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Edit,
  ExternalLink,
  MoreVertical,
  Palette,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from "@/types/project";

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onOpen?: (project: Project) => void;
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onOpen,
}: ProjectCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ko,
      });
    } catch {
      return "날짜 오류";
    }
  };

  const handleCardClick = () => {
    if (!isMenuOpen) {
      // 빌더로 직접 이동
      window.location.href = `/builder?id=${project.id}`;
    }
  };

  return (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-border/50 hover:border-border"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
              {project.name}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {project.screens.length}개 화면 • v{project.version}
            </CardDescription>
          </div>

          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setIsMenuOpen(true);
                }}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">프로젝트 메뉴</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link
                  href={`/builder?id=${project.id}`}
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                  }}
                >
                  <Palette className="mr-2 h-4 w-4" />
                  빌더에서 편집
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onOpen?.(project);
                  setIsMenuOpen(false);
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                프로젝트 열기
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onEdit?.(project);
                  setIsMenuOpen(false);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                이름 변경
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onDelete?.(project);
                  setIsMenuOpen(false);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* 프로젝트 통계 */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>디자인 시스템</span>
            <span className="capitalize">{project.settings.designLibrary}</span>
          </div>

          {/* 협업자 정보 */}
          {project.collaborators && project.collaborators.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>협업자</span>
              <span>{project.collaborators.length}명</span>
            </div>
          )}

          {/* 마지막 수정일 */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">마지막 수정</span>
            <span className="font-medium">{formatDate(project.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
