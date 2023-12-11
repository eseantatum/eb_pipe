import { useTheme } from "@mui/material";
import LabelChart from "../../components/LabelChart";

const Dashboard = () => {
  const theme = useTheme();

  return (
    <div>
      <h2>What's New?</h2>
      <ul>
        <li>The whole project!</li>
        <li>Report bugs to adam.b.kratch.mil@army.mil</li>
        <li>There will be a lot of them!</li>
      </ul>
      <h2>Current Feature Backlog - As of 06JUL2023</h2>
      <ul>
        <li>[ ] Wrap b-box label saver backend in a try except with db rollback conditions</li>
        <li>[ ] Fix bug where thumbnail can get deleted permanently</li>
        <li>[ ] Form validation for label drop down</li>
        <li>[ ] Add script to wipeout uploads and tmp upon bootup</li>
        <li>[ ] Change "type" field in db for uploads from mp4 to FMV</li>
        <li>[ ] After "Delete Selected" re-render the page so that it doesn't have fewer than N components</li>
        <li>[ ] Dump all files and labels feature (convert to yolo darknet)</li>
        <li>[ ] Add enriching information (% labeled, etc, to a dataset...)</li>
        <li>[ ] Make "delete" back end more robust and add switch statement for cases</li>
        <li>[ ] Automatically delete zip file after upload succeeds</li>
        <li>[ ] Bug where if there is no /train folder it doesn't succeed in flattening</li>
        <li>[ ] Add a sample dataset page</li>
        <li>[ ] Add a download button for image galleries / datasets</li>
    </ul>
    <LabelChart></LabelChart>
    </div>
  );
};

export default Dashboard;
