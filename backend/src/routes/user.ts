import { Hono } from "hono";
import { HonoGeneric, payload } from "../types";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
import { User } from "../types";
import { setExpiration } from "../utils";

const userRoute = new Hono<HonoGeneric>();

userRoute.post("/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body: { email: string; password: string } = await c.req.json();

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
      c.status(409);
      return c.json({ message: "User email already exist" });
    }

    c.status(403);
    return c.json({ error: "error while signing up" });
  }

  const payload = {
    userId: user.id,
    exp: setExpiration(), // 12hr
  }

  if (user) {
    const token = await sign(payload, c.env.JWT_SECRET);
    return c.json({ token });
  } else {
    return c.json({ message: "user does not exist" });
  }
});

userRoute.post("/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body: { email: string; password: string } = await c.req.json();

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

  if (user?.password != body.password) {
    c.status(403);
    return c.json({ message: "Wrong creadentials" });
  }

  const payload = {
    userId: user.id,
    exp: setExpiration()
  };

  if (user) {
    const token = await sign(payload, c.env.JWT_SECRET);
    c.status(200);
    return c.json({ token });
  } else {
    c.status(404);
    return c.json({ message: "not found" });
  }
});

export default userRoute;