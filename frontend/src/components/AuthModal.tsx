"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Removed - using relative paths

type AuthResponse = { token?: string; user?: { id: number; email: string } };
async function postJSON(path: 'login' | 'signup', data: Record<string, string>): Promise<AuthResponse> {
  const res = await fetch(`/api/backend/auth/${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  const json = (await res.json().catch(() => ({}))) as Partial<AuthResponse & { error?: string }>;
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json as AuthResponse;
}

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  afterAuthHref?: string;
};

export default function AuthModal({ open, onOpenChange, afterAuthHref = "/profile" }: Props) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (tab === "login") {
        // Use NextAuth signIn for login
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false
        });
        
        if (result?.error) {
          throw new Error("Invalid credentials");
        }
        
        window.location.href = afterAuthHref;
      } else {
        // For signup: create account via backend first
        await postJSON("signup", { email, password, name });
        
        // Then log in via NextAuth
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false
        });
        
        if (result?.error) {
          throw new Error("Registration completed but login failed");
        }
        
        window.location.href = afterAuthHref;
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  const googleHref = `/api/backend/auth/google`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 overflow-hidden rounded-2xl sm:max-w-[420px]"
        aria-describedby={undefined}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Authentication</DialogTitle>
        </DialogHeader>

        <div className="bg-white dark:bg-neutral-900">
          <div className="px-5 py-4 border-b">
            <div className="text-lg font-semibold">Welcome</div>
          </div>

          <div className="px-5 pt-4 pb-3">
            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")} className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <AuthFormInner
                  mode="login"
                  email={email}
                  password={password}
                  setEmail={setEmail}
                  setPassword={setPassword}
                  showPass={showPass}
                  setShowPass={setShowPass}
                  loading={loading}
                  err={err}
                  onSubmit={onSubmit}
                />
              </TabsContent>

              <TabsContent value="signup">
                <AuthFormInner
                  mode="register"
                  email={email}
                  password={password}
                  name={name}
                  setEmail={setEmail}
                  setPassword={setPassword}
                  setName={setName}
                  showPass={showPass}
                  setShowPass={setShowPass}
                  loading={loading}
                  err={err}
                  onSubmit={onSubmit}
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="px-5 pb-5">
            <div className="relative my-3">
              <div className="h-px bg-border" />
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-background px-2 text-xs text-muted-foreground">
                or continue with
              </span>
            </div>
            <Button asChild variant="outline" className="w-full">
              <a href={googleHref} aria-label="Continue with Google">
                <span className="inline-flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.7 3l5.7-5.7C33.7 6.1 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 19-7.3 19-20 0-1.2-.1-2.3-.4-3.5z"/>
                    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.6 19 14 24 14c3 0 5.7 1.1 7.7 3l5.7-5.7C33.7 6.1 29.1 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
                    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.8 13.5-4.9l-6.2-5.1C29.3 36 26.8 37 24 37c-5.2 0-9.6-3.5-11.1-8.2l-6.5 5C9.7 39.4 16.4 44 24 44z"/>
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.7 3.4-5.3 6-9.3 6-5.2 0-9.6-3.5-11.1-8.2l-6.5 5C9.7 39.4 16.4 44 24 44c10 0 19-7.3 19-20 0-1.2-.1-2.3-.4-3.5z"/>
                  </svg>
                  Google
                </span>
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AuthFormInner(props: {
  mode: "login" | "register";
  email: string;
  password: string;
  name?: string;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setName?: (v: string) => void;
  showPass: boolean;
  setShowPass: (v: boolean) => void;
  loading: boolean;
  err: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const {
    mode, email, password, name, setEmail, setPassword, setName,
    showPass, setShowPass, loading, err, onSubmit
  } = props;

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-3"
    >
      {mode === "register" && (
        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">Name</label>
          <div className="relative">
            <Input
              placeholder="Your name"
              value={name || ""}
              onChange={(e) => setName?.(e.target.value)}
              required
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-sm text-muted-foreground">Email</label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            className="pl-9"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-muted-foreground">Password</label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type={showPass ? "text" : "password"}
            className="pl-9 pr-10"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
            aria-label={showPass ? "Hide password" : "Show password"}
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {err && <div className="text-sm text-red-600">{err}</div>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "…" : mode === "login" ? "Sign in" : "Create account"}
      </Button>

      {mode === "login" && (
        <div className="text-xs text-muted-foreground text-center pt-1">
          By continuing you agree to our Terms and Privacy Policy.
        </div>
      )}
    </motion.form>
  );
}


