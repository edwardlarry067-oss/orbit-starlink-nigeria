import React from "react";
import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";

export default function CheckoutSuccess() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-24 max-w-3xl flex items-center justify-center min-h-[70vh]">
        <Card className="w-full bg-background border-primary/30 shadow-[0_0_50px_rgba(0,212,255,0.05)] overflow-hidden">
          <div className="h-2 bg-primary w-full" />

          <CardHeader className="text-center pt-10 pb-6">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold uppercase tracking-widest mb-2">Order Confirmed</CardTitle>
            <p className="text-muted-foreground text-lg">Welcome to the future of connectivity.</p>
          </CardHeader>

          <CardContent className="px-8 pb-10">
            <div className="space-y-6 bg-card rounded-lg p-6 border border-border">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-1">Payment</p>
                  <p className="font-medium text-sm text-emerald-400">Secured via Paystack ✓</p>
                  <p className="text-xs text-muted-foreground mt-1">A confirmation email has been sent to you.</p>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-4 text-center">
              <h4 className="font-bold uppercase tracking-widest text-sm">Next Steps</h4>
              <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-md mx-auto list-disc pl-5">
                <li>Your hardware kit will ship within 1–2 weeks.</li>
                <li>You will receive a tracking number via email once shipped.</li>
                <li>Download the OrbitFuture app to prepare for setup.</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="bg-card/50 border-t border-border px-8 py-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button className="uppercase tracking-widest text-xs font-bold w-full sm:w-auto h-12 px-8">
                Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="uppercase tracking-widest text-xs font-bold w-full sm:w-auto h-12 px-8">
                Return Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
