import { Router } from "express";
import {
  SchemaValidator,
  roleValidator,
  tokenValidator,
} from "../../middlewares/index.mjs";
import {
  phoneNumberSchema,
  userRegistrationSchema,
  otpTokenSchema,
  loginSchema,
  ROLES,
  resetPasswordSchema,
  userUpdateSchema,
} from "../../models/index.mjs";
import {
  refreshTokenHandler,
  resetPassword,
  sendOTP,
  updateFields,
  userLogOut,
  userLogin,
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

AuthRoutes.post(
  "/login",
  // hcaptcha.middleware.validate(process.env.CAPTCHA_SECRET),
  SchemaValidator(loginSchema),
  userLogin
);

AuthRoutes.post("/send-code", SchemaValidator(phoneNumberSchema), sendOTP);
AuthRoutes.post("/verify-code", SchemaValidator(otpTokenSchema), verifyCode);

AuthRoutes.get(
  "/logout",
  tokenValidator,
  roleValidator(ROLES.PARTICIPANT),
  userLogOut
);
AuthRoutes.get("/refresh", refreshTokenHandler);

AuthRoutes.post(
  "/password",
  tokenValidator,
  roleValidator(ROLES.PARTICIPANT),
  SchemaValidator(resetPasswordSchema),
  resetPassword
);

AuthRoutes.post(
  "/update",
  tokenValidator,
  roleValidator(ROLES.PARTICIPANT),
  SchemaValidator(userUpdateSchema),
  updateFields
);
