import React, { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";
import { useParams } from "react-router-dom";
import { BsGrid1X2, BsFillImageFill, BsFolder, BsLayers } from "react-icons/bs";
import {
  FaShapes,
  FaCloudUploadAlt,
  FaTrash,
  FaUndo,
  FaRedo,
  FaKeyboard,
} from "react-icons/fa";
import { IoDuplicateOutline } from "react-icons/io5";
import { TfiText } from "react-icons/tfi";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { RxTransparencyGrid } from "react-icons/rx";
import { HiOutlineArrowLeft } from "react-icons/hi";
import TemplateDesign from "../components/main/TemplateDesign";
import MyImages from "../components/MyImages";
import Projects from "../components/Projects";
import CreateComponente from "../components/CreateComponent";
import api from "../utils/api";
import InitialImage from "../components/InitialImage";
import BackgroundImages from "../components/BackgroundImages";
import toast from "react-hot-toast";
import {
  ZoomControls,
  GridToggle,
  FontFamilySelector,
  TextAlignment,
  TextEffects,
  LayerControls,
  CopyPasteControls,
  KeyboardShortcutsModal,
  SearchBar,
} from "../components/EditorFeatures";

const Main = () => {
  const [selectItem, setSelectItem] = useState("");
  const { design_id } = useParams();

  // Debug: Log design_id to help identify issues
  useEffect(() => {
    console.log("Design ID from URL params:", design_id);
  }, [design_id]);
  const [state, setState] = useState("");
  const [current_component, setCurrentComponent] = useState("");
  const [color, setColor] = useState("");
  const [image, setImage] = useState("");
  const [rotate, setRotate] = useState(0);
  const [left, setLeft] = useState("");
  const [top, setTop] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [opacity, setOpacity] = useState("");
  const [zIndex, setzIndex] = useState("");

  const [padding, setPadding] = useState("");
  const [font, setFont] = useState("");
  const [weight, setWeight] = useState("");
  const [text, setText] = useState("");
  const [radius, setRadius] = useState(0);

  const [show, setShow] = useState({
    status: true,
    name: "",
  });

  const [showLayers, setShowLayers] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // New feature states
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [clipboard, setClipboard] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textAlign, setTextAlign] = useState("left");
  const [textEffect, setTextEffect] = useState({
    shadow: "none",
    outline: "none",
  });

  const [components, setComponents] = useState([
    {
      name: "main_frame",
      type: "rect",
      id: Math.floor(Math.random() * 100 + 1),
      height: 450,
      width: 650,
      z_index: 1,
      color: "#fff",
      image: "",
      setCurrentComponent: (a) => setCurrentComponent(a),
    },
  ]);

  // Save state to history
  const saveToHistory = useCallback(
    (comps) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(comps)));
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  // Undo functionality
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setComponents(
        prevState.map((c) => ({
          ...c,
          setCurrentComponent: (a) => setCurrentComponent(a),
          moveElement,
          resizeElement,
          rotateElement,
        }))
      );
      setHistoryIndex(historyIndex - 1);
      toast.success("Undone");
    }
  }, [history, historyIndex]);

  // Redo functionality
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setComponents(
        nextState.map((c) => ({
          ...c,
          setCurrentComponent: (a) => setCurrentComponent(a),
          moveElement,
          resizeElement,
          rotateElement,
        }))
      );
      setHistoryIndex(historyIndex + 1);
      toast.success("Redone");
    }
  }, [history, historyIndex]);

  // Copy/Paste functionality
  const handleCopy = useCallback(() => {
    if (current_component && current_component.name !== "main_frame") {
      setClipboard(JSON.parse(JSON.stringify(current_component)));
      toast.success("Element copied to clipboard");
    } else {
      toast.error("Select an element to copy");
    }
  }, [current_component]);

  const handlePaste = useCallback(() => {
    if (clipboard) {
      const newComponent = {
        ...clipboard,
        id: Date.now(),
        left: (clipboard.left || 10) + 20,
        top: (clipboard.top || 10) + 20,
      };
      const newComponents = [...components, newComponent];
      setComponents(newComponents);
      setCurrentComponent(newComponent);
      setSelectItem(newComponent.id);
      saveToHistory(newComponents);
      toast.success("Element pasted");
    } else {
      toast.error("Nothing to paste");
    }
  }, [clipboard, components, saveToHistory]);

  // Layer reordering
  const moveLayerUp = useCallback(() => {
    if (current_component && current_component.name !== "main_frame") {
      const index = components.findIndex((c) => c.id === current_component.id);
      if (index < components.length - 1) {
        const newComponents = [...components];
        [newComponents[index], newComponents[index + 1]] = [
          newComponents[index + 1],
          newComponents[index],
        ];
        setComponents(newComponents);
        setCurrentComponent(newComponents[index + 1]);
        saveToHistory(newComponents);
        toast.success("Layer moved up");
      }
    }
  }, [current_component, components, saveToHistory]);

  const moveLayerDown = useCallback(() => {
    if (current_component && current_component.name !== "main_frame") {
      const index = components.findIndex((c) => c.id === current_component.id);
      if (index > 0) {
        const newComponents = [...components];
        [newComponents[index], newComponents[index - 1]] = [
          newComponents[index - 1],
          newComponents[index],
        ];
        setComponents(newComponents);
        setCurrentComponent(newComponents[index - 1]);
        saveToHistory(newComponents);
        toast.success("Layer moved down");
      }
    }
  }, [current_component, components, saveToHistory]);

  // Duplicate functionality
  const duplicate = useCallback(
    (current) => {
      if (current) {
        const newComponent = { ...current, id: Date.now() };
        const newComponents = [...components, newComponent];
        setComponents(newComponents);
        saveToHistory(newComponents);
        toast.success("Element duplicated");
      }
    },
    [components, saveToHistory]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "c") {
        e.preventDefault();
        handleCopy();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "v") {
        e.preventDefault();
        handlePaste();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        if (current_component) duplicate(current_component);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        // Save is handled by Header component
      } else if ((e.ctrlKey || e.metaKey) && e.key === "g") {
        e.preventDefault();
        setShowGrid(!showGrid);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "=") {
        e.preventDefault();
        if (zoom < 200) setZoom(Math.min(zoom + 10, 200));
      } else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        if (zoom > 50) setZoom(Math.max(zoom - 10, 50));
      } else if (e.key === "?" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowShortcuts(true);
      } else if (
        e.key === "Delete" &&
        current_component &&
        current_component.name !== "main_frame"
      ) {
        removeComponent(current_component.id);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    undo,
    redo,
    current_component,
    handleCopy,
    handlePaste,
    duplicate,
    zoom,
    showGrid,
  ]);

  const setElements = (type, name) => {
    setState(type);
    setShow({
      state: false,
      name,
    });
  };

  const moveElement = (id, currentInfo) => {
    setCurrentComponent(currentInfo);
    let isMoving = true;

    const currentDiv = document.getElementById(id);

    const mouseMove = ({ movementX, movementY }) => {
      setSelectItem("");
      const getStyle = window.getComputedStyle(currentDiv);
      const left = parseInt(getStyle.left);
      const top = parseInt(getStyle.top);
      if (isMoving) {
        currentDiv.style.left = `${left + movementX}px`;
        currentDiv.style.top = `${top + movementY}px`;
      }
    };

    const mouseUp = (e) => {
      setSelectItem(currentInfo.id);
      isMoving = false;
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", mouseUp);
      setLeft(parseInt(currentDiv.style.left));
      setTop(parseInt(currentDiv.style.top));
    };

    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", mouseUp);
    currentDiv.ondragstart = function () {
      return false;
    };
  };

  const resizeElement = (id, currentInfo) => {
    setCurrentComponent(currentInfo);

    let isMoving = true;

    const currentDiv = document.getElementById(id);

    const mouseMove = ({ movementX, movementY }) => {
      const getStyle = window.getComputedStyle(currentDiv);
      const width = parseInt(getStyle.width);
      const height = parseInt(getStyle.height);
      if (isMoving) {
        currentDiv.style.width = `${width + movementX}px`;
        currentDiv.style.height = `${height + movementY}px`;
      }
    };

    const mouseUp = (e) => {
      isMoving = false;
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", mouseUp);
      setWidth(parseInt(currentDiv.style.width));
      setHeight(parseInt(currentDiv.style.height));
    };

    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", mouseUp);
    currentDiv.ondragstart = function () {
      return false;
    };
  };

  const rotateElement = (id, currentInfo) => {
    setCurrentComponent(currentInfo);

    const target = document.getElementById(id);

    const mouseMove = ({ movementX, movementY }) => {
      const getStyle = window.getComputedStyle(target);

      const trans = getStyle.transform;

      const values = trans.split("(")[1].split(")")[0].split(",");

      const angle = Math.round(
        Math.atan2(values[1], values[0]) * (180 / Math.PI)
      );

      let deg = angle < 0 ? angle + 360 : angle;

      if (movementX) {
        deg = deg + movementX;
      }
      target.style.transform = `rotate(${deg}deg)`;
    };
    const mouseUp = (e) => {
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", mouseUp);

      const getStyle = window.getComputedStyle(target);
      const trans = getStyle.transform;
      const values = trans.split("(")[1].split(")")[0].split(",");
      const angle = Math.round(
        Math.atan2(values[1], values[0]) * (180 / Math.PI)
      );
      let deg = angle < 0 ? angle + 360 : angle;
      setRotate(deg);
    };

    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", mouseUp);

    target.ondragstart = function () {
      return false;
    };
  };

  const removeComponent = (id) => {
    const temp = components.filter((c) => c.id !== id);
    setCurrentComponent("");
    setComponents(temp);
    saveToHistory(temp);
  };

  const remove_background = () => {
    const com = components.find((c) => c.id === current_component.id);
    const temp = components.filter((c) => c.id !== current_component.id);
    com.image = "";
    setImage("");
    setComponents([...temp, com]);
  };

  const opacityHandle = (e) => {
    setOpacity(parseFloat(e.target.value));
  };

  const createShape = (name, type) => {
    setCurrentComponent("");
    const id = Date.now();
    const style = {
      id: id,
      name: name,
      type,
      left: 10,
      top: 10,
      opacity: 1,
      width: 200,
      height: 150,
      rotate,
      z_index: 2,
      color: "#3c3c3d",
      setCurrentComponent: (a) => setCurrentComponent(a),
      moveElement,
      resizeElement,
      rotateElement,
    };
    setSelectItem(id);
    setCurrentComponent(style);
    const newComponents = [...components, style];
    setComponents(newComponents);
    saveToHistory(newComponents);
  };

  const add_text = (name, type) => {
    setCurrentComponent("");
    const id = Date.now();
    const style = {
      id: id,
      name: name,
      type,
      left: 10,
      top: 10,
      opacity: 1,
      rotate,
      z_index: 10,
      padding: 6,
      font: 22,
      title: "Add text",
      weight: 400,
      color: "#3c3c3d",
      fontFamily: "Arial",
      textAlign: "left",
      textShadow: "none",
      textOutline: "none",
      setCurrentComponent: (a) => setCurrentComponent(a),
      moveElement,
      resizeElement,
      rotateElement,
    };

    setWeight("");
    setFont("");
    setSelectItem(id);
    setCurrentComponent(style);
    const newComponents = [...components, style];
    setComponents(newComponents);
    saveToHistory(newComponents);
  };

  const add_image = (img) => {
    setCurrentComponent("");
    const id = Date.now();
    const style = {
      id: id,
      name: "image",
      type: "image",
      left: 10,
      top: 10,
      opacity: 1,
      width: 200,
      height: 150,
      rotate,
      z_index: 2,
      ratius: 0,
      image: img,
      setCurrentComponent: (a) => setCurrentComponent(a),
      moveElement,
      resizeElement,
      rotateElement,
    };

    setSelectItem(id);
    setCurrentComponent(style);
    const newComponents = [...components, style];
    setComponents(newComponents);
    saveToHistory(newComponents);
  };

  useEffect(() => {
    if (current_component) {
      setComponents((prevComponents) => {
        const index = prevComponents.findIndex(
          (c) => c.id === current_component.id
        );
        if (index === -1) return prevComponents;

        const updatedComponents = [...prevComponents];
        const component = { ...updatedComponents[index] };

        if (current_component.name !== "text") {
          if (width !== "") component.width = width || current_component.width;
          if (height !== "")
            component.height = height || current_component.height;
          if (rotate !== 0)
            component.rotate = rotate || current_component.rotate;
        }
        if (current_component.name === "text") {
          if (font !== "") component.font = font || current_component.font;
          if (padding !== "")
            component.padding = padding || current_component.padding;
          if (weight !== "")
            component.weight = weight || current_component.weight;
          if (text !== "") component.title = text || current_component.title;
          // Update text properties from current_component
          if (current_component.fontFamily)
            component.fontFamily = current_component.fontFamily;
          if (current_component.textAlign)
            component.textAlign = current_component.textAlign;
          if (current_component.textShadow)
            component.textShadow = current_component.textShadow;
          if (current_component.textOutline)
            component.textOutline = current_component.textOutline;
        }
        if (current_component.name === "image") {
          if (radius !== 0)
            component.radius = radius || current_component.radius;
        }

        if (current_component.name === "main_frame" && image) {
          component.image = image || current_component.image;
        }
        if (color !== "") component.color = color || current_component.color;

        if (current_component.name !== "main_frame") {
          if (left !== "") component.left = left || current_component.left;
          if (top !== "") component.top = top || current_component.top;
          if (opacity !== "")
            component.opacity = opacity || current_component.opacity;
          if (zIndex !== "")
            component.z_index = zIndex || current_component.z_index;
        }

        updatedComponents[index] = component;
        return updatedComponents;
      });
    }
  }, [
    color,
    image,
    left,
    top,
    width,
    height,
    opacity,
    zIndex,
    padding,
    font,
    weight,
    text,
    radius,
    rotate,
    current_component,
    fontFamily,
    textAlign,
    textEffect,
  ]);

  // Note: History is saved explicitly in user actions (moveElement, resizeElement, etc.)
  // Not automatically on property changes to avoid infinite loops

  // Sync form fields when component changes
  useEffect(() => {
    if (current_component) {
      // Reset numeric/string fields to empty to trigger updates only on change
      setColor("");
      setWidth("");
      setHeight("");
      setTop("");
      setLeft("");
      setRotate(0);
      setOpacity("");
      setzIndex("");
      setText("");
      setPadding("");
      setFont("");
      setWeight("");

      // Sync text-specific properties from component
      if (current_component.name === "text") {
        setFontFamily(current_component.fontFamily || "Arial");
        setTextAlign(current_component.textAlign || "left");
        setTextEffect({
          shadow: current_component.textShadow || "none",
          outline: current_component.textOutline || "none",
        });
      }
    }
  }, [current_component?.id]);

  useEffect(() => {
    const get_design = async () => {
      // Only fetch design if design_id exists
      if (!design_id) {
        console.log("Design ID is undefined, skipping fetch");
        return;
      }

      try {
        const { data } = await api.get(`/api/user-design/${design_id}`);
        console.log("Design fetched successfully:", data);

        // Handle response structure: data.data.design or data.design
        const design = data?.data?.design || data?.design;

        if (!design || !Array.isArray(design)) {
          console.error("Invalid design data received:", data);
          return;
        }

        for (let i = 0; i < design.length; i++) {
          design[i].setCurrentComponent = (a) => setCurrentComponent(a);
          design[i].moveElement = moveElement;
          design[i].resizeElement = resizeElement;
          design[i].rotateElement = rotateElement;
          design[i].remove_background = remove_background;
        }
        setComponents(design);
        saveToHistory(design);
      } catch (error) {
        console.error("Error fetching design:", error);
        console.error("Design ID:", design_id);
        console.error("Error response:", error.response?.data);

        // If design not found, keep the default components (for new designs)
        if (error.response?.status === 404) {
          console.log(
            "Design not found - using default components (this is normal for newly created designs)"
          );
        }
      }
    };
    get_design();
  }, [design_id]);

  return (
    <div className="min-w-screen h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header components={components} design_id={design_id} />
      <div className="flex h-[calc(100%-60px)] w-screen">
        <div className="w-[80px] bg-gradient-to-b from-[#1a1a1c] to-[#0f0f10] border-r border-gray-800 z-50 h-full text-gray-400 overflow-y-auto shadow-2xl">
          <div
            onClick={() => setElements("design", "design")}
            className={`${
              show.name === "design"
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-l-2 border-purple-500 text-purple-300"
                : "hover:bg-gray-800/50"
            } w-full h-[80px] cursor-pointer flex justify-center flex-col items-center gap-1 transition-all duration-200 group`}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              <BsGrid1X2 />
            </span>
            <span className="text-xs font-medium">Design</span>
          </div>

          <div
            onClick={() => setElements("shape", "shape")}
            className={`${
              show.name === "shape"
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-l-2 border-purple-500 text-purple-300"
                : "hover:bg-gray-800/50"
            } w-full h-[80px] cursor-pointer flex justify-center flex-col items-center gap-1 transition-all duration-200 group`}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              <FaShapes />
            </span>
            <span className="text-xs font-medium">Shapes</span>
          </div>

          <div
            onClick={() => setElements("image", "uploadImage")}
            className={`${
              show.name === "uploadImage"
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-l-2 border-purple-500 text-purple-300"
                : "hover:bg-gray-800/50"
            } w-full h-[80px] cursor-pointer flex justify-center flex-col items-center gap-1 transition-all duration-200 group`}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              <FaCloudUploadAlt />
            </span>
            <span className="text-xs font-medium">Upload</span>
          </div>

          <div
            onClick={() => setElements("text", "text")}
            className={`${
              show.name === "text"
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-l-2 border-purple-500 text-purple-300"
                : "hover:bg-gray-800/50"
            } w-full h-[80px] cursor-pointer flex justify-center flex-col items-center gap-1 transition-all duration-200 group`}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              <TfiText />
            </span>
            <span className="text-xs font-medium">Text</span>
          </div>

          <div
            onClick={() => setElements("project", "projects")}
            className={`${
              show.name === "projects"
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-l-2 border-purple-500 text-purple-300"
                : "hover:bg-gray-800/50"
            } w-full h-[80px] cursor-pointer flex justify-center flex-col items-center gap-1 transition-all duration-200 group`}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              <BsFolder />
            </span>
            <span className="text-xs font-medium">Project</span>
          </div>

          <div
            onClick={() => setElements("initImage", "images")}
            className={`${
              show.name === "images"
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-l-2 border-purple-500 text-purple-300"
                : "hover:bg-gray-800/50"
            } w-full h-[80px] cursor-pointer flex justify-center flex-col items-center gap-1 transition-all duration-200 group`}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              <BsFillImageFill />
            </span>
            <span className="text-xs font-medium">Images</span>
          </div>

          <div
            onClick={() => setElements("background", "background")}
            className={`${
              show.name === "background"
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-l-2 border-purple-500 text-purple-300"
                : "hover:bg-gray-800/50"
            } w-full h-[80px] cursor-pointer flex justify-center flex-col items-center gap-1 transition-all duration-200 group`}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              <RxTransparencyGrid />
            </span>
            <span className="text-xs font-medium">Background</span>
          </div>

          <div className="border-t border-gray-800 my-2"></div>

          <div
            onClick={() => setShowLayers(!showLayers)}
            className={`${
              showLayers
                ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-l-2 border-purple-500 text-purple-300"
                : "hover:bg-gray-800/50"
            } w-full h-[80px] cursor-pointer flex justify-center flex-col items-center gap-1 transition-all duration-200 group`}
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              <BsLayers />
            </span>
            <span className="text-xs font-medium">Layers</span>
          </div>

          <div className="flex flex-col gap-2 mt-2 px-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className={`p-2 rounded-lg transition-all ${
                historyIndex > 0
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white"
                  : "bg-gray-900 text-gray-600 cursor-not-allowed"
              }`}
              title="Undo (Ctrl+Z)"
            >
              <FaUndo />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className={`p-2 rounded-lg transition-all ${
                historyIndex < history.length - 1
                  ? "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white"
                  : "bg-gray-900 text-gray-600 cursor-not-allowed"
              }`}
              title="Redo (Ctrl+Y)"
            >
              <FaRedo />
            </button>
            <button
              onClick={() => setShowShortcuts(true)}
              className="p-2 rounded-lg transition-all bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white"
              title="Keyboard Shortcuts (Ctrl+?)"
            >
              <FaKeyboard />
            </button>
          </div>
        </div>
        <div className="h-full w-[calc(100%-75px)]">
          <div
            className={`${
              show.status ? "p-0 -left-[350px]" : "px-8 left-[75px] py-5"
            } bg-gradient-to-b from-[#1f1f21] to-[#18181a] border-r border-gray-800 h-full fixed transition-all w-[350px] z-30 duration-700 shadow-2xl`}
          >
            <div
              onClick={() => setShow({ name: "", status: true })}
              className="flex absolute justify-center items-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 w-[24px] -right-3 text-white top-[40%] cursor-pointer h-[100px] rounded-r-lg shadow-lg transition-all hover:scale-105"
            >
              <MdKeyboardArrowLeft className="text-xl" />
            </div>
            {state === "design" && (
              <div>
                <TemplateDesign type="main" />
              </div>
            )}
            {state === "shape" && (
              <div className="p-4">
                <h3 className="text-white font-bold text-lg mb-4">
                  Basic Shapes
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div
                    onClick={() => createShape("shape", "rect")}
                    className="h-[90px] bg-gradient-to-br from-purple-600 to-indigo-600 cursor-pointer rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all border-2 border-transparent hover:border-purple-400"
                    title="Rectangle"
                  ></div>
                  <div
                    onClick={() => createShape("shape", "circle")}
                    className="h-[90px] bg-gradient-to-br from-purple-600 to-indigo-600 cursor-pointer rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all border-2 border-transparent hover:border-purple-400"
                    title="Circle"
                  ></div>
                  <div
                    onClick={() => createShape("shape", "trangle")}
                    style={{ clipPath: "polygon(50% 0,100% 100%,0 100%)" }}
                    className="h-[90px] bg-gradient-to-br from-purple-600 to-indigo-600 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 transition-all border-2 border-transparent hover:border-purple-400"
                    title="Triangle"
                  ></div>
                </div>
                <h3 className="text-white font-bold text-lg mb-4">
                  More Shapes
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div
                    onClick={() => createShape("shape", "diamond")}
                    style={{
                      clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                    }}
                    className="h-[90px] bg-gradient-to-br from-pink-600 to-rose-600 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 transition-all border-2 border-transparent hover:border-pink-400"
                    title="Diamond"
                  ></div>
                  <div
                    onClick={() => createShape("shape", "star")}
                    style={{
                      clipPath:
                        "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                    }}
                    className="h-[90px] bg-gradient-to-br from-yellow-500 to-orange-500 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 transition-all border-2 border-transparent hover:border-yellow-400"
                    title="Star"
                  ></div>
                  <div
                    onClick={() => createShape("shape", "hexagon")}
                    style={{
                      clipPath:
                        "polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)",
                    }}
                    className="h-[90px] bg-gradient-to-br from-cyan-600 to-blue-600 cursor-pointer shadow-lg hover:shadow-xl hover:scale-105 transition-all border-2 border-transparent hover:border-cyan-400"
                    title="Hexagon"
                  ></div>
                </div>
              </div>
            )}
            {state === "image" && <MyImages add_image={add_image} />}
            {state === "text" && (
              <div className="p-2">
                <div className="grid grid-cols-1 gap-3">
                  <div
                    onClick={() => add_text("text", "title")}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 cursor-pointer font-bold p-4 text-white text-lg rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 text-center"
                  >
                    <TfiText className="inline-block mr-2 text-xl" />
                    <span>Add Text</span>
                  </div>
                </div>
              </div>
            )}

            {state === "project" && (
              <Projects type="main" design_id={design_id} />
            )}
            {state === "initImage" && (
              <div className="h-[88vh] overflow-y-auto scrollbar-hide">
                <div className="p-4">
                  <SearchBar
                    onSearch={setSearchQuery}
                    placeholder="Search images..."
                  />
                </div>
                <InitialImage add_image={add_image} searchQuery={searchQuery} />
              </div>
            )}
            {state === "background" && (
              <div className="h-[88vh] overflow-y-auto scrollbar-hide">
                <div className="p-4">
                  <SearchBar
                    onSearch={setSearchQuery}
                    placeholder="Search backgrounds..."
                  />
                </div>
                <BackgroundImages
                  type="background"
                  setImage={setImage}
                  searchQuery={searchQuery}
                />
              </div>
            )}
            {showLayers && (
              <div className="h-[88vh] overflow-y-auto scrollbar-hide p-4">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <BsLayers className="text-purple-400" />
                  Layers
                </h3>
                <div className="space-y-2">
                  {components
                    .slice()
                    .reverse()
                    .map((comp, idx) => (
                      <div
                        key={comp.id}
                        onClick={() => {
                          setCurrentComponent(comp);
                          setSelectItem(comp.id);
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-all ${
                          current_component?.id === comp.id
                            ? "bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-2 border-purple-500"
                            : "bg-gray-800/50 hover:bg-gray-700/50 border-2 border-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm font-medium">
                            {comp.name === "main_frame"
                              ? "Canvas"
                              : comp.name === "text"
                              ? `Text: ${comp.title || "Untitled"}`
                              : comp.name === "image"
                              ? "Image"
                              : comp.type || comp.name}
                          </span>
                          <span className="text-gray-400 text-xs">
                            Z: {comp.z_index}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-full flex h-full">
            <div
              className={`flex justify-center relative items-center h-full ${
                !current_component ? "w-full" : "w-[calc(100%-280px)]"
              } overflow-hidden bg-gradient-to-br from-gray-900/50 to-black/50`}
            >
              {/* Zoom and Grid Controls */}
              <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
                <GridToggle
                  showGrid={showGrid}
                  onToggle={() => setShowGrid(!showGrid)}
                />
                <ZoomControls
                  zoom={zoom}
                  onZoomChange={setZoom}
                  onReset={() => setZoom(100)}
                />
              </div>

              {/* Grid Overlay */}
              {showGrid && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `
                    linear-gradient(to right, rgba(139, 61, 255, 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(139, 61, 255, 0.1) 1px, transparent 1px)
                  `,
                    backgroundSize: "20px 20px",
                  }}
                />
              )}

              <div
                className="m-w-[650px] m-h-[480px] flex justify-center items-center overflow-hidden p-8"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: "center",
                  transition: "transform 0.2s ease",
                }}
              >
                <div
                  id="main_design"
                  className="w-auto relative h-auto overflow-hidden select-none bg-white shadow-2xl rounded-lg"
                >
                  {components.map((c, i) => (
                    <CreateComponente
                      selectItem={selectItem}
                      setSelectItem={setSelectItem}
                      key={c.id || i}
                      info={c}
                      current_component={current_component}
                      removeComponent={removeComponent}
                    />
                  ))}
                </div>
              </div>
            </div>
            {current_component && (
              <div className="h-full w-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 text-gray-300 bg-gradient-to-b from-[#1f1f21] to-[#18181a] border-l border-gray-800 px-4 py-4 shadow-2xl">
                <div className="flex gap-6 flex-col items-start h-full justify-start pt-2">
                  <div className="w-full pb-3 border-b border-gray-800">
                    <h3 className="text-white font-bold text-lg mb-2">
                      Properties
                    </h3>
                  </div>
                  {current_component.name !== "main_frame" && (
                    <>
                      <CopyPasteControls
                        onCopy={handleCopy}
                        onPaste={handlePaste}
                        canPaste={!!clipboard}
                      />
                      <LayerControls
                        currentIndex={components.findIndex(
                          (c) => c.id === current_component.id
                        )}
                        totalLayers={components.length}
                        onMoveUp={moveLayerUp}
                        onMoveDown={moveLayerDown}
                        onLock={() => toast.info("Lock feature coming soon")}
                        onUnlock={() =>
                          toast.info("Unlock feature coming soon")
                        }
                        isLocked={false}
                      />
                      <div className="flex justify-start items-center gap-3 w-full">
                        <button
                          onClick={() => removeComponent(current_component?.id)}
                          className="flex-1 flex justify-center items-center gap-2 rounded-lg cursor-pointer py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all shadow-lg hover:shadow-xl"
                          title="Delete (Del)"
                        >
                          <FaTrash />
                          <span className="text-sm font-medium">Delete</span>
                        </button>
                        <button
                          onClick={() => duplicate(current_component)}
                          className="flex-1 flex justify-center items-center gap-2 rounded-lg cursor-pointer py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all shadow-lg hover:shadow-xl"
                          title="Duplicate (Ctrl+D)"
                        >
                          <IoDuplicateOutline />
                          <span className="text-sm font-medium">Duplicate</span>
                        </button>
                      </div>
                    </>
                  )}
                  <div className="w-full">
                    <label className="text-sm text-gray-400 mb-2 block">
                      Color
                    </label>
                    <div className="flex gap-3 items-center">
                      <label
                        className="w-[50px] h-[50px] cursor-pointer rounded-lg border-2 border-gray-700 hover:border-purple-500 transition-all shadow-lg"
                        style={{
                          background: `${
                            current_component.color &&
                            current_component.color !== "#fff"
                              ? current_component.color
                              : "gray"
                          }`,
                        }}
                        htmlFor="color"
                      ></label>
                      <input
                        onChange={(e) => setColor(e.target.value)}
                        type="color"
                        className="invisible"
                        id="color"
                      />
                      <span className="text-white text-sm font-mono">
                        {current_component.color || "#ffffff"}
                      </span>
                    </div>
                  </div>
                  {current_component.name === "main_frame" &&
                    current_component.image && (
                      <div className="w-full">
                        <button
                          className="w-full py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all shadow-lg hover:shadow-xl font-medium"
                          onClick={remove_background}
                        >
                          Remove Background
                        </button>
                      </div>
                    )}

                  {current_component.name !== "main_frame" && (
                    <div className="flex gap-4 flex-col w-full">
                      <div className="w-full">
                        <label className="text-sm text-gray-400 mb-2 block">
                          Opacity
                        </label>
                        <input
                          onChange={opacityHandle}
                          className="w-full border border-gray-700 bg-gray-900/50 text-white outline-none px-3 py-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          type="number"
                          step={0.1}
                          min={0.1}
                          max={1}
                          value={current_component.opacity}
                        />
                      </div>
                      <div className="w-full">
                        <label className="text-sm text-gray-400 mb-2 block">
                          Z-Index
                        </label>
                        <input
                          onChange={(e) => setzIndex(parseInt(e.target.value))}
                          className="w-full border border-gray-700 bg-gray-900/50 text-white outline-none px-3 py-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          type="number"
                          step={1}
                          value={current_component.z_index}
                        />
                      </div>
                      {current_component.name === "image" && (
                        <div className="w-full">
                          <label className="text-sm text-gray-400 mb-2 block">
                            Border Radius (%)
                          </label>
                          <input
                            onChange={(e) =>
                              setRadius(parseInt(e.target.value))
                            }
                            className="w-full border border-gray-700 bg-gray-900/50 text-white outline-none px-3 py-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            type="number"
                            step={1}
                            min={0}
                            max={50}
                            value={current_component.radius || 0}
                          />
                        </div>
                      )}
                      {current_component.name === "text" && (
                        <>
                          <FontFamilySelector
                            value={current_component.fontFamily || fontFamily}
                            onChange={(font) => {
                              setFontFamily(font);
                              const updatedComponent = {
                                ...current_component,
                                fontFamily: font,
                              };
                              setCurrentComponent(updatedComponent);
                              // Update components array immediately
                              setComponents((prevComponents) => {
                                const index = prevComponents.findIndex(
                                  (c) => c.id === current_component.id
                                );
                                if (index === -1) return prevComponents;
                                const updated = [...prevComponents];
                                updated[index] = {
                                  ...updated[index],
                                  fontFamily: font,
                                };
                                return updated;
                              });
                            }}
                          />
                          <TextAlignment
                            value={current_component.textAlign || textAlign}
                            onChange={(align) => {
                              setTextAlign(align);
                              const updatedComponent = {
                                ...current_component,
                                textAlign: align,
                              };
                              setCurrentComponent(updatedComponent);
                              // Update components array immediately
                              setComponents((prevComponents) => {
                                const index = prevComponents.findIndex(
                                  (c) => c.id === current_component.id
                                );
                                if (index === -1) return prevComponents;
                                const updated = [...prevComponents];
                                updated[index] = {
                                  ...updated[index],
                                  textAlign: align,
                                };
                                return updated;
                              });
                            }}
                          />
                          <TextEffects
                            value={{
                              shadow: current_component.textShadow || "none",
                              outline: current_component.textOutline || "none",
                            }}
                            onEffectChange={(effect) => {
                              setTextEffect(effect);
                              const updatedComponent = {
                                ...current_component,
                                textShadow: effect.shadow,
                                textOutline: effect.outline,
                              };
                              setCurrentComponent(updatedComponent);
                              // Update components array immediately
                              setComponents((prevComponents) => {
                                const index = prevComponents.findIndex(
                                  (c) => c.id === current_component.id
                                );
                                if (index === -1) return prevComponents;
                                const updated = [...prevComponents];
                                updated[index] = {
                                  ...updated[index],
                                  textShadow: effect.shadow,
                                  textOutline: effect.outline,
                                };
                                return updated;
                              });
                            }}
                          />
                          <div className="w-full">
                            <label className="text-sm text-gray-400 mb-2 block">
                              Padding
                            </label>
                            <input
                              onChange={(e) => {
                                const newPadding =
                                  parseInt(e.target.value) || 0;
                                setPadding(newPadding);
                                // Update components array immediately
                                setComponents((prevComponents) => {
                                  const index = prevComponents.findIndex(
                                    (c) => c.id === current_component.id
                                  );
                                  if (index === -1) return prevComponents;
                                  const updated = [...prevComponents];
                                  updated[index] = {
                                    ...updated[index],
                                    padding: newPadding,
                                  };
                                  return updated;
                                });
                              }}
                              className="w-full border border-gray-700 bg-gray-900/50 text-white outline-none px-3 py-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                              type="number"
                              step={1}
                              value={current_component.padding || 6}
                            />
                          </div>
                          <div className="w-full">
                            <label className="text-sm text-gray-400 mb-2 block">
                              Font Size
                            </label>
                            <input
                              onChange={(e) => {
                                const newFont = parseInt(e.target.value) || 22;
                                setFont(newFont);
                                // Update components array immediately
                                setComponents((prevComponents) => {
                                  const index = prevComponents.findIndex(
                                    (c) => c.id === current_component.id
                                  );
                                  if (index === -1) return prevComponents;
                                  const updated = [...prevComponents];
                                  updated[index] = {
                                    ...updated[index],
                                    font: newFont,
                                  };
                                  return updated;
                                });
                              }}
                              className="w-full border border-gray-700 bg-gray-900/50 text-white outline-none px-3 py-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                              type="number"
                              step={1}
                              min={8}
                              max={200}
                              value={current_component.font || 22}
                            />
                          </div>
                          <div className="w-full">
                            <label className="text-sm text-gray-400 mb-2 block">
                              Font Weight
                            </label>
                            <input
                              onChange={(e) => {
                                const newWeight =
                                  parseInt(e.target.value) || 400;
                                setWeight(newWeight);
                                // Update components array immediately
                                setComponents((prevComponents) => {
                                  const index = prevComponents.findIndex(
                                    (c) => c.id === current_component.id
                                  );
                                  if (index === -1) return prevComponents;
                                  const updated = [...prevComponents];
                                  updated[index] = {
                                    ...updated[index],
                                    weight: newWeight,
                                  };
                                  return updated;
                                });
                              }}
                              className="w-full border border-gray-700 bg-gray-900/50 text-white outline-none px-3 py-2 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                              type="number"
                              step={100}
                              min={100}
                              max={900}
                              value={current_component.weight || 400}
                            />
                          </div>

                          <div className="w-full">
                            <label className="text-sm text-gray-400 mb-2 block">
                              Text Content
                            </label>
                            <input
                              onChange={(e) => {
                                const newTitle = e.target.value;
                                const updatedComponent = {
                                  ...current_component,
                                  title: newTitle,
                                };
                                setCurrentComponent(updatedComponent);
                                // Update components array immediately
                                setComponents((prevComponents) => {
                                  const index = prevComponents.findIndex(
                                    (c) => c.id === current_component.id
                                  );
                                  if (index === -1) return prevComponents;
                                  const updated = [...prevComponents];
                                  updated[index] = {
                                    ...updated[index],
                                    title: newTitle,
                                  };
                                  return updated;
                                });
                                setText(newTitle);
                              }}
                              className="w-full border border-gray-700 bg-gray-900/50 text-white outline-none p-3 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                              type="text"
                              value={current_component.title || ""}
                              placeholder="Enter text..."
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
};

export default Main;
