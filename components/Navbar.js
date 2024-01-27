import React, {useState} from 'react'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/router'
import Image from 'next/image';
import logo from '../public/bearlyLogo.png'
// import {Button} from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import styles from '../styles/NavBarProfile.module.css';
import { FaRegUserCircle } from "react-icons/fa";
import instance from '../config/configkey'
import Button from 'react-bootstrap/Button';
import axios from 'axios';



const NavbarComp = () => {
  const [quantityLeft, setQuantityLeft] = useState(0)
  const [subscribed, setSubscribed] = useState(false)
  const [subsExpiry, setSubsExpiry] = useState('')

  const [showStatus, setShowStatus] = useState(false);

  function getDateOnly(dateString) {
    if(dateString==undefined||dateString==null||dateString==""){
      return "";
  }
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${day < 10 ? '0' : ''}${day}-${month < 10 ? '0' : ''}${month}-${year}`;
  }
  const downloadInvoice = (payment_id) => {
    console.log("user",user)
    axios.post("https://api.bearlytech.com/gait/invoice/",{
      "doctor_id" : user.uid,
      "payment_id" : payment_id,
    }, {
      responseType: 'blob',
      headers: {
        'authToken': user.accessToken
      }
    }).then((data) => {
      const url = window.URL.createObjectURL(new Blob([data.data]));
      const link = document.createElement('a');
      // console.log(data)
      link.href = url
      const dlink = 'Invoice'+'.pdf'
      link.setAttribute('download', dlink)

      document.body.appendChild(link)
      link.click()
    }).catch((err) => alert(err))
}
  const { user, logout } = useAuth()
  const router = useRouter()
  const [doctorName, setDoctorName] = useState('')
  const [doctorEmail, setDoctorEmail] = useState('')
  const [institutionAddress, setInstitutionAddress] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  if(user){
    // setShowStatus(true);
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
setShowStatus(true);
}).catch((err) => {
console.log(err);
}
)}
  const [showProfile, setShowProfile] = useState(false);
  const handleProfileClose = () => setShowProfile(false);
  const handleProfileOpen = () => setShowProfile(true);

  const [showTransaction, setShowTransaction] = useState(false);
  const handleTransactionClose = () => setShowTransaction(false);
  const handleTransactionOpen = () => setShowTransaction(true);

  const [transactionData, setTransactionData] = useState([])

  const [editProfileState, setEditProfileState] = useState(false);
  const getAllTransactions = async () => {
    await instance.get('/api/payment/getAllTransactions',
    {
     headers:{
       'authToken': user.accessToken,
       'doctor_id': user.uid
     }
    }
    ).then((res) => {
        setTransactionData(res.data.data)
     }).catch((err) => {
       console.log(err)
     })
  }
  const handleChange = (e) => {  
    switch(e.target.name){
      case 'doctorName':
        setDoctorName(e.target.value)
        break;
      case 'doctorEmail':
        setDoctorEmail(e.target.value)
        break;
      case 'institutionAddress':
        setInstitutionAddress(e.target.value)
        break;
      case 'gstNumber':
        setGstNumber(e.target.value)
        break;
    }
  }

  const getDoctorProfile = async () => {
   await instance.get('/api/doctors/getDocProfile',
   {
    headers:{
      'authToken': user.accessToken,
      'doctor_id': user.uid
    }
   }
   ).then((res) => {
      console.log(res.data)
      setDoctorName(res.data.doctor_name)
      setDoctorEmail(res.data.doctor_email)
      setInstitutionAddress(res.data.institution_address)
      setGstNumber(res.data.gst_number)
      handleProfileOpen();
    }).catch((err) => {
      console.log(err)
    })
   
  }
  const editProfile = () => {
    // handleProfileClose();
    // router.push('/doctorProfile')

    setEditProfileState(true);
  }
  return (
    <Navbar bg="white" expand="lg" className="navborder">
      <Container className="nav">

          <Image
            className={"logo"}
            src={logo}
            alt="Shoe Image"
          />    
      
        <Navbar.Brand className="navhead" style={{'cursor' : 'pointer'}} onClick={() => router.push('/patientDashboard')}>PaceB</Navbar.Brand>
    
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">

            {user ? (
              <div>
                <Nav.Link
                  onClick={() => {
                    logout()
                    window.location.reload(false)
                    router.push('/login')
                  }}
                >
                  Logout
                </Nav.Link>
              </div>
            ) : null}


            {/* { */}
             {/* user && user.isAdmin ? ( */}
                {/* <div className='d-flex' style={{position: 'absolute', right: 160}}> */}
                   {/* {/* <button variant="primary"  onClick={() => { */}
                    {/* router.push('/allotShoe') */}
                  {/* }}>List shoes</button> */} 
                
                {/* </div> */}
              {/* ) : null } */}

          </Nav>
        </Navbar.Collapse>
              {showStatus ? (
        <><div>
            {!subscribed ? (
              <div>Remaining analyses: {quantityLeft}</div>
            ) : (
              <div>Subscription expires on {subsExpiry}</div>
            )}

          </div>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <FaRegUserCircle
              style={{ paddingRight: "0px", cursor: "pointer" }}
              size={30}
              onClick={getDoctorProfile} /></>
      ) : null}

      <Modal size='lg' show={showProfile} onHide={handleProfileClose} centered>

      <Modal.Header closeButton>
          <Modal.Title className='text-align-center'>Doctor Profile</Modal.Title>
      </Modal.Header>

      <Modal.Body closeButton>
        { !editProfileState ?
        (<><div className='row'>
                <div className='col-md-6'>
                  <h5>Doctor Name</h5>
                  <p>{doctorName}</p>
                </div>
                <div className='col-md-6'>
                  <h5>Doctor Email</h5>
                  <p>{doctorEmail}</p>
                </div>
              </div><div className='row'>
                  <div className='col-md-6'>
                    <h5>Institution Address</h5>
                    <p>{institutionAddress}</p>
                  </div>
                  <div className='col-md-6'>
                    <h5>GST Number</h5>
                    <p>{gstNumber}</p>
                  </div>
                </div></>):(<div>

                  <div className='row'>
                <div className='col-md-6'>
                  <h5>Doctor Name</h5>
                  <textarea className={styles.input} defaultValue={doctorName} name='doctorName' onChange={handleChange}></textarea>
                </div>
                <div className='col-md-6'>
                  <h5>Doctor Email</h5>
                  <p>{doctorEmail}</p>

                </div>
              </div><div className='row'>
                  <div className='col-md-6'>
                    <h5>Institution Address</h5>
                    <textarea className={styles.input} defaultValue={institutionAddress} name='institutionAddress' onChange={handleChange}></textarea>
                  </div>
                  <div className='col-md-6'>
                    <h5>GST Number</h5>
                    <textarea className={styles.input} defaultValue={gstNumber} name='gstNumber' onChange={handleChange}></textarea>
                  </div>
                </div>

                <div className='d-flex justify-content-center mx-auto'>
                <Button variant='outline-info' onClick={() => 
                  {
                    instance.put('/api/doctors/editDocProfile',
                    {
                      doctor_name: doctorName,
                      doctor_email: doctorEmail,
                      institution_address: institutionAddress,
                      gst_number: gstNumber
                    },
                    {
                      headers:{
                        'authToken': user.accessToken,
                        'doctor_id': user.uid
                      }
                    }
                    ).then((res) => {
                      console.log(res.data)
                      setEditProfileState(false)
                      handleProfileClose()
                    }).catch((err) => {
                      console.log(err)
                    })
                    setEditProfileState(false)}}>Save</Button>
                </div>
                </div>
               

                )
        }
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between', paddingBottom:'6px', paddingLeft:'6px', paddingRight:'6px'}}>
    <Button variant='outline-info' onClick={() => {
              handleProfileClose();
              getAllTransactions();
              console.log(transactionData)
        handleTransactionOpen();
            }} className='me-2'>View Transactions</Button>
    <Button variant='outline-info' onClick={editProfile}>Edit Profile</Button>
    
</div>

        </Modal.Body>
        </Modal>

      </Container>
      <Modal size='xl' show={showTransaction} onHide={handleTransactionClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className='text-align-center'>Transactions</Modal.Title>
      </Modal.Header>
      <Modal.Body >
      
      {transactionData.length > 0 ? (
  <div className="container">
    <div className="row">
      {transactionData.map((transaction, index) => (
        <div key={index} className="col-lg-4 mb-4"
        onClick={() => downloadInvoice(transaction.razorpay_payment_id)}
        style={{ cursor: 'pointer' }}

        >
          <div className="card">
            <div className="card-body">
              <h5 className="card-title"> Transaction {index + 1}</h5>
              <p className="card-text"><strong>Date:</strong> {getDateOnly(transaction.createdAt)}</p>
              {transaction.subscription ? (
                <p className="card-text"><strong>Subscription Duration:</strong> {transaction.subscriptionMonths} months</p>
              ) : (
                <p className="card-text"><strong>Analysis Bought:</strong> {transaction.analysis_purchased} units</p>
              )}
              <p className="card-text"><strong>ID:</strong> {transaction.razorpay_payment_id}</p>
              <p className="card-text"><strong>Amount:</strong> {transaction.amount}</p>
              {/* Add more card content for other properties */}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
) : (
  <div className='d-flex justify-content-center'>
    <p>No transactions found.</p>
  </div>
)}
      

        </Modal.Body>
      </Modal>
    </Navbar>
    
  )
}

export default NavbarComp