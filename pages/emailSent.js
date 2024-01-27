import { style } from 'dom-helpers'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import { Button, Form } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/login.module.css'
import Head from 'next/head';

const EmailSent = () => {
  const router = useRouter()
  const FirebaseErrors = ["Firebase: Error (auth/wrong-password).", "Firebase: Error (auth/user-not-found).", "Firebase: Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later. (auth/too-many-requests)."]
  const [loading, setLoading] = useState(false)
  const { user, resetPassword } = useAuth()
  const [data, setData] = useState({
    email: '',
    password: '',
  })

  const handleLogin = async (e) => {
    e.preventDefault()

    setLoading(true)
   
    try {
      await resetPassword(data.email, data.password)
      setLoading(false)
      router.push('/login')
    } catch (err) {
      setLoading(false)
      if(err.message === FirebaseErrors[0]){
        alert("Wrong password")
      }else if(err.message === FirebaseErrors[1]){
        alert("User with this email not found")
      }else if(err.message === FirebaseErrors[2]){
        alert("Too many failed login attempts,Your account is now disabled.Contact the admin.")
      }
      else{
        alert("Something went wrong, Contact the admin")
      }
    
    }
  }
  useEffect(() => {
    if (user) {
      router.push('/patientDashboard')
    }
  }, [])

  return (
    <><div>
      <Head>
        <title>
          paceB | Email Sent
        </title>

      </Head>
    </div><div
      style={{
        // width: '30%',
        margin: 'auto',
      }}
    >

        <div className={styles.logincard}>
          {/* <h1 className={styles.hello}>Hello,</h1>
    <h1 className={styles.welcome}>Welcome!</h1> */}


          <h3 style={{ textAlign: 'center' }}>Reset password email has been sent!</h3>
          <Button onClick={() => router.push('/login')} className={styles.logButton} variant="primary" type="submit">
            Go to Login
          </Button>
          <p onClick={() => router.push('/forgotPassword')} style={{ textAlign: 'center', marginTop: 30, fontSize: 17, cursor: 'pointer' }}>Did not receive mail? <b>Resend Mail</b></p>
        </div>
      </div></>
  )
}
export default EmailSent