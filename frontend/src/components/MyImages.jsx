import React, { useEffect, useState } from "react";
import Image from "./Image";
import api from "../utils/api";
import BarLoader from "react-spinners/BarLoader";
import toast from "react-hot-toast";
import { FaCloudUploadAlt } from "react-icons/fa";
import { SearchBar } from "./EditorFeatures";

const MyImages = ({ add_image }) => {
  const [images, setImages] = useState([]);
  const [loader, setLoader] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const image_upload = async (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];

      try {
        setLoader(true);

        // Convert file to base64 (matching backend expectation)
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Data = reader.result.split(",")[1]; // Remove data:image/jpeg;base64, prefix

          const requestBody = {
            imageData: base64Data,
          };

          try {
            const { data } = await api.post("/api/add-user-image", requestBody);

            // Handle different response structures
            const newImage = data?.data?.userImage || data?.userImage;
            if (newImage) {
              setImages([...images, newImage]);
            }
            setLoader(false);
          } catch (error) {
            setLoader(false);
            toast.error(
              error.response?.data?.message || "Failed to upload image"
            );
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        setLoader(false);
        toast.error("Failed to process image file");
      }
    }
  };

  useEffect(() => {
    const get_images = async () => {
      try {
        const { data } = await api.get("/api/get-user-image");
        // Handle response structure: { success: true, data: { images: [...] } }
        const imageList = Array.isArray(data?.data?.images)
          ? data.data.images
          : Array.isArray(data?.images)
          ? data.images
          : [];
        setImages(imageList);
      } catch (error) {
        console.error("Error fetching user images:", error);
        toast.error("Failed to load your images");
        setImages([]);
      }
    };
    get_images();
  }, []);

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <label 
          htmlFor="image" 
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg text-white py-3 px-4 cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
        >
          <FaCloudUploadAlt className="text-lg" />
          <span>Upload Image</span>
        </label>
        <input
          disabled={loader}
          onChange={image_upload}
          type="file"
          id="image"
          accept="image/*"
          className="hidden"
        />
      </div>
      {loader && (
        <div className="flex justify-center items-center mb-4 py-2">
          <BarLoader color="#8b3dff" width={150} />
        </div>
      )}
      {images.length > 0 && (
        <div className="mb-4 px-2">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search your images..."
          />
        </div>
      )}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <Image add_image={add_image} images={images} searchQuery={searchQuery} />
      </div>
    </div>
  );
};

export default MyImages;
