// AIDEV-NOTE: PRD 표준 Variant & State 정의
// PRD.md §4의 "컴포넌트 Variant & State 표준" 테이블 반영

import type { ComponentState, StyleVariant } from "./component-base";

/**
 * Button 컴포넌트 표준 변형
 */
export const BUTTON_VARIANTS: StyleVariant[] = [
  {
    name: "variant",
    label: "버튼 스타일",
    defaultValue: "primary",
    options: [
      { label: "Primary", value: "primary" },
      { label: "Secondary", value: "secondary" },
      { label: "Ghost", value: "ghost" },
    ],
  },
  {
    name: "size",
    label: "크기",
    defaultValue: "md",
    options: [
      { label: "Small", value: "sm" },
      { label: "Medium", value: "md" },
      { label: "Large", value: "lg" },
    ],
  },
];

/**
 * Button 컴포넌트 표준 상태
 */
export const BUTTON_STATES: ComponentState[] = [
  {
    name: "hover",
    label: "호버 상태",
    type: "boolean",
    defaultValue: false,
    description: "마우스 오버 시 상태",
  },
  {
    name: "active",
    label: "활성 상태",
    type: "boolean",
    defaultValue: false,
    description: "클릭 시 상태",
  },
  {
    name: "disabled",
    label: "비활성화",
    type: "boolean",
    defaultValue: false,
    description: "버튼 비활성화 상태",
  },
  {
    name: "loading",
    label: "로딩 상태",
    type: "boolean",
    defaultValue: false,
    description: "로딩 중 상태",
  },
];

/**
 * Input/Textarea 컴포넌트 표준 변형
 */
export const INPUT_VARIANTS: StyleVariant[] = [
  {
    name: "size",
    label: "크기",
    defaultValue: "md",
    options: [
      { label: "Small", value: "sm" },
      { label: "Medium", value: "md" },
      { label: "Large", value: "lg" },
    ],
  },
];

/**
 * Input/Textarea 컴포넌트 표준 상태
 */
export const INPUT_STATES: ComponentState[] = [
  {
    name: "focus",
    label: "포커스 상태",
    type: "boolean",
    defaultValue: false,
    description: "입력 필드 포커스 상태",
  },
  {
    name: "disabled",
    label: "비활성화",
    type: "boolean",
    defaultValue: false,
    description: "입력 필드 비활성화 상태",
  },
  {
    name: "error",
    label: "오류 상태",
    type: "boolean",
    defaultValue: false,
    description: "유효성 검사 오류 상태",
  },
];
