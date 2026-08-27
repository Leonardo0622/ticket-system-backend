import { Router } from "express";
import { register, login, logout, me, listUsers, updateUserController, deleteUserController } from "../controllers/auth.controller";
import { registerSchema, loginSchema, updateUserSchema } from "../validators/auth.schema";
import { Validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import rateLimit from "express-rate-limit";


const router = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many login attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    message: { message: "Too many registration attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false
});


router.post("/register", registerLimiter, Validate(registerSchema), register);
router.post("/login", loginLimiter, Validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);
router.get("/users", authMiddleware, authorizeRoles("admin"), listUsers);
router.put("/users/:id", authMiddleware, authorizeRoles("admin"), Validate(updateUserSchema), updateUserController);
router.delete("/users/:id", authMiddleware, authorizeRoles("admin"), deleteUserController);

export default router;