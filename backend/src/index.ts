import { Hono } from "hono";
import { HonoGeneric } from "./types";
import blogRoute from "./routes/blog";
import userRoute from "./routes/user";

const app = new Hono<HonoGeneric>();

app.get("/", async (c) => {
  console.log(c.env.JWT_SECRET);

  return c.json({message: "medium blog"});
});

app.route("/api/v1/user", userRoute);
app.route("/api/v1/blog", blogRoute);

export default app;
