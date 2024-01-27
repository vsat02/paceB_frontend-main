import React, {useState, useEffect} from 'react'
import styles from '../styles/medicalHistory.module.css'
import Image from 'next/image'
import shoe from '../public/shoe.jpg'
import MedConditionCard from '../components/MedConditionCard'
import MedHistoryCard from '../components/MedHistoryCard'
import { useRouter } from 'next/router'
import PocketBase from 'pocketbase';
import Spinner from 'react-bootstrap/Spinner';
import Modal from 'react-bootstrap/Modal';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button'
import axios from 'axios'
import back from '../public/back.png'
import { useAuth } from '../context/AuthContext'
import Head from 'next/head'
import instance from '../config/configkey'
function medicalHistory() {
  function getDateOnly(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${day < 10 ? '0' : ''}${day}-${month < 10 ? '0' : ''}${month}-${year}`;

  }

  const { query } = useRouter();
  const router = useRouter()
  const [id, setId] = useState()
  const { user, login } = useAuth()
  const[showNotes,setShowNotes]=useState(false);


  const stage = 0 // Deployment stage, Change it to 1 for dev stage

  // Modal supporting code
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

   // Data loading state
   const [dloading, setDLoading] = useState(false)

  const [loading, setLoading] = useState()
  const [patient, setPatient] = useState()

  const [meta, setMeta] = useState()

  const [ana, setAna] = useState('None')
  const [notes, setNotes] = useState('None')

  const [quantityLeft, setQuantityLeft] = useState(0)
  const [subscribed, setSubscribed] = useState(false)
  const [subsExpiry, setSubsExpiry] = useState('')
  const getTimeFromTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
  
    // Format the time as HH:MM:SS
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
    return formattedTime;
  };
  

  const getShoeDetails = () => {
    if(query.patientid === undefined)
      router.push('/patientDashboard')
    else
      setId(query.patientid)
  }



  const createAnalysis = () => {
    setDLoading(true)
   const subscriptionExpiryDate = new Date(subsExpiry);
   subscriptionExpiryDate.setDate(subscriptionExpiryDate.getDate() - 1);

const currentDate = new Date();

console.log(subscriptionExpiryDate, currentDate);
console.log(new Date(subsExpiry));

if ((quantityLeft <= 0 && !subscribed) || (subscribed && (subscriptionExpiryDate <= currentDate))) {
  alert('No more analyses left. Please subscribe to continue');
  setDLoading(false);
  router.push('/patientDashboard');
  return;
}

    // console.log(ana, notes)
    if(ana != undefined && notes != undefined){
      const data = {
        analysis : ana,
        notes : notes,
        patient : query.patientid
      }
    
      instance.post(`/api/medicalHistory/`, {
        patient_condition: ana,
        notes: notes,
        patientId: query.patientid
      },{
        headers: {
            'authToken': user.accessToken
        }
    }).then(() => {     
      if(!subscribed){
        instance.put(`/api/doctors/reduceAnalysis`, {
          doctor_id: user.uid
        },{
          headers: {
              'authToken': user.accessToken,
              'doctor_id': user.uid
          }
      }).then(() => {
        console.log("Analysis added")
      }).catch(() => {
        alert('An error occured')
      });
      }
      getPatientDetails();

        setDLoading(false)
        getPatientDetails()
        setShow(false)
      }).catch(() => {
          alert('An error occured')
          setDLoading(false)
        });
    }else{
      alert('Fields should not be empty')
      setDLoading(false)
    }

  }

  const getPatientDetails = () => {
    // console.log("helooooooo")
    console.log(user)
    setLoading(true)
    console.log(query)
    instance.get(`/api/doctors/noanalysis`,{
            
      headers: {
          'authToken': user.accessToken,
          'doctor_id': user.uid
      }
  }
).then((data) => {
  console.log("data",data.data);
  setQuantityLeft(data.data.noAnalysis);
  setSubscribed(data.data.subscription);
  setSubsExpiry(getDateOnly(data.data.subs_expiry));
}).catch((err) => {
  console.log(err);
}
)
    instance.get(`/api/medicalHistory/${query.patientid}`, {
      headers: {
        'authToken': user.accessToken,
        'doctor_id': user.uid
      }
    }).then((data) => { 
              console.log(data)
                
                setPatient(data.data[0])
          setLoading(false)
    }).catch(() => {
       alert("An error occured while loading the data")
    })
  }



  const handleChange = (e) => {
    var data = e.target.value
    switch(e.target.name){
        case 'analysis':
            setAna(data)
            break;
         
        case 'notes':
            setNotes(data)
            break;
       
        default:
            return;    
    }
  }

  useState(() => {
    // getShoeDetails()
    getPatientDetails()
  },[])


  return (
    <><div>
      <Head>
      <title>
          paceB | Medical History
        </title>
      </Head>
    </div>
    <div className={styles.backDiv}>

      {!loading ?
        <div className={styles.background}>


          <div className={styles.patientDet}>
            {/* <Image
              className={styles.back}
              src={back}
              alt="Back"
                /> */}
            <p><b>Name:</b> {patient?.patient_name}</p>
            {/* <p><b>DOB: </b> {getDateOnly(patient?.dob)}</p> */}
            <p><b>Gender:</b> {patient?.sex=="M"?"Male":"Female"}</p>
            <p><b>Age:</b> {patient?.age}</p>
            <p><b>Region:</b> {patient?.region}</p>
            <p><b>Height:</b> {patient?.height}</p>
            <p><b>Weight:</b> {patient?.weight}</p>
            <p><b>BMI:</b> {patient?.BMI}</p>
            <p><b>Shoe Size:</b> {patient?.shoesize} cm</p>



          </div>

          <hr />
          <h4 style={{display:"flex",justifyContent:"center"}}>Medical History</h4>

          <div className={styles.medicalHistory}>
          <div className={styles.purchase_analysis}>
    {/* {!subscribed ? `Remaining analyses : ${quantityLeft}` : `Subscription expires on ${subsExpiry}`} */}
</div>


            <div className={styles.medNav}>
             

              {/* <Image
                className={styles.shoeIcon}
                src={shoe}
                alt="Shoe"
                onClick={() => router.push('/allotShoe?isList=false')}
            /> */}
              <div className={styles.shoeIcon}>

              </div>
            </div>

            <div className={styles.medCond}>
              {patient && patient.medicalHistories != 0 ?
                patient.medicalHistories.map((data) => (
                data.recording_id != null ?
                <div onClick={() => {
                  setShowNotes(!show)
                }}>
                <MedHistoryCard isGait date={getDateOnly(data.createdAt)} time ={getTimeFromTimestamp(data.createdAt)} sym={data.patient_condition} medHisId={data.id} recording_id={data.recording_id} patientId={data.patientId} token={user.accessToken} notes={data.notes} />
               
                </div>
              :
                  <div>
                    <MedHistoryCard date={getDateOnly(data.createdAt)} time ={getTimeFromTimestamp(data.createdAt)} sym={data.patient_condition} medHisId={data.id} patientId={data.patientId} token={user.accessToken} notes ={data.notes} />
                  </div>

                ))
                :
                <div>No records found</div>}
            </div>

          </div>

          <Modal size='lg' show={show} onHide={handleClose} centered>

            <Modal.Header closeButton>
              <Modal.Title className='text-align-center'>Add analysis</Modal.Title>
            </Modal.Header>

            <Modal.Body>

              <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>

                <input onChange={(e) => handleChange(e)} name='analysis' className={styles.input} type="text" placeholder="Enter the Subject's condition" />
                {/* <input onChange={(e) => handleChange(e)} name='notes' className={styles.input1} type="text" placeholder="Doctor's notes" /> */}
                <textarea onChange={(e) => handleChange(e)} name='notes' className={styles.input1} type="text" placeholder="Doctor's notes (less than 250 characters) 1. First diagnosed date 2. Other Details" />
              </div>

            </Modal.Body>

            <Modal.Footer>
              <Button variant='outline-danger' onClick={handleClose}>Cancel</Button>
              <Button variant='primary' onClick={createAnalysis} disabled={dloading}>
                {dloading ?
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      style={{ 'marginRight': 10 }}
                      aria-hidden="true" />
                    <span className="visually-hidden">Loading...</span>
                  </> :
                  <>

                  </>}
                Add
              </Button>
            </Modal.Footer>

          </Modal>

          <div className={styles.btnCenter}>
            <button className={styles.button} onClick={handleShow}>Add New Analysis</button>
          </div>



        </div> : <Spinner animation="grow" />}

    </div></>
  )
}

export default medicalHistory