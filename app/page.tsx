"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
      if (session) {
        router.push("/chat");
      } else {
        router.push("/sign-in");
      }
  }, [session, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to chat...</p>
      </div>
    </div>
  );
}
