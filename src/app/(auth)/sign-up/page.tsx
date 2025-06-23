"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import EmailVerificationTrigger from "./EmailVerificationTrigger";

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z
      .string()
      .min(1, "Email is Required")
      .email("Please enter a valid email adress"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
type RegisterFormData = z.infer<typeof registerSchema>;
export default function SignUpPage() {
  const { signUp, isLoading } = useAuth();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [email, setEmail] = useState<string>("");
  const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
      resolver: zodResolver(registerSchema),
      defaultValues: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword:"",
      },
    });
  const onSubmit = async (data: RegisterFormData) => {
    const name = `${data.firstName} ${data.lastName}`
    try {
      await signUp(name, data.email, data.password);
      setEmail(data.email);
      setStep("verify");
    } catch (error :any) {
      console.log("Register error",error);
    }
  }
  const RegisterStep = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  {...register("firstName")}
                  disabled={isLoading || isSubmitting}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  {...register("lastName")}
                  disabled={isLoading || isSubmitting}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                {...register("email")}
                disabled={isLoading || isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                {...register("password")}
                disabled={isLoading || isSubmitting}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2 mb-4">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                {...register("confirmPassword")}
                disabled={isLoading || isSubmitting}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full cursor-pointer">
              {(isLoading || isSubmitting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create account
            </Button>
            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-blue-600 hover:text-blue-500 hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
    
  
  return (
    <>
      {step === "form" && <RegisterStep />}
      {step === "verify" && <EmailVerificationTrigger email={email} />}
    </>
  );
}
