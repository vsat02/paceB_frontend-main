import React from 'react'
import Image from 'next/image'
import arrow from '../public/arrow.png'
import styles from '../styles/medConditionCard.module.css'
import {Button} from 'react-bootstrap'

function MedConditionCard({sym, date, time, isGait, isLatest, visualize, gait}) {
  return (
    <div className={isLatest ? styles.medConditionCardLatest : styles.medConditionCard} style={{marginTop: 40}}>
        <p className={styles.disease}>{sym}</p>
        <p className={styles.date}>{date}</p>
        <p className={styles.time}>{time}</p>
        {
          isGait ? 
          <div style={{width :'15%'}}>
            <Button variant='outline-secondary' onClick={gait}>Perform Gait analysis</Button> 

          </div>
          
          : 
        <Image
            className={styles.arrow}
            src={arrow}
            alt="Arrow"
        />
        }

       
    </div>
  )
}

export default MedConditionCard