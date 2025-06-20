// AIDEV-NOTE: shadcn/ui 컴포넌트 매핑 - 실제 React 컴포넌트와 빌더 타입 연결
// 어댑터 패턴의 핵심 - 추상 타입을 실제 컴포넌트로 매핑

import { Button } from "@/components/ui/button";
import type { ComponentMetadata, ComponentWrapper } from "@/types/component";
import { BUTTON_STATES, BUTTON_VARIANTS } from "@/types/component";
import { buttonPropsSchema } from "./schema";

/**
 * Button 컴포넌트 메타데이터
 */
const buttonMetadata: ComponentMetadata = {
  type: "Button",
  displayName: "버튼",
  description: "사용자 액션을 위한 클릭 가능한 버튼 컴포넌트",
  category: "Basic",
  icon: "MousePointer", // Lucide React 아이콘
  defaultProps: {
    children: "버튼",
    variant: "default",
    size: "default",
    disabled: false,
    type: "button",
  },
  canHaveChildren: false, // 텍스트만 받음
  draggable: true,
  deletable: true,
};

/**
 * Button 컴포넌트 래퍼
 */
export const buttonWrapper: ComponentWrapper = {
  type: "Button",
  component: Button,
  metadata: buttonMetadata,
  propsSchema: buttonPropsSchema,
  variants: BUTTON_VARIANTS,
  states: BUTTON_STATES,
};

/**
 * shadcn/ui 컴포넌트 매핑
 * 새로운 컴포넌트 추가 시 이 객체에 추가
 */
export const shadcnComponents = {
  Button: buttonWrapper,
  // TODO: 추후 추가할 컴포넌트들
  // Input: inputWrapper,
  // Card: cardWrapper,
  // Modal: modalWrapper,
} as const;

/**
 * 등록된 모든 컴포넌트 래퍼 배열
 */
export const allShadcnComponents = Object.values(shadcnComponents);
