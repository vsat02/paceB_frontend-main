import React, {use, useEffect, useState} from 'react'
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'),{ ssr: false });
// import ReactApexChart from 'react-apexcharts'
import axios from 'axios';
import { useAuth } from '../context/AuthContext'
import { exportToExcel } from 'react-json-to-excel';
import { Modal, Button, Spinner } from 'react-bootstrap';
import styles1 from '../styles/medHistoryCard.module.css'

import styles from '../styles/medicalHistory.module.css'
import instance from '../config/configkey';
function GaitChart({shoeSide, recordingId, patientId,token}) {
  const { user, login } = useAuth()
    
    const [s1,sets1] = useState(0)
    const [s2,sets2] = useState(60)
    const [show, setShow] = useState(false);
    const handleOpen = () => setShow(true);
    const handleClose = () => setShow(false);
    // const [filterSec, setFilterSec] = useState(0)

    const [ana, setAna] = useState('None')
    const [notes, setNotes] = useState('None')
    const [gaitData, setGaitData] = useState()
    const [chartData, setChartData] = useState([])
    const [chartData2, setChartData2] = useState([])

    const [medHisId, setMedHisId] = useState()

    const [loading, setLoading] = useState(false)
    // const [errMessage,setErrMessage] = useState(false)
    const [chartError, setChartError] = useState(false)
    const [error,setError] = useState(null)
    const [MinTime,setMinTime] = useState()
    const [MinPeaks, setMinPeaks] = useState()

    const [MinPeaksRight, setMinPeaksRight] = useState()
    const [MinPeaksLeft, setMinPeaksLeft] = useState()

    const [cadenceLeft,setcadenceLeft] = useState()
    const [cadenceRight,setcadenceRight] = useState()
    const [cadenceAverage, setcadenceAverage] = useState()

    const options = {
            
      series: [{
        name: '',
        data: chartData
    },
    {
      name: '',
      data: chartData2, 
      color: '#1E90FF',
      yAxisIndex: 1,

    }
  ],
        options: {
            chart: {
            type: 'bar',
            height: 150
          },
          plotOptions: {
            bar: {
              borderRadius: 4,
              horizontal: false,
              
            
            },
           
    

            },
            colors: [
              function({ value, seriesIndex, w ,dataPointIndex}) {
                console.log(w.globals.series[0])
               let returnColor = '#90EE90'
                if ((dataPointIndex==0)&&value.toFixed(3)>=0.7&&value.toFixed(3)<=1.4) //stride time
          
                {
                  return returnColor
                }
                if ((dataPointIndex==1)&&value.toFixed(3)>=0.35&&value.toFixed(3)<=0.7) //step time
                {
                  return returnColor
                }
                if (dataPointIndex == 2 && w.globals.series[0][3].toFixed(3) >= 0.5 && w.globals.series[0][3].toFixed(3) <= 0.7) //stance time and stance phase
                {
                  // console.log("stance phase ",w.globals.series[0][3]  ,w.globals.series[0][3] )
                  return returnColor
                }
                if ((dataPointIndex==3)&&value.toFixed(3)>0.5&&value.toFixed(3)<0.7) //stance phase
                {
                  return returnColor
                }
                if (dataPointIndex == 4 && w.globals.series[0][5].toFixed(3) >= 0.3 && w.globals.series[0][5].toFixed(3) <= 0.5) //swing phase and stance phase
                {
                  return returnColor
                }
                if ((dataPointIndex==5)&&value.toFixed(3)>0.3&&value.toFixed(3)<0.5) //swing phase
                {
                  return returnColor
                }
                if ((dataPointIndex==6)&& w.globals.series[0][5].toFixed(3) >= 0.3 && w.globals.series[0][5].toFixed(3) <= 0.5) //single support time
                {
                  return returnColor
                }
                if ((dataPointIndex==7)&&value.toFixed(3)>0.1&&value.toFixed(3)<0.4) //double support time
                {
                  return returnColor
                }
                if ((dataPointIndex==8)) //accel index
                {
                  return returnColor
                }
                if ((dataPointIndex==9)&&value.toFixed(3)>0.4&&value.toFixed(3)<0.7) //step length
                {
                  return returnColor
                }
                if ((dataPointIndex==10)&&value.toFixed(3)>0.7&&value.toFixed(3)<1.2) //stride length
                {
                  return returnColor
                }
                //  else {
                //   return '#02DFDE'
                // }
                return '#F44336'
              },
              function({ value, seriesIndex, dataPointIndex,w }) {
                // if (value >0) {
                //   return '#FF0000'
                // } else {
                //   return '#02DFDE'
                // }
              },
            ],
            dataLabels: {
            enabled: false,
            
            },
            
            xaxis: {
            categories: shoeSide != "Cumulative" ? [
              'Stride Time',
              'Step Time',
              'Stance Time',
              'Stance Phase',

              'Swing Time',
              // 'Swing to Stance Ratio',
              'Swing Phase',
              'Single Support Time',
              'Double Support Time',
              'Accel Index',
              'Step Length',
              'Stride Length',
              
            ]
            : [
            'Stride Time',
              'Step Time',
            'Stance Time',
            'Stance Phase',

            'Swing Time',
            // 'Swing to Stance Ratio',
            'Swing Phase',
            'Single Support Time',
            'Double Support Time',
            'Accel Index',
            'Step Length',
            'Stride Length',
          ],
            },
            
            yaxis: [
              {
                  labels: {
                      formatter: (value) => { return value.toFixed(1) }
                  },
              },
              {
                  opposite: true,
                  labels: {
                      formatter: (value) => { return value.toFixed(1) }
                  },
              },
          ],
            tooltip: {
              y: [{
                // seriesName: 'Gait Parameters',

                formatter: function (value, { seriesIndex, dataPointIndex, w }) {
                  if (dataPointIndex==0) // stride time
                  {
                    return `Value: ${value.toFixed(3)} second(s)<br/>Normal Range: (0.7-1.4)<br/><em>Description: The time difference between <br/> the subsequent initial contacts of the same foot`

                  }
                  if (dataPointIndex==1)// step time
                  {
                    return `Value: ${value.toFixed(3)} second(s)<br/>Normal Range: (0.35-0.7)<br/><em>Description: The time difference between <br/> the initial contacts of the current and contralateral foot`
                    
                  }
                  if (dataPointIndex==2) // stance time
                  {
                    return `Value: ${value.toFixed(3)} second(s)<br/><br/><em>Description: Amount of time the foot is grounded<em/>`
                  }
                  if (dataPointIndex==3) // stance phase
                  {
                    return `Value: ${value.toFixed(3)*100}%<br/>Normal Range: (50-70)<br/><em>Description: Percentage of stance among a complete stride<em/>`
                  }
                  if (dataPointIndex==4) // swing time
                  {
                    return `Value: ${value.toFixed(3)} second(s)<br/><br/><em>Description: Amount of time the foot is on air</em>`
                  }
                  if (dataPointIndex==5) // swing phase 
                  {
                    return `Value: ${value.toFixed(3)*100}%<br/>Normal Range: (30-50)<br/><em>Description: Percentage of swing among a complete stride<em/>`
                  }
                  if (dataPointIndex==6) // single support time
                  {
                    return `Value: ${value.toFixed(3)} seconds(s)<br/><br/><em>Description: The duration for which only one foot is grounded<em/>`
                  }
                  if (dataPointIndex==7) // double support time
                  {
                    return `Value: ${value.toFixed(3)} second(s)<br/>Normal Range: (0.1-0.4)<br/><em>Description: The duration for which both feet are grounded<em/>`
                  }
                  if (dataPointIndex==8) // accel index
                  {
                    return `Value: ${value.toFixed(3)}<br/><br/><em>Description: Acceleration in the significant movement direction<em/>`
                  } 
                  if (dataPointIndex==9) // step length
                  {
                    return `Value: ${value.toFixed(3)} meter(s)<br/>Normal Range: (0.4-0.7)<br/><em>Description: The distance between the <br/> initial contacts of the current and contralateral foot</em>`
                  }
                  if (dataPointIndex==10) // stride length
                  {
                    return `Value: ${value.toFixed(3)} meter(s)<br/>Normal Range: (0.7-1.2)<br/><em>Description: The distance between the <br/>subsequent initial contacts of the same foot<em/>`
                  }
                
                  
                },
              },
              {
                seriesName: 'Gait Variability Index',

                opposite: true,
                formatter: function (value, { seriesIndex, dataPointIndex, w }) {
                  if(dataPointIndex==0)
                  {
                    return `Variability: ${value} <br/><br/> <em>Description: Deviation of stride time from its average</em>`;
                  }
                  if(dataPointIndex==1)
                  {
                    return `Variability: ${value} <br/><br/> <em> Description: Deviation of step time from its average</em>`;
                  }
                  if(dataPointIndex==2)
                  {
                    return `Variability: ${value} <br/><br/> <em>Description: Deviation of stance time from its average</em>`;
                  }
                  if(dataPointIndex==3)
                  {
                    return `Variability: ${value} <br/><br/> <em>Description: Deviation of stance phase from its average</em>`;
                  }
                  if(dataPointIndex==4)
                  {
                    return `Variability: ${value} <br/><br/><em>Description: Deviation of swing time from its average</em>`;
                  }
                  if(dataPointIndex==5)
                  {
                    return `Variability: ${value} <br/><br/> <em>Description: Deviation of swing phase from its average</em>`;
                  }
                  if(dataPointIndex==6)
                  {
                    return `Variability: ${value} <br/><br/><em>Description: Deviation of single support time from its average</em>`;
                  }
                  if(dataPointIndex==7)
                  {
                    return `Variability: ${value} <br/><br/> <em>Description: Deviation of double support time from its average</em>`;
                  }
                  if(dataPointIndex==8)
                  {
                    return `Variability: ${value} <br/><br/> <em>Description: Deviation of acceleration index from its average</em>`;
                  }
                  if(dataPointIndex==9)
                  {
                    return `Variability: ${value} <br/><br/> <em>Description: Deviation of step length from its average</em>`;
                  }
                  if(dataPointIndex==10)
                  {
                    return `Variability: ${value} <br/><br/> <em>Description: Deviation of stride length from its average</em>`;
                  }
                },
              }],
            
            },
        }, 



    };
    const handleEditButtonClick = () => {
      const medHistoryId=medHisId;
      const analysis=ana;
      const doctorNotes=notes;
      console.log(medHistoryId,analysis,doctorNotes)
      instance.put(`/api/medicalHistory/`,{
        condition:analysis,
        notes:doctorNotes,
        id:medHistoryId
      },{
        headers: {
            'authToken': token
        }}
      ).then(()=>{
        alert(`Successfully edited ${ana} analysis`)
        window.location.reload(false);
    
      }).catch((err)=>{
        alert(`Unable to edit ${sym} analysis`)
      })
    
    }
    const handleChange = (e) => {
      var data = e.target.value
      // console.log(data)
      switch(e.target.name){
          case 'peak1':
              sets1(data)
              break;
           
          case 'peak2':
              sets2(data)
              break;
          
          case 'analysis':
              setAna(data)
              break;
          case 'notes':
              setNotes(data)
              break;
         
          default:
              return;    
      }
    }
    const doGait = () => {
        // let p1 =1;
        // let p2 =5;
        setLoading(true)
        // console.log(token)
        instance.get(`/api/medicalHistory/MedRecord/${recordingId}`, 
        {  
          headers: {
            'authToken': user.accessToken
          }
        }).then((data) => {      
          console.log(data.data[0].id);
          setAna(data.data[0].patient_condition)
          setNotes(data.data[0].notes)
          setMedHisId(data.data[0].id)
        }).catch((err) => {
          console.log(err);
        });
        axios.get(`https://api.bearlytech.com/gait/python/?id=${recordingId}&t1=${s1}&t2=${s2}`,{
          headers: {
              'authToken': user.accessToken
          },
         
      }).then((data) => { // change url
            
            console.log(data)
            // console.log(data.data.GaitParameters.MinPeaks)
            setMinTime(data.data.GaitParameters.MinTime)
            setMinPeaks(data.data.GaitParameters.MinPeaks)
            setMinPeaksLeft(data.data.GaitParameters.MinPeaksLeft)
            setMinPeaksRight(data.data.GaitParameters.MinPeaksRight)
            setcadenceLeft(data.data.GaitParameters.Cadence.left)
            setcadenceRight(data.data.GaitParameters.Cadence.right)
            setcadenceAverage(data.data.GaitParameters.Cadence.Cumulative)
            // console.log("minimum"+minPeaks)
            setGaitData(data.data)
           
            // console.log(data.data)
            if(data.data['error'] != undefined){
    
              setError(data.data['error'])
              setChartError(true)
            
            }else{

              setChartError(false)
             
              const newData = [
                      data.data.GaitParameters.StrideTime[shoeSide],

                      data.data.GaitParameters.StepTime[shoeSide],

                      data.data.GaitParameters.StanceTime[shoeSide],
                      data.data.GaitParameters.StanceRatio[shoeSide],


                      data.data.GaitParameters.SwingTime[shoeSide],

                      // data.data.GaitParameters.SwingToStanceRatio[shoeSide],
                      data.data.GaitParameters.SwingRatio[shoeSide],
                      data.data.GaitParameters.SingleSupportTime[shoeSide],
                      data.data.GaitParameters.DoubleSupportTime[shoeSide],

                      data.data.GaitParameters.AccelIndex[shoeSide],
                      data.data.GaitParameters.StepLength[shoeSide],
                      data.data.GaitParameters.StrideLength[shoeSide],
                     
                      /* 
                      stride time
                      step time
                      stance 
                      swing
                      swing to stance ratio
                      speed
                      step length
                      stride length
                      average force applied
                      cadenceLeft
                      */
                    ]
                    // SwingToStanceRatioVariance = 
                    const newData2=[
                      data.data.GaitParameters.StrideVariance[shoeSide],

                      data.data.GaitParameters.StepVariance[shoeSide],

                      data.data.GaitParameters.StanceVariance[shoeSide],
                      data.data.GaitParameters.StanceRatioVariance[shoeSide],


                      data.data.GaitParameters.SwingVariance[shoeSide],

                      // data.data.GaitParameters.SwingToStanceRatio[shoeSide],
                      data.data.GaitParameters.SwingRatioVariance[shoeSide],
                      data.data.GaitParameters.SingleSupportTimeVariance[shoeSide],
                      data.data.GaitParameters.DoubleSupportTimeVariance[shoeSide],

                      data.data.GaitParameters.AccelVariance[shoeSide],
                      data.data.GaitParameters.StepLengthVariance[shoeSide],
                      data.data.GaitParameters.StrideLengthVariance[shoeSide],
                     
                    ]
            setChartData2(newData2)
    
            setChartData(newData)
                  
            }
    
           
            setLoading(false)
        }).catch((err) => {
          console.log(err)
          // alert(err, "Heyy")
          console.log(err)
          setMinTime(err.response.data.MinTime)
          // if(err.response.data.error =="Required number of peaks not found")
          // {
          //   setErrMessage(false)
          //   setError("Required number of peaks not found")
          //   // setError("The error could have been caused by \n 1. Insufficient recording time (a minimum of 30 seconds is recommended)  Or  2. Improper selection of time frame")
          // }
          // else{
          // setError(err.response.data.error)
          // }
          // setError(err.response.data.error)
          setMinPeaks(0)
          // alert("Peaks not found, please try again")
          setChartError(true)
          // console.log(err.response.data.error)
          setLoading(false)
        })
      }
      const downloadRawData = () => {
        axios.get(`https://api.bearlytech.com/gait/shoeRawData/?recording_id=${recordingId}`,{
          headers: {
              'authToken': user.accessToken
          }
      }).then((data) => {
        // console.log(data)

         exportToExcel(data.data, 'data')
        }).catch((err) => alert(err))


      }
  const downloadReport = () => {
    axios.post("https://api.bearlytech.com/gait/download/",{
      patientId,
      gaitData : gaitData.GaitParameters
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
      const dlink = 'gaitReport_'+ patientId+'.pdf'
      link.setAttribute('download', dlink)

      document.body.appendChild(link)
      link.click()
    }).catch((err) => alert(err))
  }
  useEffect(() => {
    doGait()
  }, [recordingId])

  useEffect(() => {
    doGait()
  }, [])

  useEffect(() => {
    if(gaitData && !chartError){
      
      if(shoeSide === "Cumulative"){
    
      const newData = [
        gaitData.GaitParameters.StrideTime[shoeSide],

        gaitData.GaitParameters.StepTime[shoeSide],

        gaitData.GaitParameters.StanceTime[shoeSide],
        gaitData.GaitParameters.StanceRatio[shoeSide],


        gaitData.GaitParameters.SwingTime[shoeSide],

        // gaitData.GaitParameters.SwingToStanceRatio[shoeSide],
        gaitData.GaitParameters.SwingRatio[shoeSide],
        gaitData.GaitParameters.SingleSupportTime[shoeSide],
        gaitData.GaitParameters.DoubleSupportTime[shoeSide],
        gaitData.GaitParameters.AccelIndex[shoeSide],

        gaitData.GaitParameters.StepLength[shoeSide],
        gaitData.GaitParameters.StrideLength[shoeSide],

  
    ]
    const newData2 = [
      gaitData.GaitParameters.StrideVariance[shoeSide],

        gaitData.GaitParameters.StepVariance[shoeSide],

        gaitData.GaitParameters.StanceVariance[shoeSide],
        gaitData.GaitParameters.StanceRatioVariance[shoeSide],


        gaitData.GaitParameters.SwingVariance[shoeSide],

        // gaitData.GaitParameters.SwingToStanceRatio[shoeSide],
        gaitData.GaitParameters.SwingRatioVariance[shoeSide],
        gaitData.GaitParameters.SingleSupportTimeVariance[shoeSide],
        gaitData.GaitParameters.DoubleSupportTimeVariance[shoeSide],
        gaitData.GaitParameters.AccelVariance[shoeSide],

        gaitData.GaitParameters.StepLengthVariance[shoeSide],
        gaitData.GaitParameters.StrideLengthVariance[shoeSide],
    
    ]
    setChartData2(newData2)
    setChartData(newData)
    }else{
      const newData = [
        gaitData.GaitParameters.StrideTime[shoeSide],

        gaitData.GaitParameters.StepTime[shoeSide],

        gaitData.GaitParameters.StanceTime[shoeSide],
        gaitData.GaitParameters.StanceRatio[shoeSide],


        gaitData.GaitParameters.SwingTime[shoeSide],

        // gaitData.GaitParameters.SwingToStanceRatio[shoeSide],
        gaitData.GaitParameters.SwingRatio[shoeSide],
        gaitData.GaitParameters.SingleSupportTime[shoeSide],
        gaitData.GaitParameters.DoubleSupportTime[shoeSide],
        gaitData.GaitParameters.AccelIndex[shoeSide],

        gaitData.GaitParameters.StepLength[shoeSide],
        gaitData.GaitParameters.StrideLength[shoeSide],
    ]
    const newData2 = [
      gaitData.GaitParameters.StrideVariance[shoeSide],

      gaitData.GaitParameters.StepVariance[shoeSide],

      gaitData.GaitParameters.StanceVariance[shoeSide],
      gaitData.GaitParameters.StanceRatioVariance[shoeSide],


      gaitData.GaitParameters.SwingVariance[shoeSide],

      // gaitData.GaitParameters.SwingToStanceRatio[shoeSide],
      gaitData.GaitParameters.SwingRatioVariance[shoeSide],
      gaitData.GaitParameters.SingleSupportTimeVariance[shoeSide],
      gaitData.GaitParameters.DoubleSupportTimeVariance[shoeSide],
      gaitData.GaitParameters.AccelVariance[shoeSide],

      gaitData.GaitParameters.StepLengthVariance[shoeSide],
      gaitData.GaitParameters.StrideLengthVariance[shoeSide],
    ]
    setChartData2(newData2)
    setChartData(newData)
  }
  }
  }, [shoeSide])
  return (
    
    <div>
      
            <div style={{display:"flex",justifyContent:"center",alignItems:"center",marginBottom:"10px"}}>
      Seconds recorded: {MinTime}

    </div>
    {/* <div style={{display:"flex",justifyContent:"center",alignItems:"center",marginBottom:"10px"}}>
       Peaks in Time Interval: {MinPeaks}

    </div> */}
    <div style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
          <input
        name='peak1'
        min="0"
        onInput={(e) => e.target.validity.valid || (e.target.value = '')}
        onChange={(e) => handleChange(e)}
        className={styles.inputGaitPeak}
        size="2"
        type="number"
        defaultValue="0"
      />

      <input
        name='peak2'
        min="0"
        onInput={(e) => e.target.validity.valid || (e.target.value = '')}
        onChange={(e) => handleChange(e)}
        className={styles.inputGaitPeak}
        size="2"
        type="number"
        defaultValue="60"
      />
      
        {/* <input
        name='filter'
        min="0"
        // onInput={(e) => e.target.validity.valid || (e.target.value = '')}
        onChange={(e) => handleChange(e)}
        className={styles.inputGaitPeak}
        size="2"
        type="number"
        max="5" step="0.5"
        defaultValue="0"
      /> */}

    </div>
    <Modal size='lg' 
      show={show} onHide={handleClose} centered>
              <Modal.Header closeButton>
                <Modal.Title className='text-align-center'>Edit Analysis</Modal.Title>
              </Modal.Header>

              <Modal.Body>
              <div style={{ display: 'flex', justifyContent: 'center', flexDirection:'column', alignItems:'center', gap: 20 }}>

              <input onChange={(e) => handleChange(e)} className={styles1.input} name='analysis'  type="text" defaultValue={ana}/>
              <textarea onChange={(e) => handleChange(e)} className={styles1.input} defaultValue={notes} name='notes' type="text"/>
            </div></Modal.Body>
              <div style={{display:'flex',alignItems:'center', justifyContent:'center', paddingBottom:'6px', paddingLeft:'6px', paddingRight:'6px'}}>
              
            <Button variant='info' onClick={handleEditButtonClick}>
              Save
            </Button>
           
            </div>
            </Modal>

   
    <div style={{display:"flex",justifyContent:"center",alignItems:"center" ,marginTop:"10px"}}>
    <Button variant='danger' onClick={() => {
      // console.log(p1,p2)
      doGait()
    }}>Recalculate</Button>
</div>
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px" }}>
    {shoeSide === "left" && (
      <div>Cadence: {cadenceLeft} steps/minute</div>
    )}
    {shoeSide === "right" && (
      <div>Cadence: {cadenceRight} steps/minute</div>
    )}
    {shoeSide === "Cumulative" && (
      <div>Cadence: {cadenceAverage} steps/minute</div>
    )}
  </div>
  {/* <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "10px" }}>
    {shoeSide === "left" && (
      <div>Peaks: {MinPeaksLeft}</div>
    )}
    {shoeSide === "right" && (
      <div>Peaks: {MinPeaksRight} </div>
    )} */}
   
  {/* </div> */}
{
            loading ? 
            <div>Calculating...</div> : 
            chartError ? 
            <><div>ERROR: </div><div>
              The error could have been caused by:
              <ul>
                <li>Insufficient recording time (a minimum of 30 seconds is recommended)</li>
                <li>Improper selection of time frame</li>
              </ul>
            </div></>
           
            : 
            <ReactApexChart options={options.options} series={options.series} type="bar" height={650} width={750}/>
        }
         {
          
          !chartError ?
          <><div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "10px" }}>

          </div><div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: 50 }}>
              <Button variant='danger' onClick={() => downloadReport()}>Download report</Button>
              <div style={{ width: 20 }}></div>
              <Button variant='danger' onClick={() => downloadRawData()}>Download Data</Button>
              <div style={{ width: 20 }}></div>

            <Button variant='outline-info' onClick={handleOpen}>
              Edit Analysis
            </Button>
            </div></> : null
         }
    </div>
  )
}

export default GaitChart