import axios from './clients/axios';

const authEndPoints = {
  login: `/api/auth/login`,
  register: `/api/auth/register`,
  forgotPassword: `/api/auth/forgot-password`,
  changePassword: `/api/auth/reset-password`,
  resendVerification: `/api/auth/resend-verification-code`,
  updatePassword: `/api/auth/update-password`,
  loginSession: `/api/auth/loginsession`,
  updateUserDetails: `/api/user/me/update`,
  health: `/virtuoso/v1/user/health`,
};

// Response Generic Type
export interface Response<T> {
  status: number;
  msg: string;
  data: T;
}

// extends Response type
export interface ILoginResponse extends Response<IAuthResponseData> {}
export interface IRegisterResponse extends Response<IRegisterResponseData> {}

// response type for login and loginsession data
export interface IAuthResponseData {
  ChallengeParameters: any;
  AuthenticationResult: IAuthResult;
}

export interface IRegisterResponseData {
  user: any;
  userConfirmed: any;
  userSub: any;
}

export interface IAuthResult {
  AccessToken: string;
  IdToken: string;
  RefreshToken: string;
  email: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginSessionPayload {
  token: string;
}

export interface BasicUserRegisterPayload {
  username: string;
  password: string;
  email: string;
  name: string;
  type: string;
}

export interface IForgotPasswordData {}

export interface IForgotPassWordResponse
  extends Response<IForgotPasswordData> {}

export interface IUserData {
  gender?: string;
  avatar?: string;
  about?: string;
  name?: string;
  email?: string;
  cover?: string;
  username?: string;
  accessToken?: string;
}

export interface IUserResponse extends Response<IUserData> {}

export const registerUser = (variables: BasicUserRegisterPayload) => {
  return axios.post<IRegisterResponse>(authEndPoints.register, {
    ...variables,
  });
};

export const forgotPassword = (username: string) => {
  return axios.post<IForgotPassWordResponse>(authEndPoints.forgotPassword, {
    username: username,
  });
};

export const changePassword = (variables: {
  username: string;
  newPassword: string;
  code: string;
}) => {
  return axios.post<IForgotPassWordResponse>(authEndPoints.changePassword, {
    ...variables,
  });
};

export const resendVerification = (variables: { username: string }) => {
  return axios.post<IForgotPassWordResponse>(authEndPoints.resendVerification, {
    ...variables,
  });
};
