"use client";

import { SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Page() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <div className="w-full flex justify-center py-12">
      <div className="w-full max-w-md">
        <SignIn
          path="/signin"
          routing="path"
          signUpUrl="/signup"
          afterSignInUrl="/dashboard"
          afterSignUpUrl="/dashboard"
          redirectUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: mounted ? undefined : { display: 'none' }
            }
          }}
        />
      </div>
    </div>
  );
}
