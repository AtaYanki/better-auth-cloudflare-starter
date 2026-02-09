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
				<Body className="bg-gray-100 py-[40px] font-sans">
					<Container className="mx-auto max-w-[600px] rounded-[8px] bg-white p-[40px]">
						{/* Header */}
						<Section className="mb-[32px] text-center">
							<Heading className="m-0 mb-[8px] font-bold text-[28px] text-gray-900">
								Sign In to Your Account
							</Heading>
							<Text className="m-0 text-[16px] text-gray-600">
								Complete your sign-in with the verification code below
							</Text>
						</Section>

						{/* OTP Code Section */}
						<Section className="mb-[32px] text-center">
							<div className="mb-[16px] rounded-[8px] border border-green-200 bg-green-50 p-[24px]">
								<Text className="m-0 mb-[8px] text-[14px] text-green-600 uppercase tracking-wide">
									Sign-In Verification Code
								</Text>
								<Text className="letter-spacing-[8px] m-0 font-bold font-mono text-[36px] text-green-700">
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
								Someone is trying to sign in to your account. Enter this
								verification code to complete your sign-in process.
							</Text>
							<Text className="m-0 mb-[16px] text-[16px] text-gray-700">
								If you didn't attempt to sign in, please ignore this email and
								consider changing your password for security.
							</Text>
							<Text className="m-0 text-[16px] text-gray-700">
								This code is single-use and will expire automatically for your
								protection.
							</Text>
						</Section>

						{/* Login Details */}
						<Section className="mb-[32px] rounded-[8px] border border-gray-200 bg-gray-50 p-[20px]">
							<Text className="m-0 mb-[8px] font-semibold text-[14px] text-gray-800">
								📍 Sign-In Details
							</Text>
							<Text className="m-0 mb-[4px] text-[14px] text-gray-600">
								<span className="font-medium">Time:</span> {props.loginTime}
							</Text>
							<Text className="m-0 mb-[4px] text-[14px] text-gray-600">
								<span className="font-medium">Location:</span>{" "}
								{props.loginLocation || "unknown"}
							</Text>
							<Text className="m-0 mb-[4px] text-[14px] text-gray-600">
								<span className="font-medium">Device:</span>{" "}
								{props.deviceInfo || "unknown"}
							</Text>
							<Text className="m-0 text-[14px] text-gray-600">
								<span className="font-medium">IP Address:</span>{" "}
								{props.ipAddress || "unknown"}
							</Text>
						</Section>

						{/* Security Notice */}
						<Section className="mb-[32px] rounded-[8px] border border-blue-200 bg-blue-50 p-[20px]">
							<Text className="m-0 mb-[8px] font-semibold text-[14px] text-blue-800">
								🔒 Security Notice
							</Text>
							<Text className="m-0 mb-[8px] text-[14px] text-blue-700">
								We use verification codes to keep your account secure.
							</Text>
							<Text className="m-0 text-[14px] text-blue-700">
								Never share this code with anyone. We'll never ask for it via
								phone or email.
							</Text>
						</Section>

						{/* Suspicious Activity Alert */}
						<Section className="mb-[32px] rounded-[8px] border border-yellow-200 bg-yellow-50 p-[20px]">
							<Text className="m-0 mb-[8px] font-semibold text-[14px] text-yellow-800">
								⚠️ Didn't Try to Sign In?
							</Text>
							<Text className="m-0 mb-[8px] text-[14px] text-yellow-700">
								If you didn't attempt to sign in, someone may be trying to
								access your account.
							</Text>
							<Text className="m-0 text-[14px] text-yellow-700">
								Please secure your account immediately and contact our support
								team.
							</Text>
						</Section>

						<Hr className="my-[32px] border-gray-200" />

						{/* Footer */}
						<Section className="text-center">
							<Text className="m-0 mb-[8px] text-[14px] text-gray-500">
								Questions about this sign-in attempt? Contact support
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
