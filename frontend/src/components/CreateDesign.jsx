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

  // Default dimensions if state is not available
  const width = state?.width || 650;
  const height = state?.height || 450;

  const obj = {
    name: "main_frame",
    type: "rect",
    id: Date.now(),
    height: height,
    width: width,
    z_index: 1,
    color: "#fff",
    image: "",
    setCurrentComponent: () => {}, // Add empty function to prevent error
    moveElement: () => {},
    resizeElement: () => {},
    rotateElement: () => {},
  };

  const [loader, setLoader] = useState(false);

  const handleOfflineMode = (error = null) => {
    // Remove functions from obj before passing through navigation state
    // Functions cannot be cloned/serialized in React Router state
    const serializableObj = {
      name: obj.name,
      type: obj.type,
      id: obj.id,
      height: obj.height,
      width: obj.width,
      z_index: obj.z_index,
      color: obj.color,
      image: obj.image,
      // Explicitly omit functions: setCurrentComponent, moveElement, resizeElement, rotateElement
    };

    // Handle offline/network errors - allow editing without saving
    if (
      !error ||
      error.message === "Network Error" ||
      error.code === "ERR_NETWORK" ||
      error.code === "ERR_BAD_RESPONSE" ||
      error.response?.status === 504 ||
      error.response?.status === 503 ||
      error.response?.status === 408 ||
      !navigator.onLine
    ) {
      console.log("Offline mode - creating temporary design for editing");
      toast.info(
        error?.response?.status === 504
          ? "Server timeout: You can edit the design, but it cannot be saved until the server is available."
          : "Offline mode: You can edit the design, but it cannot be saved until online."
      );
      // Create a temporary design that can be edited offline
      const tempId = `temp-${Date.now()}`;
      navigate(`/design/${tempId}/edit`, {
        state: {
          tempDesign: true,
          components: [serializableObj],
          width: width,
          height: height,
        },
      });
    } else {
      // For other errors, show error but still allow offline editing
      console.error("Error creating design:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create design. Working in offline mode.";

      toast.error(errorMessage);
      // Still allow offline editing
      const tempId = `temp-${Date.now()}`;
      navigate(`/design/${tempId}/edit`, {
        state: {
          tempDesign: true,
          components: [serializableObj],
          width: width,
          height: height,
        },
      });
    }
  };

  const create_design = async () => {
    // Validate ref is attached and element is ready
    if (!ref.current) {
      console.error("Ref is not attached to DOM element");
      handleOfflineMode(new Error("DOM element not ready"));
      return;
    }

    // Check if element has valid dimensions
    const rect = ref.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.warn("Element has zero dimensions, waiting for render...");
      // Wait a bit more and try again
      setTimeout(() => {
        create_design();
      }, 300);
      return;
    }

    try {
      setLoader(true);

      // Generate image with optimized options to reduce size and prevent timeout
      // Using lower quality and pixelRatio to reduce image size
      let image;
      try {
        image = await htmlToImage.toBlob(ref.current, {
          quality: 0.8, // Reduced from 1.0 to 0.8 to reduce file size
          pixelRatio: 1.5, // Reduced from 2 to 1.5 to reduce file size
          backgroundColor: "#ffffff",
          cacheBust: true,
          type: "image/jpeg", // Use JPEG instead of PNG for better compression
        });
      } catch (imageError) {
        console.error("htmlToImage.toBlob error:", imageError);
        // Try with toPng as fallback
        try {
          console.log("Trying toPng as fallback...");
          const dataUrl = await htmlToImage.toPng(ref.current, {
            quality: 0.8,
            pixelRatio: 1.5,
            backgroundColor: "#ffffff",
            cacheBust: true,
          });
          // Convert data URL to blob
          const response = await fetch(dataUrl);
          image = await response.blob();
        } catch (pngError) {
          console.error("toPng also failed:", pngError);
          setLoader(false);
          handleOfflineMode(pngError);
          return;
        }
      }

      if (!image) {
        console.error("Image generation returned null/undefined");
        setLoader(false);
        handleOfflineMode(new Error("Image generation returned null"));
        return;
      }

      console.log("Image generated successfully, size:", image.size);

      // Remove functions from obj before stringifying (functions cannot be serialized)
      const serializableDesignObj = {
        name: obj.name,
        type: obj.type,
        id: obj.id,
        height: obj.height,
        width: obj.width,
        z_index: obj.z_index,
        color: obj.color,
        image: obj.image,
      };
      const design = JSON.stringify([serializableDesignObj]);

      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Data = reader.result.split(",")[1]; // Remove data:image/jpeg;base64, prefix

          if (!base64Data) {
            throw new Error("Failed to convert image to base64");
          }

          // Check image size - if too large, compress it
          const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
          let finalBase64Data = base64Data;

          if (base64Data.length > MAX_IMAGE_SIZE) {
            console.warn("Image size is large, attempting to compress...");
            // If image is too large, we can't easily compress base64 on client side
            // Instead, we'll reduce quality on the next attempt or handle it server-side
            // For now, we'll proceed but the server might timeout
            toast.warn("Large image detected. Processing may take longer...");
          }

          const requestBody = {
            imageData: finalBase64Data,
            design: design,
          };

          // Set a longer timeout for image upload (60 seconds)
          const { data } = await api.post(
            "/api/create-user-design",
            requestBody,
            {
              headers: {
                "Content-Type": "application/json",
              },
              timeout: 60000, // 60 seconds timeout
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
            handleOfflineMode(new Error("Design ID not found"));
            return;
          }

          navigate(`/design/${designId}/edit`);
          setLoader(false);
        } catch (error) {
          setLoader(false);
          console.error("Error saving design:", error);
          handleOfflineMode(error);
        }
      };

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        setLoader(false);
        handleOfflineMode(new Error("Failed to read image file"));
      };

      reader.readAsDataURL(image);
    } catch (error) {
      setLoader(false);
      console.error("Unexpected error in create_design:", error);
      handleOfflineMode(error);
    }
  };

  useEffect(() => {
    if (!state) {
      console.warn("No state provided, using default dimensions");
      // Continue with default dimensions instead of navigating away
    }

    if (!width || !height || width <= 0 || height <= 0) {
      toast.error("Invalid design dimensions");
      navigate("/");
      return;
    }

    // Wait for component to mount and render
    // Use a longer delay to ensure the CreateComponent has rendered
    const timer = setTimeout(() => {
      if (ref.current) {
        // Check if the element is actually rendered with dimensions
        const rect = ref.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          create_design();
        } else {
          // If still not ready, try one more time
          console.log("Element not ready, retrying...");
          setTimeout(() => {
            if (ref.current) {
              create_design();
            } else {
              // If ref is still not ready after delay, go to offline mode
              console.warn("Ref not ready after delays, using offline mode");
              handleOfflineMode(
                new Error("Component not ready for image generation")
              );
            }
          }, 500);
        }
      } else {
        // If ref is not ready, try again after a delay
        console.log("Ref not ready, retrying...");
        setTimeout(() => {
          if (ref.current) {
            create_design();
          } else {
            console.warn("Ref not ready after delay, using offline mode");
            handleOfflineMode(
              new Error("Component not ready for image generation")
            );
          }
        }, 500);
      }
    }, 500); // Increased delay to 500ms

    return () => clearTimeout(timer);
  }, [state, ref, navigate]);
  return (
    <div className="w-screen h-screen flex justify-center items-center relative">
      <div
        ref={ref}
        className="relative"
        style={{
          width: `${obj.width}px`,
          height: `${obj.height}px`,
          minWidth: `${obj.width}px`,
          minHeight: `${obj.height}px`,
          backgroundColor: "#ffffff",
        }}
      >
        <CreateComponent info={obj} current_component={{}} />
      </div>
      {loader && (
        <div className="left-0 top-0 w-full h-full flex justify-center items-center bg-black/50 absolute z-50">
          <RotateLoader color="white" />
        </div>
      )}
    </div>
  );
};

export default CreateDesign;
