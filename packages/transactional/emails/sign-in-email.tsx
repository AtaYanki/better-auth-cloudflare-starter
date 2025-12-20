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

interface SignInOTPEmailProps {
  otpCode: string;
  expiryMinutes: string;
  userEmail: string;
  loginTime: string;
  loginLocation: string | null;
  deviceInfo: string | null;
  ipAddress: string | null;
}

const SignInOTPEmail = (props: SignInOTPEmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] max-w-[600px] mx-auto p-[40px]">
            {/* Header */}
            <Section className="text-center mb-[32px]">
              <Heading className="text-[28px] font-bold text-gray-900 m-0 mb-[8px]">
                Sign In to Your Account
              </Heading>
              <Text className="text-[16px] text-gray-600 m-0">
                Complete your sign-in with the verification code below
              </Text>
            </Section>

            {/* OTP Code Section */}
            <Section className="text-center mb-[32px]">
              <div className="bg-green-50 border border-green-200 rounded-[8px] p-[24px] mb-[16px]">
                <Text className="text-[14px] text-green-600 m-0 mb-[8px] uppercase tracking-wide">
                  Sign-In Verification Code
                </Text>
                <Text className="text-[36px] font-bold text-green-700 m-0 letter-spacing-[8px] font-mono">
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
                Someone is trying to sign in to your account. Enter this
                verification code to complete your sign-in process.
              </Text>
              <Text className="text-[16px] text-gray-700 m-0 mb-[16px]">
                If you didn't attempt to sign in, please ignore this email and
                consider changing your password for security.
              </Text>
              <Text className="text-[16px] text-gray-700 m-0">
                This code is single-use and will expire automatically for your
                protection.
              </Text>
            </Section>

            {/* Login Details */}
            <Section className="bg-gray-50 border border-gray-200 rounded-[8px] p-[20px] mb-[32px]">
              <Text className="text-[14px] text-gray-800 m-0 mb-[8px] font-semibold">
                📍 Sign-In Details
              </Text>
              <Text className="text-[14px] text-gray-600 m-0 mb-[4px]">
                <span className="font-medium">Time:</span> {props.loginTime}
              </Text>
              <Text className="text-[14px] text-gray-600 m-0 mb-[4px]">
                <span className="font-medium">Location:</span>{" "}
                {props.loginLocation || "unknown"}
              </Text>
              <Text className="text-[14px] text-gray-600 m-0 mb-[4px]">
                <span className="font-medium">Device:</span>{" "}
                {props.deviceInfo || "unknown"}
              </Text>
              <Text className="text-[14px] text-gray-600 m-0">
                <span className="font-medium">IP Address:</span>{" "}
                {props.ipAddress || "unknown"}
              </Text>
            </Section>

            {/* Security Notice */}
            <Section className="bg-blue-50 border border-blue-200 rounded-[8px] p-[20px] mb-[32px]">
              <Text className="text-[14px] text-blue-800 m-0 mb-[8px] font-semibold">
                🔒 Security Notice
              </Text>
              <Text className="text-[14px] text-blue-700 m-0 mb-[8px]">
                We use verification codes to keep your account secure.
              </Text>
              <Text className="text-[14px] text-blue-700 m-0">
                Never share this code with anyone. We'll never ask for it via
                phone or email.
              </Text>
            </Section>

            {/* Suspicious Activity Alert */}
            <Section className="bg-yellow-50 border border-yellow-200 rounded-[8px] p-[20px] mb-[32px]">
              <Text className="text-[14px] text-yellow-800 m-0 mb-[8px] font-semibold">
                ⚠️ Didn't Try to Sign In?
              </Text>
              <Text className="text-[14px] text-yellow-700 m-0 mb-[8px]">
                If you didn't attempt to sign in, someone may be trying to
                access your account.
              </Text>
              <Text className="text-[14px] text-yellow-700 m-0">
                Please secure your account immediately and contact our support
                team.
              </Text>
            </Section>

            <Hr className="border-gray-200 my-[32px]" />

            {/* Footer */}
            <Section className="text-center">
              <Text className="text-[14px] text-gray-500 m-0 mb-[8px]">
                Questions about this sign-in attempt? Contact support
              </Text>
              <Text className="text-[12px] text-gray-400 m-0 mb-[16px]">
                This email was sent to {props.userEmail}
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

SignInOTPEmail.PreviewProps = {
  otpCode: "738291",
  expiryMinutes: "5",
  userEmail: "alex@example.com",
  loginTime: "Dec 19, 2024 at 3:44 PM",
  loginLocation: "Istanbul, Turkey",
  deviceInfo: "Chrome on Windows",
  ipAddress: "85.105.123.45",
};

export default SignInOTPEmail;
