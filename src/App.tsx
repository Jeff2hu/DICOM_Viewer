import * as cornerstone from "cornerstone-core";
import * as cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import * as dicomParser from "dicom-parser";
import { useEffect, useRef, useState } from "react";

cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

const App = () => {
  const dicomViewerRef = useRef<HTMLDivElement>(null);
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [currentSlice, setCurrentSlice] = useState(0);

  const [dicomFiles] = useState(
    Array.from({ length: 360 }, (_, i) => {
      const num = String(i).padStart(5, "0");
      return `wadouri:${window.location.origin}/demo/image-${num}.dcm`;
    })
  );

  useEffect(() => {
    const element = dicomViewerRef.current;
    if (!element || dicomFiles.length === 0) return;

    cornerstone.enable(element);

    const loadedImageIds = dicomFiles;
    setImageIds(loadedImageIds);

    cornerstone
      .loadImage(loadedImageIds[0])
      .then((image: any) => cornerstone.displayImage(element, image))
      .catch((err: any) => console.error("DICOM 加載失敗", err));

    return () => cornerstone.disable(element);
  }, [dicomFiles]);

  useEffect(() => {
    const element = dicomViewerRef.current;
    if (!element) return;

    const handleWheel = (event: WheelEvent) => {
      if (imageIds.length <= 1) return;

      let newSlice = currentSlice + (event.deltaY > 0 ? 1 : -1);
      newSlice = Math.max(0, Math.min(imageIds.length - 1, newSlice));
      setCurrentSlice(newSlice);

      cornerstone
        .loadImage(imageIds[newSlice])
        .then((image: any) => cornerstone.displayImage(element, image))
        .catch((err: any) => console.error("無法載入 slice", err));
    };

    element.addEventListener("wheel", handleWheel);
    return () => element.removeEventListener("wheel", handleWheel);
  }, [imageIds, currentSlice]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
      }}
    >
      <h2>DeepRed DICOM Viewer</h2>
      <div
        ref={dicomViewerRef}
        style={{
          width: 512,
          height: 512,
          backgroundColor: "black",
          objectFit: "contain",
          position: "relative",
        }}
      >
        <span
          style={{
            color: "red",
            position: "absolute",
            top: 3,
            right: 3,
          }}
        >
          Slice: {currentSlice + 1} / {imageIds.length}
        </span>
      </div>
    </div>
  );
};

export default App;
