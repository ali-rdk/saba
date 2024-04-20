import { Router } from "express";
import {
  Address,
  Email,
  PhoneNumber,
  ROLES,
  User,
} from "../../models/index.mjs";
import { roleValidator, tokenValidator } from "../../middlewares/index.mjs";

export const getSingleUser = async ({ user }, res) => {
  const wantedUser = await User.findOne({
    national_id: user.national_id,
  });
  const { address, phone_number, email, ...restUser } = wantedUser._doc;
  const user_address = await Address.findById(address);
  const phone = await PhoneNumber.findById(phone_number);
  const user_email = await Email.findById(email);
  const userData = {
    ...restUser,
    email: user_email.email,
    phone_number: phone.phone_number,
    province: user_address.province,
    city: user_address.city,
    postal_code: user_address.psotal_code,
  };
  return res.status(200).json({ user: userData });
};

export const generalRoutes = Router();

generalRoutes.get(
  "/single-user",
  tokenValidator,
  roleValidator(ROLES.PARTICIPANT),
  getSingleUser
);
