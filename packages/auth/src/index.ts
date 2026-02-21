import { env } from "cloudflare:workers";
import { db } from "@better-auth-cloudflare-starter/db";
import * as schema from "@better-auth-cloudflare-starter/db/schema/auth";
import {
	OrganizationInviteEmail,
	OTPVerificationEmail,
	PasswordResetEmail,
	PasswordResetOTPEmail,
	SignInOTPEmail,
} from "@better-auth-cloudflare-starter/transactional/emails";
import { checkout, polar, portal } from "@polar-sh/better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import {
	admin,
	emailOTP,
	haveIBeenPwned,
	organization,
} from "better-auth/plugins";
import { Resend } from "resend";
import { polarClient } from "./lib/payments";
import { POLAR_PRODUCTS } from "./lib/polar-products";

const resend = new Resend(env.RESEND_API_KEY || process.env.RESEND_API_KEY);
const EMAIL_FROM = "BetterAuth <onboarding@resend.dev>";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	trustedOrigins: [env.CORS_ORIGIN],
	user: {
		changeEmail: {
			enabled: true,
			sendChangeEmailConfirmation: async ({ user, token }) => {
				await resend.emails.send({
					from: EMAIL_FROM,
					to: user.email,
					subject: "Confirm your email address",
					react: OTPVerificationEmail({
						otpCode: token,
						expiryMinutes: "10",
						userEmail: user.email,
					}),
				});
			},
		},
		deleteUser: {
			enabled: true,
			afterDelete: async (user) => {
				await polarClient.customers.deleteExternal({
					externalId: user.id,
				});
			},
		},
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		autoSignInAfterVerification: true,
		sendResetPassword: async ({ user, url }) => {
			const webAppUrl = env.CORS_ORIGIN || process.env.CORS_ORIGIN || "";

			let resetUrl = url;
			if (webAppUrl) {
				try {
					const urlObj = new URL(url);
					const callbackURL = urlObj.searchParams.get("callbackURL");

					if (callbackURL) {
						const absoluteCallbackURL = callbackURL.startsWith("http")
							? callbackURL
							: `${webAppUrl}${callbackURL}`;

						urlObj.searchParams.set("callbackURL", absoluteCallbackURL);
						resetUrl = urlObj.toString();
					}
				} catch (error) {
					console.error("Failed to parse reset password URL:", error);
				}
			}

			await resend.emails.send({
				from: EMAIL_FROM,
				to: user.email,
				subject: "Reset your password",
				react: PasswordResetEmail({
					userEmail: user.email,
					resetLink: resetUrl,
					expiryTime: "1 hour",
				}),
			});
		},
	},
	...(env.NODE_ENV !== "development"
		? {
				session: {
					cookieCache: {
						enabled: true,
						maxAge: 60,
					},
				},
			}
		: {}),
	secret: env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL || process.env.BETTER_AUTH_URL,
	advanced: {
		...(env.NODE_ENV !== "development"
			? {
					defaultCookieAttributes: {
						sameSite: "none" as const,
						secure: true,
						httpOnly: true,
						partitioned: true,
					},
				}
			: {}),
	},
	plugins: [
		admin(),
		haveIBeenPwned({
			customPasswordCompromisedMessage: "Please choose a more secure password",
		}),
		emailOTP({
			sendVerificationOnSignUp: true,
			async sendVerificationOTP({ email, otp, type }, ctx) {
				if (type === "sign-in") {
					await resend.emails.send({
						from: EMAIL_FROM,
						to: email,
						subject: `${otp} is your sign in code`,
						react: SignInOTPEmail({
							otpCode: otp,
							expiryMinutes: "10",
							userEmail: email,
							loginTime: new Date().toLocaleString(),
							loginLocation:
								ctx?.request?.headers.get("x-forwarded-for") || null,
							deviceInfo: ctx?.request?.headers.get("user-agent") || null,
							ipAddress: ctx?.request?.headers.get("x-forwarded-for") || null,
						}),
					});
				} else if (type === "email-verification") {
					await resend.emails.send({
						from: EMAIL_FROM,
						to: email,
						subject: `${otp} is your verification code`,
						react: OTPVerificationEmail({
							otpCode: otp,
							expiryMinutes: "10",
							userEmail: email,
						}),
					});
				} else {
					await resend.emails.send({
						from: EMAIL_FROM,
						to: email,
						subject: `${otp} is your password reset code`,
						react: PasswordResetOTPEmail({
							otpCode: otp,
							expiryMinutes: "10",
							userEmail: email,
							requestDate: new Date().toLocaleString(),
							requestIP: ctx?.request?.headers.get("x-forwarded-for") || null,
						}),
					});
				}
			},
		}),
		polar({
			client: polarClient,
			createCustomerOnSignUp: true,
			enableCustomerPortal: true,
			use: [
		checkout({
					products: [
						{
							productId: POLAR_PRODUCTS.pro.id,
							slug: POLAR_PRODUCTS.pro.slug,
						},
					],
					successUrl: `${env.POLAR_SUCCESS_URL}?checkout_id={checkout_id}`,
					authenticatedUsersOnly: true,
				}),
				portal(),
			],
		}),
		organization({
			teams: {
				enabled: true,
			},
			requireEmailVerificationOnInvitation: true,
			sendInvitationEmail: async (data) => {
				const invitationUrl = `${env.CORS_ORIGIN}/accept-invitation?invitationId=${data.id}`;
				await resend.emails.send({
					from: EMAIL_FROM,
					to: data.email,
					subject: `${data.inviter.user.name} has invited you to join ${data.organization.name}`,
					react: OrganizationInviteEmail({
						inviterName: data.inviter.user.name,
						organizationName: data.organization.name,
						inviteLink: invitationUrl,
						expiresIn: 7,
					}),
				});
			},
		}),
	],
});
