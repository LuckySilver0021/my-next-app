"use client";

import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="w-full flex justify-center py-12">
      <div className="w-full max-w-md">
        <SignUp path="/signup" routing="path" signInUrl="/signin" />
      </div>
    </div>
  );
}
