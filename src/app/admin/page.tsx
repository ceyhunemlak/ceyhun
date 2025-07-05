"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simple validation
    if (username !== "admin") {
      setError("Kullanıcı adı hatalı");
      setIsLoading(false);
      return;
    }

    try {
      // In a real app, this would be an API call to verify credentials
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (response.ok) {
        // Set some auth state (cookie/localStorage in real app)
        localStorage.setItem("adminAuthenticated", "true");
        router.push("/admin/panel");
      } else {
        setError("Parola hatalı");
      }
    } catch (err) {
      setError("Giriş yapılırken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-[#FFB000]/20 shadow-xl shadow-[#FFB000]/5">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <div className="w-40 h-40 relative mb-4">
              <Image 
                src="/images/logo_black.png" 
                alt="Ceyhun Gayrimenkul Logo" 
                fill
                className="object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Admin Girişi</CardTitle>
            <CardDescription className="text-center">
              Yönetim paneline erişmek için giriş yapın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Kullanıcı Adı</Label>
                <Input
                  id="username"
                  placeholder="Kullanıcı adınızı girin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-[#FFB000]/30 focus:border-[#FFB000] focus:ring-[#FFB000]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Parola</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Parolanızı girin"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-[#FFB000]/30 focus:border-[#FFB000] focus:ring-[#FFB000]"
                  required
                />
              </div>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
                >
                  {error}
                </motion.div>
              )}
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleLogin} 
              className="w-full bg-[#FFB000] hover:bg-[#FFB000]/80 text-black font-medium transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Giriş Yapılıyor...
                </div>
              ) : (
                "Giriş Yap"
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
} 