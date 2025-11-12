import React from "react";
import Element from "./Element";

const CreateComponente = ({
  info,
  current_component,
  removeComponent,
  selectItem,
  setSelectItem,
  showOverlays = false,
}) => {
  let html = "";

  if (info.name === "main_frame") {
    const isSelected = current_component?.id === info.id;
    html = (
      <div
        onClick={() => {
          info.setCurrentComponent(info);
          setSelectItem("");
        }}
        className={`shadow-md transition-all ${
          isSelected ? "border-[3px] border-blue-500" : "border-transparent"
        }`}
        style={{
          width: info.width + "px",
          height: info.height + "px",
          backgroundColor: info.image ? "transparent" : info.color,
          zIndex: info.z_index,
          position: "absolute",
          top: 0,
          left: 0,
          overflow: "hidden",
          borderRadius: "0.5rem",
          pointerEvents: "auto",
          margin: 0,
          padding: 0,
        }}
      >
        {info.image && (
          <img
            className="w-full h-full object-cover absolute inset-0"
            src={info.image}
            alt="background"
            style={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          />
        )}
      </div>
    );
  }
  if (info.name === "shape" && info.type === "rect") {
    const isSelected = current_component?.id === info.id;
    html = (
      <div
        id={info.id}
        onClick={() => info.setCurrentComponent(info)}
        style={{
          opacity: info.opacity,
          left: info.left + "px",
          top: info.top + "px",
          zIndex: info.z_index,
          transform: info.rotate ? `rotate(${info.rotate}deg)` : "rotate(0deg)",
        }}
        className={`absolute group ${
          isSelected ? "border-[3px] border-blue-500" : ""
        }`}
      >
        {isSelected && (
          <Element id={info.id} info={info} exId={`${info.id}r`} />
        )}

        <div
          onMouseDown={(e) => {
            // Only allow moving when clicking on the element itself, not on resize handles
            const target = e.target;
            // Check if clicking on resize handle or rotate button
            if (
              target.closest(".resize-handle") ||
              target.closest('[title="Rotate"]')
            ) {
              e.stopPropagation();
              return; // Don't move if clicking on resize handle or rotate button
            }
            info.moveElement(info.id, info, e);
          }}
          id={`${info.id}r`}
          style={{
            width: info.width + "px",
            height: info.height + "px",
            background: info.color,
          }}
        ></div>
      </div>
    );
  }

  if (info.name === "shape" && info.type === "circle") {
    const isSelected = current_component?.id === info.id;
    html = (
      <div
        id={info.id}
        onClick={() => info.setCurrentComponent(info)}
        style={{
          left: info.left + "px",
          top: info.top + "px",
          zIndex: info.z_index,
          transform: info.rotate ? `rotate(${info.rotate}deg)` : "rotate(0deg)",
        }}
        className={`absolute group ${
          isSelected ? "border-[3px] border-blue-500" : ""
        }`}
      >
        {isSelected && (
          <Element id={info.id} info={info} exId={`${info.id}c`} />
        )}
        <div
          onMouseDown={(e) => {
            const target = e.target;
            if (
              target.closest(".resize-handle") ||
              target.closest('[title="Rotate"]')
            ) {
              e.stopPropagation();
              return;
            }
            info.moveElement(info.id, info, e);
          }}
          id={`${info.id}c`}
          className="rounded-full"
          style={{
            width: info.width + "px",
            height: info.width + "px",
            background: info.color,
            opacity: info.opacity,
          }}
        ></div>
      </div>
    );
  }

  if (info.name === "shape" && info.type === "trangle") {
    const isSelected = current_component?.id === info.id;
    html = (
      <div
        id={info.id}
        onClick={() => info.setCurrentComponent(info)}
        style={{
          left: info.left + "px",
          top: info.top + "px",
          zIndex: info.z_index,
          transform: info.rotate ? `rotate(${info.rotate}deg)` : "rotate(0deg)",
        }}
        className={`absolute group ${
          isSelected ? "border-[3px] border-blue-500" : ""
        }`}
      >
        {isSelected && (
          <Element id={info.id} info={info} exId={`${info.id}t`} />
        )}

        <div
          onMouseDown={(e) => {
            const target = e.target;
            if (
              target.closest(".resize-handle") ||
              target.closest('[title="Rotate"]')
            ) {
              e.stopPropagation();
              return;
            }
            info.moveElement(info.id, info, e);
          }}
          id={`${info.id}t`}
          style={{
            width: info.width + "px",
            height: info.height + "px",
            background: info.color,
            opacity: info.opacity,
            clipPath: "polygon(50% 0,100% 100%,0 100%)",
          }}
        ></div>
      </div>
    );
  }

  if (info.name === "shape" && info.type === "diamond") {
    const isSelected = current_component?.id === info.id;
    html = (
      <div
        id={info.id}
        onClick={() => info.setCurrentComponent(info)}
        style={{
          left: info.left + "px",
          top: info.top + "px",
          zIndex: info.z_index,
          transform: info.rotate ? `rotate(${info.rotate}deg)` : "rotate(0deg)",
        }}
        className={`absolute group ${
          isSelected ? "border-[3px] border-blue-500" : ""
        }`}
      >
        {isSelected && (
          <Element id={info.id} info={info} exId={`${info.id}d`} />
        )}
        <div
          onMouseDown={(e) => {
            const target = e.target;
            if (
              target.closest(".resize-handle") ||
              target.closest('[title="Rotate"]')
            ) {
              e.stopPropagation();
              return;
            }
            info.moveElement(info.id, info, e);
          }}
          id={`${info.id}d`}
          style={{
            width: info.width + "px",
            height: info.height + "px",
            background: info.color,
            opacity: info.opacity,
            clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
          }}
        ></div>
      </div>
    );
  }

  if (info.name === "shape" && info.type === "star") {
    const isSelected = current_component?.id === info.id;
    html = (
      <div
        id={info.id}
        onClick={() => info.setCurrentComponent(info)}
        style={{
          left: info.left + "px",
          top: info.top + "px",
          zIndex: info.z_index,
          transform: info.rotate ? `rotate(${info.rotate}deg)` : "rotate(0deg)",
        }}
        className={`absolute group ${
          isSelected ? "border-[3px] border-blue-500" : ""
        }`}
      >
        {isSelected && (
          <Element id={info.id} info={info} exId={`${info.id}s`} />
        )}
        <div
          onMouseDown={(e) => {
            const target = e.target;
            if (
              target.closest(".resize-handle") ||
              target.closest('[title="Rotate"]')
            ) {
              e.stopPropagation();
              return;
            }
            info.moveElement(info.id, info, e);
          }}
          id={`${info.id}s`}
          style={{
            width: info.width + "px",
            height: info.height + "px",
            background: info.color,
            opacity: info.opacity,
            clipPath:
              "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
          }}
        ></div>
      </div>
    );
  }

  if (info.name === "shape" && info.type === "hexagon") {
    const isSelected = current_component?.id === info.id;
    html = (
      <div
        id={info.id}
        onClick={() => info.setCurrentComponent(info)}
        style={{
          left: info.left + "px",
          top: info.top + "px",
          zIndex: info.z_index,
          transform: info.rotate ? `rotate(${info.rotate}deg)` : "rotate(0deg)",
        }}
        className={`absolute group ${
          isSelected ? "border-[3px] border-blue-500" : ""
        }`}
      >
        {isSelected && (
          <Element id={info.id} info={info} exId={`${info.id}h`} />
        )}
        <div
          onMouseDown={(e) => {
            const target = e.target;
            if (
              target.closest(".resize-handle") ||
              target.closest('[title="Rotate"]')
            ) {
              e.stopPropagation();
              return;
            }
            info.moveElement(info.id, info, e);
          }}
          id={`${info.id}h`}
          style={{
            width: info.width + "px",
            height: info.height + "px",
            background: info.color,
            opacity: info.opacity,
            clipPath:
              "polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)",
          }}
        ></div>
      </div>
    );
  }
  if (info.name === "text") {
    const isSelected = current_component?.id === info.id;
    html = (
      <div onClick={() => info.setCurrentComponent(info)}>
        <div
          id={info.id}
          style={{
            left: info.left + "px",
            top: info.top + "px",
            width: (info.width || 200) + "px",
            height: (info.height || 50) + "px",
            zIndex: info.z_index,
            transform: info.rotate
              ? `rotate(${info.rotate}deg)`
              : "rotate(0deg)",
            padding: info.padding + "px",
            color: info.color,
            opacity: info.opacity,
          }}
          className={`absolute group ${
            isSelected ? "border-[3px] border-blue-500" : ""
          }`}
        >
          {isSelected && <Element id={info.id} info={info} exId="" />}
          <div
            onMouseDown={(e) => {
              const target = e.target;
              if (
                target.closest(".resize-handle") ||
                target.closest('[title="Rotate"]')
              ) {
                return;
              }
              info.moveElement(info.id, info, e);
            }}
          >
            <h2
              style={{
                fontSize: info.font + "px",
                fontWeight: info.weight,
                fontFamily: info.fontFamily || "Arial",
                textAlign: info.textAlign || "left",
                textShadow: info.textShadow || "none",
                WebkitTextStroke:
                  info.textOutline && info.textOutline !== "none"
                    ? info.textOutline
                    : "none",
                textStroke:
                  info.textOutline && info.textOutline !== "none"
                    ? info.textOutline
                    : "none",
              }}
              className="w-full h-full"
            >
              {info.title}
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (info.name === "image") {
    const isSelected = current_component?.id === info.id;
    html = (
      <div
        id={info.id}
        onClick={() => info.setCurrentComponent(info)}
        style={{
          left: info.left + "px",
          top: info.top + "px",
          zIndex: info.z_index,
          transform: info.rotate ? `rotate(${info.rotate}deg)` : "rotate(0deg)",
          opacity: info.opacity,
        }}
        className={`absolute group ${
          isSelected ? "border-[3px] border-blue-500" : ""
        }`}
      >
        {isSelected && (
          <Element id={info.id} info={info} exId={`${info.id}img`} />
        )}
        <div
          onMouseDown={(e) => {
            const target = e.target;
            if (
              target.closest(".resize-handle") ||
              target.closest('[title="Rotate"]')
            ) {
              e.stopPropagation();
              return;
            }
            info.moveElement(info.id, info, e);
          }}
          className="overflow-hidden"
          id={`${info.id}img`}
          style={{
            width: info.width + "px",
            height: info.height + "px",
            borderRadius: `${info.radius}%`,
          }}
        >
          <img className="w-full h-full" src={info.image} alt="image" />
        </div>
      </div>
    );
  }

  return html;
};

export default CreateComponente;
