// const AWS = require('aws-sdk');
import React, {useEffect, useState, useRef} from 'react'
import Button from 'react-bootstrap/Button';
import MedConditionCard from '../components/MedConditionCard';
import axios from 'axios';
import { useRouter } from 'next/router'
import RealtimeChartLeft from '../components/RealtimeChartLeft';
import RealtimeChartRight from '../components/RealtimeChartRight';
const shortid = require('shortid');
const mqtt = require('mqtt')
import { useAuth } from '../context/AuthContext'
import Head from 'next/head';
import instance from '../config/configkey';

function visualize() {

  const { user, login } = useAuth()

  const { query } = useRouter();
  const [currentGraphData, setCurrentGraphData] = useState()
  const [graphData, setGraphData] = useState([])

  const router = useRouter()

  const [client, setClient] = useState(null)

  const [recording, setRecording] = useState(false)
  const [leftShoeOnline, setleftShoeOnline] = useState(false)
  const [rightShoeOnline, setRightShoeOnline] = useState(false)
  const [recordings, setRecordings] = useState([])

  const [shoeSide, setShoeSide] = useState("left")

  const getPatientDetails = () => {

    instance.get(`/api/medicalHistory/${query.patientId}`,{
      headers: {
          'authToken': user.accessToken,
          'doctor_id': user.uid
      }
  }).then((data) => { 
    console.log(data)
              setRecordings(data.data[0].medicalHistories)
    }).catch(() => {
       alert("An error occured while loading the data")
    })
  }

  const startRecording = () => {
    // axios.post(`https://api.bearlytech.com/api/setShoeState`, {
    //   state: "1",
    //   recording_id: shortid.generate(),
    //   shoe_id: query.shoeId,
    //   id: query.medicalHistoryId

    // }).then((data) => {
    //   setRecording(data.data) 
    //   // console.log(data.data);  
    // }).catch((err) => {
    //   alert("Something went wrong while starting recording") 
    // })


    if(client){
      const recording_id = shortid.generate()
      client.publish(`status/${query.shoeId}`, JSON.stringify({state: "1", recording_id: recording_id}));
      instance.post(`/api/setShoeState`, {
        recording_id: recording_id,
        shoe_id: query.shoeId,
        id: query.medicalHistoryId
      },{
        headers: {
            'authToken': user.accessToken
        }
    }).then((data) => {        setRecording(data.data)
      })
      .catch((err) => {
        alert("Something went wrong while starting recording")
      })
    }else{
      connectMqtt()
      alert("An error occured, Please try again")
    }

    
  }

  const stopRecording = () => {
    // axios.post(`https://api.bearlytech.com/api/setShoeState`, {
    //   state: "2",
    //   shoe_id: query.shoeId,
     
    // }).then((data) => {
    //   getPatientDetails()
      
    // }).catch((err) => {
    //   alert("Something went wrong while stopping recording")
    // })
    if(client){
      client.publish(`status/${query.shoeId}`, JSON.stringify({state: "2"}));
      instance.post(`/api/setShoeState`, {
        shoe_id: query.shoeId,
        id: query.medicalHistoryId
      },{
        headers: {
            'authToken': user.accessToken
        }
    }).then((data) => {
              getPatientDetails()
      }).catch((err) => { 
        alert("Something went wrong while stopping recording")
      })
    }else{
      connectMqtt()
      alert("An error occured, Please try again")
    }
  }
  const shoeOnlineStatus =() => {
    setleftShoeOnline(false);
    setRightShoeOnline(false);
              if(client){
                    client.publish(`${query.shoeId}/left/online`, JSON.stringify({state: "0"}));
                    client.subscribe(`${query.shoeId}/left/online`);
                    client.publish(`${query.shoeId}/right/online`, JSON.stringify({state: "0"}));
                    client.subscribe(`${query.shoeId}/right/online`);
                    client.on('message', (topic, message) => {

                      var receivedData = JSON.parse(message.toString()); // Assuming the data is in plain text format.
                      // console.log('Received data:', receivedData);
                      if(receivedData.status == "1"){
                        if(topic==`${query.shoeId}/left/online`)
                          {
                        setleftShoeOnline(true)}
                        else if(topic==`${query.shoeId}/right/online`)
                        {
                          // console.log(topic,receivedData.status)
                          setRightShoeOnline(true)
                        }
                        client.unsubscribe(topic);

                      }
                                  });
                                }
              else{
                connectMqtt()
              }
             

  }
  const connectMqtt = () => {
    const clientId = "emqx_react_" + Math.random().toString(16).substring(2, 8);
    const username = "dasarathg68";
    const password = "bearly@emqx";
    const port = 443;
    const client = mqtt.connect('wss://mqtt.bearlytech.com',{
    username,
    password,
    path: '/mqtt',
    port,
  
    // protocol: 'mqtt', // Explicitly set the protocol
    // rejectUnauthorized: true, // Reject self-signed certificates
  });
    setClient(client)
  }
      // console.log(client)

  useEffect(() => {
    getPatientDetails()
    connectMqtt()
  }, [])


  useEffect(() => {
    
    if(client){
      client.on('connect', () => {
        client.subscribe(`status/${query.shoeId}`);
        // console.log("Connected")
     
      });
    }

    return () => {     
      if(client){
        client.end();
      }

    };
  }, [client]);
       
  return (
    <><div>
      <Head>
        <title>
          paceB | Live Graph
        </title>

      </Head>
    </div><div>
        
        {/* <div style={{ width: "100vw", display: 'flex', justifyContent: 'center', gap: 60, marginTop: 60 }}>
          <Button onClick={() => shoeOnlineStatus()}>Check Shoe Status</Button>
          <p>
        Left Shoe:{leftShoeOnline?"online":"offline"}
        </p>
        
        <p>
        Right Shoe:{rightShoeOnline?"online":"offline"}
        </p>
        </div> */}
        <div style={{ width: "100vw", display: 'flex', justifyContent: 'center', gap: 60, marginTop:30 }}>
          <Button variant={shoeSide === "left" ? 'danger' : 'primary'} onClick={() => {
            setShoeSide('left'); 
          }
        }>Left</Button>
        
        
          <Button variant={shoeSide === "right" ? 'danger' : 'primary'} onClick={() => setShoeSide('right')}>Right</Button>
          
        </div>
        <div style={{ width: "100vw", display: 'flex', justifyContent: 'center', gap: 70, marginTop:5}}>
        <p>
        {leftShoeOnline?"Online":"Offline"}
        </p>
        <p>
        {rightShoeOnline?"Online":"Offline"}
        </p>
        </div>
        <div style={{ width: "100vw", display: 'flex', justifyContent: 'center', gap: 60, marginTop: 10 }}>
          <Button onClick={() => { 
            shoeOnlineStatus()
          }
        }>Refresh Status</Button>
        </div>
        {shoeSide === 'left' ?
          <RealtimeChartLeft shoeId={query.shoeId} /> : <RealtimeChartRight shoeId={query.shoeId} />}


        <div style={{ width: "100%", display: 'flex', gap: 30, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
          {recording ?
            <Button variant={'secondary'} size='lg' onClick={() => { 
              
              setRecording(false); stopRecording(); 
              window.location.reload(false);
              
              } }>
              Stop recording
            </Button>
            :
            <Button variant={'danger'} size='lg' onClick={() => { 
              if (leftShoeOnline && rightShoeOnline){
           const isConfirmed = window.confirm(`Are you sure you want to START recording?`);
                if (isConfirmed) {
              setRecording(true); startRecording();
                }
              }
              else{
                alert("Shoe(s) are offline. Please check the status");
              }
              //  setRecording(true); startRecording();
              // mqttClient.end
              } }>
              Start recording
            </Button>}
        </div>

        <div style={{ width: "100vw", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
          <h1 style={{ textAlign: 'center', marginTop: 40 }}>Recording</h1>

          <div style={{ width: "100vw", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {recordings.length == 0 ? <p style={{ textAlign: 'center', marginTop: 40 }}>No recordings</p> :
              recordings.map((recording, index) => (
                recording.recording_id != null && recording.id == query.medicalHistoryId ?
                  <div onClick={() => router.push(`/gaitAnalysis?recordingId=${recording.recording_id}&patientid=${query.patientId}`)}>
                    <MedConditionCard isLatest={true} isGait date={recording.createdAt} sym={`Latest Recording`} />
                  </div>
                  : null
              ))}
          </div>

        </div>
      </div></>
    
  )
}

export default visualize