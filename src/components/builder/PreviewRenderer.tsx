"use client";

import { isContainerComponent } from "@/lib/utils";
import type { CanvasNode } from "@/types/project";
import { AdapterComponentRenderer } from "./AdapterComponentRenderer";

interface PreviewRendererProps {
  node: CanvasNode;
  isRoot?: boolean;
}

export function PreviewRenderer({ node, isRoot = false }: PreviewRendererProps) {
  if (isContainerComponent(node.type)) {
    return (
      <AdapterComponentRenderer node={node} isPreview={true}>
        {node.children.map((child) => (
          <PreviewRenderer key={child.id} node={child} />
        ))}
      </AdapterComponentRenderer>
    );
  }

  return <AdapterComponentRenderer node={node} isPreview={true} />;
}
