import React, {useState, useEffect} from 'react'
import styles from '../styles/patientDashboard.module.css'

import PatientCard from '../components/patientCard'
import Modal from 'react-bootstrap/Modal';

import Spinner from 'react-bootstrap/Spinner';
import Button from 'react-bootstrap/Button';
import { useRouter } from 'next/router'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import { useAuth } from '../context/AuthContext'
// New addition to check authtoken
import { FaSearch } from "react-icons/fa";

import Head from 'next/head'
import instance from '../config/configkey'
import { IoIosArrowBack } from "react-icons/io";
import { reload } from 'firebase/auth';

import axios from 'axios';
// import Razorpay from 'razorpay';

function patientDashboard() {
    function getDateOnly(dateString) {
        if(dateString==undefined||dateString==null||dateString==""){
            return "Expired";
        }
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${day < 10 ? '0' : ''}${day}-${month < 10 ? '0' : ''}${month}-${year}`;
    
      }
  const router = useRouter()

  const { user, login } = useAuth()


  const today = new Date();

  // Modal supporting code
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [quantityLeft, setQuantityLeft] = useState(0);

  const [showP, setShowP] = useState(false);
  const handleCloseP = () => setShowP(false);
  const handleShowP = () => setShowP(true);


  const subscriptionPriceMonth = 5000;
  const [subscription, setSubscription] = useState(false);
  const [subscriptionMonths, setSubscriptionMonths] = useState(0);
  const [subscriptionPrice, setSubscriptionPrice] = useState(subscriptionMonths*subscriptionPriceMonth);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState();
  
    const [validTill, setValidTill] = useState();

    
  // Date input

  const [date, setDate] = useState();

  const stage = 0 // Deployment stage, Change it to 1 for dev stage
  
  //Loading state
  const [loading, setLoading] = useState(false)

  // Data loading state
  const [dloading, setDLoading] = useState(false)

  // Patient data
  const [name, setName] = useState()
//   const [dob, setDob] = useState()
  const [age, setAge] = useState()
  const [height,setHeight]=useState()
  const [weight,setWeight]=useState()
  const [region, setRegion] = useState()
  const [sex, setSex] = useState('M')
  const [shoeSize,setShoeSize]=useState()
  const [ehr_patient_id,setEhr_patient_id]=useState()

  const [search, setSearch] = useState("")    

  const analysisPrice = 120;
  // Full patient record state
  const [patientRecords, setPatientRecords] = useState([]);
  const [quantityP, setQuantityP] = useState(0);
  const [price, setPrice] = useState(quantityP*analysisPrice);
  const initPayment = (data) => {
    // console.log("subs",subscriptionMonths);
    let tempvar =0; //dont use state variable here, it will does not update properly
    console.log("data",data)
    let amount = data.amount
    if(subscription==true){
        tempvar=1;
    }
    else if(subscription==false){
        tempvar=0;
    }
    const options = {
        key: "rzp_test_HgSriqBKc4r06v",
        amount: data.amount,
        currency: data.currency,
        name: "PaceB by bEarly",
        description: "Test Transaction",
        image: "https://bearlytech.com/navlogo.png",
        order_id: data.id,
        handler: async (response) => {
            try {
                const { data } = await instance.post("/api/payment/verify", 
                response, 
                {
                  headers: {
                    'authToken': user.accessToken,
                    'doctor_id': user.uid,
                    'quantity': quantityP,
                    'subscription': tempvar,
                    'subscriptionMonths':subscriptionMonths,
                    'amount': amount
                  }
                }
              );
                alert("Payment Successfull!");
                window.location.reload(false);
            } catch (error) {
                console.log(error);
            }
        },
        theme: {
            color: "#3399cc",
        },
    };
    const rzp1 = new window.Razorpay(options);
    // console.log("haha",rzp1);
    rzp1.open();
};
  const handlePayment = async () => {
    try {
        let tempvar =0;
    if(subscription==true){
        tempvar=1;
    }
    else if(subscription==false){
        tempvar=0;
    }
        const { data } = await instance.post("/api/payment/orders", 
        { quantity: quantityP },
        {
            headers: {
                'authToken': user.accessToken,
                    'doctor_id': user.uid,
                    'quantity': quantityP,
                    'subscription': tempvar,
                    'subscriptionMonths':subscriptionMonths

            }}
        );
        initPayment(data.data);
    } catch (error) {
        console.log(error);
    }
};
    const changePayScheme = () => {
        const isConfirmed= window.confirm("Are you sure you want to switch Payment Scheme?")
        if(isConfirmed){
            let tempvar =0;
            if(subscription==true){
                tempvar=1;
            }
            else if(subscription==false){
                tempvar=0;
            }
            // console.log("tempvar",tempvar);
            // console.log("usercheck",user);
            instance.put('/api/doctors/changePayScheme', null, {
                headers: {
                  'authtoken': user.accessToken,
                  'doctor_id': user.uid,
                  'subscription': tempvar
                }
              }).then((data) => {
                setSubscriptionExpiry(data.data.subs_expiry);
                setSubscription(!subscription);
                setQuantityLeft(data.data.noAnalysis);
                setValidTill(getDateOnly(data.data.subs_expiry));
                window.location.reload(false);
              })
                .catch(error => {
                  // Handle errors here
                  console.error('Error:', error);
                });
                setSubscription(!subscription);
        }
        
    }
  const searchButtonListener = () => {
    let results = [];
    if (search === ""||search===undefined||search.length===1) {
        // console.log("hi")
        getPatients();
        return;
    }
    let searchLower = search.toLowerCase();

    // console.log(patientRecords)
    for (let record of patientRecords) {
        // console.log(record.id === search)
        let nameLower = `${record.patient_name}`;
        nameLower = nameLower.toLowerCase();
        // console.log(nameLower)
        let patientidsearch = record.ehr_patient_id+'';
        if (patientidsearch.includes(search) || nameLower === (searchLower) || nameLower.includes(searchLower)) {
            results.push(record);
        }
    }
    setPatientRecords(results)
    // console.log(results)
}
  // Fetch patients
  const getPatients = async () => {
    console.log(user);
  
   await instance.get(`/api/doctors/noanalysis`,{
            
        headers: {
            'authToken': user.accessToken,
            'doctor_id': user.uid,
            "doctor_email": user.email
        }
    }
).then((data) => {
    console.log("data",data.data);
    setQuantityLeft(data.data.noAnalysis);
    setSubscription(data.data.subscription);
    setSubscriptionExpiry(data.data.subs_expiry);
    // console.log(data.data.subs_expiry)

    if(subscriptionExpiry!=undefined||subscriptionExpiry!=null){
        const newExpiryDate = new Date(subscriptionExpiry);
        newExpiryDate.setMonth(newExpiryDate.getMonth() + parseInt(subscriptionMonths));
        // console.log(newExpiryDate)
        setValidTill(getDateOnly(newExpiryDate));
        }
        else{
            const timeElapsed = Date.now();
            const newExpiryDate = new Date(timeElapsed);
            // console.log("newExpiryDate",newExpiryDate)
            newExpiryDate.setMonth(newExpiryDate.getMonth() + parseInt(data));
            setValidTill(getDateOnly(newExpiryDate));
        }
}).catch((err) => {
    console.log(err);
}
)
    if(user.isAdmin){
        
        instance.get(`/api/patients/`,{
            headers: {
                'authToken': user.accessToken
            }
        }).then((data) => {      
            // console.log(data.data) 
            setPatientRecords(data.data)
            setLoading(false)
        }).catch(() => {
            alert("Cannot connect to services")
            setLoading(false)
            });
            return;
    }
    instance.get(`/api/patients/${user.uid}`,{
        headers: {
            'authToken': user.accessToken
        }
    }).then((data) => {       
        setPatientRecords(data.data)
        setLoading(false)
    }).catch(() => {
        alert("Cannot connect to services")
        setLoading(false)
        });
      setLoading(true)
    
  }



function calculateAge (birthDate, otherDate) {
    birthDate = new Date(birthDate);
    otherDate = new Date(otherDate);

    var years = (otherDate.getFullYear() - birthDate.getFullYear());

    if (otherDate.getMonth() < birthDate.getMonth() || 
        otherDate.getMonth() == birthDate.getMonth() && otherDate.getDate() < birthDate.getDate()) {
        years--;
    }

    return years;
}

  const handleChange = (e, isDate=false) => {  
    var data;
    if(isDate){
        data = e
        // setDob(data)
        setAge(calculateAge(data, today))
        
    }else{
        data = e.target.value
    }
    if(!isDate){
    switch(e.target.name){
        case 'name':
            setName(data)
            break;
         
        case 'age':
            setAge(data)
            break;
            
        case 'sex':
            setSex(data)
            break;

        case 'region':
            setRegion(data)
            break;
        case 'height':
            setHeight(data)
            break;
        case 'weight':
            setWeight(data)
            break;
        case 'shoesize':
            setShoeSize(data)
            break;
        case 'search':
            setSearch(data);
            searchButtonListener();
            break;
        case 'ehr_patient_id':
            setEhr_patient_id(data)
            break;
        case 'quantityp':
            setQuantityP(data);
            setPrice(data*analysisPrice);
            break;
        
        case 'months':
            setSubscriptionMonths(data);
            setSubscriptionPrice(data*subscriptionPriceMonth);
            // console.log("check",subscriptionExpiry)
            if(subscriptionExpiry!=undefined||subscriptionExpiry!=null){
            const newExpiryDate = new Date(subscriptionExpiry);
            newExpiryDate.setMonth(newExpiryDate.getMonth() + parseInt(data));
            // console.log(newExpiryDate)
            setValidTill(getDateOnly(newExpiryDate));
            }
            else{
                const timeElapsed = Date.now();
                const newExpiryDate = new Date(timeElapsed);
                // console.log("newExpiryDate",newExpiryDate)
                newExpiryDate.setMonth(newExpiryDate.getMonth() + parseInt(data));
                setValidTill(getDateOnly(newExpiryDate));
            }
            
            break;
      
        default:
            return;    
    }
}
  }

  const createPatient = () => {
    setDLoading(true)
    // var dateOfB = convertDate(dob)

    if(name != undefined && age != undefined && sex != undefined && region != undefined){
        const data = {
            name,
            age, 
            sex,
            region,
            // dob : dateOfB
        };
       
        var BMI = (weight/(height*height))*10000;
        instance.post(`/api/patients`, {
            doctor_id: user.uid,
            patient_name: name,
            sex: sex,
            // dob: dob,
            region: region,
            age: age,
            height: height,
            weight: weight,
            BMI:BMI,
            shoesize:shoeSize,
            ehr_patient_id:ehr_patient_id
        },{
            headers: {
                'authToken': user.accessToken
            }}
        ).then(() => {
            setDLoading(false)
            getPatients()
            setShow(false)
        }).catch((err) => {
            alert("Failed to upload data")
        })
    }else{
        alert('Fields should not be empty')
        setDLoading(false)
    }
  }

  useEffect(()=>{
    
    getPatients()
    // New addition to check authtoken
    
  },[])

  return (
    
      <><div><Head>
                <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

          <title>
              paceB | Patient Dashboard
          </title>
      </Head>
      </div>

      <div className={styles.backDiv}>

              <div className={styles.background}>

                  <div className={styles.dashboardNav}>
                      {/* <Image
        className={styles.back}
        src={back}
        alt="Back"
    /> */}

                      <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {user.isAdmin ?
                          <h4 className={styles.heading}>Admin Dashboard</h4>
                          :
                          <h4 className={styles.heading}> Dashboard</h4>}
                      </div>

                  </div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <button className={styles.payment} onClick={handleShowP}> Purchase </button>
                  <button className={styles.addPatient} onClick={handleShow}>Add Subject </button>
                  </div>

                  <div style ={{height:10}}></div>
               
 
                  <div className={styles.searchcard}>

                  <IoIosArrowBack size={25} onClick={getPatients}/>
                  <div style ={{width:20}}></div>
        <input name="search" onChange={(e)=>handleChange(e)}className={styles.search} type="text" placeholder="Search Patient based on ID or name" />
        <div style ={{width:20}}></div>
        <FaSearch size={25}onClick={searchButtonListener} />
                      </div>
                      <Modal size='sm' show={showP} onHide={handleCloseP} centered>

<Modal.Header closeButton>
    <Button variant='outline-info' onClick={changePayScheme}>
        {/* {!subscription ? "Switch to Subscription" : "Buy Analyses"} */}
        Switch Payment Scheme
        </Button>
</Modal.Header>

<Modal.Body closeButton>
{!subscription ? (
  <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
    <div className={styles.container}>
      {/* <img alt="book_img" className={styles.img} /> */}
      <p className={styles.purchase_header}>Purchase analyses</p>
      <div className={styles.purchase_analysis}>Remaining analyses: {quantityLeft}</div>

      <div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className={styles.purchase_analysis}>Buy: &nbsp;</div>

          <input
            name='quantityp'
            min="0"
            onInput={(e) => e.target.validity.valid || (e.target.value = '')}
            onChange={(e) => handleChange(e)}
            className={styles.inputNumber}
            size="4"
            type="number"
            defaultValue="10"
          />
        </div>
      </div>
      <p className={styles.purchase_price}>
        Price : <span>&#x20B9; {price} </span>
      </p>
      <button onClick={handlePayment} className={styles.buy_btn}>
        buy now
      </button>
    </div>
  </div>
) : (
    <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
    <div className={styles.container}>
      {/* <img alt="book_img" className={styles.img} /> */}
      <p className={styles.purchase_header}>Purchase Subscription </p>
      <div className={styles.purchase_analysis}>Expiring On: {getDateOnly(subscriptionExpiry)}</div>

      <div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className={styles.purchase_analysis}>Buy (months): &nbsp;</div>

          <input
            name='months'
            min="0"
            onInput={(e) => e.target.validity.valid || (e.target.value = '')}
            onChange={(e) => handleChange(e)}
            className={styles.inputNumber}
            size="3"
            type="number"
            defaultValue={subscriptionMonths}
          />
        </div>
      </div>
      <div className={styles.purchase_analysis}>Valid till: {validTill}</div>

      <p className={styles.purchase_price}>
        Price : <span>&#x20B9; {subscriptionPrice} </span>
      </p>
      <button onClick={handlePayment} className={styles.buy_btn}>
        buy now
      </button>
    </div>
  </div>
)}

</Modal.Body>



</Modal>


                  <Modal size='lg' show={show} onHide={handleClose} centered>

                      <Modal.Header closeButton>
                          <Modal.Title className='text-align-center'>Add New Subject</Modal.Title>
                      </Modal.Header>

                      <Modal.Body>

                          <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>

                              <input onChange={(e) => handleChange(e)} name='name' className={styles.input} maxLength="30" pattern="[A-Za-z]" type="text" placeholder="Enter the Subject Name" />
                              <input onChange={(e)=> handleChange(e)} name='ehr_patient_id' className={styles.input}  placeholder="Enter Patient ID"/>
                             

                              <input onChange={(e) => handleChange(e)} name='age' value={age} className={styles.input} type="text" placeholder="Enter Age " />
                              <input onChange={(e) => handleChange(e)} name='region'  className={styles.input} type="textx" placeholder="Enter Patient Region " />
                              <input onChange={(e) => handleChange(e)} name='height' className={styles.input} type="height" placeholder="Enter Height" />
                              <input onChange={(e) => handleChange(e)} name='weight' className={styles.input} type="weight" placeholder="Enter Weight" />
                              <input onChange={(e) => handleChange(e)} name='shoesize' className={styles.input} type="shoesize" placeholder="Enter Shoe Size (cm)" />
                              <select onChange={(e) => handleChange(e)} placeholder="Gender" defaultValue="" name='sex' className={styles.input}>
                                  <option value="M">Male</option>
                                  <option value="F">Female</option>
                                  <option value="T">Transgender</option>
                                  <option value="O">Other</option>
                              </select>

                          </div>

                      </Modal.Body>

                      <Modal.Footer>
                          <Button variant='outline-danger' onClick={handleClose}>Cancel</Button>
                          <Button variant='primary' onClick={createPatient} disabled={dloading}>
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
                
                  <div className={styles.patientCardsDiv}>
                      {!loading ?

                          patientRecords.length != 0 ? patientRecords && patientRecords.map((patient) => (
                            //   <div onClick={() => router.push(`/medicalHistory?patientid=${patient.id}`)}>
                            <div>
                                  <PatientCard name={patient.patient_name} id={patient.id} ehr_patient_id={patient.ehr_patient_id} sex={patient.sex} token={user.accessToken}/>
                              </div>
                          ))
                              :
                              <div>
                                  <p>
                                      No patient records found
                                  </p>
                              </div>
                          :
                          <Spinner animation="grow" />}
                  </div>

              </div>

          </div>
          </>
  )
}

export default patientDashboard