import React from "react";
import { ClipLoader, PulseLoader, RotateLoader, BeatLoader } from "react-spinners";

export const PageLoader = () => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen w-full flex flex-col items-center justify-center">
      <div className="relative">
        <RotateLoader color="#8b3dff" size={15} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      </div>
      <p className="mt-8 text-white text-lg font-medium">Loading...</p>
    </div>
  );
};

export const ButtonLoader = ({ size = 10, color = "#fff" }) => {
  return <BeatLoader color={color} size={size} />;
};

export const InlineLoader = ({ text = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <PulseLoader color="#8b3dff" size={10} />
      {text && <span className="text-gray-400">{text}</span>}
    </div>
  );
};

export const CardLoader = () => {
  return (
    <div className="flex items-center justify-center h-[200px] bg-gradient-to-b from-[#1f1f21] to-[#18181a] rounded-xl border border-gray-800">
      <ClipLoader color="#8b3dff" size={25} />
    </div>
  );
};

export default PageLoader;

