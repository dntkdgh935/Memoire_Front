import React from "react";
import { Route, Routes } from "react-router-dom";
import AtelierHome from "../pages/atelier/AtelierHome";
import TextToTextMain from "../pages/atelier/TextToTextMain";
import TextToImageMain from "../pages/atelier/TextToImageMain";
import ImageToImageMain from "../pages/atelier/ImageToImageMain";
import ImageToVideoMain from "../pages/atelier/ImageToVideoMain";

function AtelierRouter() {
  return (
    <Routes>
      <Route path="/" element={<AtelierHome />} />
      <Route path="/text2text" element={<TextToTextMain />} />
      <Route path="/text2image" element={<TextToImageMain />} />
      <Route path="/image2image" element={<ImageToImageMain />} />
      <Route path="/image2video" element={<ImageToVideoMain />} />
    </Routes>
  );
}

export default AtelierRouter;
