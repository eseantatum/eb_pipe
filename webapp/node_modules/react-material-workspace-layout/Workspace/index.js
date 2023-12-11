import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import React from "react";
import { styled } from "@mui/styles";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Header from "../Header";
import IconSidebar from "../IconSidebar";
import RightSidebar from "../RightSidebar";
import WorkContainer from "../WorkContainer";
import useDimensions from "react-use-dimensions";
import { IconDictionaryContext } from "../icon-dictionary.js";
var emptyAr = [];
var emptyObj = {};
var theme = createTheme();
var Container = styled("div")(function (_ref) {
  var theme = _ref.theme;
  return {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
    maxWidth: "100vw"
  };
});
var SidebarsAndContent = styled("div")(function (_ref2) {
  var theme = _ref2.theme;
  return {
    display: "flex",
    flexGrow: 1,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    maxWidth: "100vw"
  };
});
export default (function (_ref3) {
  var _ref3$style = _ref3.style,
      style = _ref3$style === void 0 ? emptyObj : _ref3$style,
      _ref3$iconSidebarItem = _ref3.iconSidebarItems,
      iconSidebarItems = _ref3$iconSidebarItem === void 0 ? emptyAr : _ref3$iconSidebarItem,
      _ref3$selectedTools = _ref3.selectedTools,
      selectedTools = _ref3$selectedTools === void 0 ? ["select"] : _ref3$selectedTools,
      _ref3$headerItems = _ref3.headerItems,
      headerItems = _ref3$headerItems === void 0 ? emptyAr : _ref3$headerItems,
      _ref3$rightSidebarIte = _ref3.rightSidebarItems,
      rightSidebarItems = _ref3$rightSidebarIte === void 0 ? emptyAr : _ref3$rightSidebarIte,
      onClickHeaderItem = _ref3.onClickHeaderItem,
      onClickIconSidebarItem = _ref3.onClickIconSidebarItem,
      _ref3$headerLeftSide = _ref3.headerLeftSide,
      headerLeftSide = _ref3$headerLeftSide === void 0 ? null : _ref3$headerLeftSide,
      _ref3$iconDictionary = _ref3.iconDictionary,
      iconDictionary = _ref3$iconDictionary === void 0 ? emptyObj : _ref3$iconDictionary,
      rightSidebarExpanded = _ref3.rightSidebarExpanded,
      _ref3$hideHeader = _ref3.hideHeader,
      hideHeader = _ref3$hideHeader === void 0 ? false : _ref3$hideHeader,
      _ref3$hideHeaderText = _ref3.hideHeaderText,
      hideHeaderText = _ref3$hideHeaderText === void 0 ? false : _ref3$hideHeaderText,
      children = _ref3.children;

  var _useDimensions = useDimensions(),
      _useDimensions2 = _slicedToArray(_useDimensions, 2),
      sidebarAndContentRef = _useDimensions2[0],
      sidebarAndContent = _useDimensions2[1];

  return /*#__PURE__*/React.createElement(ThemeProvider, {
    theme: theme
  }, /*#__PURE__*/React.createElement(IconDictionaryContext.Provider, {
    value: iconDictionary
  }, /*#__PURE__*/React.createElement(Container, {
    style: style
  }, !hideHeader && /*#__PURE__*/React.createElement(Header, {
    hideHeaderText: hideHeaderText,
    leftSideContent: headerLeftSide,
    onClickItem: onClickHeaderItem,
    items: headerItems
  }), /*#__PURE__*/React.createElement(SidebarsAndContent, {
    ref: sidebarAndContentRef
  }, iconSidebarItems.length === 0 ? null : /*#__PURE__*/React.createElement(IconSidebar, {
    onClickItem: onClickIconSidebarItem,
    selectedTools: selectedTools,
    items: iconSidebarItems
  }), /*#__PURE__*/React.createElement(WorkContainer, null, children), rightSidebarItems.length === 0 ? null : /*#__PURE__*/React.createElement(RightSidebar, {
    initiallyExpanded: rightSidebarExpanded,
    height: sidebarAndContent.height || 0
  }, rightSidebarItems)))));
});