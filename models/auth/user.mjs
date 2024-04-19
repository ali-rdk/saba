import yup, { ref, string } from "yup";
import { model, Schema } from "mongoose";

const proviences = [
  "Tehran",
  "Isfahan",
  "Mazandaran",
  "Fars",
  "Khorasan Razavi",
  "East Azerbaijan",
  "West Azerbaijan",
  "Kerman",
  "Khuzestan",
  "Gilan",
  "Qom",
  "Kermanshah",
  "Hormozgan",
  "Sistan and Baluchestan",
  "Markazi",
  "Bushehr",
  "Lorestan",
  "Golestan",
  "North Khorasan",
  "Razavi Khorasan",
  "Zanjan",
  "Qazvin",
  "Ilam",
  "Kohgiluyeh and Boyer-Ahmad",
  "South Khorasan",
  "Chaharmahal and Bakhtiari",
  "Semnan",
  "Ardabil",
];

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
    birth_date: yup.date().required(),
    province: yup.string().required(),
    city: yup.string().required(),
    postal_code: yup.string().required().min(10).max(10),
    confession: yup.bool().required(),
    reason: yup.string(),
    illness: yup.string(),
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

const AddressSchema = new Schema({
  province: {
    type: String,
    required: true,
    enum: proviences,
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
  birth_date: {
    type: Date,
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
});

export const Address = model("address", AddressSchema);
export const PhoneNumber = model("phone_number", PhoneNumberSchema);
export const Email = model("email", EmailSchema);
export const User = model("user", UserSchema);
