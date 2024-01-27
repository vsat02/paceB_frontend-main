import React from 'react'
import styles from '../styles/patientCard.module.css'
import Dropdown from 'react-bootstrap/Dropdown';

import { useRouter } from 'next/router'
import instance from '../config/configkey';

function patientCard({name, id, sex, token,ehr_patient_id}) {
  const limitedName = name.length > 20 ? name.substring(0, 18) + '...' : name;

  const handleDeletePatientRecords =() =>{

    const isConfirmed = window.confirm(`Are you sure you want to DELETE ${name}'s records?`);
    if (isConfirmed) {

    instance.delete(`/api/patients/${id}`,{
      headers: {
          'authToken': token
      }}
    ).then(()=>{
      alert(`Successfully deleted ${name}'s records`)
      window.location.reload(false);

    }).catch((err)=>{
      alert(`Unable to delete ${name}'s records`)
    })
  }
  }
  
  
  const router = useRouter()
  return (
    <div className={styles.patientCard}>
        <div className={styles.nameDet}>
            <h5 className={styles.name} onClick={() => router.push(`/medicalHistory?patientid=${id}`)}>{limitedName}</h5>
                  <Dropdown style={{paddingRight:"10px"}}>
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={handleDeletePatientRecords} >Delete Patient</Dropdown.Item>
            
            </Dropdown.Menu>
          </Dropdown>
           

        </div>
        <p className={styles.id} onClick={() => router.push(`/medicalHistory?patientid=${id}`)}>Patient ID: {ehr_patient_id}</p>
        <p className={styles.id} onClick={() => router.push(`/medicalHistory?patientid=${id}`)}>Gait ID: {id}</p>

       <div style={{paddingLeft:"20px",paddingBottom:"0px"}}>   
 
    <h6 onClick={() => router.push(`/medicalHistory?patientid=${id}`)} className={styles.gender}>{sex}</h6>

        </div>
        <p className={styles.details} onClick={() => router.push(`/medicalHistory?patientid=${id}`)}>Get Details</p>

    </div>
  )
  }

export default patientCard