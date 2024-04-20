import yup, { ref, string } from "yup";
import { model, Schema } from "mongoose";
import { ROLES } from "./roles.mjs";

export const userRegistrationSchema = yup.object({
  body: yup.object({
    name: yup.string().required(),
    lastname: yup.string().required(),
    nationalId: yup.string().max(10).min(8).required(),
    phoneNumber: yup.string().required(),
    email: yup.string().email("Invalid Email").required(),
    password: yup.string().required(),
    repeatPassword: yup.string().required(),
    t_shirt: yup
      .string()
      .oneOf(["S", "M", "L", "XL", "XXL", "XXXL"])
      .required(),
    university: yup.string().required(),
    major: yup.string().required(),
    degree: yup.string().oneOf(["Bachelor", "Master", "PHD"]).required(),
    gender: yup.string().oneOf(["Male", "Female"]).required(),
    age: yup.number().integer().required(),
    province: yup.string().required(),
    city: yup.string().required(),
    postal_code: yup.string().required().min(10).max(10),
    confession: yup.bool().required(),
    reason: yup.string(),
    illness: yup.string(),
    father_name: yup.string().required(),
    residence: yup.string(),
  }),
});

export const userUpdateSchema = yup.object({
  body: yup.object({
    first_name: yup.string(),
    last_name: yup.string(),
    email: yup.string().email("Invalid Email"),
    password: yup.string(),
    repeatPassword: yup.string(),
    t_shirt: yup.string().oneOf(["S", "M", "L", "XL", "XXL", "XXXL"]),
    university: yup.string(),
    major: yup.string(),
    degree: yup.string().oneOf(["Bachelor", "Master", "PHD"]),
    gender: yup.string().oneOf(["Male", "Female"]),
    age: yup.number().integer(),
    province: yup.string(),
    city: yup.string(),
    postal_code: yup.string().min(10).max(10),
    confession: yup.bool(),
    reason: yup.string(),
    illness: yup.string(),
    father_name: yup.string(),
    residence: yup.string(),
  }),
});

export const phoneNumberSchema = yup.object({
  body: yup.object({
    phone_number: yup.string().required(),
  }),
});

export const otpTokenSchema = yup.object({
  body: yup.object({
    token: yup.string().required(),
  }),
});

export const loginSchema = yup.object({
  body: yup.object({
    nationalId: yup.string().max(10).min(8).required(),
    password: yup.string().required(),
  }),
});

export const resetPasswordSchema = yup.object({
  body: yup.object({
    current_password: yup.string().required(),
    new_password: yup.string().required(),
    repeat_new_password: yup.string().required(),
  }),
});

const AddressSchema = new Schema({
  province: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  postal_code: {
    type: String,
    maxlength: 10,
    minlength: 10,
    required: true,
    unique: true,
  },
});

const EmailSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

const PhoneNumberSchema = new Schema({
  phone_number: {
    type: String,
    required: true,
    unique: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  token: {
    type: String,
  },
  sent_time: {
    type: Date,
    default: Date.now(),
  },
});

const UserSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  national_id: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: Schema.Types.ObjectId,
    ref: "Email",
  },
  phone_number: {
    type: Schema.Types.ObjectId,
    ref: "PhoneNumber",
  },
  university: {
    type: String,
    required: true,
  },
  major: {
    type: String,
    required: true,
  },
  degree: {
    type: String,
    enum: ["Bachelor", "Master", "PHD"],
    required: true,
  },
  t_shirt: {
    type: String,
    enum: ["S", "M", "L", "XL", "XXL", "XXXL"],
    required: true,
  },
  address: {
    type: Schema.Types.ObjectId,
    ref: "Address",
  },
  illness: {
    type: String,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    required: true,
  },
  confession: {
    type: Boolean,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  refresh_token: [String],
  role: {
    type: String,
    enum: [ROLES.ADMIN, ROLES.PARTICIPANT],
  },
  father_name: {
    type: String,
    required: true,
  },
  residence: Boolean,
});

export const Address = model("address", AddressSchema);
export const PhoneNumber = model("phone_number", PhoneNumberSchema);
export const Email = model("email", EmailSchema);
export const User = model("user", UserSchema);
