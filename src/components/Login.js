import React, { useState } from "react";

const Login = ({ onLogin }) => {
  const [userID, setUserID] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Perform form validation
    if (!userID || !password) {
      setError("Please enter both userID and Password");
      return;
    }

    // Mock authentication
    if (userID === "admin" && password === "password") {
      // If credentials are correct, call the onLogin function to indicate successful login
      onLogin();
      // Clear error message
      setError("");
    } else {
      // If credentials are incorrect, display an error message
      setError("Invalid UserID or password");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-black shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full sm:max-w-md">
        <h1 className="text-white  text-3xl text-center font-bold mb-4">
          Login Details
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-500 text-sm font-bold mb-2"
              htmlFor="username"
            >
              UserID
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Username"
              value={userID}
              onChange={(e) => setUserID(e.target.value)}
            />
          </div>
          <div className="mb-4 relative">
            <label
              className="block text-gray-500 text-sm font-bold mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute top-0 right-0 mt-2 mr-2 text-blue-500 text-sm hover:text-blue-700"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            type="submit"
          >
            Login
          </button>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
