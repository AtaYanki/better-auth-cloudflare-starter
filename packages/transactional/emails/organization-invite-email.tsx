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

interface OrganizationInviteProps {
  inviterName: string;
  organizationName: string;
  inviteLink: string;
  expiresIn: number;
}

const OrganizationInvite = (props: OrganizationInviteProps) => {
  const { inviterName, organizationName, inviteLink, expiresIn } = props;

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>You've been invited to join {organizationName}</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] px-[32px] py-[40px] mx-auto max-w-[600px]">
            {/* Header */}
            <Section className="text-center mb-[32px]">
              <Heading className="text-[28px] font-bold text-gray-900 m-0 mb-[16px]">
                You're Invited!
              </Heading>
              <Text className="text-[16px] text-gray-600 m-0">
                Join {organizationName} and start collaborating with your team
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="mb-[32px]">
              <Text className="text-[16px] text-gray-800 leading-[24px] mb-[16px]">
                Hi there,
              </Text>
              <Text className="text-[16px] text-gray-800 leading-[24px] mb-[16px]">
                <strong>{inviterName}</strong> has invited you to join <strong>{organizationName}</strong>. 
                You'll have access to shared projects, team collaboration tools, and much more.
              </Text>
              <Text className="text-[16px] text-gray-800 leading-[24px] mb-[24px]">
                Click the button below to accept your invitation and get started:
              </Text>
            </Section>

            {/* CTA Button */}
            <Section className="text-center mb-[32px]">
              <Button
                href={inviteLink}
                className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border inline-block"
              >
                Accept Invitation
              </Button>
            </Section>

            {/* Additional Info */}
            <Section className="mb-[32px]">
              <Text className="text-[14px] text-gray-600 leading-[20px] mb-[16px]">
                If the button above doesn't work, you can copy and paste this link into your browser:
              </Text>
              <Text className="text-[14px] text-blue-600 break-all">
                {inviteLink}
              </Text>
            </Section>

            {/* Expiry Notice */}
            <Section className="bg-gray-50 rounded-[8px] p-[16px] mb-[32px]">
              <Text className="text-[14px] text-gray-700 m-0">
                <strong>Note:</strong> This invitation will expire in {expiresIn} days. If you have any questions, 
                please contact {inviterName} or our support team.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="border-t border-gray-200 pt-[24px]">
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0 mb-[8px]">
                {organizationName}
              </Text>
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0 mb-[8px]">
                123 Business Street, Suite 100, City, State 12345
              </Text>
              <Text className="text-[12px] text-gray-500 leading-[16px] m-0">
                © 2025 {organizationName}. All rights reserved. | 
                <a href="#" className="text-blue-600 no-underline ml-[4px]">Unsubscribe</a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

OrganizationInvite.PreviewProps = {
  inviterName: "Sarah Johnson",
  organizationName: "Tech Innovators Inc.",
  inviteLink: "https://app.example.com/invite/abc123",
  expiresIn: 7,
};

export default OrganizationInvite;