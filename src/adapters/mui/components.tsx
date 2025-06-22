"use client";

// AIDEV-NOTE: Material-UI 컴포넌트 래퍼들
// MUI 컴포넌트들을 빌더에서 사용할 수 있도록 래핑

import {
  FormControl,
  InputLabel,
  MenuItem,
  Avatar as MuiAvatar,
  Badge as MuiBadge,
  Box as MuiBox,
  Button as MuiButton,
  Card as MuiCard,
  CardActions as MuiCardActions,
  CardContent as MuiCardContent,
  Checkbox as MuiCheckbox,
  Chip as MuiChip,
  Container as MuiContainer,
  Paper as MuiPaper,
  Select as MuiSelect,
  Switch as MuiSwitch,
  TextField as MuiTextField,
  Typography as MuiTypography,
} from "@mui/material";
import type React from "react";
import type { z } from "zod";
import type {
  muiAvatarSchema,
  muiBadgeSchema,
  muiBoxSchema,
  muiButtonSchema,
  muiCardActionsSchema,
  muiCardContentSchema,
  muiCardSchema,
  muiCheckboxSchema,
  muiChipSchema,
  muiContainerSchema,
  muiPaperSchema,
  muiSelectSchema,
  muiSwitchSchema,
  muiTextFieldSchema,
  muiTypographySchema,
} from "./schema";

// MUI Button 래퍼
export function Button(props: z.infer<typeof muiButtonSchema>) {
  const { children, onClick, ...muiProps } = props;

  const handleClick = onClick
    ? () => {
        console.log("Button clicked:", onClick);
        // 실제 프로덕션에서는 이벤트 시스템으로 처리
      }
    : undefined;

  return (
    <MuiButton {...muiProps} onClick={handleClick}>
      {children}
    </MuiButton>
  );
}

// MUI TextField 래퍼
export function TextField(props: z.infer<typeof muiTextFieldSchema>) {
  const { ...muiProps } = props;
  return <MuiTextField {...muiProps} />;
}

// MUI Card 래퍼
export function Card(props: z.infer<typeof muiCardSchema> & { children?: React.ReactNode }) {
  const { children, ...muiProps } = props;
  return <MuiCard {...muiProps}>{children}</MuiCard>;
}

// MUI CardContent 래퍼
export function CardContent(props: z.infer<typeof muiCardContentSchema> & { children?: React.ReactNode }) {
  const { children, ...muiProps } = props;
  return <MuiCardContent {...muiProps}>{children}</MuiCardContent>;
}

// MUI CardActions 래퍼
export function CardActions(props: z.infer<typeof muiCardActionsSchema> & { children?: React.ReactNode }) {
  const { children, ...muiProps } = props;
  return <MuiCardActions {...muiProps}>{children}</MuiCardActions>;
}

// MUI Typography 래퍼
export function Typography(props: z.infer<typeof muiTypographySchema>) {
  const { children, ...muiProps } = props;
  return <MuiTypography {...muiProps}>{children}</MuiTypography>;
}

// MUI Checkbox 래퍼
export function Checkbox(props: z.infer<typeof muiCheckboxSchema>) {
  const { ...muiProps } = props;
  return <MuiCheckbox {...muiProps} />;
}

// MUI Switch 래퍼
export function Switch(props: z.infer<typeof muiSwitchSchema>) {
  const { ...muiProps } = props;
  return <MuiSwitch {...muiProps} />;
}

// MUI Select 래퍼
export function Select(props: z.infer<typeof muiSelectSchema>) {
  const { label, options, ...muiProps } = props;

  return (
    <FormControl fullWidth={muiProps.fullWidth} size={muiProps.size}>
      <InputLabel>{label}</InputLabel>
      <MuiSelect {...muiProps} label={label}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
}

// MUI Chip 래퍼
export function Chip(props: z.infer<typeof muiChipSchema>) {
  const { ...muiProps } = props;
  return <MuiChip {...muiProps} />;
}

// MUI Avatar 래퍼
export function Avatar(props: z.infer<typeof muiAvatarSchema>) {
  const { children, size, ...muiProps } = props;

  // size를 sx prop으로 변환
  const sizeStyles = {
    small: { width: 24, height: 24 },
    medium: { width: 40, height: 40 },
    large: { width: 56, height: 56 },
  };

  return (
    <MuiAvatar {...muiProps} sx={sizeStyles[size]}>
      {!muiProps.src && children}
    </MuiAvatar>
  );
}

// MUI Badge 래퍼
export function Badge(props: z.infer<typeof muiBadgeSchema> & { children?: React.ReactNode }) {
  const { children, ...muiProps } = props;
  return <MuiBadge {...muiProps}>{children || <Avatar>B</Avatar>}</MuiBadge>;
}

// MUI Paper 래퍼
export function Paper(props: z.infer<typeof muiPaperSchema>) {
  const { children, ...muiProps } = props;
  return (
    <MuiPaper {...muiProps} sx={{ p: 2 }}>
      {children}
    </MuiPaper>
  );
}

// MUI Container 래퍼
export function Container(props: z.infer<typeof muiContainerSchema>) {
  const { children, maxWidth, ...muiProps } = props;

  // "none" 값을 false로 변환
  const maxWidthProp = maxWidth === "none" ? false : maxWidth;

  return (
    <MuiContainer {...muiProps} maxWidth={maxWidthProp}>
      {children}
    </MuiContainer>
  );
}

// MUI Box 래퍼
export function Box(props: z.infer<typeof muiBoxSchema>) {
  const { children, ...muiProps } = props;
  return <MuiBox {...muiProps}>{children}</MuiBox>;
}

// 모든 컴포넌트 내보내기
export const muiComponents = {
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  Typography,
  Checkbox,
  Switch,
  Select,
  Chip,
  Avatar,
  Badge,
  Paper,
  Container,
  Box,
} as const;
