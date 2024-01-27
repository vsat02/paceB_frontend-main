import { useEffect, useRef, useState } from "react";
// import dynamic from 'next/dynamic';
// const Chart = dynamic(() => import('chart.js/auto'),{ ssr: false });
import {Chart} from "chart.js";
import { Alert } from "react-bootstrap";
const AWS = require('aws-sdk');
const mqtt = require('mqtt')

// const AWSIoTData = require('aws-iot-device-sdk');
//   let awsConfig = {
//       identityPoolId: 'ap-south-1:ee5b5687-9ebe-4923-a1e3-0ed3f43e0bab',
//       mqttEndpoint: 'a18kfz9mh1sak-ats.iot.ap-south-1.amazonaws.com',
//       region: 'ap-south-1',
//       clientId: '2sabmitnm40fdbei8shc2b80te',
//       userPoolId: 'ap-south-1_WuSvUCuMv'
//     };
    
//     const mqttClient = AWSIoTData.device({
//       region: awsConfig.region,
//       host: awsConfig.mqttEndpoint,
//       clientId: awsConfig.clientId,
//       protocol: 'wss',
//       maximumReconnectTimeMs: 8000,
//       debug: false,
//       accessKeyId: '',
//       secretKey: '',
//       sessionToken: ''
//     });
    
//     AWS.config.region = awsConfig.region;
    
//     AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//         IdentityPoolId: awsConfig.identityPoolId
//     });
    
//     AWS.config.credentials.get((err) => { 
//         if (err) {
//             // console.log(AWS.config.credentials);
//             throw err;
//         } else {
//             mqttClient.updateWebSocketCredentials(
//                 AWS.config.credentials.accessKeyId,
//                 AWS.config.credentials.secretAccessKey,
//                 AWS.config.credentials.sessionToken
//             );
//         }
//     });
    
    
const RealtimeChartLeft = ({shoeId}) => {
    const chartRef = useRef(null);
    const chartInstanceRef = useRef();
    const [data, setData] = useState([]);
    const [mqttStatus, setMqttStatus] = useState('Not connected');

    const [isBatteryLow, setIsBatteryLow] = useState(false);

    // mqttClient.on('connect', () => {
    //     console.log('mqttClient connected')
    //     setMqttStatus('Connected');
    //     mqttClient.subscribe(`sensor/${shoeId}/left`);

    // });
    
    // mqttClient.on('error', (err) => {
    //     console.log('mqttClient error:', err)
    //     setMqttStatus('Shoe connection Error');
    // });

  useEffect(() => {

    const clientId = "emqx_react_" + Math.random().toString(16).substring(2, 8);
    const username = "dasarathg68";
    const password = "bearly@emqx";
    const port = 443;
    const rejectUnauthorized = false;

    const mqttClient = mqtt.connect('wss://mqtt.bearlytech.com',{
    username,
    password,
    path: '/mqtt',
    port
    // protocol: 'tcp', // Explicitly set the protocol

  });
    
    mqttClient.on('connect', () => {
      mqttClient.subscribe(`sensor/${shoeId}/left`);
      // console.log("Connected chart left")
   
    });

    mqttClient.on('error', (err) => {
      // console.log('mqttClient error:', err)
      setMqttStatus('Shoe connection Error');
    });

    // Initialize the chart
    const myChartRef = chartRef.current.getContext("2d");

    // Destroy existing chart instance if there is one
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const chart = new Chart(myChartRef, {
      type: "line",
      data: {   
        labels: [],
        datasets: [
          {
            label: "Sensor 1",
            data: [],
            fill: false,
            borderColor: "rgb(237, 14, 198)",
            tension: 1,
          },
          {
            label: "Sensor 2",
            data: [],
            fill: false,
            borderColor: "rgb(60, 136, 49)",
            tension: 1,
          },
          {
            label: "Sensor 3",
            data: [],
            fill: false,
            borderColor: "rgb(199, 117, 191)",
            tension: 1,
          },
          {
            label: "Sensor 4",
            data: [],
            fill: false,
            borderColor: "rgb(32, 39, 82)",
            tension: 1,
          },
          {
            label: "Sensor 5",
            data: [],
            fill: false,
            borderColor: "rgb(88, 248, 197)",
            tension: 1,
          },
          {
            label: "Sensor 6",
            data: [],
            fill: false,
            borderColor: "rgb(92, 81, 166)",
            tension: 1,
          },
          {
            label: "Sensor 7",
            data: [],
            fill: false,
            borderColor: "rgb(185, 106, 225)",
            tension: 1,
          },
          {
            label: "Sensor 8",
            data: [],
            fill: false,
            borderColor: "rgb(98, 124, 71)",
            tension: 1,
          },
        ],
      },
      options: {
        animation: false,
        responsive: true,
      },
    });

    chartInstanceRef.current = chart;

    mqttClient.on('message', (topic, payload) => {
        const msg = JSON.parse(payload.toString());

      
        if(msg.Battery_percentage < 20){
            setIsBatteryLow(true)
        }

            const sensorArray = Object.keys(msg).map((key) => [Number(key), msg[key]]);

            
            const newDataPoint = {
                timestamp: sensorArray[0][1],
                values: [
                    sensorArray[5][1],
                    sensorArray[6][1],
                    sensorArray[7][1],
                    sensorArray[8][1],
                    sensorArray[9][1],
                    sensorArray[10][1],
                    sensorArray[11][1],
                    sensorArray[12][1],
                    ],
                };
                setData((prevData) => [...prevData, newDataPoint]);
                // Limit the number of data points to 1000
                if (data.length > 10) {
                setData((prevData) => prevData.slice(1));
                }

    });



    return () => {
      // Clear the interval on unmount
      // Destroy the chart instance on unmount
      mqttClient.end()
      chart.destroy();
    };
  }, []);

  useEffect(() => {
    // Update the chart data when the data state changes
    const { labels, datasets } = chartInstanceRef.current.data;
    const newData = {
      labels: data.map((d) => '1'),
      datasets: datasets.map((dataset, i) => ({
        ...dataset,
        data: data.map((d) => d.values[i]),
      })),
    };
    chartInstanceRef.current.data = newData;
    chartInstanceRef.current.update();

    if (data.length > 400) {
      setData((prevData) => prevData.slice(-1));

      }
  }, [data]);

  

  return <div>
    {
      isBatteryLow ?
      <Alert style={{marginTop: 20, margin: 50, textAlign: 'center'}} variant="danger">Battery low on left shoe</Alert>
      : null
    }
  <h1 style={{textAlign: 'center', margin: 10}}>Left</h1>
  <canvas ref={chartRef} />
  <p style={{textAlign: 'center'}}>X axis - Time (s) <br></br>  Y axis - Vertical Ground Reaction Force (N)</p>
</div> 
};

export default RealtimeChartLeft;




