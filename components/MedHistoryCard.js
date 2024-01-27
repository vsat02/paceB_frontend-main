import React ,{useState} from 'react'
import Image from 'next/image'
import arrow from '../public/arrow.png'
import styles from '../styles/medHistoryCard.module.css'
import Dropdown from 'react-bootstrap/Dropdown';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/router'
import instance from '../config/configkey';
import { GrNotes } from "react-icons/gr";
import { RiDeleteBin6Line } from "react-icons/ri";





function MedHistoryCard({sym, date, time, isGait, recording_id,patientId,medHisId,token,notes}) {
const router = useRouter()
const [show, setShow] = useState(false);
// console.log(notes)
const [EditAna, setEditAna] = useState(sym)
const [EditNotes, setEditNotes] = useState(notes)

const handleOpen = () => setShow(true);
const handleClose = () => setShow(false);
const [showEdit, setShowEdit] = useState(false);
// console.log(notes)

const handleOpenEdit = () => {setShow(false) ;
  setShowEdit(true)};
const handleCloseEdit = () => setShowEdit(false);

const handleChange = (e) => {
  var data = e.target.value
  switch(e.target.name){
      case 'analysis':
          setEditAna(data)
          break;
       
      case 'notes':
          setEditNotes(data)
          break;
     
      default:
          return;    
  }
}

const handleEditButtonClick = () => {
  const medHistoryId=medHisId;
  const analysis=EditAna;
  const doctorNotes=EditNotes;
  instance.put(`/api/medicalHistory/`,{
    condition:analysis,
    notes:doctorNotes,
    id:medHistoryId
  },{
    headers: {
        'authToken': token
    }}
  ).then(()=>{
    alert(`Successfully edited ${sym} analysis`)
    window.location.reload(false);

  }).catch((err)=>{
    alert(`Unable to edit ${sym} analysis`)
  })

}
const handleDeleteAnalysis =() =>{
  const isConfirmed = window.confirm(`Are you sure you want to DELETE the analysis ${sym} ?`);
  if (isConfirmed) {
  const medHistoryId=medHisId;

  instance.delete(`/api/medicalHistory/${medHistoryId}`,{
    headers: {
        'authToken': token
    }}
  ).then(()=>{
    alert(`Successfully deleted ${sym} analysis`)
    window.location.reload(false);

  }).catch((err)=>{
    alert(`Unable to delete ${sym} analysis`)
  })
}
}

  return (
    <div className={styles.medConditionCard} style={{marginTop: 40}}>

        
        {
            isGait ? (
              <>
              {/* <p className={styles.disease}>{sym}</p> */}
              <p className={styles.date}>{date}</p>
              <p className={styles.time}>{time}</p>
              <div style={{ width: '40%' }}>

            <Button variant='outline-secondary' onClick={() => router.push(`/gaitAnalysis?recordingId=${recording_id}&patientid=${patientId}`)} style={{ width: '75%' }}>

              Gait analysis
            </Button>

      
          </div></>
            )          
            :          
            (
              <>
              <p className={styles.date} onClick={() => router.push(`/allotShoe?patientId=${patientId}&medicalHistoryId=${medHisId}`)} >{date}</p>
              <p className={styles.time}onClick={() => router.push(`/allotShoe?patientId=${patientId}&medicalHistoryId=${medHisId}`)} >{time}</p>
              <Image className={styles.arrow} onClick={() => router.push(`/allotShoe?patientId=${patientId}&medicalHistoryId=${medHisId}`)} src={arrow} alt="Arrow" />
              </>
            )
        }
            <GrNotes className={styles.grnotes} onClick={handleOpen} />

      <Modal size='lg' 
      show={show} onHide={handleClose} centered>
              <Modal.Header closeButton>
                <Modal.Title className='text-align-center'>Analysis Description</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <p>Condition : {sym} </p> 
                <p>Doctor's Notes : {notes}</p>
              </Modal.Body>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between', paddingBottom:'6px', paddingLeft:'6px', paddingRight:'6px'}}>
              
            <Button variant='outline-danger' onClick={handleDeleteAnalysis}>
              Delete Analysis
            </Button>
            
            <Button variant='outline-info' onClick={handleOpenEdit}>
              Edit Analysis
            </Button>
            <Button variant='outline-success' onClick={() => router.push(`/allotShoe?patientId=${patientId}&medicalHistoryId=${medHisId}`)}>
              Reanalyze
            </Button>
            </div>
            </Modal>

            <Modal size='lg' show={showEdit} onHide={handleCloseEdit} centered>

            <Modal.Header closeButton>
                <Modal.Title className='text-align-center'>Edit Analysis</Modal.Title>
              </Modal.Header>
          <Modal.Body>
            <div style={{ display: 'flex', justifyContent: 'center', flexDirection:'column', alignItems:'center', gap: 20 }}>

              <input onChange={(e) => handleChange(e)} className={styles.input} name='analysis'  type="text" defaultValue={sym}/>
              <textarea onChange={(e) => handleChange(e)} className={styles.input} defaultValue={notes} name='notes' type="text"/>
            </div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center', paddingTop:'10px',paddingBottom:'6px', paddingLeft:'6px', paddingRight:'6px'}}>
            <Button variant='info' onClick={handleEditButtonClick} >
              Save
              </Button>
              </div>
          </Modal.Body>
          </Modal>
  
       
    </div>
  )
}

export default MedHistoryCard