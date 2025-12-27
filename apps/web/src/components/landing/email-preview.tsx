import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code } from "lucide-react";
import { FeatureList } from "./feature-list";

const features = [
  {
    title: "React Email Components",
    description: "Build beautiful email templates using React components",
    icon: <Code className="h-3 w-3 text-primary" />,
  },
  {
    title: "Email Verification",
    description: "OTP-based email verification with secure code delivery",
  },
  {
    title: "High Deliverability",
    description: "Powered by Resend for reliable email delivery",
  },
];

export function EmailPreview() {
  const previewProps = {
    otpCode: "847392",
    expiryMinutes: "10",
    userEmail: "john@example.com",
  };

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Deliver. <span className="text-muted-foreground">With confidence.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transactional emails powered by Resend and React Email. Design in React, send with confidence.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <FeatureList features={features} />
              <div className="rounded-lg bg-muted p-4 font-mono text-xs">
                <div className="text-muted-foreground">await resend.emails.send(</div>
                <div className="ml-4 text-muted-foreground">from: 'onboarding@resend.dev',</div>
                <div className="ml-4 text-muted-foreground">to: 'user@example.com',</div>
                <div className="ml-4 text-foreground">react: &lt;OTPVerificationEmail</div>
                <div className="ml-4 text-foreground">  otpCode="847392"</div>
                <div className="ml-4 text-foreground">  expiryMinutes="10"</div>
                <div className="ml-4 text-foreground">  userEmail="john@example.com"</div>
                <div className="ml-4 text-foreground">/&gt;</div>
                <div className="text-muted-foreground">)</div>
              </div>
            </div>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">Verify Your Email Address</CardTitle>
                <CardDescription>
                  Email verification template with OTP code
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-white rounded-lg border border-border/50 p-6 max-h-[600px] overflow-y-auto">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Verify Your Email Address
                      </h3>
                      <p className="text-gray-600">
                        Please use the verification code below to complete your registration
                      </p>
                    </div>
                    <div className="text-center bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                        Your Verification Code
                      </p>
                      <p className="text-4xl font-bold text-gray-900 font-mono tracking-widest">
                        {previewProps.otpCode}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        This code will expire in {previewProps.expiryMinutes} minutes
                      </p>
                    </div>
                    <div className="space-y-3">
                      <p className="text-gray-700">
                        Hi {previewProps.userEmail},
                      </p>
                      <p className="text-gray-700">
                        Enter this verification code in the application to verify your email address and complete your account setup.
                      </p>
                      <p className="text-gray-700">
                        If you didn't request this verification code, please ignore this email or contact our support team if you have concerns.
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                      <p className="text-sm text-blue-800 font-semibold mb-1">
                        🔒 Security Notice
                      </p>
                      <p className="text-sm text-blue-700">
                        Never share this code with anyone. Our team will never ask for your verification code.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

