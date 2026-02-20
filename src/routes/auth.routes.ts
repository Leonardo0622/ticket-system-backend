import { Router } from "express";
import { register, login, listUsers, updateUserController, deleteUserController } from "../controllers/auth.controller";
import { registerSchema, loginSchema  } from "../validators/auth.schema";
import { Validate } from "../middlewares/validate.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";


const router = Router();


router.post("/register",Validate(registerSchema),register);
router.post("/login",Validate(loginSchema),login);
router.get("/users",authMiddleware,listUsers);
router.put("users/:id", authMiddleware,updateUserController);
router.delete("/users/:id", authMiddleware, deleteUserController);

export default router;