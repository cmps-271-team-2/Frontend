"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin/auth-context";
import { Input, Button, Card } from "@/components/admin/ui/Components";
import { aubEmailSchema } from "@/lib/validators";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated, loading: authLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/admin/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLogin = async () => {
    setError(null);

    // Validate email
    const emailCheck = aubEmailSchema.safeParse(email);
    if (!emailCheck.success) {
      setError(emailCheck.error.issues[0].message);
      return;
    }

    // Validate password
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      router.push("/admin/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AUB Rate Admin
          </h1>
          <p className="text-gray-600">
            Sign in to access the admin panel
          </p>
        </div>

        <div onKeyPress={handleKeyPress}>
          <Input
            label="Admin Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="admin@mail.aub.edu"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            required
          />

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            ⚠️ Admin access only. Unauthorized access is prohibited.
          </p>
          <p className="text-xs text-gray-500 text-center mt-2">
            This is a demo login page. In production, this would require MFA.
          </p>
        </div>
      </Card>
    </div>
  );
}
