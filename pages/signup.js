import { style } from 'dom-helpers'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import { Button, Form } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import styles from '../styles/login.module.css'
import Head from 'next/head';

const Login = () => {
  const router = useRouter()
  const FirebaseErrors = ["Firebase: Error (auth/wrong-password).", "Firebase: Error (auth/user-not-found).", "Firebase: Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later. (auth/too-many-requests).", "Firebase: Error (auth/email-already-in-use)."]
  const [loading, setLoading] = useState(false)
  const { user, signup } = useAuth()
  const [data, setData] = useState({
    email: '',
    password: '',
    confirmPassword : ''
  })

  const handleLogin = async (e) => {
    e.preventDefault()

    setLoading(true)

    if(data.password !== data.confirmPassword){
        alert("Password and Confirm Password should be same")
        setLoading(false)
        return
    }
   
    try {
      await signup(data.email, data.password)
      setLoading(false)
      router.push('/patientDashboard')
    } catch (err) {
      setLoading(false)
      if(err.message === FirebaseErrors[0]){
        alert("Wrong password")
      }else if(err.message === FirebaseErrors[1]){
        alert("User with this email not found")
      }else if(err.message === FirebaseErrors[2]){
        alert("Too many failed login attempts,Your account is now disabled.Contact the admin.")
      }else if(err.message === FirebaseErrors[3]){
        alert("User with this email already exists")
      }
      else{
        console.log(err);
        alert("Error: " + err.message)
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
          paceB | Sign Up
        </title>

      </Head>
    </div><div
      style={{
        // width: '30%',
        margin: 'auto',
      }}
    >

        <div className={styles.logincard}>
          <h1 className={styles.hello}>Hello,</h1>
          <h1 className={styles.welcome}>Welcome!</h1>
          <Form onSubmit={handleLogin}>
            <Form.Group className={styles.label1} controlId="formBasicEmail">
              <Form.Label className={styles.labelText}>Email address</Form.Label>
              <Form.Control
                onChange={(e) => setData({
                  ...data,
                  email: e.target.value,
                })}
                value={data.email}
                required
                type="email"
                placeholder="Enter email" />
            </Form.Group>



            <Form.Group className={styles.label2} controlId="formBasicPassword">
              <Form.Label className={styles.labelText}>Password</Form.Label>
              <Form.Control
                onChange={(e) => setData({
                  ...data,
                  password: e.target.value,
                })}
                value={data.password}
                required
                type="password"
                placeholder="Password" />
            </Form.Group>

            <Form.Group className={styles.label2} controlId="formBasicPassword">
              <Form.Label className={styles.labelText}>Password</Form.Label>
              <Form.Control
                onChange={(e) => setData({
                  ...data,
                  confirmPassword: e.target.value,
                })}
                value={data.confirmPassword}
                required
                type="password"
                placeholder="Confirm Password" />
            </Form.Group>
            <div className="text-center">
              {loading ?
                <div className="spinner-border text-primary" role="status">
                  {/* <span className="visually-hidden">Loading...</span> */}
                </div>

                :

                // <div className={styles.logButton} variant="primary" type="submit">
                // Login
                // </div>
                <Button className={styles.logButton} variant="primary" type="submit">
                  Sign Up
                </Button>}
            </div>
          </Form>
          <p onClick={() => router.push('/login')} style={{ textAlign: 'center', marginTop: 30, fontSize: 17, cursor: 'pointer' }}>Registered user? <b>Login</b></p>
        </div>
      </div></>
  )
}

export default Login