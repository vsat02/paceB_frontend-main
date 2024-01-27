import React, {useState, useEffect} from 'react'
import AllotShoeCard from '../components/AllotShoeCard'
import styles from '../styles/allotShoe.module.css'
import styles1 from '../styles/patientDashboard.module.css'
import { useAuth } from '../context/AuthContext'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Stack from 'react-bootstrap/Stack';
import Spinner from 'react-bootstrap/Spinner';
import { useRouter } from 'next/router'
import Head from 'next/head'

import instance from '../config/configkey'
function allotShoe() {
  const { user, login } = useAuth()
  const { query } = useRouter();

  const [loading, setLoading] = useState(false)
  const [bLoading, setBloading] = useState(false)
  const [shoes, setShoes] = useState([])

   // Modal supporting code
   const [show, setShow] = useState(false);
   const handleClose = () => setShow(false);
   const handleShow = () => setShow(true);

  const [shoeName, setShoeName] = useState('Shoe-1')
  const [shoeModel, setShoeModel] = useState('Version-1')

  const addShoe = () => {
    setBloading(true)
    if(shoeName != '' && shoeModel != '') {
    instance.post("/api/shoeRegistry/associate", {
      device_id: shoeName,
      doctor_id: user.uid,
    },{
      headers: {
          'authToken': user.accessToken
      }
  }).then((data) => {     
      setBloading(false)
      getShoes()
      handleClose()
    }).catch((err)=> {
      alert(err)
      setBloading(false)
    })
    }
  }

  // useEffect(() => {
  //   if (!user.isAdmin) {
  //     router.push('/patientDashboard')
  //   }
  //   getShoes()
  // }, [])
  const getShoes = () => {
    instance.get(`/api/shoeRegistry/${user.uid}`,{
      headers: {
          'authToken': user.accessToken
      }
  }).then((data) => {     
      setShoes(data.data)
    }).catch((err) => {
      alert(err)
    })
  }

  useEffect(() => {
    getShoes()
  }, [])
  return (
    <><div><Head>
      <title>paceB | Select Shoe</title>
    </Head>
    </div>
    <div className={styles.backWrap}>
        <div className={styles.background}>
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-around', gap: "54%" }}>
            <div className={styles.head}><h4>Select Shoe</h4></div>
            <Button variant="primary" onClick={handleShow}>Add shoe</Button>
          </div>
          <div className={styles.AllotShoeCard}>
            {shoes.length > 0 ?
              shoes && shoes.map((shoe) => (
                <AllotShoeCard name={shoe.device_id} id={shoe.id} shoeId={shoe.device_id} isList={query.isList === true ? true : false}></AllotShoeCard>
              ))
              :
              <h2>No shoes added</h2>}

          </div>
        </div>
        <Modal size='lg' show={show} onHide={handleClose} centered>

          <Modal.Header closeButton>
            <Modal.Title className='text-align-center'>Add Shoe</Modal.Title>
          </Modal.Header>

          <Modal.Body>

            <Stack gap={4}>

              <input onChange={(e) => setShoeName(e.target.value)} name='name' className={styles1.input} maxLength="30" pattern="[A-Za-z]" type="text" placeholder="Enter shoe ID" />

              {/* <input onChange={(e) => setShoeModel(e.target.value)}  name='model' maxLength={6} className={styles1.input} type="textx" placeholder="Enter model"/> */}

            </Stack>

          </Modal.Body>

          <Modal.Footer>
            <Button variant='outline-danger' onClick={handleClose}>Cancel</Button>
            <Button variant='primary' onClick={addShoe} disabled={bLoading}>
              {bLoading ?
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
      </div></>
  )
}

export default allotShoe