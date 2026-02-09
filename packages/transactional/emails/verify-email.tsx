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
				<Body className="bg-gray-100 py-[40px] font-sans">
					<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white p-[40px]">
						{/* Header */}
						<Section className="mb-[32px] text-center">
							<Heading className="m-0 mb-[8px] font-bold text-[28px] text-gray-900">
								Verify Your Email Address
							</Heading>
							<Text className="m-0 text-[16px] text-gray-600">
								Please use the verification code below to complete your
								registration
							</Text>
						</Section>

						{/* OTP Code Section */}
						<Section className="mb-[32px] text-center">
							<div className="mb-[16px] rounded-[8px] border border-gray-200 bg-gray-50 p-[24px]">
								<Text className="m-0 mb-[8px] text-[14px] text-gray-600 uppercase tracking-wide">
									Your Verification Code
								</Text>
								<Text className="letter-spacing-[8px] m-0 font-bold font-mono text-[36px] text-gray-900">
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
								Enter this verification code in the application to verify your
								email address and complete your account setup.
							</Text>
							<Text className="m-0 text-[16px] text-gray-700">
								If you didn't request this verification code, please ignore this
								email or contact our support team if you have concerns.
							</Text>
						</Section>

						{/* Security Notice */}
						<Section className="mb-[32px] rounded-[8px] border border-blue-200 bg-blue-50 p-[20px]">
							<Text className="m-0 mb-[8px] font-semibold text-[14px] text-blue-800">
								🔒 Security Notice
							</Text>
							<Text className="m-0 text-[14px] text-blue-700">
								Never share this code with anyone. Our team will never ask for
								your verification code.
							</Text>
						</Section>

						<Hr className="my-[32px] border-gray-200" />

						{/* Footer */}
						<Section className="text-center">
							<Text className="m-0 mb-[8px] text-[14px] text-gray-500">
								Need help? Contact our support team
							</Text>
							<Text className="m-0 mb-[16px] text-[12px] text-gray-400">
								This email was sent to {props.userEmail}
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

OTPVerificationEmail.PreviewProps = {
	otpCode: "847392",
	expiryMinutes: "10",
	userEmail: "john@example.com",
};

export default OTPVerificationEmail;
