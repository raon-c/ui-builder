"use client";

// AIDEV-NOTE: 프로젝트 생성 모달 컴포넌트 - 새 프로젝트 생성 폼
// 이름 입력, 유효성 검사, 에러 처리 포함

import { Loader2, Plus } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateProjectModalProps {
  onCreateProject: (name: string, description?: string) => Promise<void>;
  isLoading?: boolean;
}

export function CreateProjectModal({ onCreateProject, isLoading = false }: CreateProjectModalProps) {
  const nameId = useId();
  const descriptionId = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!name.trim()) {
      setError("프로젝트 이름을 입력해주세요.");
      return;
    }

    if (name.trim().length < 2) {
      setError("프로젝트 이름은 2자 이상이어야 합니다.");
      return;
    }

    if (name.trim().length > 50) {
      setError("프로젝트 이름은 50자 이하여야 합니다.");
      return;
    }

    try {
      setError("");
      await onCreateProject(name.trim(), description.trim() || undefined);

      // 성공 시 모달 닫기 및 폼 초기화
      setOpen(false);
      setName("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "프로젝트 생성에 실패했습니다.");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen);
      if (!newOpen) {
        // 모달 닫을 때 폼 초기화
        setName("");
        setDescription("");
        setError("");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />새 프로젝트
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>새 프로젝트 만들기</DialogTitle>
            <DialogDescription>새로운 UI 프로젝트를 시작하세요. 언제든지 설정을 변경할 수 있습니다.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor={nameId}>프로젝트 이름 *</Label>
              <Input
                id={nameId}
                placeholder="예: 모바일 앱 프로토타입"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                maxLength={50}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={descriptionId}>설명 (선택)</Label>
              <Textarea
                id={descriptionId}
                placeholder="프로젝트에 대한 간단한 설명을 입력하세요..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">{description.length}/200자</p>
            </div>

            {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "생성 중..." : "프로젝트 생성"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
