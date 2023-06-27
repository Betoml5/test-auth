import "./App.css";
import { setAccessToken, getAccessToken } from "./accessToken";
import axios from "axios";
import dayjs from "dayjs";
import jwt_decode from "jwt-decode";
import { useEffect, useState } from "react";

function App() {
  const [user, setUser] = useState(null);

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
      try {
        const response = await AuthClient.post("refresh-token");
        console.log("refreshed token", response.data.accessToken);
        setAccessToken(response.data.accessToken);
        request.headers.Authorization = `Bearer ${response.data.accessToken}`;
      } catch (error) {
        console.log("rejected");
      }

      return request;
    },
    (error) => {
      console.log("rejected");
      Promise.reject(error);
    }
  );

  const login = async () => {
    try {
      const { data } = await UserClient.post("http://localhost:3000/login");
      setAccessToken(data.accessToken);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await UserClient.post("http://localhost:3000/logout");
      setAccessToken("");
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const getUser = async () => {
    try {
      const response = await UserClient.get("http://localhost:3000/users");
      console.log(response);
    } catch (error) {
      console.log("error from func");
      if (error.response.status === 401) {
        setAccessToken("");
        setUser(null);
      }
      throw error;
    }
  };

  useEffect(() => {
    const getRefreshToken = async () => {
      try {
        const response = await AuthClient.post("refresh-token");
        setAccessToken(response.data.accessToken);
        setUser(response.data.user);
      } catch (error) {
        throw error;
      }
    };
    getRefreshToken();
  }, []);

  if (!user) {
    return <button onClick={login}>Login</button>;
  }

  return (
    <div className="App">
      <button onClick={logout}>Logout</button>
      <button onClick={getUser}>Get user</button>
    </div>
  );
}

export default App;
