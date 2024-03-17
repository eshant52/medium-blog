import { z } from "zod";

// user signin
export const userSiginBody = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
});
export type UserSignInBody = z.infer<typeof userSiginBody>;

// user signup
export const userSignupBody = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type UserSignUpBody = z.infer<typeof userSignupBody>;

// blog post
export const blogPostBody = z.object({
  title: z.string(),
  content: z.string(),
});
export type BlogPostBody = z.infer<typeof blogPostBody>;

// blog put
export const blogPutBody = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
});
export type BlogPutBody = z.infer<typeof blogPutBody>;

// blog delete
export const blogDeleteBody = z.object({
  blogId: z.string(),
});
export type blogDeleteBody = z.infer<typeof blogDeleteBody>;
