import {
  SignInOTPEmail,
  OTPVerificationEmail,
  PasswordResetOTPEmail,
  OrganizationInviteEmail,
} from "@better-auth-cloudflare-starter/transactional/emails";
import { Resend } from "resend";
import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { polarClient } from "./lib/payments";
import { db } from "@better-auth-cloudflare-starter/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { polar, checkout, portal } from "@polar-sh/better-auth";
import {
  admin,
  emailOTP,
  haveIBeenPwned,
  organization,
} from "better-auth/plugins";
import * as schema from "@better-auth-cloudflare-starter/db/schema/auth";
import dotenv from "dotenv";
dotenv.config({
  path: "../../apps/server/.env",
});

const resend = new Resend(
  process.env.RESEND_API_KEY || env.RESEND_API_KEY || "re_placeholder"
);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, url, token }, request) => {
        console.log(
          "Sending change email confirmation",
          user,
          url,
          token,
          request
        );
        await resend.emails.send({
          from: "BetterAuth <onboarding@resend.dev>",
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
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignInAfterVerification: true,
  },
  // uncomment cookieCache setting when ready to deploy to Cloudflare using *.workers.dev domains
  // session: {
  //   cookieCache: {
  //     enabled: true,
  //     maxAge: 60,
  //   },
  // },
  secret: process.env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || env.BETTER_AUTH_URL,
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
      partitioned: true,
    },
    // uncomment crossSubDomainCookies setting when ready to deploy and replace <your-workers-subdomain> with your actual workers subdomain
    // https://developers.cloudflare.com/workers/wrangler/configuration/#workersdev
    // crossSubDomainCookies: {
    //   enabled: true,
    //   domain: "<your-workers-subdomain>",
    // },
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
            from: "BetterAuth <onboarding@resend.dev>",
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
            from: "BetterAuth <onboarding@resend.dev>",
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
            from: "BetterAuth <onboarding@resend.dev>",
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
      createCustomerOnSignUp: false,
      enableCustomerPortal: true,
      use: [
        checkout({
          products: [
            {
              productId: "your-product-id",
              slug: "pro",
            },
          ],
          successUrl: env.POLAR_SUCCESS_URL,
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
          from: "BetterAuth <onboarding@resend.dev>",
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
