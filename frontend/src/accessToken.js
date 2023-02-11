export let accessToken = "";

export const getAccessToken = () => {
  return accessToken;
};

export const setAccessToken = (token) => {
  if (!token) {
    accessToken = "";
  }

  accessToken = token;
};
