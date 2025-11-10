/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as htmlToImage from "html-to-image";
import api from "../utils/api";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";
import {
  FaDownload,
  FaSave,
  FaFileDownload,
  FaFileImage,
} from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";

const Header = ({ components, design_id }) => {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  const saveImage = async () => {
    // Check if design_id exists
    if (!design_id) {
      toast.error("Design ID is missing. Cannot save design.");
      return;
    }

    const getDiv = document.getElementById("main_design");
    const image = await htmlToImage.toBlob(getDiv);

    if (image) {
      try {
        setLoader(true);

        // Convert blob to base64 (matching createUserDesign pattern)
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = reader.result.split(",")[1]; // Remove data:image/jpeg;base64, prefix

          const requestBody = {
            imageData: base64Data,
            design: components, // Send components directly as array
          };

          const { data } = await api.put(
            `/api/update-user-design/${design_id}`,
            requestBody,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          toast.success(
            data?.data?.message || data?.message || "Design saved successfully"
          );
          setLoader(false);
        };
        reader.readAsDataURL(image);
      } catch (error) {
        setLoader(false);
        toast.error(error.response?.data?.message || "Failed to save design");
      }
    }
  };

  const downloadImage = async (format = "png") => {
    try {
      const getDiv = document.getElementById("main_design");
      let dataUrl;
      let filename;
      let mimeType;

      if (format === "png") {
        dataUrl = await htmlToImage.toPng(getDiv, {
          quality: 1.0,
          pixelRatio: 2,
        });
        filename = `design-${Date.now()}.png`;
        mimeType = "image/png";
      } else if (format === "jpeg") {
        dataUrl = await htmlToImage.toJpeg(getDiv, {
          quality: 0.95,
          pixelRatio: 2,
        });
        filename = `design-${Date.now()}.jpg`;
        mimeType = "image/jpeg";
      } else if (format === "svg") {
        dataUrl = await htmlToImage.toSvg(getDiv);
        filename = `design-${Date.now()}.svg`;
        mimeType = "image/svg+xml";
      }

      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    }
  };

  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="h-[60px] bg-gradient-to-r from-[#1a1a1c] via-[#1f1f21] to-[#1a1a1c] border-b border-gray-800 w-full shadow-lg">
      <div className="flex justify-between px-6 items-center text-gray-300 h-full">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img className="h-10" src={logo} alt="" />
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            AdbClone
          </span>
        </Link>
        <div className="flex justify-center items-center gap-3">
          <button
            disabled={loader}
            onClick={saveImage}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave className="text-sm" />
            <span>{loader ? "Saving..." : "Save"}</span>
          </button>
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <FaDownload className="text-sm" />
              <span>Export</span>
              <HiDotsVertical className="text-xs" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-gradient-to-b from-[#1f1f21] to-[#18181a] border border-gray-800 rounded-lg shadow-2xl z-50 overflow-hidden">
                <button
                  onClick={() => {
                    downloadImage("png");
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:bg-gray-800/50 transition-colors"
                >
                  <FaFileImage className="text-purple-400" />
                  <span>PNG (High Quality)</span>
                </button>
                <button
                  onClick={() => {
                    downloadImage("jpeg");
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:bg-gray-800/50 transition-colors"
                >
                  <FaFileImage className="text-blue-400" />
                  <span>JPEG (Compressed)</span>
                </button>
                <button
                  onClick={() => {
                    downloadImage("svg");
                    setShowExportMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-300 hover:bg-gray-800/50 transition-colors"
                >
                  <FaFileDownload className="text-green-400" />
                  <span>SVG (Vector)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showExportMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowExportMenu(false)}
        />
      )}
    </div>
  );
};

export default Header;
