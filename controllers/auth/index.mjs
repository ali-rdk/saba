import {
  generateOTP,
  nationalIdValidator,
  phoneNumberValidator,
  sendSMS,
} from "../../utils/index.mjs";
import bcrypt from "bcrypt";
import { User, Email, PhoneNumber, Address } from "../../models/index.mjs";

export const userRegister = async (req, res) => {
  const {
    name,
    lastname,
    nationalId,
    phoneNumber,
    password,
    repeatPassword,
    email,
    province,
    city,
    postal_code,
    ...rest
  } = req.body;

  if (!nationalIdValidator(nationalId)) {
    return res.status(403).json({ national_id: "کد ملی نامعتبر است" });
  }

  const userExists = await User.findOne({
    national_id: nationalId,
  });

  if (userExists) {
    return res
      .status(400)
      .json({ error: "کاربر با این مشخصات قبلا ثبت شده است" });
  }

  if (!phoneNumberValidator(phoneNumber)) {
    return res.status(403).json({ phone_number: "شماره همراه نامعتبر است" });
  }

  const phone = await PhoneNumber.findOne({
    phone_number: phoneNumber,
  });

  if (!phone || phone.verified === false) {
    return res.status(401).json({ phone_number: "شماره همراه نامعتبر است" });
  }

  if (password !== repeatPassword) {
    return res.status(403).json({ password: "پسورد و تاییدش متفاوت هستند" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userEmail = await new Email({
    email: email,
  });
  await userEmail.save();

  const addressExists = await Address.findOne({
    postal_code: postal_code,
  });

  if (addressExists) {
    return res
      .status(403)
      .json({ address: "این کد پستی قبلا به ثبت رسیده است" });
  }

  const newAdress = await new Address({
    province: province,
    city: city,
    postal_code: postal_code,
  });
  await newAdress.save();

  const user = await new User({
    national_id: nationalId,
    password: hashedPassword,
    first_name: name,
    last_name: lastname,
    email: userEmail.id,
    phone_number: phone.id,
    address: newAdress.id,
    ...rest,
  });
  await user.save();

  return res.status(201).json({ message: "کاربر با موفقیت ثبت شد" });
};

export const sendOTP = async (req, res) => {
  const phone_number = req.body.phone_number;

  const valid = phoneNumberValidator(phone_number);
  if (!valid) {
    return res.status(400).json({ phone_number: "شماره همراه نامعتبر است" });
  }

  const numberExists = await PhoneNumber.findOne({
    phone_number: phone_number,
  });

  if (numberExists && numberExists.verified === true) {
    return res
      .status(403)
      .json({ phone_number: "شماره همراه قبلا ثبت شده است" });
  }

  const token = generateOTP();
  sendSMS(phone_number, token);

  if (numberExists && numberExists.verified === false) {
    numberExists.set({
      token: token,
      sent_time: Date.now(),
      verified: false,
    });
    await numberExists.save();
    return res.status(200).json({ massage: "کد تایید ارسال شد" });
  }

  const newPhoneNumber = await new PhoneNumber({
    phone_number: phone_number,
    token: token,
    sent_time: Date.now(),
  });
  await newPhoneNumber.save();

  return res.status(200).json({ massage: "کد تایید ارسال شد" });
};

export const verifyCode = async (req, res) => {
  const userToken = req.body.token;

  const tokenCreated = await PhoneNumber.findOne({
    token: userToken,
  });

  if (!tokenCreated) {
    tokenCreated.set({
      token: null,
    });
    return res.status(401).json({ token: "کد وارد شده نامعتبر است" });
  }

  const delta = (Date.now() - tokenCreated.sent_time) / 1000;

  if (delta <= 120) {
    tokenCreated.set({
      verified: true,
      updatedAt: new Date(),
      token: null,
    });

    await tokenCreated.save();
  } else {
    await PhoneNumber.deleteOne(tokenCreated);
    return res.status(401).json({ token: "کد وارد شده نامعتبر است" });
  }

  return res.status(200).json({ massage: "شماره همراه با موفقیت تایید شد" });
};
