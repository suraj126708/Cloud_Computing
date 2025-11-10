import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Item from "./Home/Item";
import api from "../utils/api";
import toast from "react-hot-toast";
import { InlineLoader, CardLoader } from "./Loader";

const Projects = ({ type, design_id }) => {
  const [designs, setDesign] = useState([]);
  const [loading, setLoading] = useState(true);

  const get_user_design = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/user-designs");
      // Ensure we always set an array, even if data.designs is undefined
      const designList = Array.isArray(data?.data?.designs || data?.designs)
        ? data?.data?.designs || data?.designs
        : [];
      setDesign(designList);
    } catch (error) {
      console.error("Error fetching designs:", error);
      toast.error("Failed to load designs");
      setDesign([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    get_user_design();
  }, []);
  const delete_design = async (design_id) => {
    try {
      const { data } = await api.delete(`/api/delete-user-design/${design_id}`);
      toast.success(
        data?.data?.message || data?.message || "Design deleted successfully"
      );
      get_user_design();
    } catch (error) {
      console.error("Delete design error:", error);
      toast.error(error.response?.data?.message || "Failed to delete design");
    }
  };
  // Ensure designs is always an array before mapping
  const designList = Array.isArray(designs) ? designs : [];

  if (loading) {
    return (
      <div className="h-[88vh] overflow-x-auto flex justify-start items-start scrollbar-hide w-full">
        <div
          className={
            type
              ? "grid grid-cols-2 gap-4 mt-5 w-full"
              : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-5 w-full"
          }
        >
          {[...Array(8)].map((_, i) => (
            <CardLoader key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[88vh] overflow-x-auto flex justify-start items-start scrollbar-hide w-full">
      <div
        className={
          type
            ? "grid grid-cols-2 gap-4 mt-5 w-full"
            : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-5 w-full"
        }
      >
        {designList.length > 0 ? (
          designList.map(
            (d, i) =>
              d.id !== design_id && (
                <Item
                  key={i}
                  design={d}
                  type={type}
                  delete_design={delete_design}
                />
              )
          )
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center h-[400px] text-gray-400">
            <div className="text-6xl mb-4 opacity-50">📁</div>
            <p className="text-lg font-medium">No designs found</p>
            <p className="text-sm mt-2">Create your first design to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
