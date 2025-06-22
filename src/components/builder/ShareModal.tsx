"use client";

import { useEffect, useId, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProjectStore } from "@/store/projectStore";
import type { Project } from "@/types/project";

interface ShareModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

// 만료 시간 옵션
const EXPIRY_OPTIONS = [
  { value: "7", label: "7일" },
  { value: "30", label: "30일" },
  { value: "90", label: "90일" },
  { value: "never", label: "무제한" },
];

export function ShareModal({ project, isOpen, onClose }: ShareModalProps) {
  const { updateProject } = useProjectStore();
  const [shareLink, setShareLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expiryDays, setExpiryDays] = useState("30");
  const shareLinkId = useId();

  // 공유 링크 생성
  const handleGenerateLink = async () => {
    setIsGenerating(true);

    try {
      // 7자리 랜덤 문자열 생성 (shareSlug)
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let slug = "";
      for (let i = 0; i < 7; i++) {
        slug += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      // 만료 시간 계산
      let expiresAt: string | undefined;
      if (expiryDays !== "never") {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + parseInt(expiryDays));
        expiresAt = expiryDate.toISOString();
      }

      // 프로젝트에 shareSlug, 만료 시간, 공유 시점 버전 저장
      await updateProject(project.id, {
        settings: {
          ...project.settings,
          shareSlug: slug,
          shareExpiresAt: expiresAt,
          shareVersion: project.version,
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
  useEffect(() => {
    if (project.settings.shareSlug) {
      const baseUrl = window.location.origin;
      setShareLink(`${baseUrl}/viewer/${project.settings.shareSlug}`);
    }
  }, [project.settings.shareSlug]);

  // 만료 시간 표시
  const getExpiryText = () => {
    if (!project.settings.shareExpiresAt) return null;

    const expiryDate = new Date(project.settings.shareExpiresAt);
    const now = new Date();

    if (expiryDate < now) {
      return "만료됨";
    }

    const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return `${daysLeft}일 남음`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>프로젝트 공유</DialogTitle>
          <DialogDescription>읽기 전용 링크를 생성하여 팀원들과 프로젝트를 공유할 수 있습니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>프로젝트 이름</Label>
            <div className="text-sm text-muted-foreground">{project.name}</div>
          </div>

          {!shareLink && (
            <div className="space-y-2">
              <Label htmlFor="expiry">만료 기간</Label>
              <Select value={expiryDays} onValueChange={setExpiryDays}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPIRY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
                <Button variant="outline" onClick={handleCopyLink} disabled={!shareLink}>
                  {isCopied ? "복사됨!" : "복사"}
                </Button>
              )}
            </div>
            {shareLink && project.settings.shareExpiresAt && (
              <p className="text-xs text-muted-foreground">만료: {getExpiryText()}</p>
            )}
          </div>

          {!shareLink && (
            <Button onClick={handleGenerateLink} disabled={isGenerating} className="w-full">
              {isGenerating ? "생성 중..." : "읽기 전용 링크 생성"}
            </Button>
          )}

          {shareLink && (
            <div className="rounded-lg bg-muted p-3 space-y-2">
              <p className="text-sm text-muted-foreground">
                💡 이 링크로 접속한 사용자는 프로젝트를 볼 수만 있고 편집할 수 없습니다.
              </p>
              {project.settings.shareVersion && (
                <p className="text-xs text-muted-foreground">공유 버전: {project.settings.shareVersion}</p>
              )}
            </div>
          )}

          {shareLink && (
            <div className="pt-2 border-t">
              <Button variant="destructive" size="sm" className="w-full" onClick={handleGenerateLink}>
                새로운 링크 생성 (기존 링크는 무효화됩니다)
              </Button>
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
