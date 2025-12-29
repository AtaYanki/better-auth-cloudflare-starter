import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';

interface PasswordResetEmailProps {
  userEmail: string;
  resetLink: string;
  expiryTime: string;
}

const PasswordResetEmail = (props: PasswordResetEmailProps) => {
  const { userEmail, resetLink, expiryTime } = props;

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Reset your password - Action required</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] px-[32px] py-[40px] mx-auto max-w-[600px]">
            {/* Header */}
            <Section className="text-center mb-[32px]">
              <Heading className="text-[28px] font-bold text-gray-900 m-0 mb-[16px]">
                Reset Your Password
              </Heading>
              <Text className="text-[16px] text-gray-600 m-0">
                We received a request to reset your password
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="mb-[32px]">
              <Text className="text-[16px] text-gray-800 leading-[24px] mb-[16px]">
                Hello,
              </Text>
              <Text className="text-[16px] text-gray-800 leading-[24px] mb-[16px]">
                We received a request to reset the password for your account associated with <strong>{userEmail}</strong>.
              </Text>
              <Text className="text-[16px] text-gray-800 leading-[24px] mb-[24px]">
                Click the button below to create a new password:
              </Text>
            </Section>

            {/* CTA Button */}
            <Section className="text-center mb-[32px]">
              <Button
                href={resetLink}
                className="bg-red-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border inline-block"
              >
                Reset Password
              </Button>
            </Section>

            {/* Security Notice */}
            <Section className="bg-yellow-50 border border-yellow-200 rounded-[8px] p-[16px] mb-[32px]">
              <Text className="text-[14px] text-yellow-800 m-0 mb-[8px]">
                <strong>Security Notice:</strong>
              </Text>
              <Text className="text-[14px] text-yellow-800 m-0 mb-[8px]">
                • This link will expire in {expiryTime}
              </Text>
              <Text className="text-[14px] text-yellow-800 m-0 mb-[8px]">
                • This link can only be used once
              </Text>
              <Text className="text-[14px] text-yellow-800 m-0">
                • If you didn't request this reset, please ignore this email
              </Text>
            </Section>

            {/* Alternative Link */}
            <Section className="mb-[32px]">
              <Text className="text-[14px] text-gray-600 leading-[20px] mb-[16px]">
                If the button above doesn't work, copy and paste this link into your browser:
              </Text>
              <Text className="text-[14px] text-blue-600 break-all bg-gray-50 p-[12px] rounded-[4px]">
                {resetLink}
              </Text>
            </Section>

            {/* Help Section */}
            <Section className="mb-[32px]">
              <Text className="text-[16px] text-gray-800 leading-[24px] mb-[16px]">
                <strong>Didn't request this?</strong>
              </Text>
              <Text className="text-[14px] text-gray-600 leading-[20px] mb-[16px]">
                If you didn't request a password reset, you can safely ignore this email. 
                Your password will remain unchanged, and no further action is required.
              </Text>
              <Text className="text-[14px] text-gray-600 leading-[20px]">
                If you're concerned about your account security, please contact our support team immediately.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="border-t border-gray-200 pt-[24px]">
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0 mb-[8px]">
                Your Security Team
              </Text>
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0 mb-[8px]">
                123 Security Boulevard, Suite 200, City, State 12345
              </Text>
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0">
                © 2025 Your Company. All rights reserved. | 
                <a href="#" className="text-blue-600 no-underline ml-[4px]">Contact Support</a> |
                <a href="#" className="text-blue-600 no-underline ml-[4px]">Unsubscribe</a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

PasswordResetEmail.PreviewProps = {
  userEmail: "john.doe@example.com",
  resetLink: "https://app.example.com/reset-password?token=abc123xyz789",
  expiryTime: "1 hour",
};

export default PasswordResetEmail;