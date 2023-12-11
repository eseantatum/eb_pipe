import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import React, { useReducer, useEffect, useMemo } from "react";
import { styled } from "@mui/styles";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ButtonBase from "@mui/material/ButtonBase";
import ExpandIcon from "@mui/icons-material/KeyboardArrowLeft";
import ContractIcon from "@mui/icons-material/KeyboardArrowRight";
import { grey } from "@mui/material/colors";
var theme = createTheme();
var Container = styled("div")(function (_ref) {
  var theme = _ref.theme;
  return {
    width: 0,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    flexShrink: 0,
    backgroundColor: "#fff",
    position: "relative",
    transition: "width 500ms",
    "&.expanded": {
      width: 300
    }
  };
});
var Expander = styled(ButtonBase)(function (_ref2) {
  var theme = _ref2.theme;
  return {
    width: 23,
    height: 40,
    display: "flex",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-start",
    borderTopLeftRadius: "50%",
    borderBottomLeftRadius: "50%",
    boxSizing: "border-box",
    borderTop: "1px solid ".concat(grey[400]),
    borderBottom: "1px solid ".concat(grey[400]),
    borderLeft: "1px solid ".concat(grey[400]),
    boxShadow: "-1px 2px 5px rgba(0,0,0,0.2)",
    backgroundColor: "#fff",
    position: "absolute",
    top: "calc(50% - 20px)",
    left: -23,
    zIndex: 9999,
    transition: "opacity 500ms, left 500ms, width 500ms",
    "&.expanded": {
      left: -20,
      width: 20,
      opacity: 0.4,
      "& .icon": {
        marginLeft: 0
      }
    },
    "& .icon": {
      marginLeft: 3
    }
  };
});
var Slider = styled("div")(function (_ref3) {
  var theme = _ref3.theme;
  return {
    position: "absolute",
    right: 0,
    top: 0,
    width: 0,
    bottom: 0,
    overflow: "hidden",
    transition: "opacity 500ms, left 500ms, width 500ms",
    "&.expanded": {
      width: 300
    }
  };
});
var InnerSliderContent = styled("div")(function (_ref4) {
  var theme = _ref4.theme;
  return {
    width: 300,
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0
  };
});

var getInitialExpandedState = function getInitialExpandedState() {
  try {
    return JSON.parse(window.localStorage.__REACT_WORKSPACE_LAYOUT_EXPANDED);
  } catch (e) {
    return window.innerWidth > 1000 ? true : false;
  }
};

export var RightSidebar = function RightSidebar(_ref5) {
  var children = _ref5.children,
      initiallyExpanded = _ref5.initiallyExpanded,
      height = _ref5.height;

  var _useReducer = useReducer(function (state) {
    return !state;
  }, initiallyExpanded === undefined ? getInitialExpandedState() : initiallyExpanded),
      _useReducer2 = _slicedToArray(_useReducer, 2),
      expanded = _useReducer2[0],
      toggleExpanded = _useReducer2[1];

  useEffect(function () {
    if (initiallyExpanded === undefined) {
      window.localStorage.__REACT_WORKSPACE_LAYOUT_EXPANDED = JSON.stringify(expanded);
    }
  }, [initiallyExpanded, expanded]);
  var containerStyle = useMemo(function () {
    return {
      height: height || "100%"
    };
  }, [height]);
  return /*#__PURE__*/React.createElement(ThemeProvider, {
    theme: theme
  }, /*#__PURE__*/React.createElement(Container, {
    className: expanded ? "expanded" : "",
    style: containerStyle
  }, /*#__PURE__*/React.createElement(Slider, {
    className: expanded ? "expanded" : ""
  }, /*#__PURE__*/React.createElement(InnerSliderContent, null, children)), /*#__PURE__*/React.createElement(Expander, {
    onClick: toggleExpanded,
    className: expanded ? "expanded" : ""
  }, expanded ? /*#__PURE__*/React.createElement(ContractIcon, {
    className: "icon"
  }) : /*#__PURE__*/React.createElement(ExpandIcon, {
    className: "icon"
  }))));
};
export default RightSidebar;