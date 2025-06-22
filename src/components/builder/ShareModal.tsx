"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProjectStore } from "@/store/projectStore";
import type { Project } from "@/types/project";

interface ShareModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ project, isOpen, onClose }: ShareModalProps) {
  const { updateProject } = useProjectStore();
  const [shareLink, setShareLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const shareLinkId = useId();

  // 공유 링크 생성
  const handleGenerateLink = async () => {
    setIsGenerating(true);

    try {
      // 7자리 랜덤 문자열 생성 (shareSlug)
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let slug = "";
      for (let i = 0; i < 7; i++) {
        slug += characters.charAt(
          Math.floor(Math.random() * characters.length),
        );
      }

      // 프로젝트에 shareSlug 저장
      const updatedProject = {
        ...project,
        settings: {
          ...project.settings,
          shareSlug: slug,
        },
        updatedAt: new Date().toISOString(),
      };

      updateProject(project.id, {
        settings: {
          ...project.settings,
          shareSlug: slug,
        },
        updatedAt: new Date().toISOString(),
      });

      // 공유 링크 생성
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/viewer/${slug}`;
      setShareLink(link);
    } catch (error) {
      console.error("Failed to generate share link:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 링크 복사
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  // 모달이 열릴 때 기존 shareSlug가 있으면 링크 표시
  useState(() => {
    if (project.settings.shareSlug) {
      const baseUrl = window.location.origin;
      setShareLink(`${baseUrl}/viewer/${project.settings.shareSlug}`);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>프로젝트 공유</DialogTitle>
          <DialogDescription>
            읽기 전용 링크를 생성하여 팀원들과 프로젝트를 공유할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>프로젝트 이름</Label>
            <div className="text-sm text-muted-foreground">{project.name}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={shareLinkId}>공유 링크</Label>
            <div className="flex gap-2">
              <Input
                id={shareLinkId}
                value={shareLink}
                readOnly
                placeholder="링크를 생성하려면 버튼을 클릭하세요"
                className="flex-1"
              />
              {shareLink && (
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  disabled={!shareLink}
                >
                  {isCopied ? "복사됨!" : "복사"}
                </Button>
              )}
            </div>
          </div>

          {!shareLink && (
            <Button
              onClick={handleGenerateLink}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? "생성 중..." : "읽기 전용 링크 생성"}
            </Button>
          )}

          {shareLink && (
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                💡 이 링크로 접속한 사용자는 프로젝트를 볼 수만 있고 편집할 수
                없습니다.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
