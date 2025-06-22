"use client";

// AIDEV-NOTE: Material-UI 테마 프로바이더
// MUI 컴포넌트들이 올바르게 렌더링되도록 테마를 제공

import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import type React from "react";

// 기본 MUI 테마 생성
const defaultTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // 버튼 텍스트 대문자 변환 비활성화
        },
      },
    },
  },
});

interface MuiThemeProviderProps {
  children: React.ReactNode;
  theme?: typeof defaultTheme;
}

/**
 * MUI 테마 프로바이더 컴포넌트
 * MUI 컴포넌트들이 올바르게 렌더링되도록 테마를 제공합니다.
 */
export function MuiThemeProvider({ children, theme = defaultTheme }: MuiThemeProviderProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

/**
 * 다크 테마 생성
 */
export const darkTheme = createTheme({
  ...defaultTheme,
  palette: {
    mode: "dark",
    primary: {
      main: "#90caf9",
    },
    secondary: {
      main: "#f48fb1",
    },
  },
});

/**
 * 커스텀 테마 생성 헬퍼
 */
export function createCustomMuiTheme(customizations: Parameters<typeof createTheme>[0]) {
  return createTheme({
    ...defaultTheme,
    ...customizations,
  });
}
