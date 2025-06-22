"use client";

// AIDEV-NOTE: 라이브러리 선택기 - 빌더에서 사용할 디자인 라이브러리 선택
// 간단한 버전으로 구현

import { Layers } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LibrarySelectorProps {
  onLibraryChange?: (library: string) => void;
  className?: string;
}

export function LibrarySelector({ onLibraryChange, className }: LibrarySelectorProps) {
  const [selectedLibrary, setSelectedLibrary] = useState<string>("shadcn");

  const handleLibraryChange = (value: string) => {
    setSelectedLibrary(value);
    onLibraryChange?.(value);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm flex items-center gap-2">
        <Layers className="w-4 h-4" />
        디자인 라이브러리
      </Label>
      <Select value={selectedLibrary} onValueChange={handleLibraryChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="shadcn">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎨</span>
              <span>Shadcn UI</span>
            </div>
          </SelectItem>
          <SelectItem value="mui">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔷</span>
              <span>Material UI</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      <div className="text-xs text-muted-foreground">현재 선택된 라이브러리: {selectedLibrary}</div>
    </div>
  );
}
