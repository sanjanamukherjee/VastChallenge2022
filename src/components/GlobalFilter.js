import React,{useState, useEffect, useContext} from "react";
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
// import  from '@mui/material/Typography';
import "./globalFilter.css";
import { Data } from "../Context";

// const ITEM_HEIGHT = 40;
// const ITEM_PADDING_TOP = 0;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 200,
      width: 110,
    },
  },
};

const interestGroups = [
    "A","B","C","D","E","F","G","H","I"
]

const educationGroups = ["Low", "HighSchoolOrCollege", "Bachelors", "Graduate"]

const GlobalFilter = () => {
    const { participantsData, setParticipantsData, filterControls, setFilter } = useContext(Data);

    const [ageRange, setAgeRange] = useState([18, 60]);
    const [interestSelected, setInterestSelected] = useState(interestGroups);
    const [educationSelected, setEducationSelected] = useState(educationGroups);

    const handleChange = (event, field) => {
        console.log("event - ", event);
        const {
            target: { value },
        } = event;
        // console.log("value - ", value);
        if(field === "interest"){
            setInterestSelected( value);
        }
        if(field === "education"){
            setEducationSelected( value);
        }
        if(field === "age"){
            setAgeRange( value);
        }
    }

    const handleUpdateClick = () => {
        setFilter({
            ageRange : ageRange,
            InterestGroup : interestSelected,
            Education : educationSelected,
        })
    }

    const handleResetClick = () => {
        setAgeRange([18, 60]);
        setInterestSelected(interestGroups);
        setEducationSelected(educationGroups);
        setFilter({
            ageRange : [18, 60],
            InterestGroup : ["A","B","C","D","E","F","G","H","I"],
            Education : ["Low", "HighSchoolOrCollege", "Bachelors", "Graduate"],
        })
    }

    return (
        <div className="globalFilter-panel">
            <div className="age-range-div">
                <div className="age-range-slider">
                    {/* double ended draggable slider */}
                    <label style={{fontSize: 14}}>Selected Age Range </label>
                    <Box sx={{ width: 200 }} style={{display: "flex", flexDirection: "row"}}>
                    <span>{ageRange[0]}</span><Slider style={{marginLeft: "12px", marginRight: "12px"}}
                            // getAriaLabel={() => 'Age Range'}
                            value={ageRange}
                            onChange={(e)=>handleChange(e,"age")}
                            valueLabelDisplay="auto"
                            min={18}
                            max={60}
                            size="small"
                            // getAriaValueText={valuetext}
                        /><span>{ageRange[1]}</span>
                    </Box>
                </div>
            </div>
            <div className="interest-filter-div">
                <FormControl size="small" style={{width: "200px"}}>
                    <InputLabel id="select-box-label">Interest Group</InputLabel>
                    <Select
                        labelId="multiple-checkbox-label"
                        id="multiple-checkbox"
                        multiple
                        value={interestSelected}
                        onChange={(e)=>handleChange(e,"interest")}
                        input={<OutlinedInput label="Interest Group" />}
                        renderValue={(selected) => selected.join(', ')}
                        MenuProps={MenuProps}
                    >
                    {interestGroups.map((interest) => (
                        <MenuItem key={interest} value={interest}>
                        <Checkbox checked={interestSelected.indexOf(interest) > -1} />
                        <ListItemText primary={interest} />
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
            </div>
            <div className="education-filter-div">
            <FormControl size="small" style={{width: "230px"}}>
                    <InputLabel id="demo-multiple-checkbox-label">Education Level</InputLabel>
                    <Select
                        labelId="demo-multiple-checkbox-label"
                        id="demo-multiple-checkbox"
                        multiple
                        value={educationSelected}
                        onChange={(e)=>handleChange(e,"education")}
                        input={<OutlinedInput label="Education Level" />}
                        renderValue={(selected) => selected.join(', ')}
                        MenuProps={MenuProps}
                    >
                    {educationGroups.map((edu) => (
                        <MenuItem key={edu} value={edu}>
                        <Checkbox checked={educationSelected.indexOf(edu) > -1} />
                        <ListItemText primary={edu} />
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
            </div>
            <div className="buttons">
            <button className="update-button" onClick={handleUpdateClick}>Update</button>
                <button className="reset-button" onClick={handleResetClick}>Reset</button>
            </div>
        </div>
    )
}

export default GlobalFilter;