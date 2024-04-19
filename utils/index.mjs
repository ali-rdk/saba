import { Smsir } from "smsir-js";
import otpGenerator from "otp-generator";

export const phoneNumberValidator = (phoneNumber) => {
  const regex = new RegExp(
    "^(?:(?:(?:\\+?|00)(98))|(0))?((?:90|91|92|93|99)[0-9]{8})$"
  );
  const result = regex.test(phoneNumber);
  return result;
};

export const nationalIdValidator = (nationalId) => {
  const len = nationalId.length;
  const controlDigit = nationalId.slice(len - 1, len);
  const digits = nationalId.slice(0, -1);

  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum = sum + parseInt(digits[i]) * (10 - i);
  }
  let remain = sum % 11;

  if (remain > 2) {
    remain = 11 - remain;
  }
  return parseInt(controlDigit) === remain;
};

export const sendSMS = (phoneNumber, token) => {
  const sms = new Smsir(process.env.SMS_TOKEN, phoneNumber);
  sms.SendVerifyCode(phoneNumber, 100000, [
    {
      name: "code",
      value: token,
    },
  ]);
};

export const generateOTP = () => {
  return otpGenerator.generate(5, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
};
