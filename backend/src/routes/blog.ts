import { Hono } from "hono";
import { Blog, HonoGeneric, payload } from "../types";
import { verify } from "hono/jwt";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const blogRoute = new Hono<HonoGeneric>();

blogRoute.use("/*", async (c, next) => {
  const bearerToken = c.req.header("Authorization");

  if (!bearerToken) {
    c.status(401);
    return c.json({ message: "unauthorized" });
  }

  const token = bearerToken.split(" ")[1];
  let payload: { userId: string };

  try {
    payload = await verify(token, c.env.JWT_SECRET);
  } catch (err) {
    c.status(401);
    return c.json({ message: "you are not login", err: err });
  }

  c.set("userId", payload.userId);
  await next();
});

blogRoute.post("/", async (c) => {
  const userId = c.get("userId");

  const body: {
    title: string;
    content: string;
  } = await c.req.json();

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  let blog: Blog;

  try {
    blog = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: userId,
      },
    });
  } catch (err) {
    c.status(403);
    return c.json({ message: "something went wrong" });
  }

  c.status(200);
  return c.json({
    id: blog.id,
  });
});

blogRoute.put("/", async (c) => {
  const body = await c.req.json();
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  let blog: Blog;

  try {
    blog = await prisma.post.update({
      where: { id: body.id },
      data: {
        title: body.title,
        content: body.content,
      },
    });
  } catch (err) {
    c.status(400);
    return c.json({ message: "went wrong" });
  }

  c.status(200);
  return c.json({ id: blog.id, message: "post updated", blog });
});

blogRoute.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  let blogs;

  try {
    blogs = await prisma.post.findMany();
  } catch (err) {
    c.status(400);
    return c.json({ message: "" });
  }

  c.status(200);
  return c.json({ blogs });
});

blogRoute.get("/:id", async (c) => {
  const blogId = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  let blog: Blog;

  try {
    blog = await prisma.post.findFirst({
      where: {
        id: blogId,
      },
    });
  } catch (err) {
    c.status(404);
    return c.json({ message: "not found" });
  }

  c.status(200);
  return c.json({ blog });
});

export default blogRoute;
