/* eslint-disable @typescript-eslint/no-explicit-any */

import { useParams } from "react-router-dom";
import { FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
const Verify = () => {
  const { token } = useParams<{ token: string }>();

  const [verificationStatus, setVerificationStatus] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const isCalled = useRef(false); // Biến này giúp ngăn việc gọi lại API

  useEffect(() => {
    if (isCalled.current) return; // Nếu đã gọi API, bỏ qua
    isCalled.current = true;

    const verifyAccount = async () => {
      try {
        const response = await axios.get(
          `https://localhost:7235/api/accounts/verification/${token}`
        );
        console.log("res", response);
        setVerificationStatus("success");
      } catch (err: any) {
        const status = err.response?.status;
        if (status === 404) {
          setVerificationStatus("error");
        } else if (status === 400) {
          setVerificationStatus("already_verified");
        } else {
          setVerificationStatus("error");
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyAccount();
  }, [token]);

  const renderContent = () => {
    switch (verificationStatus) {
      case "success":
        return (
          <div className="text-center">
            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4 animate-bounce" />
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
              Tài khoản đã được xác thực thành công!
            </h1>
            <p className="text-gray-600 mb-6">
              Bạn đã có thể truy cập tất cả các tính năng của nền tảng của chúng
              tôi.
            </p>
          </div>
        );
      case "already_verified":
        return (
          <div className="text-center">
            <FaInfoCircle className="text-orange-500 text-6xl mx-auto mb-4 animate-bounce" />
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
              Tài khoản đã được xác thực trước đó!
            </h1>
            <p className="text-gray-600 mb-6">
              Tài khoản của bạn đã được xác thực trước đó. Bạn có thể tiếp tục
              sử dụng tất cả các tính năng.
            </p>
          </div>
        );
      case "error":
        return (
          <div className="text-center">
            <FaInfoCircle className="text-red-500 text-6xl mx-auto mb-4 animate-bounce" />
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">
              Xác thực thất bại
            </h1>
            <p className="text-red-600 mb-6">
              Đã xảy ra lỗi trong quá trình xác thực. Vui lòng thử lại hoặc liên
              hệ hỗ trợ.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {isLoading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang xác thực tài khoản của bạn...</p>
          </div>
        ) : (
          renderContent()
        )}
        <button
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out mt-6"
          onClick={() => {
            // Navigate to login page
            console.log("Chuyển hướng đến trang đăng nhập");
            alert(
              "Bạn sẽ được chuyển hướng đến trang đăng nhập của trang web."
            );
          }}
        >
          Quay lại trang đăng nhập
        </button>
      </div>
    </div>
  );
};

export default Verify;
