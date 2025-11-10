import React from "react";
import TemplateDesign from "./main/TemplateDesign";
import { BsGrid1X2 } from "react-icons/bs";

const Templates = () => {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
          <BsGrid1X2 className="text-purple-400" />
          Templates
        </h2>
        <p className="text-gray-400 text-sm">
          Choose a template to start your design or create from scratch
        </p>
      </div>
      <TemplateDesign />
    </div>
  );
};

export default Templates;