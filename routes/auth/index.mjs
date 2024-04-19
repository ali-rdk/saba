import { Router } from "express";
import { SchemaValidator } from "../../middlewares/index.mjs";
import {
  phoneNumberSchema,
  userRegistrationSchema,
  otpTokenSchema,
} from "../../models/index.mjs";
import {
  sendOTP,
  userRegister,
  verifyCode,
} from "../../controllers/auth/index.mjs";
import hcaptcha from "express-hcaptcha";

export const AuthRoutes = Router();

AuthRoutes.post(
  "/signup",
  // hcaptcha.middleware.validate(process.env.CAPTCHA_SECRET),
  SchemaValidator(userRegistrationSchema),
  userRegister
);

AuthRoutes.post("/send-code", SchemaValidator(phoneNumberSchema), sendOTP);

AuthRoutes.post("/verify-code", SchemaValidator(otpTokenSchema), verifyCode);
