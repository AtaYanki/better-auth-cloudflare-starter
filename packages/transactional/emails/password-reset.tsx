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
				<Body className="bg-gray-100 py-[40px] font-sans">
					<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white px-[32px] py-[40px]">
						{/* Header */}
						<Section className="mb-[32px] text-center">
							<Heading className="m-0 mb-[16px] font-bold text-[28px] text-gray-900">
								Reset Your Password
							</Heading>
							<Text className="m-0 text-[16px] text-gray-600">
								We received a request to reset your password
							</Text>
						</Section>

						{/* Main Content */}
						<Section className="mb-[32px]">
							<Text className="mb-[16px] text-[16px] text-gray-800 leading-[24px]">
								Hello,
							</Text>
							<Text className="mb-[16px] text-[16px] text-gray-800 leading-[24px]">
								We received a request to reset the password for your account
								associated with <strong>{userEmail}</strong>.
							</Text>
							<Text className="mb-[24px] text-[16px] text-gray-800 leading-[24px]">
								Click the button below to create a new password:
							</Text>
						</Section>

						{/* CTA Button */}
						<Section className="mb-[32px] text-center">
							<Button
								href={resetLink}
								className="box-border inline-block rounded-[8px] bg-red-600 px-[32px] py-[16px] font-semibold text-[16px] text-white no-underline"
							>
								Reset Password
							</Button>
						</Section>

						{/* Security Notice */}
						<Section className="mb-[32px] rounded-[8px] border border-yellow-200 bg-yellow-50 p-[16px]">
							<Text className="m-0 mb-[8px] text-[14px] text-yellow-800">
								<strong>Security Notice:</strong>
							</Text>
							<Text className="m-0 mb-[8px] text-[14px] text-yellow-800">
								• This link will expire in {expiryTime}
							</Text>
							<Text className="m-0 mb-[8px] text-[14px] text-yellow-800">
								• This link can only be used once
							</Text>
							<Text className="m-0 text-[14px] text-yellow-800">
								• If you didn't request this reset, please ignore this email
							</Text>
						</Section>

						{/* Alternative Link */}
						<Section className="mb-[32px]">
							<Text className="mb-[16px] text-[14px] text-gray-600 leading-[20px]">
								If the button above doesn't work, copy and paste this link into
								your browser:
							</Text>
							<Text className="break-all rounded-[4px] bg-gray-50 p-[12px] text-[14px] text-blue-600">
								{resetLink}
							</Text>
						</Section>

						{/* Help Section */}
						<Section className="mb-[32px]">
							<Text className="mb-[16px] text-[16px] text-gray-800 leading-[24px]">
								<strong>Didn't request this?</strong>
							</Text>
							<Text className="mb-[16px] text-[14px] text-gray-600 leading-[20px]">
								If you didn't request a password reset, you can safely ignore
								this email. Your password will remain unchanged, and no further
								action is required.
							</Text>
							<Text className="text-[14px] text-gray-600 leading-[20px]">
								If you're concerned about your account security, please contact
								our support team immediately.
							</Text>
						</Section>

						{/* Footer */}
						<Section className="border-gray-200 border-t pt-[24px]">
							<Text className="m-0 mb-[8px] text-[12px] text-gray-500 leading-[16px]">
								Your Security Team
							</Text>
							<Text className="m-0 mb-[8px] text-[12px] text-gray-500 leading-[16px]">
								123 Security Boulevard, Suite 200, City, State 12345
							</Text>
							<Text className="m-0 text-[12px] text-gray-500 leading-[16px]">
								© 2025 Your Company. All rights reserved. |
								<a
									href="support@example.com"
									className="ml-[4px] text-blue-600 no-underline"
								>
									Contact Support
								</a>{" "}
								|
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

PasswordResetEmail.PreviewProps = {
	userEmail: "john.doe@example.com",
	resetLink: "https://app.example.com/reset-password?token=abc123xyz789",
	expiryTime: "1 hour",
};

export default PasswordResetEmail;
