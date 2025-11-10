import React from "react";

import { FaTrash, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Item = ({ design, delete_design }) => {
  const navigate = useNavigate();

  return (
    <div className="group relative bg-gradient-to-b from-[#1f1f21] to-[#18181a] p-3 rounded-xl shadow-lg border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={design.image_url}
          alt="design"
          className="w-full h-[200px] object-cover rounded-lg transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end justify-center p-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/design/${design.id}/edit`);
            }}
            className="mr-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              delete_design(design.id);
            }}
            className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      <p className="text-gray-400 text-xs mt-3 truncate font-mono">Design ID: {design.id?.slice(0, 8)}...</p>
    </div>
  );
};

export default Item;
