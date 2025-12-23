import {
  SignInOTPEmail,
  OTPVerificationEmail,
  PasswordResetOTPEmail,
} from "@better-auth-cloudflare-starter/transactional/emails";
import { Resend } from "resend";
import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { polarClient } from "./lib/payments";
import { db } from "@better-auth-cloudflare-starter/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, emailOTP, haveIBeenPwned } from "better-auth/plugins";
import { polar, checkout, portal } from "@polar-sh/better-auth";
import * as schema from "@better-auth-cloudflare-starter/db/schema/auth";

const resend = new Resend(env.RESEND_API_KEY || "re_placeholder");

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
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
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
          // Send the OTP for sign in
          console.log("Sending OTP for sign in", email, otp);

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
          // Send the OTP for email verification
          console.log("Sending OTP for email verification", email, otp);

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
          // Send the OTP for password reset
          console.log("Sending OTP for password reset", email, otp);

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
  ],
});
