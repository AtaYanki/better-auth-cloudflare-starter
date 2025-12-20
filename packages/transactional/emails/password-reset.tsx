import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Tailwind,
} from "@react-email/components";

interface PasswordResetOTPEmailProps {
  otpCode: string;
  expiryMinutes: string;
  userEmail: string;
  requestDate: string;
  requestIP: string | null;
}

const PasswordResetOTPEmail = (props: PasswordResetOTPEmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] max-w-[600px] mx-auto p-[40px]">
            {/* Header */}
            <Section className="text-center mb-[32px]">
              <Heading className="text-[28px] font-bold text-gray-900 m-0 mb-[8px]">
                Reset Your Password
              </Heading>
              <Text className="text-[16px] text-gray-600 m-0">
                Use the verification code below to reset your password
              </Text>
            </Section>

            {/* OTP Code Section */}
            <Section className="text-center mb-[32px]">
              <div className="bg-red-50 border border-red-200 rounded-[8px] p-[24px] mb-[16px]">
                <Text className="text-[14px] text-red-600 m-0 mb-[8px] uppercase tracking-wide">
                  Password Reset Code
                </Text>
                <Text className="text-[36px] font-bold text-red-700 m-0 letter-spacing-[8px] font-mono">
                  {props.otpCode}
                </Text>
              </div>
              <Text className="text-[14px] text-gray-500 m-0">
                This code will expire in {props.expiryMinutes} minutes
              </Text>
            </Section>

            {/* Instructions */}
            <Section className="mb-[32px]">
              <Text className="text-[16px] text-gray-700 m-0 mb-[16px]">
                Hi {props.userEmail},
              </Text>
              <Text className="text-[16px] text-gray-700 m-0 mb-[16px]">
                We received a request to reset the password for your account.
                Enter this verification code in the application to proceed with
                resetting your password.
              </Text>
              <Text className="text-[16px] text-gray-700 m-0 mb-[16px]">
                If you didn't request a password reset, please ignore this
                email. Your password will remain unchanged.
              </Text>
              <Text className="text-[16px] text-gray-700 m-0">
                For your security, this code can only be used once and will
                expire automatically.
              </Text>
            </Section>

            {/* Security Alert */}
            <Section className="bg-amber-50 border border-amber-200 rounded-[8px] p-[20px] mb-[32px]">
              <Text className="text-[14px] text-amber-800 m-0 mb-[8px] font-semibold">
                ⚠️ Security Alert
              </Text>
              <Text className="text-[14px] text-amber-700 m-0 mb-[8px]">
                Someone requested a password reset for your account.
              </Text>
              <Text className="text-[14px] text-amber-700 m-0">
                If this wasn't you, please secure your account immediately and
                contact support.
              </Text>
            </Section>

            {/* Additional Security Info */}
            <Section className="bg-blue-50 border border-blue-200 rounded-[8px] p-[20px] mb-[32px]">
              <Text className="text-[14px] text-blue-800 m-0 mb-[8px] font-semibold">
                🔒 Security Tips
              </Text>
              <Text className="text-[14px] text-blue-700 m-0 mb-[8px]">
                • Never share this code with anyone
              </Text>
              <Text className="text-[14px] text-blue-700 m-0 mb-[8px]">
                • Choose a strong, unique password
              </Text>
              <Text className="text-[14px] text-blue-700 m-0">
                • Enable two-factor authentication for added security
              </Text>
            </Section>

            <Hr className="border-gray-200 my-[32px]" />

            {/* Footer */}
            <Section className="text-center">
              <Text className="text-[14px] text-gray-500 m-0 mb-[8px]">
                Need help? Contact our support team immediately
              </Text>
              <Text className="text-[12px] text-gray-400 m-0 mb-[16px]">
                This email was sent to {props.userEmail}
              </Text>
              <Text className="text-[12px] text-gray-400 m-0 mb-[8px]">
                Request made on {props.requestDate} from IP:{" "}
                {props.requestIP || "unknown"}
              </Text>

              <Text className="text-[12px] text-gray-400 m-0 mb-[8px]">
                © {new Date().getFullYear()} Your Company Name. All rights
                reserved.
              </Text>
              <Text className="text-[12px] text-gray-400 m-0">
                123 Business Street, Suite 100, City, State 12345
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

PasswordResetOTPEmail.PreviewProps = {
  otpCode: "592847",
  expiryMinutes: "15",
  userEmail: "sarah@example.com",
  requestDate: "Dec 19, 2024 at 3:37 PM",
  requestIP: "192.168.1.100",
};

export default PasswordResetOTPEmail;
