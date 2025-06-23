"use client";

import type React from "react";
import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import OtpStep from "./OtpStep";
import EmailStep from "./EmailStep";

type VerificationStep = "email" | "otp" | "success";

export default function EmailVerification({email,firstStep}: { email: string,firstStep: VerificationStep }) {
  const [step, setStep] = useState<VerificationStep>(firstStep || "email");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [emailInput, setEmailInput] = useState(email);

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const renderSuccessStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-green-600">
          Email verified!
        </CardTitle>
        <CardDescription>
          Your email address has been successfully verified
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={() => {
            // In a real app, redirect to dashboard or next step
            console.log("Redirect to dashboard");
          }}
          className="w-full"
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === "email" &&
          <EmailStep
            setStep={setStep}
            startResendCooldown={startResendCooldown}
            setEmailInput={setEmailInput}
          />}
        {step === "otp" &&
          <OtpStep
            email={emailInput}
            setStep={setStep}
            startResendCooldown={startResendCooldown}
            resendCooldown={resendCooldown}
          />}
        {step === "success" && renderSuccessStep()}
      </div>
    </div>
  );
}
