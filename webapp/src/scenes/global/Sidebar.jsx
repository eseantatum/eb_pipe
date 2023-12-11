import { useState, useEffect, useContext } from "react";
import { ProSidebar, Menu, MenuItem, SubMenu} from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import EngineeringIcon from '@mui/icons-material/Engineering';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { Context } from "../../store/appContext";
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import CollectionsIcon from '@mui/icons-material/Collections';
import AssignmentIcon from '@mui/icons-material/Assignment';

const BASE_API_URL = process.env.REACT_APP_BASE_API_URL;

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const SubItem = ({ title, to, icon, selected, setSelected, subThreads }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  //calculate total so that it can be displayed. 
  let total = 0;
  for (let i = 0; i < subThreads.length; i++) {  //loop through the array
    total += subThreads[i].count;  //Do the math!
  }
  return (
    <SubMenu
      active={selected === title}
      title={title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => setSelected(title)}
      icon={icon}
      suffix={<span className="badge gray">{total}</span>}
    > 
    {subThreads.map((p,i) => {
        return <MenuItem suffix={<span className="badge red">{p.count}</span>}>
          {p.nickname}
          <Link to={"/smfeed/"+p.nickname}/>
          </MenuItem>
      })}
    </SubMenu>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isCollapsed = false;
  const [selected, setSelected] = useState("Dashboard");
  const [userProf, setUserProf] = useState({profile_pic:"../../assets/sentinel.png"});
  const { store, actions } = useContext(Context);
  const [threads, setThreads] = useState({"twitter":[],"telegram":[]});

  useEffect(() => {
    (async () => {
        setUserProf(store.user_profile);      
    })();
  }, [store.user_profile, store.token, actions.syncTokenFromSessionStore]);

  useEffect(() => {
    (async () => {
        setThreads(store.threads);   
    })();
  }, [store.threads, actions.getThreads]);

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed} style={{position:'fixed'}}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="50px"
                  height="100%"
                  src={userProf.profile_pic}
                  style={{ cursor: "pointer", borderRadius: "10%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  Sentinel
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Data Management
            </Typography>
            <Item
              title="Ingest"
              to="/ingest"
              icon={<LibraryAddIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Datasets"
              to="/uploads"
              icon={<VideoLibraryIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Label Queue"
              to="/label"
              icon={<AssignmentIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Prepare Datasets
            </Typography>
            <Item
              title="Manage"
              to="/scrapeconfig"
              icon={<EngineeringIcon />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
