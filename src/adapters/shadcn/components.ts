"use client";

// AIDEV-NOTE: shadcn/ui 컴포넌트 매핑 - 실제 React 컴포넌트와 빌더 타입 연결
// 어댑터 패턴의 핵심 - 추상 타입을 실제 컴포넌트로 매핑

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ComponentMetadata, ComponentWrapper } from "@/types/component";
import {
  BUTTON_STATES,
  BUTTON_VARIANTS,
  INPUT_STATES,
  INPUT_VARIANTS,
} from "@/types/component";
import {
  avatarPropsSchema,
  badgePropsSchema,
  buttonPropsSchema,
  checkboxPropsSchema,
  inputPropsSchema,
  labelPropsSchema,
  switchPropsSchema,
} from "./schema";

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
 * Input 컴포넌트 메타데이터
 */
const inputMetadata: ComponentMetadata = {
  type: "Input",
  displayName: "입력 필드",
  description: "사용자 텍스트 입력을 위한 폼 컴포넌트",
  category: "Form",
  icon: "Type",
  defaultProps: {
    type: "text",
    placeholder: "텍스트를 입력하세요",
    disabled: false,
    readOnly: false,
    required: false,
    value: "",
  },
  canHaveChildren: false,
  draggable: true,
  deletable: true,
};

/**
 * Badge 컴포넌트 메타데이터
 */
const badgeMetadata: ComponentMetadata = {
  type: "Badge",
  displayName: "뱃지",
  description: "상태나 카테고리를 표시하는 작은 라벨",
  category: "DataDisplay",
  icon: "Tag",
  defaultProps: {
    children: "뱃지",
    variant: "default",
    asChild: false,
  },
  canHaveChildren: false,
  draggable: true,
  deletable: true,
};

/**
 * Checkbox 컴포넌트 메타데이터
 */
const checkboxMetadata: ComponentMetadata = {
  type: "Checkbox",
  displayName: "체크박스",
  description: "다중 선택을 위한 체크박스 컴포넌트",
  category: "Form",
  icon: "CheckSquare",
  defaultProps: {
    checked: false,
    disabled: false,
    required: false,
  },
  canHaveChildren: false,
  draggable: true,
  deletable: true,
};

/**
 * Switch 컴포넌트 메타데이터
 */
const switchMetadata: ComponentMetadata = {
  type: "Switch",
  displayName: "스위치",
  description: "On/Off 토글을 위한 스위치 컴포넌트",
  category: "Form",
  icon: "ToggleLeft",
  defaultProps: {
    checked: false,
    disabled: false,
  },
  canHaveChildren: false,
  draggable: true,
  deletable: true,
};

/**
 * Avatar 컴포넌트 메타데이터
 */
const avatarMetadata: ComponentMetadata = {
  type: "Avatar",
  displayName: "아바타",
  description: "사용자 프로필 이미지를 표시하는 컴포넌트",
  category: "DataDisplay",
  icon: "User",
  defaultProps: {
    className: "",
  },
  canHaveChildren: true, // AvatarImage, AvatarFallback를 포함
  draggable: true,
  deletable: true,
};

/**
 * Label 컴포넌트 메타데이터
 */
const labelMetadata: ComponentMetadata = {
  type: "Label",
  displayName: "라벨",
  description: "폼 요소에 대한 라벨 텍스트",
  category: "Form",
  icon: "FileText",
  defaultProps: {
    children: "라벨",
    htmlFor: "",
  },
  canHaveChildren: false,
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
 * Input 컴포넌트 래퍼
 */
export const inputWrapper: ComponentWrapper = {
  type: "Input",
  component: Input,
  metadata: inputMetadata,
  propsSchema: inputPropsSchema,
  variants: INPUT_VARIANTS,
  states: INPUT_STATES,
};

/**
 * Badge 컴포넌트 래퍼
 */
export const badgeWrapper: ComponentWrapper = {
  type: "Badge",
  component: Badge,
  metadata: badgeMetadata,
  propsSchema: badgePropsSchema,
};

/**
 * Checkbox 컴포넌트 래퍼
 */
export const checkboxWrapper: ComponentWrapper = {
  type: "Checkbox",
  component: Checkbox,
  metadata: checkboxMetadata,
  propsSchema: checkboxPropsSchema,
};

/**
 * Switch 컴포넌트 래퍼
 */
export const switchWrapper: ComponentWrapper = {
  type: "Switch",
  component: Switch,
  metadata: switchMetadata,
  propsSchema: switchPropsSchema,
};

/**
 * Avatar 컴포넌트 래퍼
 */
export const avatarWrapper: ComponentWrapper = {
  type: "Avatar",
  component: Avatar,
  metadata: avatarMetadata,
  propsSchema: avatarPropsSchema,
};

/**
 * Label 컴포넌트 래퍼
 */
export const labelWrapper: ComponentWrapper = {
  type: "Label",
  component: Label,
  metadata: labelMetadata,
  propsSchema: labelPropsSchema,
};

/**
 * shadcn/ui 컴포넌트 매핑
 * 새로운 컴포넌트 추가 시 이 객체에 추가
 */
export const shadcnComponents = {
  Button: buttonWrapper,
  Input: inputWrapper,
  Badge: badgeWrapper,
  Checkbox: checkboxWrapper,
  Switch: switchWrapper,
  Avatar: avatarWrapper,
  Label: labelWrapper,
  // TODO: 추후 추가할 컴포넌트들
  // Card: cardWrapper,
  // Select: selectWrapper,
  // Modal: modalWrapper,
} as const;

/**
 * 등록된 모든 컴포넌트 래퍼 배열
 */
export const allShadcnComponents = Object.values(shadcnComponents);
