"use client";

// AIDEV-NOTE: 드롭될 위치를 시각적으로 표시하는 인디케이터 컴포넌트
// 드래그 중일 때 드롭 가능한 위치에 파란색 라인으로 표시

interface DropIndicatorProps {
  isVisible: boolean;
  position: "top" | "bottom" | "inside";
}

export function DropIndicator({ isVisible, position }: DropIndicatorProps) {
  if (!isVisible) return null;

  const getPositionClasses = () => {
    switch (position) {
      case "top":
        return "absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-20";
      case "bottom":
        return "absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-20";
      case "inside":
        return "absolute inset-0 border-2 border-blue-500 border-dashed bg-blue-50/20 rounded-md z-10";
      default:
        return "";
    }
  };

  return (
    <div className={getPositionClasses()}>
      {position === "inside" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            여기에 드롭
          </div>
        </div>
      )}
    </div>
  );
}
