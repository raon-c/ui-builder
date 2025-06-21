import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { BuilderComponentType } from "@/types/component";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 컴포넌트가 자식을 가질 수 있는 컨테이너 타입인지 확인
 */
export function isContainerComponent(
  componentType: BuilderComponentType | string,
): boolean {
  const containerTypes: BuilderComponentType[] = [
    // Layout containers
    "Container",
    "Card",
    "Grid",
    "Flex",
    "Modal",
    "Drawer",
    "Tabs",
  ];

  return containerTypes.includes(componentType as BuilderComponentType);
}

/**
 * 두 노드가 형제 관계인지 확인
 */
export function areSiblings(
  nodeId1: string,
  nodeId2: string,
  rootNode: any,
): boolean {
  // 노드의 부모를 찾는 함수
  function findParent(root: any, targetId: string): any {
    if (root.children) {
      for (const child of root.children) {
        if (child.id === targetId) {
          return root;
        }
        const found = findParent(child, targetId);
        if (found) return found;
      }
    }
    return null;
  }

  const parent1 = findParent(rootNode, nodeId1);
  const parent2 = findParent(rootNode, nodeId2);

  return parent1 && parent2 && parent1.id === parent2.id;
}
