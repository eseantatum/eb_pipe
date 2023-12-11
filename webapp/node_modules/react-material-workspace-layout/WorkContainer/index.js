import React from "react";
import { styled } from "@mui/styles";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { grey } from "@mui/material/colors";
var theme = createTheme();
var Container = styled("div")(function (_ref) {
  var theme = _ref.theme;
  return {
    position: "relative",
    flexGrow: 1,
    flexShrink: 1,
    height: "100%",
    backgroundColor: grey[50],
    overflowY: "auto"
  };
});
var ShadowOverlay = styled("div")(function (_ref2) {
  var theme = _ref2.theme;
  return {
    content: "' '",
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    pointerEvents: "none",
    boxShadow: "inset 0 3px 5px rgba(0,0,0,0.15), inset -3px 0 5px rgba(0,0,0,0.15), inset 3px 0 5px rgba(0,0,0,0.15)"
  };
});
export var WorkContainer = React.forwardRef(function (_ref3, ref) {
  var children = _ref3.children;
  return /*#__PURE__*/React.createElement(ThemeProvider, {
    theme: theme
  }, /*#__PURE__*/React.createElement(Container, {
    ref: ref
  }, children, /*#__PURE__*/React.createElement(ShadowOverlay, null)));
});
export default WorkContainer;