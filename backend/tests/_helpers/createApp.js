import express from "express";

export function createApp() {
  const app = express();
  app.use(express.json());
  return app;
}

// Middleware que simula requireAuth y permite configurar el rol
export function fakeAuth(as = { sub: "u1", rol: "ADMIN" }) {
  return (req, _res, next) => {
    req.user = as;
    next();
  };
}
