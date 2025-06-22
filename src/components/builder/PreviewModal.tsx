"use client";

// AIDEV-NOTE: 전체 화면 미리보기 모달 - 반응형 디바이스 시뮬레이션 포함
// 데스크톱, 태블릿, 모바일 뷰포트 전환 기능

import { Monitor, Smartphone, Tablet, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Screen } from "@/types/project";
import { PreviewRenderer } from "./PreviewRenderer";

interface PreviewModalProps {
  screen: Screen | null;
  isOpen: boolean;
  onClose: () => void;
}

type DeviceType = "desktop" | "tablet" | "mobile";

const DEVICE_SIZES = {
  desktop: { width: "100%", height: "100%" },
  tablet: { width: "768px", height: "1024px" },
  mobile: { width: "375px", height: "667px" },
};

const DEVICE_ICONS = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};

export function PreviewModal({ screen, isOpen, onClose }: PreviewModalProps) {
  const [deviceType, setDeviceType] = useState<DeviceType>("desktop");

  if (!isOpen || !screen) return null;

  const deviceSize = DEVICE_SIZES[deviceType];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full h-full flex flex-col">
        {/* 미리보기 헤더 */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">미리보기: {screen.name}</h2>

            {/* 디바이스 선택 버튼들 */}
            <div className="flex items-center gap-1 border rounded-lg p-1">
              {(Object.keys(DEVICE_SIZES) as DeviceType[]).map((device) => {
                const Icon = DEVICE_ICONS[device];
                return (
                  <Button
                    key={device}
                    variant={deviceType === device ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setDeviceType(device)}
                    className="h-8 w-8 p-0"
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>

            {/* 현재 디바이스 크기 표시 */}
            <span className="text-sm text-gray-500">
              {deviceType === "desktop"
                ? "데스크톱"
                : deviceType === "tablet"
                  ? "태블릿 (768×1024)"
                  : "모바일 (375×667)"}
            </span>
          </div>

          {/* 닫기 버튼 */}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 미리보기 콘텐츠 */}
        <div className="flex-1 p-4 bg-gray-100 overflow-auto">
          <div className="flex items-center justify-center min-h-full">
            <div
              className="bg-white shadow-lg rounded-lg overflow-hidden"
              style={{
                width: deviceSize.width,
                height: deviceSize.height,
                maxWidth: "100%",
                maxHeight: "100%",
              }}
            >
              {/* 디바이스 프레임 (모바일/태블릿인 경우) */}
              {deviceType !== "desktop" && (
                <div className="bg-gray-800 px-4 py-2 text-center">
                  <div className="w-12 h-1 bg-gray-600 rounded-full mx-auto"></div>
                </div>
              )}

              {/* 실제 콘텐츠 */}
              <div className="h-full overflow-auto p-4">
                {screen.content ? (
                  <PreviewRenderer node={screen.content} isRoot={true} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-4">📱</div>
                      <div className="text-lg font-medium">빈 화면</div>
                      <div className="text-sm">컴포넌트를 추가해보세요</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 미리보기 푸터 */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-500">실제 사용자가 보는 화면입니다. 편집하려면 미리보기를 닫아주세요.</div>
          <Button onClick={onClose}>편집 모드로 돌아가기</Button>
        </div>
      </div>
    </div>
  );
}
