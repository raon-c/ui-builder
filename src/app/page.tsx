"use client";

import Image from "next/image";
import { useId } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function Home() {
  const emailId = useId();
  const passwordId = useId();
  const termsId = useId();
  const marketingId = useId();
  const notificationsId = useId();
  const darkModeId = useId();
  const profilePublicId = useId();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={180} height={38} priority />

        {/* AIDEV-NOTE: Button 컴포넌트 테스트 섹션 - shadcn/ui 동작 확인 */}
        <div className="flex flex-col gap-4 p-6 border rounded-lg bg-card">
          <h2 className="text-lg font-semibold mb-2">Button Component Test</h2>

          {/* Variant 테스트 */}
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>

          {/* Size 테스트 */}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">⭐</Button>
          </div>

          {/* State 테스트 */}
          <div className="flex flex-wrap gap-2">
            <Button disabled>Disabled</Button>
            <Button variant="outline" disabled>
              Disabled Outline
            </Button>
          </div>
        </div>

        {/* AIDEV-NOTE: 어댑터 패턴 테스트 섹션 - ComponentRegistry 동작 확인 */}
        <div className="flex flex-col gap-4 p-6 border rounded-lg bg-card">
          <h2 className="text-lg font-semibold mb-2">Adapter Pattern Test</h2>
          <p className="text-sm text-muted-foreground mb-4">개발자 도구 콘솔에서 어댑터 초기화 로그를 확인하세요.</p>

          {/* 어댑터 정보 표시 */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">어댑터:</span>
              <span>shadcn/ui v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">등록된 컴포넌트:</span>
              <span>7개 (Button, Input, Badge, Checkbox, Switch, Avatar, Label)</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">카테고리:</span>
              <span>Basic, Form, DataDisplay</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              // 어댑터 테스트를 위한 임시 코드
              import("@/adapters/shadcn").then(({ initializeShadcnAdapter }) => {
                const adapter = initializeShadcnAdapter();
                console.log("Adapter initialized:", adapter);
                console.log("Registered components:", adapter.registry.getAll());
              });
            }}
          >
            어댑터 초기화 테스트
          </Button>
        </div>

        {/* AIDEV-NOTE: 스토리지 시스템 테스트 섹션 - LocalStorage & ProjectStorage 동작 확인 */}
        <div className="flex flex-col gap-4 p-6 border rounded-lg bg-card">
          <h2 className="text-lg font-semibold mb-2">Storage System Test</h2>
          <p className="text-sm text-muted-foreground mb-4">localStorage 기반 프로젝트 CRUD 기능을 테스트합니다.</p>

          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => {
                import("@/lib/storage").then(async (module) => {
                  console.log("🧪 Starting storage test...");
                  const success = await module.testStorage();
                  if (success) {
                    alert("✅ 스토리지 테스트 성공! 콘솔을 확인하세요.");
                  } else {
                    alert("❌ 스토리지 테스트 실패! 콘솔을 확인하세요.");
                  }
                });
              }}
            >
              스토리지 CRUD 테스트
            </Button>

            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  const module = await import("@/lib/storage");
                  const { createDefaultStorage } = module;
                  const { projectStorage } = await createDefaultStorage(true);
                  const usage = await projectStorage.getStorageUsage();
                  console.log("📊 Storage Usage:", usage);
                  alert(
                    `스토리지 사용량: ${Math.round(usage.used / 1024)}KB / ${Math.round(usage.total / 1024)}KB (${Math.round(usage.usage * 100)}%)`,
                  );
                } catch (error) {
                  console.error("Storage usage check failed:", error);
                  alert("스토리지 사용량 확인 실패!");
                }
              }}
            >
              스토리지 사용량 확인
            </Button>
          </div>
        </div>

        {/* AIDEV-NOTE: 확장된 ComponentRegistry 테스트 섹션 - Sprint 2 */}
        <div className="flex flex-col gap-4 p-6 border rounded-lg bg-card">
          <h2 className="text-lg font-semibold mb-2">Enhanced Registry Test (Sprint 2)</h2>
          <p className="text-sm text-muted-foreground mb-4">
            확장된 ComponentRegistry의 이벤트 시스템, 검증, 통계 기능을 테스트합니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 레지스트리 통계 */}
            <div className="space-y-2">
              <h3 className="font-medium">Registry Statistics</h3>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const { getComponentRegistry } = await import("@/lib/component-registry");
                    const registry = getComponentRegistry();

                    if ("getStats" in registry) {
                      const stats = (registry as any).getStats();
                      console.log("📊 Registry Stats:", stats);
                      alert(
                        `통계 정보:\n총 컴포넌트: ${stats.totalComponents}\n카테고리별: ${JSON.stringify(stats.componentsByCategory, null, 2)}`,
                      );
                    } else {
                      alert("Enhanced registry features not available");
                    }
                  } catch (error) {
                    console.error("Stats check failed:", error);
                    alert("통계 조회 실패!");
                  }
                }}
              >
                통계 조회
              </Button>
            </div>

            {/* 이벤트 리스너 테스트 */}
            <div className="space-y-2">
              <h3 className="font-medium">Event System</h3>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const { getComponentRegistry } = await import("@/lib/component-registry");
                    const registry = getComponentRegistry();

                    if ("addEventListener" in registry) {
                      // 이벤트 리스너 추가
                      const listener = (event: any) => {
                        console.log("🎉 Registry Event:", event);
                        alert(`이벤트 발생: ${event.type}\n컴포넌트: ${event.component?.type || "N/A"}`);
                      };

                      (registry as any).addEventListener("component-registered", listener);

                      // 테스트용 컴포넌트 등록
                      const testWrapper = {
                        type: "TestComponent",
                        component: () => null,
                        metadata: {
                          type: "TestComponent",
                          displayName: "테스트 컴포넌트",
                          description: "이벤트 테스트용 컴포넌트",
                          category: "Basic",
                          icon: "Package",
                          defaultProps: {},
                          canHaveChildren: false,
                          draggable: true,
                          deletable: true,
                        },
                        propsSchema: {
                          type: "TestComponent",
                          schema: null,
                          fields: [],
                        },
                      };

                      registry.register(testWrapper as any);

                      // 리스너 제거
                      setTimeout(() => {
                        (registry as any).removeEventListener("component-registered", listener);
                        registry.unregister("TestComponent" as any);
                      }, 2000);
                    } else {
                      alert("Enhanced registry features not available");
                    }
                  } catch (error) {
                    console.error("Event test failed:", error);
                    alert("이벤트 테스트 실패!");
                  }
                }}
              >
                이벤트 테스트
              </Button>
            </div>

            {/* 벌크 작업 테스트 */}
            <div className="space-y-2">
              <h3 className="font-medium">Bulk Operations</h3>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const { getComponentRegistry } = await import("@/lib/component-registry");
                    const registry = getComponentRegistry();

                    if ("registerMany" in registry) {
                      const beforeCount = registry.getAll().length;

                      // 여러 테스트 컴포넌트 생성
                      const testWrappers = ["Test1", "Test2", "Test3"].map((name) => ({
                        type: name,
                        component: () => null,
                        metadata: {
                          type: name,
                          displayName: `${name} 컴포넌트`,
                          description: `벌크 테스트용 ${name}`,
                          category: "Basic",
                          icon: "Package",
                          defaultProps: {},
                          canHaveChildren: false,
                          draggable: true,
                          deletable: true,
                        },
                        propsSchema: {
                          type: name,
                          schema: null,
                          fields: [],
                        },
                      }));

                      // 벌크 등록
                      (registry as any).registerMany(testWrappers);

                      const afterCount = registry.getAll().length;
                      alert(`벌크 등록 완료!\n이전: ${beforeCount}개 → 이후: ${afterCount}개`);

                      // 벌크 제거
                      setTimeout(() => {
                        (registry as any).unregisterMany(["Test1", "Test2", "Test3"]);
                        const finalCount = registry.getAll().length;
                        console.log(`Bulk unregister completed. Final count: ${finalCount}`);
                      }, 3000);
                    } else {
                      alert("Enhanced registry features not available");
                    }
                  } catch (error) {
                    console.error("Bulk test failed:", error);
                    alert("벌크 작업 테스트 실패!");
                  }
                }}
              >
                벌크 작업 테스트
              </Button>
            </div>

            {/* 검증 기능 테스트 */}
            <div className="space-y-2">
              <h3 className="font-medium">Validation</h3>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const { getComponentRegistry } = await import("@/lib/component-registry");
                    const registry = getComponentRegistry();

                    if ("validateComponent" in registry) {
                      // 잘못된 컴포넌트 검증
                      const invalidWrapper = {
                        type: "", // 빈 타입
                        component: null, // null 컴포넌트
                        metadata: null, // null 메타데이터
                        propsSchema: null,
                      };

                      const result = (registry as any).validateComponent(invalidWrapper);
                      console.log("🔍 Validation Result:", result);

                      alert(
                        `검증 결과:\n유효성: ${result.isValid}\n에러: ${result.errors.length}개\n경고: ${result.warnings.length}개\n\n상세:\n${result.errors.join("\n")}`,
                      );
                    } else {
                      alert("Enhanced registry features not available");
                    }
                  } catch (error) {
                    console.error("Validation test failed:", error);
                    alert("검증 테스트 실패!");
                  }
                }}
              >
                검증 테스트
              </Button>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <p className="text-xs text-muted-foreground">
              💡 확장된 기능: 이벤트 시스템, 벌크 작업, 컴포넌트 검증, 성능 최적화된 카테고리 조회, 통계 정보
            </p>
          </div>
        </div>

        {/* AIDEV-NOTE: 새로운 shadcn/ui 컴포넌트 테스트 섹션 - Sprint 2 */}
        <div className="flex flex-col gap-6 p-6 border rounded-lg bg-card">
          <h2 className="text-lg font-semibold mb-2">New Components Test (Sprint 2)</h2>
          <p className="text-sm text-muted-foreground mb-4">새로 설치한 shadcn/ui 컴포넌트들의 동작을 확인합니다.</p>

          {/* Input 컴포넌트 테스트 */}
          <div className="space-y-2">
            <h3 className="font-medium">Input Components</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={emailId}>Email</Label>
                <Input id={emailId} type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor={passwordId}>Password</Label>
                <Input id={passwordId} type="password" placeholder="Enter your password" />
              </div>
            </div>
          </div>

          {/* Select 컴포넌트 테스트 */}
          <div className="space-y-2">
            <h3 className="font-medium">Select Component</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Framework</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a framework" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="next">Next.js</SelectItem>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="vue">Vue.js</SelectItem>
                    <SelectItem value="nuxt">Nuxt.js</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Size</Label>
                <Select>
                  <SelectTrigger size="sm">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Checkbox & Switch 테스트 */}
          <div className="space-y-2">
            <h3 className="font-medium">Checkbox & Switch</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id={termsId} />
                  <Label htmlFor={termsId}>Accept terms and conditions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id={marketingId} defaultChecked />
                  <Label htmlFor={marketingId}>Receive marketing emails</Label>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch id={notificationsId} />
                  <Label htmlFor={notificationsId}>Push notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id={darkModeId} defaultChecked />
                  <Label htmlFor={darkModeId}>Dark mode</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Badge 컴포넌트 테스트 */}
          <div className="space-y-2">
            <h3 className="font-medium">Badge Variants</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>

          {/* Avatar 컴포넌트 테스트 */}
          <div className="space-y-2">
            <h3 className="font-medium">Avatar Component</h3>
            <div className="flex gap-4 items-center">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage src="/nonexistent.jpg" alt="Fallback test" />
                <AvatarFallback>FB</AvatarFallback>
              </Avatar>
              <Avatar className="h-12 w-12">
                <AvatarFallback>LG</AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Card 컴포넌트 테스트 */}
          <div className="space-y-2">
            <h3 className="font-medium">Card Component</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Card Title</CardTitle>
                  <CardDescription>Card description goes here</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>This is the card content area.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Profile <Badge variant="secondary">New</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">John Doe</p>
                      <p className="text-sm text-muted-foreground">john@example.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id={profilePublicId} />
                    <Label htmlFor={profilePublicId}>Make profile public</Label>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2 tracking-[-.01em]">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)] font-semibold">
              src/app/page.tsx
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">Save and see your changes instantly.</li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/projects"
          >
            프로젝트 대시보드
          </a>
          <a
            className="rounded-full border border-solid border-primary/20 dark:border-primary/30 transition-colors flex items-center justify-center bg-primary/5 hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/40 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="/components-catalog"
          >
            컴포넌트 카탈로그
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read our docs
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/window.svg" alt="Window icon" width={16} height={16} />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
