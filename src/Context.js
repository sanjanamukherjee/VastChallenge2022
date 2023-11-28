import { createContext, useEffect, useState } from 'react';
import pdataJson from "./data/participants.json";
import bdataJson from "./data/buildings.json";
import edataJson from "./data/employers.json";
import jdataJson from "./data/jobs.json";
import pjdataJson from "./data/participant_jobs.json";

export const Data = createContext();

function timeStrToDecimal(timeString) {
    const parts = timeString.split(' ');
    const amOrPm = parts[1].toLowerCase();
    const timeParts = parts[0].split(':');

    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const seconds = parseInt(timeParts[2]);
    let time = hours + minutes / 60 + seconds / 3600;

    if (amOrPm === 'pm' && hours !== 12) {
        time += 12;
    }
    if (amOrPm === 'am' && hours === 12) {
        time -= 12;
    }

    return time;
}

function timeDecimalToStr(timeDecimal, roundMinutes = true) {
    let hours = Math.floor(timeDecimal);
    let minutes = Math.floor((timeDecimal - hours) * 60);
    let seconds = Math.floor(((timeDecimal - hours) * 60 - minutes) * 60);

    if (roundMinutes) {
        if (seconds >= 30) minutes += 1;
        seconds = 0;

        if (minutes === 60) {
            hours += 1 % 24;
            minutes = 0;
        }
    }

    let amOrPm = (hours < 12 || hours === 24) ? 'AM' : 'PM';

    if (hours > 12) {
        hours -= 12;
    }
    if (hours === 0) {
        hours = 12;
    }

    hours = hours.toString().padStart(2, '0');
    minutes = minutes.toString().padStart(2, '0');
    let timeString = '';
    if (roundMinutes) {
        timeString = `${hours}:${minutes} ${amOrPm}`;
    } else {
        seconds = seconds.toString().padStart(2, '0');
        timeString = `${hours}:${minutes}:${seconds} ${amOrPm}`;
    }

    return timeString;
}

function parseWeekDaysStr(weekDaysString) {
    const days = weekDaysString.substring(1, weekDaysString.length - 1).split(',');
    return days.map(day => {
        switch (day) {
            case 'Monday': return 'Mo';
            case 'Tuesday': return 'Tu';
            case 'Wednesday': return 'We';
            case 'Thursday': return 'Th';
            case 'Friday': return 'Fr';
            case 'Saturday': return 'Sa';
            case 'Sunday': return 'Su';
            default: return '';
        }
    });
}

