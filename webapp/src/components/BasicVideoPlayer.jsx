import React from "react";

const BasicVideoPlayer = ({ src }) => {
  return (
    <video
      src={src}
      controls
      style={{
        width: "100%",
        height: "auto",
      }}
    />
  );
};

export default BasicVideoPlayer;