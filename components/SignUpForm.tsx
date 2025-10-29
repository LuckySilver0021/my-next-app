"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Divider } from "@heroui/divider";
import {
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { signUpSchema } from "@/zod/schemas/signUpSchema";

export default function SignUpForm() {
  const router = useRouter();
  const { signUp, isLoaded, setActive } = useSignUp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  console.log("🔄 SignUpForm component rendered");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  console.log("📝 Form validation errors:", errors);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    console.log("🚀 Starting signup process...");
    console.log("📧 Email:", data.email);
    console.log("🔐 Password length:", data.password.length);
    
    if (!isLoaded) {
      console.error("❌ Auth not loaded!");
      setAuthError("Authentication system is not ready. Please try again.");
      return;
    }

    console.log("✅ Auth system loaded, proceeding with signup");
    setIsSubmitting(true);
    setAuthError(null);

    try {
      console.log("📝 Creating account...");
      const emailCheck = await signUp.create({
        emailAddress: data.email.trim(),
        password: data.password,
      });
      
      console.log("📋 Signup response status:", emailCheck.status);

      if (emailCheck.status === "complete") {
        console.log("🎉 Account created successfully, preparing email verification");
        const verificationResult = await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        console.log("📨 Verification preparation result:", JSON.stringify(verificationResult, null, 2));
        setVerifying(true);
        console.log("🔄 Switched to verification state");
      } else if (emailCheck.status === "missing_requirements") {
        console.error("⚠️ Sign-up incomplete: missing requirements", emailCheck);
        const missingFields = emailCheck.missingFields || [];
        setAuthError(
          `Additional information required: ${missingFields.join(", ")}. Please contact support or check your form.`
        );
      } else {
        console.error("⚠️ Sign-up incomplete:", emailCheck);
        setAuthError("Account creation could not be completed. Please try again.");
      }
    } catch (error: any) {
      console.error("Sign-up error:", error);
      if (error.errors?.[0]?.code === "form_identifier_exists") {
        setAuthError("An account with this email already exists. Please sign in instead.");
      } else if (error.errors?.[0]?.code === "form_password_pwned") {
        setAuthError("This password has been compromised in data breaches. Please choose a different password.");
      } else if (error.errors?.[0]?.code === "form_password_validation_failed") {
        setAuthError("Password is too weak. Please choose a stronger password.");
      } else {
        setAuthError(
          error.errors?.[0]?.message ||
            "An error occurred during sign-up. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    console.log("🔍 Starting verification process...");
    e.preventDefault();
    
    if (!isLoaded || !signUp) {
      console.error("❌ Verification system not ready!", { isLoaded, hasSignUp: !!signUp });
      setVerificationError("Verification system is not ready. Please try again.");
      return;
    }

    if (!verificationCode.trim()) {
      console.warn("⚠️ Empty verification code submitted");
      setVerificationError("Please enter the verification code.");
      return;
    }

    console.log("📝 Submitting verification code:", verificationCode.trim());
    setIsSubmitting(true);
    setVerificationError(null);

    try {
      console.log("🔄 Attempting email verification...");
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode.trim(),
      });

      console.log("📋 Verification result:", JSON.stringify(result, null, 2));

      if (result.status === "complete") {
        console.log("✅ Verification successful!");

        // If Clerk returned a createdSessionId, activate it so the user is signed in client-side.
        if (result.createdSessionId) {
          try {
            console.log("🔑 Activating session:", result.createdSessionId);
            await setActive({ session: result.createdSessionId });
            console.log("🔒 Session activated");
          } catch (e) {
            console.warn("⚠️ setActive failed:", e);
          }
        } else {
          console.warn("⚠️ No createdSessionId returned by Clerk; proceeding to redirect anyway");
        }

        console.log("➡️ Redirecting to dashboard...");
        // Await navigation to ensure it's completed before any UI state changes
        await router.push("/dashboard");
      } else {
        console.error("⚠️ Verification incomplete:", result);
        const message = "Verification could not be completed. Please try again.";
        setVerificationError(message);
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      if (error.errors?.[0]?.code === "form_code_incorrect") {
        setVerificationError("Incorrect verification code. Please try again.");
      } else if (error.errors?.[0]?.code === "form_code_expired") {
        setVerificationError("Verification code has expired. Please request a new code.");
      } else {
        setVerificationError(
          error.errors?.[0]?.message ||
            "An error occurred during verification. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
        <CardHeader className="flex flex-col gap-1 items-center pb-2">
          <h1 className="text-2xl font-bold text-default-900">
            Verify Your Email
          </h1>
          <p className="text-default-500 text-center">
            We've sent a verification code to your email
          </p>
        </CardHeader>

        <Divider />

        <CardBody className="py-6">
          {verificationError && (
            <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{verificationError}</p>
            </div>
          )}

          <form onSubmit={handleVerificationSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="verificationCode"
                className="text-sm font-medium text-default-900"
              >
                Verification Code
              </label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="Enter the 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-default-500">
              Didn't receive a code?{" "}
              <button
                onClick={async () => {
                  if (signUp) {
                    await signUp.prepareEmailAddressVerification({
                      strategy: "email_code",
                    });
                  }
                }}
                className="text-primary hover:underline font-medium"
              >
                Resend code
              </button>
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
      <CardHeader className="flex flex-col gap-1 items-center pb-2">
        <h1 className="text-2xl font-bold text-default-900">
          Create Your Account
        </h1>
        <p className="text-default-500 text-center">
          Sign up to start managing your images securely
        </p>
      </CardHeader>

      <Divider />

      <CardBody className="py-6">
        {authError && (
          <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p>{authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-default-900"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              startContent={<Mail className="h-4 w-4 text-default-500" />}
              isInvalid={!!errors.email}
              errorMessage={errors.email?.message}
              {...register("email")}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-default-900"
            >
              Password
            </label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              startContent={<Lock className="h-4 w-4 text-default-500" />}
              endContent={
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-default-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-default-500" />
                  )}
                </Button>
              }
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              {...register("password")}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="passwordConfirmation"
              className="text-sm font-medium text-default-900"
            >
              Confirm Password
            </label>
            <Input
              id="passwordConfirmation"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              startContent={<Lock className="h-4 w-4 text-default-500" />}
              endContent={
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  type="button"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-default-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-default-500" />
                  )}
                </Button>
              }
              isInvalid={!!errors.passwordConfirm}
              errorMessage={errors.passwordConfirm?.message}
              {...register("passwordConfirm")}
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-sm text-default-600">
                By signing up, you agree to our Terms of Service and Privacy
                Policy
              </p>
            </div>
          </div>

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </CardBody>

      <Divider />

      <CardFooter className="flex justify-center py-4">
        <p className="text-sm text-default-600">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}