import React, {useState, useEffect} from 'react'
import Button from 'react-bootstrap/Button';
import { useRouter } from 'next/router'
import axios from 'axios';
import Dropdown from 'react-bootstrap/Dropdown';
import GaitChart from '../components/GaitChart';
import { useAuth } from '../context/AuthContext';
import Head from 'next/head';
import instance from '../config/configkey';
function GaitAnalysis() {   

    const { user, login } = useAuth()   
    const { query } = useRouter();
    const [loading, setLoading] = useState(false)
    const [shoeSide, setShoeSide] = useState('left')
    const [patient, setPatient] = useState([])
  
    const[compareChartId, setCompareChartId] = useState()

    const [isCompare, setIsCompare] = useState(false)
  

  const getPatientDetails = () => {
    setLoading(true)
    instance.get(`api/medicalHistory/${query.patientid}`,{
      headers: {
          'authToken': user.accessToken,
          'doctor_id': user.uid
        }
  }).then((data) => {  
              setPatient(data.data[0].medicalHistories)
          setLoading(false)
    }).catch(() => {
       alert("An error occured while getting patient details, Cannot load comparison data")
    })
  }

  function getDateOnly(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
  }
  

  const compareChart = (analysis) => {
      setIsCompare(true)
      setCompareChartId(analysis)
  }

  useEffect(() => {
    getPatientDetails()
  }, [])



 

  if(loading)
  return <div>Calculating...</div>
   
  return (
    <><div>
      <Head>
        <title>
          paceB | Gait Analysis
        </title>
      </Head>
    </div>
   
  

    
    <div>
      
        <div style={{ width: "100vw", display: 'flex', justifyContent: 'center', gap: 60, marginTop: 30 }}>

          <div>

            <Button style={{ marginRight: 30 }} variant={shoeSide === "left" ? 'danger' : 'primary'} onClick={() => setShoeSide('left')}>Left</Button>
            <Button style={{ marginRight: 30 }} variant={shoeSide === "right" ? 'danger' : 'primary'} onClick={() => setShoeSide('right')}>Right</Button>
            <Button variant={shoeSide === "Cumulative" ? 'danger' : 'primary'} onClick={() => setShoeSide('Cumulative')}>Both</Button>



          </div>



        </div>


        <div style={{ width: '100vw', display: 'flex', justifyContent: 'center', marginTop: 40 }}>
          <Dropdown>
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
              Compare with
            </Dropdown.Toggle>

            <Dropdown.Menu>

              {patient && patient.map((item, index) => (


                item.recording_id !== query.recordingId ?
                  <Dropdown.Item onClick={() => compareChart(item.recording_id)}>{item.patient_condition} - {getDateOnly(item.createdAt)}</Dropdown.Item>
                  : null



              ))}
              <Dropdown.Item onClick={() => { setIsCompare(false); console.log("No compare"); } }>No compare</Dropdown.Item>
            </Dropdown.Menu>

          </Dropdown>
        </div>

        <div style={{ width: '100vw', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 30, marginTop: 30 }}>

          <div>
            <h2 style={{ textAlign: 'center' }}>Current recording</h2>
            <GaitChart shoeSide={shoeSide} recordingId={query.recordingId} patientId={query.patientid} token={user.accessToken} />
          </div>

          {isCompare ?

            <div>
              <h3 style={{ textAlign: 'center' }}>Comparison recording</h3>
              <GaitChart shoeSide={shoeSide} recordingId={compareChartId} patientId={query.patientid} />
            </div>

            : null}


        </div>
      </div></>
        
  )
}

export default GaitAnalysis

