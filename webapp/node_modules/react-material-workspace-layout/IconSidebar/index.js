import React from "react";
import { styled } from "@mui/styles";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import { iconMapping } from "../icon-mapping.js";
import { useIconDictionary } from "../icon-dictionary";
import Tooltip from "@mui/material/Tooltip";
var theme = createTheme();
var Container = styled("div")(function (_ref) {
  var theme = _ref.theme;
  return {
    width: 50,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
    flexShrink: 0
  };
});
var emptyAr = [];
export var IconSidebar = function IconSidebar(_ref2) {
  var _ref2$items = _ref2.items,
      items = _ref2$items === void 0 ? emptyAr : _ref2$items,
      onClickItem = _ref2.onClickItem,
      _ref2$selectedTools = _ref2.selectedTools,
      selectedTools = _ref2$selectedTools === void 0 ? emptyAr : _ref2$selectedTools;
  var customIconMapping = useIconDictionary();
  return /*#__PURE__*/React.createElement(ThemeProvider, {
    theme: theme
  }, /*#__PURE__*/React.createElement(Container, null, items.map(function (item) {
    var NameIcon = customIconMapping[item.name.toLowerCase()] || iconMapping[item.name.toLowerCase()] || iconMapping["help"];
    var buttonPart = /*#__PURE__*/React.createElement(IconButton, {
      key: item.name,
      color: item.selected || selectedTools.includes(item.name.toLowerCase()) ? "primary" : "default",
      disabled: Boolean(item.disabled),
      onClick: item.onClick ? item.onClick : function () {
        return onClickItem(item);
      }
    }, item.icon || /*#__PURE__*/React.createElement(NameIcon, null));
    if (!item.helperText) return buttonPart;
    return /*#__PURE__*/React.createElement(Tooltip, {
      key: item.name,
      title: item.helperText,
      placement: "right"
    }, buttonPart);
  })));
};
export default IconSidebar;