import React from "react";
import HeaderButton from "../HeaderButton";
import Box from "@mui/material/Box";
import { styled } from "@mui/styles";
import { createTheme, ThemeProvider } from "@mui/material/styles";
var theme = createTheme();
var emptyObj = {};
var Container = styled("div")(function (_ref) {
  var theme = _ref.theme;
  return {
    width: "100%",
    display: "flex",
    backgroundColor: "#fff",
    borderBottom: "1px solid #ccc",
    alignItems: "center",
    flexShrink: 1,
    boxSizing: "border-box"
  };
});
export var Header = function Header(_ref2) {
  var _ref2$leftSideContent = _ref2.leftSideContent,
      leftSideContent = _ref2$leftSideContent === void 0 ? null : _ref2$leftSideContent,
      _ref2$hideHeaderText = _ref2.hideHeaderText,
      hideHeaderText = _ref2$hideHeaderText === void 0 ? false : _ref2$hideHeaderText,
      items = _ref2.items,
      onClickItem = _ref2.onClickItem;
  return /*#__PURE__*/React.createElement(ThemeProvider, {
    theme: theme
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement(Box, {
    flexGrow: 1
  }, leftSideContent), items.map(function (item) {
    return /*#__PURE__*/React.createElement(HeaderButton, Object.assign({
      key: item.name,
      hideText: hideHeaderText,
      onClick: function onClick() {
        return onClickItem(item);
      }
    }, item));
  })));
};
export default Header;