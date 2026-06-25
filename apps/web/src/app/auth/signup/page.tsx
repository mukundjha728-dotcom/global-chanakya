import { Suspense } from "react";
import SignUpForm from "./signup-form";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-black">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
