import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { BsFolder, BsGrid1X2 } from "react-icons/bs";
import { token_decode } from "../utils/index";
import userImage from "../assets/user.png";
import logo from "../assets/logo.png";

const Layout = ({ onAuthChange }) => {
  const userInfo = token_decode(localStorage.getItem("canva_token"));

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);

  const create = () => {
    navigate("/design/create", {
      state: {
        type: "create",
        width: 600,
        height: 450,
      },
    });
  };

  const logout = () => {
    localStorage.removeItem("canva_token");
    // Update auth state and navigate
    onAuthChange();
    navigate("/");
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen w-full">
      <div className="bg-gradient-to-r from-[#1a1a1c] via-[#1f1f21] to-[#1a1a1c] border-b border-gray-800 shadow-lg fixed left-0 top-0 w-full z-20">
        <div className="w-[93%] m-auto py-4">
          <div className="flex justify-between items-center">
            <div className="w-[80px] h-[48px] flex items-center">
              <img
                className="w-full h-full object-contain"
                src={logo}
                alt="Logo"
              />
            </div>
            <div className="flex gap-4 justify-center items-center relative">
              <button
                onClick={create}
                className="py-2 px-6 overflow-hidden text-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Create a Design
              </button>
              <div onClick={() => setShow(!show)} className="cursor-pointer">
                <img
                  src={userInfo?.image ? userImage?.image : userImage}
                  className="w-[45px] h-[45px] rounded-full"
                  alt="prfile"
                />
              </div>
              <div
                className={`absolute top-[60px] right-0 w-[280px] bg-gradient-to-b from-[#1f1f21] to-[#18181a] p-4 border border-gray-800 rounded-xl shadow-2xl transition-all duration-300 ${
                  show
                    ? "visible opacity-100 scale-100"
                    : "invisible opacity-0 scale-95"
                }`}
              >
                <div className="px-2 py-2 flex justify-start gap-5 items-center">
                  <img
                    src={userInfo?.image ? userImage?.image : userImage}
                    className="w-[40px] h-[40px] rounded-full"
                    alt="prfile"
                  />
                  <div className="flex justify-center flex-col items-start">
                    <span className="text-[#e0dddd] font-bold text-md">
                      {userInfo?.name}
                    </span>
                    <span className="text-[#c4c0c0] font-bold text-md">
                      {userInfo?.email}
                    </span>
                  </div>
                </div>
                <ul className="text-[#e0dddd] font-semibold">
                  <li>
                    <Link className="p-2">
                      <span>Setting</span>
                    </Link>
                  </li>
                  <li>
                    <div onClick={logout} className="p-2 cursor-pointer">
                      <span>Logout</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex mt-16">
        <div className="sidebar w-[300px] p-6 h-[calc(100vh-64px)] fixed left-0 top-16 bg-gradient-to-b from-[#1a1a1c] to-[#0f0f10] border-r border-gray-800 overflow-y-auto overflow-x-hidden">
          <div className="px-3 py-3 flex justify-start gap-4 items-center mb-6 bg-gradient-to-r from-purple-600/10 to-indigo-600/10 rounded-lg border border-purple-500/20 flex-shrink-0">
            <img
              className="w-[45px] h-[45px] rounded-full border-2 border-purple-500/50"
              src={userInfo?.image ? userImage?.image : userImage}
              alt="profile"
            />
            <div className="flex justify-center flex-col items-start">
              <span className="text-white font-bold text-md">
                {userInfo?.name}
              </span>
              <span className="text-purple-400 text-xs font-medium bg-purple-500/20 px-2 py-0.5 rounded">
                Free Plan
              </span>
            </div>
          </div>
          <ul className="px-2 flex flex-col gap-1">
            <li>
              <Link
                to="/"
                className={`text-gray-300 px-3 py-3 flex justify-start items-center gap-3 ${
                  pathname === "/"
                    ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-l-2 border-purple-500 text-purple-300"
                    : "hover:bg-gray-800/50"
                } rounded-lg transition-all`}
              >
                <span className="text-xl">
                  <FaHome />
                </span>
                <span className="font-medium">Home</span>
              </Link>
            </li>
            <li>
              <Link
                to="/projects"
                className={`text-gray-300 px-3 py-3 flex justify-start items-center gap-3 ${
                  pathname === "/projects"
                    ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-l-2 border-purple-500 text-purple-300"
                    : "hover:bg-gray-800/50"
                } rounded-lg transition-all`}
              >
                <span className="text-xl">
                  <BsFolder />
                </span>
                <span className="font-medium">Projects</span>
              </Link>
            </li>
            <li>
              <Link
                to="/templates"
                className={`text-gray-300 px-3 py-3 flex justify-start items-center gap-3 ${
                  pathname === "/templates"
                    ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-l-2 border-purple-500 text-purple-300"
                    : "hover:bg-gray-800/50"
                } rounded-lg transition-all`}
              >
                <span className="text-xl">
                  <BsGrid1X2 />
                </span>
                <span className="font-medium">Templates</span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="ml-[300px] w-[calc(100%-300px)] min-w-0">
          <div className="py-4 pr-4 min-h-[calc(100vh-64px)]">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
