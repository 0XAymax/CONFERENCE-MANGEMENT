import z from "zod";
import { procedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { sendMail } from "@/lib/mail";

const JWT_SECRET = process.env.JWT_SECRET || "scret";
const EMAIL_TOKEN_SECRET = process.env.EMAIL_TOKEN_SECRET!;
export const authRouter = router({
  register: procedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already in use",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const user = await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      return { user };
    }),
  login: procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const userWithPassword = await prisma.user.findUnique({
        where: { email: input.email },
      });

      if (!userWithPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const isValid = await bcrypt.compare(
        input.password,
        userWithPassword.password
      );

      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const token = jwt.sign(
        { userId: userWithPassword.id, email: userWithPassword.email },
        JWT_SECRET,
        { expiresIn: "30d" }
      );

      return {
        user: {
          id: userWithPassword.id,
          name: userWithPassword.name,
          email: userWithPassword.email,
        },
        token,
      };
    }),
  verifyToken: procedure
    .input(
      z.object({
        token: z.string(),
        secret: z.string(),
      })
    )
    .query(({ input }) => {
      try {
        jwt.verify(input.token, input.secret);
        return true;
      } catch {
        return false;
      }
    }),
  sendVerificationEmail: procedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const token = jwt.sign(
        { email: input.email, type: "email-verification" },
        EMAIL_TOKEN_SECRET!,
        { expiresIn: "15m" }
      );

      await sendMail(input.email, token);
      return { success: true };
    }),
  verifyEmailToken: procedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const decoded = jwt.verify(input.token, EMAIL_TOKEN_SECRET!) as {
          email: string;
          type: string;
        };

        if (decoded.type !== "email-verification") {
          throw new Error("Invalid token type.");
        }
        return { success: true };
      } catch (error) {
        console.error("Invalid or expired token", error);
        return { success: false, message: "Invalid or expired token" };
      }
    }),
});
