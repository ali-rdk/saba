import {
  generateOTP,
  nationalIdValidator,
  phoneNumberValidator,
  sendSMS,
} from "../../utils/index.mjs";
import bcrypt from "bcrypt";
import jwt, { decode } from "jsonwebtoken";
import {
  User,
  Email,
  PhoneNumber,
  Address,
  ROLES,
} from "../../models/index.mjs";

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
    role: ROLES.PARTICIPANT,
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

export const userLogin = async ({ body, cookies }, res) => {
  const user = await User.findOne({ national_id: body.nationalId });
  if (!user)
    return res
      .status(401)
      .json({ error: "password and username are required" });

  const comparePassword = await bcrypt.compare(body.password, user.password);
  if (!comparePassword)
    return res.status(401).json({ error: "password or username is wrong" });
  console.log(user);
  const {
    refresh_token,
    password,
    _id,
    __v,
    email,
    phone_number,
    address,
    birth_date,
    verified,
    confession,
    illness,
    gender,
    t_shirt,
    university,
    major,
    degree,
    first_name,
    last_name,
    ...restUser
  } = user._doc;

  const accessToken = jwt.sign({ ...restUser }, process.env.ACCESS_SECRET_KEY, {
    expiresIn: "30m",
  });
  const newRefreshToken = jwt.sign(
    { ...restUser },
    process.env.REFRESH_SECRET_KEY,
    { expiresIn: "1d" }
  );

  // let newRefreshTokenArray = !cookies?.refreshToken ? user.refreshToken : user.refreshToken.filter(token => token !== cookies.refreshToken)
  let newRefreshTokenArray = [];
  if (cookies?.refreshToken) {
    const foundToken = await User.find({
      refreshToken: cookies.refreshToken,
    });

    if (foundToken)
      newRefreshTokenArray = user.refresh_token.filter(
        (token) => token !== cookies.refreshToken
      );
    console.log(newRefreshTokenArray);
  } else {
    newRefreshTokenArray = user.refres_token || [];
    console.log(newRefreshTokenArray);
  }

  res.clearCookie("refresh_token", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });

  user.refresh_token = [...newRefreshTokenArray, newRefreshToken];
  await user.save();

  res.cookie("refresh_token", newRefreshToken, {
    httpOnly: true,
    sameSite: "None",
    secure: true,
    expiresIn: 24 * 60 * 60 * 1000,
  });
  res
    .status(202)
    .json({ massage: "signed in successfully", access_token: accessToken });
};

export const userLogOut = async ({ cookies }, res) => {
  if (!cookies.refresh_token) return res.sendStatus(204);

  const user = await User.findOne({ refresh_token: cookies.refresh_token });
  if (!user) {
    res.clearCookie("refresh", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    return res.sendStatus(204);
  }

  user.refresh_token = user.refresh_token.filter(
    (token) => token !== cookies.refresh_token
  );
  await user.save();

  res.clearCookie("refresh_token", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.sendStatus(204);
};

export const refreshTokenHandler = async ({ cookies }, res) => {
  if (!cookies?.refresh_token) return res.sendStatus(401);
  res.clearCookie("refresh_token", {
    httpOnly: true,
    sameSite: "None",
    secure: true,
  });

  const user = await User.findOne({ refresh_token: cookies.refresh_token });
  if (!user) {
    jwt.verify(
      cookies.refresh_token,
      process.env.REFRESH_SECRET_KEY,
      async (err, decoded) => {
        if (err) return res.status(403).json({ err: err });
        const hackedUser = await User.findOne(decoded);
        hackedUser.refresh_token = [];
        await hackedUser.save();
      }
    );
    return res.sendStatus(403);
  }

  const newRefreshTokenArray = user.refresh_token.filter(
    (token) => token !== cookies.refresh_token
  );

  jwt.verify(
    cookies.refresh_token,
    process.env.REFRESH_SECRET_KEY,
    async (err, decoded) => {
      if (err) {
        user.refresh_token = [...newRefreshTokenArray];
        await user.save();
      }

      console.log(decoded._doc.username);
      if (user.username !== decoded._doc.username) {
        return res.status(403).json({ err: err });
      }

      const accessToken = jwt.sign(decoded, process.env.ACCESS_SECRET_KEY);
      const newRefreshToken = jwt.sign(decoded, process.env.REFRESH_SECRET_KEY);

      user.refresh_token = [...newRefreshTokenArray, newRefreshToken];
      await user.save();

      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 50000,
      });

      res.json({ accessToken: accessToken });
    }
  );
};
