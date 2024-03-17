export type User = {
  id: string;
  email: string;
  name: string | null;
  password: string;
} | null;

export type Blog = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  authorId: string;
} | null;

export type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
};

export type Variables = {
  userId: string;
};

export type HonoGeneric = {
  Bindings: Bindings;
  Variables: Variables;
};

export type payload = {
      userId: string;
    }
  | {
      exp: number;
      nbf: number;
      iat: number;
    };
