import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { AiOutlineGoogle } from "react-icons/ai";
import { FaFacebookF } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";
import { ButtonLoader } from "../components/Loader";

const Index = ({ onAuthChange }) => {
  const navigate = useNavigate();
  const [type, setType] = useState("");
  const [show, setShow] = useState(false);
  const [loader, setLoader] = useState(false);

  const [state, setState] = useState({
    name: "",
    email: "",
    password: "",
  });

  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const user_register = async (e) => {
    e.preventDefault();
    try {
      setLoader(true);
      const { data } = await api.post("/api/user-register", state);
      setLoader(false);
      localStorage.setItem("canva_token", data.data.token);
      setState({
        name: "",
        email: "",
        password: "",
      });
      setShow(false);
      // Update auth state and navigate
      onAuthChange();
      navigate("/");
    } catch (error) {
      setLoader(false);
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      toast.error(errorMessage);
    }
  };

  const user_login = async (e) => {
    e.preventDefault();
    try {
      setLoader(true);
      const { data } = await api.post("/api/user-login", state);
      setLoader(false);
      localStorage.setItem("canva_token", data.data.token);
      setState({
        email: "",
        password: "",
      });
      setShow(false);
      // Update auth state and navigate
      onAuthChange();
      navigate("/");
    } catch (error) {
      console.log(error);
      setLoader(false);
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen w-full">
      <div
        className={`w-screen ${
          show ? "visible opacity-100" : "invisible opacity-0"
        } transition-all duration-300 h-screen fixed bg-black/80 backdrop-blur-sm flex justify-center items-center z-50`}
      >
        <div className="w-[400px] bg-gradient-to-b from-[#1f1f21] to-[#18181a] border border-gray-800 m-auto px-8 py-6 rounded-xl relative shadow-2xl">
          <div
            onClick={() => setShow(false)}
            className="absolute right-4 top-4 text-xl cursor-pointer text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded-full"
          >
            <IoMdClose />
          </div>
          <h2 className="text-white pb-6 text-center text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Login or Sign Up
          </h2>
          {type === "signin" && (
            <form onSubmit={user_login}>
              <div className="flex flex-col gap-2 mb-4 text-white">
                <label htmlFor="email" className="text-sm text-gray-400">
                  Email
                </label>
                <input
                  onChange={inputHandle}
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Enter your email"
                  value={state.email}
                  className="px-4 py-3 rounded-lg border outline-none border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-gray-900/50 text-white transition-all"
                />
              </div>
              <div className="flex flex-col gap-2 mb-4 text-white">
                <label htmlFor="password" className="text-sm text-gray-400">
                  Password
                </label>
                <input
                  onChange={inputHandle}
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Enter your password"
                  value={state.password}
                  className="px-4 py-3 rounded-lg border outline-none border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-gray-900/50 text-white transition-all"
                />
              </div>
              <div>
                <button
                  disabled={loader}
                  className="px-3 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 w-full outline-none text-white font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loader ? <ButtonLoader size={8} /> : "Sign In"}
                </button>
              </div>
              <div className="flex py-4 justify-between items-center px-3">
                <div className="w-[45%] h-[1px] bg-[#434449]"></div>

                <div className="w-[45%] h-[1px] bg-[#434449]"></div>
              </div>
            </form>
          )}
          {type === "signup" && (
            <form onSubmit={user_register}>
              <div className="flex flex-col gap-2 mb-4 text-white">
                <label htmlFor="name" className="text-sm text-gray-400">
                  Name
                </label>
                <input
                  type="text"
                  onChange={inputHandle}
                  value={state.name}
                  required
                  name="name"
                  id="name"
                  placeholder="Enter your name"
                  className="px-4 py-3 rounded-lg border outline-none border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-gray-900/50 text-white transition-all"
                />
              </div>
              <div className="flex flex-col gap-2 mb-4 text-white">
                <label htmlFor="email" className="text-sm text-gray-400">
                  Email
                </label>
                <input
                  onChange={inputHandle}
                  value={state.email}
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Enter your email"
                  className="px-4 py-3 rounded-lg border outline-none border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-gray-900/50 text-white transition-all"
                  required
                />
              </div>
              <div className="flex flex-col gap-2 mb-4 text-white">
                <label htmlFor="password" className="text-sm text-gray-400">
                  Password
                </label>
                <input
                  onChange={inputHandle}
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Create a password"
                  value={state.password}
                  className="px-4 py-3 rounded-lg border outline-none border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 bg-gray-900/50 text-white transition-all"
                  required
                />
              </div>
              <div>
                <button
                  disabled={loader}
                  className="px-3 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 w-full outline-none text-white font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loader ? <ButtonLoader size={8} /> : "Sign Up"}
                </button>
              </div>
              <div className="flex py-4 justify-between items-center px-3">
                <div className="w-[45%] h-[1px] bg-[#434449]"></div>
                <div className="w-[45%] h-[1px] bg-[#434449]"></div>
              </div>
            </form>
          )}
        </div>
      </div>
      <div className="bg-gradient-to-r from-[#1a1a1c] via-[#1f1f21] to-[#1a1a1c] border-b border-gray-800 shadow-lg">
        <div className="w-[93%] m-auto py-4">
          <div className="flex justify-between items-center">
            <div className="w-[80px] h-[48px] flex items-center">
              <img
                className="w-full h-full object-contain"
                src={logo}
                alt="Logo"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setType("signin");
                  setShow(true);
                }}
                className="py-2 px-6 text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all rounded-lg font-medium shadow-lg hover:shadow-xl"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setType("signup");
                  setShow(true);
                }}
                className="py-2 px-6 text-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all rounded-lg font-medium shadow-lg hover:shadow-xl"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-full justify-center items-center p-4">
        <div className="py-[120px] flex justify-center items-center flex-col gap-8">
          <h2 className="text-6xl text-white font-bold text-center drop-shadow-lg">
            What will you design today?
          </h2>
          <span className="text-gray-300 text-2xl font-medium text-center max-w-2xl">
            Create stunning designs with our powerful, easy-to-use editor. No
            design experience needed.
          </span>
          <button
            onClick={() => {
              setType("signup");
              setShow(true);
            }}
            className="py-3 px-8 text-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all rounded-lg font-medium text-lg shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105"
          >
            Get Started for Free
          </button>
          <div className="flex gap-8 mt-8 text-gray-400">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">100%</div>
              <div className="text-sm">Free</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">∞</div>
              <div className="text-sm">Unlimited Designs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">⚡</div>
              <div className="text-sm">Fast & Easy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
