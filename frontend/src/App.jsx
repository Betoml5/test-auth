import "./App.css";
import { setAccessToken, getAccessToken } from "./accessToken";
import axios from "axios";

import dayjs from "dayjs";
import jwt_decode from "jwt-decode";

function App() {
  const UserClient = axios.create({
    withCredentials: true,
  });
  const AuthClient = axios.create({
    baseURL: "http://localhost:3000/",
    withCredentials: true,
  });

  UserClient.interceptors.request.use(
    async (request) => {
      request.headers = {
        Authorization: `Bearer ${getAccessToken()}`,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      };

      if (!getAccessToken()) {
        return request;
      }

      const user = jwt_decode(getAccessToken());
      const isExpired = dayjs.unix(user.exp).diff(dayjs(), "second") < 1;
      if (!isExpired) return request;
      const response = await AuthClient.post("refresh-token");
      setAccessToken(response.data.accessToken);
      request.headers.Authorization = `Bearer ${response.data.accessToken}`;
      console.log("Access token refreshed");
      return request;
    },
    (error) => {
      Promise.reject(error);
    }
  );

  const login = async () => {
    try {
      const { data } = await UserClient.post("http://localhost:3000/login");
      setAccessToken(data.accessToken);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getUser = async () => {
    try {
      const response = await UserClient.get("http://localhost:3000/users");
      console.log(response);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="App">
      <button onClick={login}>Login</button>
      <button onClick={getUser}>Get user</button>
    </div>
  );
}

export default App;
