"use client";

// AIDEV-NOTE: 커스텀 컴포넌트 페이지 - 커스텀 컴포넌트 관리 전용 페이지
// 컴포넌트 목록, 등록, 수정, 삭제 기능 제공

import { useRouter } from "next/navigation";
import { CustomComponentManagerUI } from "@/components/custom/CustomComponentManager";

export default function CustomComponentsPage() {
  const router = useRouter();

  const handleSelectComponent = (componentId: string) => {
    // 빌더로 이동하여 컴포넌트 사용
    router.push(`/builder?customComponent=${componentId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <CustomComponentManagerUI onSelectComponent={handleSelectComponent} />
    </div>
  );
}
 