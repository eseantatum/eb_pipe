import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { mockDataWODComp } from "../data/mockWOD";
import { mockDataWODCF } from "../data/mockWOD";


const fakeDataFeeder = (selection) => {
    if (selection === "All"){
        return [...mockDataWODComp, ...mockDataWODCF];
    }
    if (selection === "CrossFit"){
        return mockDataWODCF;
    }
    if (selection === "Competitive"){
        return mockDataWODComp;
    }


}
export default function BasicDropDown(props) {
  const [choice, setChoice] = React.useState(props.default);

  const handleChange = (event) => {
    setChoice(event.target.value);
    props.changeDataHook(fakeDataFeeder(event.target.value));
    console.log(event.target.value);
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl>
        <InputLabel id="demo-simple-select-label">{props.label}</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={choice}
          label={props.label}
          onChange={handleChange}
        > 
        {props.items.map((p,i) => {
          return <MenuItem value={p.value} key={i}>{p.label}</MenuItem>
        })}
        </Select>
      </FormControl>
    </Box>
  );
}