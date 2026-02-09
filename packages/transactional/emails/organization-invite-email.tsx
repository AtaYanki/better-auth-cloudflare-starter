import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Preview,
	Section,
	Tailwind,
	Text,
} from "@react-email/components";

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
				<Body className="bg-gray-100 py-[40px] font-sans">
					<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white px-[32px] py-[40px]">
						{/* Header */}
						<Section className="mb-[32px] text-center">
							<Heading className="m-0 mb-[16px] font-bold text-[28px] text-gray-900">
								You're Invited!
							</Heading>
							<Text className="m-0 text-[16px] text-gray-600">
								Join {organizationName} and start collaborating with your team
							</Text>
						</Section>

						{/* Main Content */}
						<Section className="mb-[32px]">
							<Text className="mb-[16px] text-[16px] text-gray-800 leading-[24px]">
								Hi there,
							</Text>
							<Text className="mb-[16px] text-[16px] text-gray-800 leading-[24px]">
								<strong>{inviterName}</strong> has invited you to join{" "}
								<strong>{organizationName}</strong>. You'll have access to
								shared projects, team collaboration tools, and much more.
							</Text>
							<Text className="mb-[24px] text-[16px] text-gray-800 leading-[24px]">
								Click the button below to accept your invitation and get
								started:
							</Text>
						</Section>

						{/* CTA Button */}
						<Section className="mb-[32px] text-center">
							<Button
								href={inviteLink}
								className="box-border inline-block rounded-[8px] bg-blue-600 px-[32px] py-[16px] font-semibold text-[16px] text-white no-underline"
							>
								Accept Invitation
							</Button>
						</Section>

						{/* Additional Info */}
						<Section className="mb-[32px]">
							<Text className="mb-[16px] text-[14px] text-gray-600 leading-[20px]">
								If the button above doesn't work, you can copy and paste this
								link into your browser:
							</Text>
							<Text className="break-all text-[14px] text-blue-600">
								{inviteLink}
							</Text>
						</Section>

						{/* Expiry Notice */}
						<Section className="mb-[32px] rounded-[8px] bg-gray-50 p-[16px]">
							<Text className="m-0 text-[14px] text-gray-700">
								<strong>Note:</strong> This invitation will expire in{" "}
								{expiresIn} days. If you have any questions, please contact{" "}
								{inviterName} or our support team.
							</Text>
						</Section>

						{/* Footer */}
						<Section className="border-gray-200 border-t pt-[24px]">
							<Text className="m-0 mb-[8px] text-[12px] text-gray-500 leading-[16px]">
								{organizationName}
							</Text>
							<Text className="m-0 mb-[8px] text-[12px] text-gray-500 leading-[16px]">
								123 Business Street, Suite 100, City, State 12345
							</Text>
							<Text className="m-0 text-[12px] text-gray-500 leading-[16px]">
								© 2025 {organizationName}. All rights reserved. |
								<a
									href="support@example.com"
									className="ml-[4px] text-blue-600 no-underline"
								>
									Unsubscribe
								</a>
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
