import { Hono } from "hono";
import { Blog, HonoGeneric, payload } from "../types";
import { verify } from "hono/jwt";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { blogPostBody, blogPutBody } from "@medium-blog/common";

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
  } catch (error) {
    c.status(401);
    return c.json({ message: "you are not login", error: error });
  }

  c.set("userId", payload.userId);
  await next();
});

blogRoute.post("/", async (c) => {
  const userId = c.get("userId");

  const body = await c.req.json();

  const res = blogPostBody.safeParse(body);

  if (!res.success) {
    c.status(400);
    return c.json({ message: "bad request", error: res.error });
  }

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
    c.status(502);
    return c.json({ message: "something went wrong" });
  }

  c.status(200);
  return c.json({
    message: "blog created",
    blog,
  });
});

blogRoute.put("/", async (c) => {
  const body = await c.req.json();

  const res = blogPutBody.safeParse(body);

  if (!res.success) {
    c.status(400);
    return c.json({message: "Bad request", error: res.error});
  }

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

  if (!blog) {
    c.status(404);
    return c.json({message: "blog doesn't exist"});
  }

  c.status(200);
  return c.json({
    message: "post updated",
    blog,
  });
});

blogRoute.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  let blogs: Blog[];
  
  try {
    blogs = await prisma.post.findMany();
  } catch (err) {
    c.status(500);
    return c.json({ message: "Something went wrong" });
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
    c.status(500);
    return c.json({ message: "Something went wrong" });
  }

  if (!blog) {
    c.status(404);
    return c.json({message: "Blog does not exist"});
  }

  c.status(200);
  return c.json({ blog });
});

export default blogRoute;
