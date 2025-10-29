"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

interface BusinessCheckProviderProps {
  children: React.ReactNode;
}

export function BusinessCheckProvider({ children }: BusinessCheckProviderProps) {
  const { data: session, isLoading: sessionLoading } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [hasBusiness, setHasBusiness] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!sessionLoading && session?.user) {
      checkBusinessStatus();
    } else if (!sessionLoading && !session) {
      setIsLoading(false);
    }
  }, [session, sessionLoading]);

  const checkBusinessStatus = async () => {
    try {
      const response = await fetch("/api/business/setup");
      const data = await response.json();

      if (data.business) {
        setHasBusiness(true);
      } else {
        setHasBusiness(false);
      }
    } catch (error) {
      console.error("Failed to check business status:", error);
      setHasBusiness(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && hasBusiness !== null && session?.user) {
      const pathname = window.location.pathname;

      // If no business and not on business setup page, redirect
      if (!hasBusiness && pathname !== "/business-setup" && !pathname.startsWith("/sign-")) {
        router.push("/business-setup");
        return;
      }

      // If has business and on business setup page, redirect to chat
      if (hasBusiness && pathname === "/business-setup") {
        router.push("/chat");
        return;
      }
    }
  }, [isLoading, hasBusiness, session, router]);

  if (isLoading || sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}