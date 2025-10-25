import * as yup from "yup";

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export const registerValidation = yup.object({
  body: yup.object({
    name: yup.string().min(2).max(200).required("Name is required"),
    email: yup
      .string()
      .matches(EMAIL_REGEX, "Invalid email format")
      .required("Email is required"),
    password: yup
      .string()
      .min(3, "Password must be at least 3 characters")
      .required("Password is required"),
    avatar: yup.string().url("Invalid avatar URL").optional(),
  }),
});

export const loginValidation = yup.object({
  body: yup.object({
    email: yup
      .string()
      .matches(EMAIL_REGEX, "Invalid email format")
      .required("Email is required"),
    password: yup.string().required("Password is required"),
  }),
});

export const refreshTokenValidation = yup.object({
  body: yup.object({
    refreshToken: yup.string().required("Refresh token is required"),
  }),
});

export const verifyTokenValidation = yup.object({
  body: yup.object({
    token: yup.string().required("Token is required"),
  }),
});
