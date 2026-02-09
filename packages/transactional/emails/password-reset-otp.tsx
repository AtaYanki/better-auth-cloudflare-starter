import {
	Body,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Section,
	Tailwind,
	Text,
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
				<Body className="bg-gray-100 py-[40px] font-sans">
					<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white p-[40px]">
						{/* Header */}
						<Section className="mb-[32px] text-center">
							<Heading className="m-0 mb-[8px] font-bold text-[28px] text-gray-900">
								Reset Your Password
							</Heading>
							<Text className="m-0 text-[16px] text-gray-600">
								Use the verification code below to reset your password
							</Text>
						</Section>

						{/* OTP Code Section */}
						<Section className="mb-[32px] text-center">
							<div className="mb-[16px] rounded-[8px] border border-red-200 bg-red-50 p-[24px]">
								<Text className="m-0 mb-[8px] text-[14px] text-red-600 uppercase tracking-wide">
									Password Reset Code
								</Text>
								<Text className="letter-spacing-[8px] m-0 font-bold font-mono text-[36px] text-red-700">
									{props.otpCode}
								</Text>
							</div>
							<Text className="m-0 text-[14px] text-gray-500">
								This code will expire in {props.expiryMinutes} minutes
							</Text>
						</Section>

						{/* Instructions */}
						<Section className="mb-[32px]">
							<Text className="m-0 mb-[16px] text-[16px] text-gray-700">
								Hi {props.userEmail},
							</Text>
							<Text className="m-0 mb-[16px] text-[16px] text-gray-700">
								We received a request to reset the password for your account.
								Enter this verification code in the application to proceed with
								resetting your password.
							</Text>
							<Text className="m-0 mb-[16px] text-[16px] text-gray-700">
								If you didn't request a password reset, please ignore this
								email. Your password will remain unchanged.
							</Text>
							<Text className="m-0 text-[16px] text-gray-700">
								For your security, this code can only be used once and will
								expire automatically.
							</Text>
						</Section>

						{/* Security Alert */}
						<Section className="mb-[32px] rounded-[8px] border border-amber-200 bg-amber-50 p-[20px]">
							<Text className="m-0 mb-[8px] font-semibold text-[14px] text-amber-800">
								⚠️ Security Alert
							</Text>
							<Text className="m-0 mb-[8px] text-[14px] text-amber-700">
								Someone requested a password reset for your account.
							</Text>
							<Text className="m-0 text-[14px] text-amber-700">
								If this wasn't you, please secure your account immediately and
								contact support.
							</Text>
						</Section>

						{/* Additional Security Info */}
						<Section className="mb-[32px] rounded-[8px] border border-blue-200 bg-blue-50 p-[20px]">
							<Text className="m-0 mb-[8px] font-semibold text-[14px] text-blue-800">
								🔒 Security Tips
							</Text>
							<Text className="m-0 mb-[8px] text-[14px] text-blue-700">
								• Never share this code with anyone
							</Text>
							<Text className="m-0 mb-[8px] text-[14px] text-blue-700">
								• Choose a strong, unique password
							</Text>
							<Text className="m-0 text-[14px] text-blue-700">
								• Enable two-factor authentication for added security
							</Text>
						</Section>

						<Hr className="my-[32px] border-gray-200" />

						{/* Footer */}
						<Section className="text-center">
							<Text className="m-0 mb-[8px] text-[14px] text-gray-500">
								Need help? Contact our support team immediately
							</Text>
							<Text className="m-0 mb-[16px] text-[12px] text-gray-400">
								This email was sent to {props.userEmail}
							</Text>
							<Text className="m-0 mb-[8px] text-[12px] text-gray-400">
								Request made on {props.requestDate} from IP:{" "}
								{props.requestIP || "unknown"}
							</Text>

							<Text className="m-0 mb-[8px] text-[12px] text-gray-400">
								© {new Date().getFullYear()} Your Company Name. All rights
								reserved.
							</Text>
							<Text className="m-0 text-[12px] text-gray-400">
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
