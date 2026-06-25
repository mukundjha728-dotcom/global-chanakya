import { Suspense } from "react";
import SignInForm from "./signin-form";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center bg-black">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
