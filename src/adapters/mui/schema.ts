// AIDEV-NOTE: Material-UI 컴포넌트 스키마 정의
// MUI 컴포넌트들의 props를 Zod 스키마로 정의하여 동적 속성 편집 지원

import { z } from "zod";

/**
 * MUI 공통 색상 옵션
 */
export const muiColorSchema = z.enum(["primary", "secondary", "error", "warning", "info", "success"]);

/**
 * MUI 공통 크기 옵션 (TextField, Switch, Select는 large 미지원)
 */
export const muiSizeSchema = z.enum(["small", "medium"]);
export const muiSizeSchemaWithLarge = z.enum(["small", "medium", "large"]);

/**
 * MUI Button 스키마
 */
export const muiButtonSchema = z.object({
  children: z.string().default("Button"),
  variant: z.enum(["text", "outlined", "contained"]).default("contained"),
  color: muiColorSchema.default("primary"),
  size: muiSizeSchemaWithLarge.default("medium"),
  disabled: z.boolean().default(false),
  fullWidth: z.boolean().default(false),
  startIcon: z.string().optional(),
  endIcon: z.string().optional(),
  href: z.string().optional(),
  onClick: z.string().optional(),
});

/**
 * MUI TextField 스키마
 */
export const muiTextFieldSchema = z.object({
  label: z.string().default("Label"),
  placeholder: z.string().default("Enter text..."),
  variant: z.enum(["outlined", "filled", "standard"]).default("outlined"),
  size: muiSizeSchema.default("medium"),
  fullWidth: z.boolean().default(false),
  required: z.boolean().default(false),
  disabled: z.boolean().default(false),
  error: z.boolean().default(false),
  helperText: z.string().optional(),
  type: z.enum(["text", "password", "email", "number", "tel", "url"]).default("text"),
  multiline: z.boolean().default(false),
  rows: z.number().min(1).max(10).default(4),
  maxRows: z.number().min(1).max(20).optional(),
});

/**
 * MUI Card 스키마
 */
export const muiCardSchema = z.object({
  elevation: z.number().min(0).max(24).default(1),
  variant: z.enum(["elevation", "outlined"]).default("elevation"),
  raised: z.boolean().default(false),
});

/**
 * MUI CardContent 스키마
 */
export const muiCardContentSchema = z.object({
  children: z.string().default("Card content goes here..."),
});

/**
 * MUI CardActions 스키마
 */
export const muiCardActionsSchema = z.object({
  disableSpacing: z.boolean().default(false),
});

/**
 * MUI Typography 스키마
 */
export const muiTypographySchema = z.object({
  children: z.string().default("Typography"),
  variant: z
    .enum(["h1", "h2", "h3", "h4", "h5", "h6", "subtitle1", "subtitle2", "body1", "body2", "caption", "overline"])
    .default("body1"),
  color: z
    .enum(["primary", "secondary", "textPrimary", "textSecondary", "error", "warning", "info", "success"])
    .default("textPrimary"),
  align: z.enum(["left", "center", "right", "justify"]).default("left"),
  gutterBottom: z.boolean().default(false),
  noWrap: z.boolean().default(false),
});

/**
 * MUI Checkbox 스키마
 */
export const muiCheckboxSchema = z.object({
  checked: z.boolean().default(false),
  color: muiColorSchema.default("primary"),
  size: muiSizeSchema.default("medium"),
  disabled: z.boolean().default(false),
  indeterminate: z.boolean().default(false),
  required: z.boolean().default(false),
});

/**
 * MUI Switch 스키마
 */
export const muiSwitchSchema = z.object({
  checked: z.boolean().default(false),
  color: muiColorSchema.default("primary"),
  size: muiSizeSchema.default("medium"),
  disabled: z.boolean().default(false),
  required: z.boolean().default(false),
});

/**
 * MUI Select 스키마
 */
export const muiSelectSchema = z.object({
  value: z.string().default(""),
  label: z.string().default("Select"),
  variant: z.enum(["outlined", "filled", "standard"]).default("outlined"),
  size: muiSizeSchema.default("medium"),
  fullWidth: z.boolean().default(false),
  disabled: z.boolean().default(false),
  required: z.boolean().default(false),
  multiple: z.boolean().default(false),
  options: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    )
    .default([
      { value: "option1", label: "Option 1" },
      { value: "option2", label: "Option 2" },
      { value: "option3", label: "Option 3" },
    ]),
});

/**
 * MUI Chip 스키마
 */
export const muiChipSchema = z.object({
  label: z.string().default("Chip"),
  variant: z.enum(["filled", "outlined"]).default("filled"),
  color: muiColorSchema.default("primary"),
  size: muiSizeSchema.default("medium"),
  disabled: z.boolean().default(false),
  clickable: z.boolean().default(false),
  deletable: z.boolean().default(false),
  icon: z.string().optional(),
  avatar: z.string().optional(),
});

/**
 * MUI Avatar 스키마
 */
export const muiAvatarSchema = z.object({
  alt: z.string().default("Avatar"),
  src: z.string().optional(),
  children: z.string().default("A"),
  variant: z.enum(["circular", "rounded", "square"]).default("circular"),
  size: z.enum(["small", "medium", "large"]).default("medium"),
});

/**
 * MUI Badge 스키마
 */
export const muiBadgeSchema = z.object({
  badgeContent: z.string().default("4"),
  color: muiColorSchema.default("primary"),
  variant: z.enum(["standard", "dot"]).default("standard"),
  overlap: z.enum(["rectangular", "circular"]).default("rectangular"),
  anchorOrigin: z
    .object({
      vertical: z.enum(["top", "bottom"]).default("top"),
      horizontal: z.enum(["left", "right"]).default("right"),
    })
    .default({ vertical: "top", horizontal: "right" }),
  invisible: z.boolean().default(false),
  showZero: z.boolean().default(false),
  max: z.number().min(1).default(99),
});

/**
 * MUI Paper 스키마
 */
export const muiPaperSchema = z.object({
  elevation: z.number().min(0).max(24).default(1),
  variant: z.enum(["elevation", "outlined"]).default("elevation"),
  square: z.boolean().default(false),
  children: z.string().default("Paper content"),
});

/**
 * MUI Container 스키마
 */
export const muiContainerSchema = z.object({
  maxWidth: z.enum(["xs", "sm", "md", "lg", "xl", "none"]).default("lg"),
  fixed: z.boolean().default(false),
  disableGutters: z.boolean().default(false),
  children: z.string().default("Container content"),
});

/**
 * MUI Box 스키마
 */
export const muiBoxSchema = z.object({
  component: z.string().default("div"),
  children: z.string().default("Box content"),
  sx: z.record(z.any()).optional(),
});

/**
 * 모든 MUI 스키마 내보내기
 */
export const muiSchemas = {
  Button: muiButtonSchema,
  TextField: muiTextFieldSchema,
  Card: muiCardSchema,
  CardContent: muiCardContentSchema,
  CardActions: muiCardActionsSchema,
  Typography: muiTypographySchema,
  Checkbox: muiCheckboxSchema,
  Switch: muiSwitchSchema,
  Select: muiSelectSchema,
  Chip: muiChipSchema,
  Avatar: muiAvatarSchema,
  Badge: muiBadgeSchema,
  Paper: muiPaperSchema,
  Container: muiContainerSchema,
  Box: muiBoxSchema,
} as const;

export type MuiComponentType = keyof typeof muiSchemas; 