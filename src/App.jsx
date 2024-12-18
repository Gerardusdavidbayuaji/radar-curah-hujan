import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const RainViewer = () => {
  const [animationPosition, setAnimationPosition] = useState(5);
  const [optionColorScheme, setOptionColorScheme] = useState(7);
  const [optionKind, setOptionKind] = useState("radar");
  const [isPlaying, setIsPlaying] = useState(false);
  const [mapFrames, setMapFrames] = useState([]);
  const [apiData, setApiData] = useState(null);
  const [optionExtension] = useState("png");
  const [radarLayers] = useState({});

  useEffect(() => {
    axios
      .get("https://api.rainviewer.com/public/weather-maps.json")
      .then((response) => {
        setApiData(response.data);
        initialize(response.data, "radar");
      })
      .catch((error) => console.error("Error fetching API data", error));
  }, []);

  const initialize = (api, kind) => {
    if (!api) return;

    let frames = [];
    if (kind === "satellite" && api.satellite && api.satellite.infrared) {
      frames = api.satellite.infrared;
    } else if (api.radar && api.radar.past) {
      frames = api.radar.past;
      if (api.radar.nowcast) {
        frames = frames.concat(api.radar.nowcast);
      }
    }

    setMapFrames(frames);
    setAnimationPosition(frames.length - 1);
  };

  const addLayer = (frame) => {
    if (!radarLayers[frame.path]) {
      const colorScheme = optionKind === "satellite" ? 0 : optionColorScheme;
      const smooth = optionKind === "satellite" ? 0 : 1;
      const snow = optionKind === "satellite" ? 0 : 1;

      const tileLayerUrl =
        `${apiData.host}${frame.path}/256/{z}/{x}/{y}/${colorScheme}` +
        `/${smooth}_${snow}.${optionExtension}`;

      radarLayers[frame.path] = (
        <TileLayer
          key={frame.path}
          url={tileLayerUrl}
          opacity={0.9}
          zIndex={frame.time}
        />
      );
    }
    return radarLayers[frame.path];
  };

  const showFrame = (position) => {
    if (position < 0 || position >= mapFrames.length) return;

    setAnimationPosition(position);
  };

  const play = () => {
    setIsPlaying(true);
    const interval = setInterval(() => {
      setAnimationPosition((prev) => (prev + 1) % mapFrames.length);
    }, 2000);

    return () => clearInterval(interval);
  };

  const stop = () => {
    setIsPlaying(false);
  };

  const handleKindChange = (kind) => {
    setOptionKind(kind);
    initialize(apiData, kind);
  };

  const handleColorChange = (colorScheme) => {
    setOptionColorScheme(colorScheme);
    initialize(apiData, optionKind);
  };

  // const handleExtensionChange = () => {
  //   setOptionExtension((prev) => (prev === "png" ? "webp" : "png"));
  //   initialize(apiData, optionKind);
  // };

  return (
    <div className="relative w-full h-screen flex justify-center">
      {/* komponen 1 */}
      <div className="absolute bg-[#f5f4f2] border border-[#fafafa] p-4 flex justify-between space-x-4 z-40 rounded-md mt-4 text-[#242321]">
        <div className="space-x-2 flex">
          <input
            type="radio"
            name="kind"
            checked={optionKind === "radar"}
            onChange={() => handleKindChange("radar")}
          />
          <p>Radar</p>
          <input
            type="radio"
            name="kind"
            checked={optionKind === "satellite"}
            onChange={() => handleKindChange("satellite")}
          />
          <p>Satellite</p>
        </div>

        <div className="space-x-2">
          <button onClick={() => showFrame(animationPosition - 1)}>prev</button>
          <button onClick={isPlaying ? stop : play}>
            {isPlaying ? "Stop" : "Play"}
          </button>
          <button onClick={() => showFrame(animationPosition + 1)}>next</button>
        </div>

        <div className="bg-[#f5f4f2]">
          <select
            onChange={(e) => handleColorChange(Number(e.target.value))}
            value={optionColorScheme}
            className="rounded-md text-xs font-normal bg-[#f5f4f2] border p-1"
          >
            <option className="text-xs font-normal" value={0}>
              Black and White
            </option>
            <option className="text-xs font-normal" value={1}>
              Original
            </option>
            <option className="text-xs font-normal" value={2}>
              Universal Blue
            </option>
            <option className="text-xs font-normal" value={3}>
              TITAN
            </option>
            <option className="text-xs font-normal" value={4}>
              The Weather Channel
            </option>
            <option className="text-xs font-normal" value={5}>
              Meteored
            </option>
            <option className="text-xs font-normal" value={6}>
              NEXRAD Level-III
            </option>
            <option className="text-xs font-normal" value={7}>
              RAINBOW @ SELEX-SI
            </option>
            <option className="text-xs font-normal" value={8}>
              Dark Sky
            </option>
            <option className="text-xs font-normal" value={255}>
              Raw Source
            </option>
          </select>
        </div>

        {/* <div className="flex space-x-2">
          <p>WebP</p>
          <input
            type="checkbox"
            checked={optionExtension === "webp"}
            // onChange={handleExtensionChange}
          />
        </div> */}
      </div>

      <MapContainer
        className="absolute top-0 left-0 w-full h-full z-0"
        center={[-3.8513, 117.8554]}
        zoom={5}
        scrollWheelZoom={false}
      >
        {mapFrames[animationPosition] && addLayer(mapFrames[animationPosition])}
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}" />
      </MapContainer>

      {/* komponen 2 */}
      <div className="absolute bottom-0 rounded-md mb-4 bg-[#f5f4f2] border-t border-[#fafafa] p-2 text-center z-40 text-[#242321]">
        {mapFrames[animationPosition] && (
          <div>
            {mapFrames[animationPosition].time > Date.now() / 1000
              ? "FORECAST"
              : "PAST"}
            : {new Date(mapFrames[animationPosition].time * 1000).toString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default RainViewer;
