import React from 'react'
import styles from '../styles/addAnalysisCard.module.css'

function AddAnalysisCard() {
  return (
    <div className={styles.addPatientCard}>
        <h4>Add New Subject</h4>

        <input className={styles.input} type="text" placeholder="Enter the Subject Name" />
        {/* <input className={styles.input} type="text" placeholder="Enter DOB "/> */}
        <input className={styles.input} type="text" placeholder="Enter Age "/>
        <input className={styles.input} type="text" placeholder="Enter Region "/>
        <input className={styles.input} type="text" placeholder="Enter Gender "/>


        <button className={styles.button}>ADD</button>
    </div>
  )
}

export default AddAnalysisCard