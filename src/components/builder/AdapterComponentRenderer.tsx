"use client";

// AIDEV-NOTE: 어댑터 기반 컴포넌트 렌더러 - 현재 활성 라이브러리의 컴포넌트를 동적으로 렌더링
// 하드코딩된 렌더링 대신 컴포넌트 레지스트리와 다중 라이브러리 시스템 활용

import { useMemo } from "react";
import { multiLibraryManager } from "@/lib/adapters/MultiLibraryManager";
import { getComponentRegistry } from "@/lib/component-registry";
import { useBuilderStore } from "@/store/builderStore";
import type { ComponentWrapper } from "@/types/component";
import type { CanvasNode } from "@/types/project";

interface AdapterComponentRendererProps {
  node: CanvasNode;
  isPreview?: boolean;
  children?: React.ReactNode;
}

/**
 * 어댑터 기반 컴포넌트 렌더러
 * 현재 활성 라이브러리에 따라 적절한 컴포넌트를 동적으로 렌더링
 */
export function AdapterComponentRenderer({ node, isPreview = false, children }: AdapterComponentRendererProps) {
  const { activeLibrary } = useBuilderStore();

  // 현재 활성 라이브러리에 맞는 컴포넌트 래퍼 찾기
  const componentWrapper = useMemo(() => {
    const registry = getComponentRegistry();

    // 1. 네임스페이스가 포함된 컴포넌트 타입으로 먼저 찾기
    const namespacedType = `${activeLibrary}:${node.type}` as any;
    let wrapper = registry.get(namespacedType);

    // 2. 네임스페이스 없는 기본 타입으로 찾기 (fallback)
    if (!wrapper) {
      wrapper = registry.get(node.type);
    }

    return wrapper;
  }, [activeLibrary, node.type]);

  // 컴포넌트 렌더링
  const renderComponent = () => {
    if (!componentWrapper) {
      return renderFallbackComponent();
    }

    try {
      const Component = componentWrapper.component;
      const props = { ...node.props };

      // 컨테이너 타입 컴포넌트인 경우 children 처리
      if (componentWrapper.metadata.isContainer && children) {
        return <Component {...props}>{children}</Component>;
      }

      return <Component {...props} />;
    } catch (error) {
      console.error(`Error rendering component ${node.type}:`, error);
      return renderFallbackComponent();
    }
  };

  // 폴백 컴포넌트 렌더링 (어댑터에서 컴포넌트를 찾을 수 없을 때)
  const renderFallbackComponent = () => {
    return (
      <div className="p-2 border border-gray-300 rounded bg-gray-50">
        <div className="text-xs text-gray-500 mb-1">
          [{activeLibrary}] {node.type}
        </div>
        <div className="text-sm text-gray-600">{node.type} 컴포넌트를 찾을 수 없습니다</div>
        {children && <div className="mt-2">{children}</div>}
      </div>
    );
  };

  return <div className="adapter-component-wrapper">{renderComponent()}</div>;
}

/**
 * 어댑터 기반 컨테이너 렌더러
 * 자식 노드들을 포함하여 컨테이너 컴포넌트를 렌더링
 */
export function AdapterContainerRenderer({
  node,
  isPreview = false,
  renderChildren,
}: AdapterComponentRendererProps & {
  renderChildren: () => React.ReactNode;
}) {
  const childrenContent = renderChildren();

  return (
    <AdapterComponentRenderer node={node} isPreview={isPreview}>
      {childrenContent}
    </AdapterComponentRenderer>
  );
}

/**
 * 디버그 정보 표시 (개발 모드)
 */
export function ComponentDebugInfo({ node }: { node: CanvasNode }) {
  const { activeLibrary } = useBuilderStore();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="absolute top-0 left-0 bg-black text-white text-xs px-1 py-0.5 rounded opacity-75 z-10">
      {activeLibrary}:{node.type}
    </div>
  );
}
