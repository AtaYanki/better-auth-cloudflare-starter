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

interface OTPVerificationEmailProps {
  otpCode: string;
  expiryMinutes: string;
  userEmail: string;
}

const OTPVerificationEmail = (props: OTPVerificationEmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] max-w-[600px] mx-auto p-[40px]">
            {/* Header */}
            <Section className="text-center mb-[32px]">
              <Heading className="text-[28px] font-bold text-gray-900 m-0 mb-[8px]">
                Verify Your Email Address
              </Heading>
              <Text className="text-[16px] text-gray-600 m-0">
                Please use the verification code below to complete your
                registration
              </Text>
            </Section>

            {/* OTP Code Section */}
            <Section className="text-center mb-[32px]">
              <div className="bg-gray-50 border border-gray-200 rounded-[8px] p-[24px] mb-[16px]">
                <Text className="text-[14px] text-gray-600 m-0 mb-[8px] uppercase tracking-wide">
                  Your Verification Code
                </Text>
                <Text className="text-[36px] font-bold text-gray-900 m-0 letter-spacing-[8px] font-mono">
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
                Enter this verification code in the application to verify your
                email address and complete your account setup.
              </Text>
              <Text className="text-[16px] text-gray-700 m-0">
                If you didn't request this verification code, please ignore this
                email or contact our support team if you have concerns.
              </Text>
            </Section>

            {/* Security Notice */}
            <Section className="bg-blue-50 border border-blue-200 rounded-[8px] p-[20px] mb-[32px]">
              <Text className="text-[14px] text-blue-800 m-0 mb-[8px] font-semibold">
                🔒 Security Notice
              </Text>
              <Text className="text-[14px] text-blue-700 m-0">
                Never share this code with anyone. Our team will never ask for
                your verification code.
              </Text>
            </Section>

            <Hr className="border-gray-200 my-[32px]" />

            {/* Footer */}
            <Section className="text-center">
              <Text className="text-[14px] text-gray-500 m-0 mb-[8px]">
                Need help? Contact our support team
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

OTPVerificationEmail.PreviewProps = {
  otpCode: "847392",
  expiryMinutes: "10",
  userEmail: "john@example.com",
};

export default OTPVerificationEmail;
