import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../utils/auth";
import { Button, Input } from "antd";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const user = login(email);
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      navigate(user.role === "Admin" ? "/admin" : "/viewer");
    } else {
      setError("Invalid email!");
    }
  };


  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.key === 'Enter') {
        handleLogin();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  },
  )
  return (
    <div>
      <h1>Login</h1>
      <Input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div style={{
        margin: '10px'
      }}>
        <Button onClick={handleLogin}>Login</Button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Login;
