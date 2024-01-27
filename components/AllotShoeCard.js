import React from 'react'
import styles from '../styles/AllotShoeCard.module.css'
import Image from 'next/image'
import shoe from '../public/shoe.jpg'
import { useRouter } from 'next/router'

function AllotShoeCard({name, id, isList, shoeId}) {
  const router = useRouter()
  const { query } = useRouter();
  return (
    <div className={isList ? styles.wholeWrap : styles.allotShoeWrapMain}>
    <div className={styles.allotShoeWrap}> 
        <div className={styles.shoeImgWrap}>
            <Image 
            className={styles.shoeImg}
            src={shoe}/>
        </div>
        <div className={styles.TextWrap}>
            <p><span className={styles.heading}>Shoe ID</span>: {shoeId}</p>
        </div>
        {
          !isList ?
          <div className={styles.allotBtnWrap}><button className={styles.allotBtn} onClick={() => router.push(`/visualize?patientId=${query.patientId}&medicalHistoryId=${query.medicalHistoryId}&shoeId=${shoeId}`)}>ALLOT</button></div>
          : null
        }
    </div>
    </div>
  )
}

export default AllotShoeCard
