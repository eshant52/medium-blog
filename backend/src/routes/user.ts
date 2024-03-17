import { Hono } from "hono";
import { HonoGeneric, payload } from "../types";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
import { User } from "../types";
import { setExpiration } from "../utils";
import { userSiginBody, userSignupBody } from "@medium-blog/common";

const userRoute = new Hono<HonoGeneric>();

userRoute.post("/signup", async (c) => {
  const body = await c.req.json();
  
  const res = userSignupBody.safeParse(body);
  
  if (!res.success) {
    c.status(400);
    return c.json({ message: "Invalid request", error: res.error });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  let user: User;

  try {
    user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
      },
    });
  } catch (error) {
    if (error.code == "P2002") {
      c.status(403);
      return c.json({ message: "User email already exist" });
    }

    c.status(502);
    return c.json({ error: "Error from server side" });
  }

  const payload = {
    userId: user.id,
    exp: setExpiration(), // 12hr
  };

  let token: string;

  try {
    token = await sign(payload, c.env.JWT_SECRET);
  } catch (err) {
    c.status(500);
    return c.json({ message: "Error while creating token" });
  }

  c.status(200);
  return c.json({ token });
});

userRoute.post("/signin", async (c) => {
  const body = await c.req.json();
  
  const res = userSiginBody.safeParse(body);
  
  if (!res.success) {
    c.status(400);
    return c.json({ message: "Invalid request", error: res.error });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  let user: User;

  try {
    user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Internal Server" });
  }

  if (!user) {
    c.status(404);
    return c.json({ message: "user email does not exist" });
  }

  if (user.password != body.password) {
    c.status(401);
    return c.json({ message: "Wrong creadentials" });
  }

  let token: string;

  const payload = {
    userId: user.id,
    exp: setExpiration(),
  };

  try {
    token = await sign(payload, c.env.JWT_SECRET);
  } catch (error) {
    c.status(500);
    return c.json({
      message: "Something went wrong while creating  jwt token",
    });
  }

  c.status(200);
  return c.json({ token });
});

export default userRoute;
