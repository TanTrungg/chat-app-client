/* eslint-disable @typescript-eslint/no-explicit-any */
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { AuthData, LoginForm, UserRegister } from "@/types/Auth";
import { AxiosResponse } from "axios";
import React, { useState } from "react";
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);

  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState<UserRegister>({
    email: "",
    phoneNumber: "",
    fullName: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: AxiosResponse = await authService.handleLogin(loginForm);
      const { status, data } = res;

      if (status === 200) {
        //console.log("Login successful:", data);
        const authData: AuthData = data;

        localStorage.setItem("auth", JSON.stringify(authData));
        navigate("/chat-app");
      } else {
        console.error("Login failed:", data);
      }
    } catch (error: any) {
      console.error("Error during login:", error.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: AxiosResponse = await userService.handleRegisterUser(
        registerForm
      );
      const { status, data } = res;

      if (status === 201) {
        console.log("Register successful:", data);
        setIsRegistering(false);
      } else {
        console.error("Login failed:", data);
      }
    } catch (error: any) {
      console.error("Error during login:", error.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        {isRegistering ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
            <div>
              <label htmlFor="name" className="block mb-1 font-medium">
                Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="name"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your name"
                  value={registerForm.fullName}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      fullName: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="register-email"
                className="block mb-1 font-medium"
              >
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="register-email"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your email"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="register-phoneNumber"
                className="block mb-1 font-medium"
              >
                Phone Number
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  id="register-phoneNumber"
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your phone number"
                  value={registerForm.phoneNumber}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      phoneNumber: e.target.value,
                    })
                  }
                  required
                />
                {/* <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button> */}
              </div>
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="block mb-1 font-medium"
              >
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirm-password"
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Confirm your password"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      password: e.target.value,
                    })
                  }
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              Register
            </button>
            <p className="text-center">
              Already have an account?{" "}
              <button
                type="button"
                className="text-blue-500 hover:underline"
                onClick={() => setIsRegistering(false)}
              >
                Login
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
            <div>
              <label htmlFor="login-email" className="block mb-1 font-medium">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="login-email"
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your email"
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="login-password"
                className="block mb-1 font-medium"
              >
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              Login
            </button>
            <p className="text-center">
              Don't have an account?{" "}
              <button
                type="button"
                className="text-blue-500 hover:underline"
                onClick={() => setIsRegistering(true)}
              >
                Register
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