const DataProvider = ({children}) => {
    let jdata = {};
    for (const row of Object.values(jdataJson)) {
        const jobId = row['jobId'];
        const employerId = row['employerId'];
        const hourlyRate = row['hourlyRate'];
        const startTime = timeStrToDecimal(row['startTime']);
        const endTime = timeStrToDecimal(row['endTime']);
        const weekDays = parseWeekDaysStr(row['daysToWork']);
        const eduReq = row['educationRequirement'];

        jdata[jobId] = {
            jobId,
            employerId,
            hourlyRate,
            startTime,
            endTime,
            weekDays,
            eduReq,
            participants: [],
        };
    }

    let edata = {};
    for (const row of Object.values(edataJson)) {
        const employerId = row['employerId'];
        const buildingId = row['buildingId'];

        edata[employerId] = {
            employerId,
            buildingId,
            jobs: [],
        };
    }

    let pdata = {};
    for (const row of Object.values(pdataJson)) {
        const participantId = parseInt(row['participantId']);
        const age = row['age'];
        const joviality = row['joviality'];
        const educationLevel = row['educationLevel'];
        const interestGroup = row['interestGroup'];
        const Food = row['Food'];
        const Recreation = row['Recreation'];
        const RentAdjustment = row['RentAdjustment'];
        const Shelter = row['Shelter'];
        const Wage = row['Wage'];
        const Travel = row['Travel'];

        pdata[participantId] = {
            participantId,
            age,
            joviality,
            educationLevel,
            interestGroup,
            Food,
            Recreation,
            RentAdjustment,
            Shelter,
            Wage,
            Travel,
            jobs: [],
        };
    }

    for (let [participantId, jobIdList] of Object.entries(pjdataJson)) {
        jobIdList = jobIdList.map(x => parseInt(x));

        pdata[participantId].jobs.push(...jobIdList);

        for (const jobId of jobIdList) {
            jdata[jobId].participants.push(participantId);
        }
    }

    for (const job of Object.values(jdata)) {
        const employer = edata[job.employerId];
        employer.jobs.push(job.jobId);
    }

    const [participantsData, setParticipantsData] = useState(pdata);
    const [buildingsData, setBuildingsData] = useState(bdataJson);
    const [employersData, setEmployersData] = useState(edata);
    const [jobsData, setJobsData] = useState(jdata);
    const [selectedBuildings, setSelectedBuildings] = useState(bdataJson);
    const [participantsPieData, setParticipantsPieData] = useState(pdata);
    const [spiderEmployerId, setSpiderEmployerId] = useState(-1);

    // Jbhoite
    const [participantsID, setParticipantsID] = useState(-1);
    

    const [filterControls, setFilter] = useState({
        ageRange : [18, 60],
        InterestGroup : ["A","B","C","D","E","F","G","H","I"],
        Education : ["Low", "HighSchoolOrCollege", "Bachelors", "Graduate"],
    });
    const [isParticipantSelected, setParticipantSelected] = useState(false);
    const [selectedParticipantId, setSelectedParticipantId] = useState([]); //arra when parallel is selected we are gonna appedn to tshis first array, passing setselectedparticiapantid that you will be able to do, that will be filtered only when if selected then bool one will be true,
    // in parallel check if



    useEffect(() => {
        console.log("here in data provider filter useEffect =======================- ", filterControls)
        const filteredParticipantData = Object.fromEntries(
            Object.entries(pdata).filter(([participantId, participant]) => {
                const isAgeInRange = participant.age >= filterControls.ageRange[0] && participant.age <= filterControls.ageRange[1];
                const isInterestGroupMatched = filterControls.InterestGroup.includes(participant.interestGroup);
                const isEducationMatched = filterControls.Education.includes(participant.educationLevel);
                // console.log("isAgeInRange, isInterestGroupMatched, isEducationMatched - ", isAgeInRange, isInterestGroupMatched, isEducationMatched)

                return isAgeInRange && isInterestGroupMatched && isEducationMatched;
            })
        );
        console.log("filteredParticipantData - ", filteredParticipantData);
        setParticipantsData(filteredParticipantData);

        const filteredJobIdSet = new Set();
        const filteredEmployerIdSet = new Set();
        for (const participant of Object.values(filteredParticipantData)) {
            for (const jobId of participant.jobs) {
                filteredJobIdSet.add(jobId);
                filteredEmployerIdSet.add(jdata[jobId].employerId);
            }
        }
        const filteredJobsData = Object.fromEntries(
            Object.entries(jdata).filter(([jobId, job]) => filteredJobIdSet.has(parseInt(jobId)))
        );
        console.log('filteredJobsData', filteredJobsData);
        setJobsData(filteredJobsData);
        const filteredEmployersData = Object.fromEntries(
            Object.entries(edata).filter(([employerId, employer]) => filteredEmployerIdSet.has(parseInt(employerId)))
        );
        console.log('filteredEmployersData', filteredEmployersData);
        setEmployersData(filteredEmployersData);
    }, [filterControls]);

    return (
        <Data.Provider value={{
            participantsData, setParticipantsData,
            participantsID,setParticipantsID,
            buildingsData, setBuildingsData,
            employersData, setEmployersData,
            jobsData, setJobsData,

            setFilter,
            selectedBuildings, setSelectedBuildings,
            participantsPieData, setParticipantsPieData,

            spiderEmployerId, setSpiderEmployerId,
        }}>
            {children}
        </Data.Provider>
    )
}

export default DataProvider;