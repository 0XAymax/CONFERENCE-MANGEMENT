"use client"
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import React, { useState } from 'react'
type VerificationStep = "email" | "otp" | "success";
interface EmailStepProps {
  setStep: React.Dispatch<React.SetStateAction<VerificationStep>>;
  startResendCooldown: () => void;
  setEmailInput: React.Dispatch<React.SetStateAction<string>>;
}
function EmailStep({ setStep, startResendCooldown,setEmailInput }: EmailStepProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [email, setEmail] = useState("");
    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
    
        setIsLoading(true);
        setError("");
    
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setEmailInput(email);
          setStep("otp");
          startResendCooldown();
          
        } catch (err) {
          setError("Failed to send verification code. Please try again.");
        } finally {
          setIsLoading(false);
        }
    };
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
        <CardDescription>
          Enter your email address and we&apos;ll send you a verification code
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send verification code"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default EmailStep