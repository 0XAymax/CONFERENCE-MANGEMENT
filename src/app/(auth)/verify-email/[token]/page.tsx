"use client";
import { trpc } from '@/server/client';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect } from 'react'
import { toast } from 'sonner';

function Page() {
    const params = useParams();
    const token = params.token as string;
    const router = useRouter();

    const verifyMutation = trpc.auth.verifyEmailToken.useMutation({
      onSuccess: (res) => {
        if (res.success) {
          toast.success("Email verified successfully!");
          router.push("/sign-in");
        } else {
          toast.error("Invalid token.");
        }
      },
      onError: () => {
        toast.error("Verification failed.");
      },
    });

    useEffect(() => {
      if (token) {
        verifyMutation.mutate({ token });
      }
    }, [token]);
  return (
    <div className="flex justify-center items-center min-h-screen">
      <p className="text-gray-700">Verifying your email...</p>
    </div>
  );
}

export default Page