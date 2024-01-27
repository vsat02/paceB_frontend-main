import React from 'react'
import styles from '../styles/addAnalysisCard.module.css'

function AddAnalysisCard() {
  return (
    <div className={styles.addAnalysisCard}>
        <h4>Add New Analysis</h4>

        <input className={styles.input} type="text" placeholder="Enter the Subject's Condition" />
        <input className={styles.input} type="text" placeholder="Enter the Symptoms "/>

        <button className={styles.button}>ADD</button>
    </div>
  )
}

export default AddAnalysisCard