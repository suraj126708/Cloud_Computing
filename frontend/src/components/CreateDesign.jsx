import React, { useEffect, useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { useLocation, useNavigate } from "react-router-dom";
import RotateLoader from "react-spinners/RotateLoader";
import api from "../utils/api";
import toast from "react-hot-toast";

import CreateComponent from "./CreateComponent";

const CreateDesign = () => {
  const ref = useRef();

  const { state } = useLocation();

  const navigate = useNavigate();

  const obj = {
    name: "main_frame",
    type: "rect",
    id: Date.now(),
    height: state.height,
    width: state.width,
    z_index: 1,
    color: "#fff",
    image: "",
    setCurrentComponent: () => {}, // Add empty function to prevent error
    moveElement: () => {},
    resizeElement: () => {},
    rotateElement: () => {},
  };

  const [loader, setLoader] = useState(false);

  const create_design = async () => {
    const image = await htmlToImage.toBlob(ref.current);

    const design = JSON.stringify(obj);

    if (image) {
      try {
        setLoader(true);

        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = reader.result.split(",")[1]; // Remove data:image/jpeg;base64, prefix

          const requestBody = {
            imageData: base64Data,
            design: design,
          };

          const { data } = await api.post(
            "/api/create-user-design",
            requestBody,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          // Log the response to debug
          console.log("Create design response:", data);
          console.log("Design ID:", data?.data?.design?.id);

          // Use 'id' instead of '_id' as per the design model
          const designId = data?.data?.design?.id;
          if (!designId) {
            console.error("Design ID not found in response:", data);
            toast.error("Failed to get design ID from response");
            setLoader(false);
            return;
          }

          navigate(`/design/${designId}/edit`);
          setLoader(false);
        };
        reader.readAsDataURL(image);
      } catch (error) {
        setLoader(false);

        // Enhanced error logging
        console.error("=== CREATE DESIGN ERROR ===");
        console.error("Error object:", error);
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        console.error("Error status:", error.response?.status);
        console.error("Error statusText:", error.response?.statusText);
        console.error("Error data:", error.response?.data);
        console.error("Error headers:", error.response?.headers);
        console.error("Request config:", error.config);
        console.error("Request URL:", error.config?.url);
        console.error("Request method:", error.config?.method);
        console.error("Request headers:", error.config?.headers);
        console.error("Request data:", error.config?.data);
        console.error("==========================");

        // Show user-friendly error message
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to create design. Please try again.";

        alert(`Error: ${errorMessage}`);

        // Navigate back to home on error
        navigate("/");
      }
    }
  };

  useEffect(() => {
    if (state && ref.current) {
      create_design();
    } else {
      navigate("/");
    }
  }, [state, ref]);
  return (
    <div className="w-screen h-screen flex justify-center items-center relative">
      <div ref={ref} className="relative w-auto h-auto overflow-auto">
        <CreateComponent info={obj} current_component={{}} />
      </div>
      {loader && (
        <div className="left-0 top-0 w-full h-full flex justify-center items-center bg-black absolute">
          <RotateLoader color="white" />
        </div>
      )}
    </div>
  );
};

export default CreateDesign;
