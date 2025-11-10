import React, { useState, useEffect } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Item from "./Home/Item";
import toast from "react-hot-toast";
import CanvaMagical from "canva-magical-mouse-effect";
import { BsFolder } from "react-icons/bs";

const Home = () => {
  const [designs, setDesign] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [state, setState] = useState({
    width: 0,
    height: 0,
  });

  const inputHandle = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const [show, setShow] = useState(false);
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 3,
    },
    mdtablet: {
      breakpoint: { max: 992, min: 464 },
      items: 3,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 4,
    },
  };

  const create = () => {
    navigate("/design/create", {
      state: {
        type: "create",
        width: state.width,
        height: state.height,
      },
    });
  };

  const get_user_design = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/user-designs");
      const incomingDesigns = Array.isArray(data?.data?.designs)
        ? data.data.designs
        : [];
      setDesign(incomingDesigns);
    } catch (error) {
      console.error("Error fetching designs:", error);
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
      toast.success(data?.message || "Deleted");
      get_user_design();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete");
    }
  };

  const options = {
    removeStarTime: 3500,
    iconText: "★",
    cursorStyle: true,
    iconFontSizes: ["20px"],
    background: "linear-gradient(145deg, #FF597B, rgb(58, 38, 153))",
    starColors: ["red", "yellow", "orange"],
  };

  return (
    <div className="pt-5">
      <div className="w-full h-[300px] rounded-xl overflow-hidden shadow-2xl">
        <CanvaMagical options={options}>
          <div className="relative flex justify-center items-center w-full h-full">
            <button
              onClick={() => setShow(!show)}
              className="px-4 py-2 text-[15px] overflow-hidden text-center bg-gradient-to-r from-purple-600/90 to-indigo-600/90 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all absolute top-4 right-4 z-10"
            >
              Custom size
            </button>
            <form
              onSubmit={create}
              className={`absolute top-20 right-4 gap-3 bg-gradient-to-b from-[#1f1f21] to-[#18181a] border border-gray-800 w-[280px] p-5 text-white rounded-xl shadow-2xl ${
                show ? "visible opacity-100 scale-100" : "invisible opacity-0 scale-95"
              } transition-all duration-300`}
            >
              <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Custom Canvas Size
              </h3>
              <div className="grid grid-cols-2 pb-4 gap-3">
                <div className="flex gap-2 justify-center items-start flex-col">
                  <label htmlFor="width" className="text-sm text-gray-400">Width</label>
                  <input
                    required
                    onChange={inputHandle}
                    type="number"
                    name="width"
                    min="100"
                    max="2000"
                    className="w-full outline-none px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    id="width"
                    placeholder="650"
                  />
                </div>
                <div className="flex gap-2 justify-center items-start flex-col">
                  <label htmlFor="height" className="text-sm text-gray-400">Height</label>
                  <input
                    onChange={inputHandle}
                    type="number"
                    name="height"
                    min="100"
                    max="2000"
                    required
                    className="w-full outline-none px-3 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    id="height"
                    placeholder="450"
                  />
                </div>
              </div>
              <button className="px-4 py-2 text-sm overflow-hidden text-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all w-full">
                Create Design
              </button>
            </form>
            <div>
              <h2 className="text-4xl pb-4 pt-6 font-bold text-white drop-shadow-lg">
                What will you design today?
              </h2>
              <p className="text-lg text-gray-300">
                Create stunning designs with our powerful editor
              </p>
            </div>
          </div>
        </CanvaMagical>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl py-6 font-bold text-white flex items-center gap-2">
          <BsFolder className="text-purple-400" />
          Your Recent Designs
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-b from-[#1f1f21] to-[#18181a] rounded-xl border border-gray-800 h-[250px] animate-pulse"
              />
            ))}
          </div>
        ) : designs.length > 0 ? (
          <div>
            <Carousel
              autoPlay={true}
              infinite={true}
              responsive={responsive}
              transitionDuration={500}
            >
              {(designs || []).map((d, i) => (
                <Item delete_design={delete_design} design={d} key={i} />
              ))}
            </Carousel>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
            <div className="text-6xl mb-4 opacity-50">🎨</div>
            <p className="text-lg font-medium">No designs yet</p>
            <p className="text-sm mt-2">Create your first design to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
