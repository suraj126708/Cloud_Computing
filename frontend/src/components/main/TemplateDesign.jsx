import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa";
import { PulseLoader } from "react-spinners";
import toast from "react-hot-toast";

const TemplateDesign = ({ type }) => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const get_templates = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/templates");
        const templateList = Array.isArray(data?.data?.templates)
          ? data.data.templates
          : Array.isArray(data?.templates)
          ? data.templates
          : [];
        setTemplates(templateList);
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast.error("Failed to load templates");
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };
    get_templates();
  }, []);

  const add_template = async (id, e) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      const { data } = await api.get(`/api/add-user-template/${id}`);
      const designId = data?.data?.design?.id || data?.design?.id;
      if (!designId) {
        console.error("Design ID not found in response:", data);
        toast.error("Failed to create design from template");
        return;
      }
      toast.success("Template applied successfully");
      navigate(`/design/${designId}/edit`);
    } catch (error) {
      console.error("Error adding template:", error);
      toast.error(error.response?.data?.message || "Failed to apply template");
    }
  };

  const delete_template = async (template_id, e) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (!window.confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      setDeletingId(template_id);
      const { data } = await api.delete(`/api/delete-template/${template_id}`);
      toast.success(data?.data?.message || "Template deleted successfully");
      setTemplates(templates.filter((t) => t.id !== template_id));
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete template"
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <PulseLoader color="#8b3dff" size={10} />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div
        className={`grid gap-4 ${
          type ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
        }`}
      >
        {templates.length > 0 ? (
          templates.map((template) => (
            <div
              key={template.id}
              className="group relative bg-gradient-to-b from-[#1f1f21] to-[#18181a] rounded-xl shadow-lg border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden"
            >
              <div
                className={`relative overflow-hidden ${
                  type ? "h-[100px]" : "h-[200px]"
                }`}
              >
                <img
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  src={template.image_url}
                  alt={template.name || "Template"}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23333' width='200' height='200'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImage not found%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3 gap-2">
                  <button
                    onClick={(e) => add_template(template.id, e)}
                    className="px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    title="Use Template"
                  >
                    <FaPlus className="text-sm" />
                    <span className="text-xs font-medium">Use</span>
                  </button>
                  <button
                    onClick={(e) => delete_template(template.id, e)}
                    disabled={deletingId === template.id}
                    className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Template"
                  >
                    {deletingId === template.id ? (
                      <PulseLoader color="#fff" size={6} />
                    ) : (
                      <FaTrash className="text-sm" />
                    )}
                  </button>
                </div>
              </div>
              {template.name && (
                <div className="p-3">
                  <h3 className="text-white text-sm font-medium truncate">
                    {template.name}
                  </h3>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center h-[400px] text-gray-400">
            <div className="text-6xl mb-4 opacity-50">📄</div>
            <p className="text-lg font-medium">No templates available</p>
            <p className="text-sm mt-2">Templates will appear here when available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateDesign;
