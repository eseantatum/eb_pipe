import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Form from "./scenes/form";
import Login from "./scenes/login";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import injectContext from "./store/appContext";
import Test from "./scenes/test";
import UploadPage from "./scenes/upload";
import UploadImageGallery from "./scenes/uploadimagegallery";
import UploadGallery from "./scenes/uploadgallery";
import DataLabel from "./scenes/datalabel";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar isSidebar={isSidebar} />
          <div className="test">
          <main className="content">
            <Topbar setIsSidebar={setIsSidebar} />
            <Routes>
                {/* <Route element={<PrivateRoutes/>}> */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/uploads" element={<UploadGallery />} />
                    <Route path="/form" element={<Form />} />
                    <Route path="/test" element={<Test />} />
                    <Route path="/label" element={<DataLabel />} />
                    <Route path="/ingest" element={<UploadPage />} />
                    <Route path="/upload/:uuid" element={<UploadImageGallery />} />
                {/* </Route> */}
                    <Route path="/login" element={<Login />} />
            </Routes>
          </main>
          </div>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default injectContext(App);
