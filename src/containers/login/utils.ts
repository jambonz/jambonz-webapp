import {
  GITHUB_CLIENT_ID,
  GOOGLE_CLIENT_ID,
  BASE_URL,
} from "src/api/constants";

export const getGithubOauthUrl = (state: string) => {
  return `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&state=${state}&scope=user:email&allow_signup=false`;
};

export const getGoogleOauthUrl = (state: string) => {
  return `https://accounts.google.com/o/oauth2/v2/auth?scope=email+profile&access_type=offline&include_granted_scopes=true&response_type=code&state=${state}&redirect_uri=${BASE_URL}/oauth-callback/google&client_id=${GOOGLE_CLIENT_ID}`;
};

const length = 6;
const digit = () => Math.floor(Math.random() * 10);

export function generateActivationCode() {
  let activationCode = "";
  for (let i = 0; i < length; i++) {
    activationCode += digit();
  }
  return activationCode;
}
