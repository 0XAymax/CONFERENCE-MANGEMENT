"use client"
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail } from 'lucide-react';
import React, { useState } from 'react'

type VerificationStep = "email" | "otp" | "success";
interface OtpStepProps {
  email: string;
  setStep: React.Dispatch<React.SetStateAction<VerificationStep>>;
  startResendCooldown: () => void;
    resendCooldown: number;
}

function OtpStep({ email,setStep,startResendCooldown,resendCooldown }: OtpStepProps) {
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) return;
    
        setIsLoading(true);
        setError("");
    
        try {
          // Simulate API call to verify OTP
          await new Promise((resolve) => setTimeout(resolve, 1000));
    
          // In a real app, you would call your API here
          // const response = await verifyOTP(email, otp)
    
          setStep("success");
        } catch (err) {
          setError("Invalid verification code. Please try again.");
          setOtp("");
        } finally {
          setIsLoading(false);
        }
    };
    const handleResendCode = async () => {
      if (resendCooldown > 0) return;

      setIsLoading(true);
      setError("");

      try {
        // Simulate API call to resend OTP
        await new Promise((resolve) => setTimeout(resolve, 1000));

        startResendCooldown();
      } catch (err) {
        setError("Failed to resend code. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
   
    const handleBackToEmail = () => {
      setStep("email");
      setOtp("");
      setError("");
    };
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold">
          Enter verification code
        </CardTitle>
        <CardDescription>
          We sent a 6-digit code to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-center block">
              Verification code
            </Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? "Verifying..." : "Verify code"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive the code?
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || isLoading}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend code"}
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleBackToEmail}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to email
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default OtpStep