const app = require("express")();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const jwt = require("jsonwebtoken");

app.use(cookieParser());

app.use(
  cors({
    origin: "http://127.0.0.1:5173",
    credentials: true,
  })
);

const user = {
  id: 1,
  username: "brad",
  email: "brad@hotmail.com",
};

app.get("/users", (req, res) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  if (!accessToken) {
    return res.status(401).send("Unauthorized");
  }
  jwt.verify(accessToken, "secretKey", (err) => {
    if (err) {
      console.log("expired");
      return res.status(401).send("Unauthorized");
    }
  });

  return res.status(200).send({
    users: [
      {
        id: 1,
        username: "brad",
        email: "brad@hotmail.com",
      },
    ],
  });
});

app.post("/login", (req, res) => {
  try {
    const accessToken = jwt.sign(user, "secretKey", {
      expiresIn: "5s",
    });
    const refreshToken = jwt.sign(user, "refreshKey", {
      expiresIn: "7s",
    });

    const cookie = res.cookie("refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
      httpOnly: true,
    });

    console.log(cookie);

    return res.status(200).send({ user, accessToken, refreshToken });
  } catch (error) {
    console.log(error);
  }
});

app.post("/logout", (req, res) => {
  res.cookie("refreshToken", "", {
    maxAge: 0,
    sameSite: "none",
    secure: true,
    httpOnly: true,
  });

  return res.status(200).send("Logged out");
});

app.post("/refresh-token", (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  console.log(req.cookies);

  if (!refreshToken) {
    return res.status(401).send("Unauthorized");
  }

  jwt.verify(refreshToken, "refreshKey", (err) => {
    if (err) {
      res.cookie("refreshToken", "");

      return res.status(401).send("Unauthorized");
    }
  });

  const accessToken = jwt.sign(user, "secretKey", {
    expiresIn: "5s",
  });

  return res.status(200).send({ user, accessToken });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
