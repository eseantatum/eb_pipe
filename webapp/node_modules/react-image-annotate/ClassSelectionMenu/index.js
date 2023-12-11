import React, { useEffect } from "react";
import { styled } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import * as muiColors from "@material-ui/core/colors";
import SidebarBoxContainer from "../SidebarBoxContainer";
import colors from "../colors";
import BallotIcon from "@material-ui/icons/Ballot";
import capitalize from "lodash/capitalize";
import classnames from "classnames";
var LabelContainer = styled("div")({
  display: "flex",
  paddingTop: 4,
  paddingBottom: 4,
  paddingLeft: 16,
  paddingRight: 16,
  alignItems: "center",
  cursor: "pointer",
  opacity: 0.7,
  backgroundColor: "#fff",
  "&:hover": {
    opacity: 1
  },
  "&.selected": {
    opacity: 1,
    fontWeight: "bold"
  }
});
var Circle = styled("div")({
  width: 12,
  height: 12,
  borderRadius: 12,
  marginRight: 8
});
var Label = styled("div")({
  fontSize: 11
});
var DashSep = styled("div")({
  flexGrow: 1,
  borderBottom: "2px dotted ".concat(muiColors.grey[300]),
  marginLeft: 8,
  marginRight: 8
});
var Number = styled("div")({
  fontSize: 11,
  textAlign: "center",
  minWidth: 14,
  paddingTop: 2,
  paddingBottom: 2,
  fontWeight: "bold",
  color: muiColors.grey[700]
});
export var ClassSelectionMenu = function ClassSelectionMenu(_ref) {
  var selectedCls = _ref.selectedCls,
      regionClsList = _ref.regionClsList,
      onSelectCls = _ref.onSelectCls;
  useEffect(function () {
    var keyMapping = {};

    var _loop = function _loop(i) {
      keyMapping[i + 1] = function () {
        return onSelectCls(regionClsList[i]);
      };
    };

    for (var i = 0; i < 9 && i < regionClsList.length; i++) {
      _loop(i);
    }

    var onKeyDown = function onKeyDown(e) {
      if (keyMapping[e.key]) {
        keyMapping[e.key]();
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return function () {
      return window.removeEventListener("keydown", onKeyDown);
    };
  }, [regionClsList, selectedCls]);
  return /*#__PURE__*/React.createElement(SidebarBoxContainer, {
    title: "Classifications",
    subTitle: "",
    icon: /*#__PURE__*/React.createElement(BallotIcon, {
      style: {
        color: muiColors.grey[700]
      }
    }),
    expandedByDefault: true
  }, regionClsList.map(function (label, index) {
    return /*#__PURE__*/React.createElement(LabelContainer, {
      className: classnames({
        selected: label === selectedCls
      }),
      onClick: function onClick() {
        return onSelectCls(label);
      }
    }, /*#__PURE__*/React.createElement(Circle, {
      style: {
        backgroundColor: colors[index % colors.length]
      }
    }), /*#__PURE__*/React.createElement(Label, {
      className: classnames({
        selected: label === selectedCls
      })
    }, capitalize(label)), /*#__PURE__*/React.createElement(DashSep, null), /*#__PURE__*/React.createElement(Number, {
      className: classnames({
        selected: label === selectedCls
      })
    }, index < 9 ? "Key [".concat(index + 1, "]") : ""));
  }), /*#__PURE__*/React.createElement(Box, {
    pb: 2
  }));
};
export default ClassSelectionMenu;