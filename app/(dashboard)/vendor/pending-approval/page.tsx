"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Clock, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PendingApprovalPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "vendor") {
        router.push("/dashboard");
      } else if (user.vendorStatus === "approved") {
        router.push("/vendor/dashboard");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Leaf className="h-10 w-10 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Approval Pending
            </h1>
            <p className="text-muted-foreground">
              Thank you for registering as a vendor on GreenNest!
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center gap-2 text-amber-700">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Under Review</span>
            </div>
            <p className="text-sm text-amber-600">
              Your vendor application is currently being reviewed by our team.
              This usually takes 1-2 business days.
            </p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              <span>We&apos;ll notify you once approved</span>
            </div>
            <p>
              You&apos;ll receive an email at <strong>{user?.email}</strong> when your
              account is activated.
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <Link href="/" className="block">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">
              Need help? Contact us at{" "}
              <a
                href="mailto:support@greennest.com"
                className="text-primary hover:underline"
              >
                support@greennest.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
