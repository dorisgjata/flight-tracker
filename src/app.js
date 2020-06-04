// Your code goes here

// ----- PLEASE NOTE -----
// Although your code is bundled, we do not otherwise transform or transpile your
// user code. ES6+ JavaScript is incompatible with the in-vehicle platform and
// will need to be transpiled into ES5!
// -----------------------

// You can require definitions from other JavaScript and JSON files.
// Your code will be bundled together using WebPack during DFF compilation.


let terms = require("./terms.json");

let time = new Date();
let flightTime = new Date(time);
flightTime.setHours(flightTime.getHours()+3);
flightTime.setMinutes(flightTime.getMinutes()+23);
const flightInfo = {
  flightTime: flightTime,
  flightNo: 'abcd',
  coords: {
    latitude: 44.583038,
    longitude: -93.133987
  },
  address: "DTW"
};

// Load each term into built-in flow context for Terms & Conditions.
ngi.cards("_ngi:terms", terms);

// Define the Splash screen.
ngi.cards('_ngi:init.splash', {
  icon: './images/airplane.png'
});

ngi.flow('flightFlow', {
    entry: 'flightMain'
  })
  .addRoute(
    'flightMain', {
      layout: 'Detail',    
      actions: [{
        label: 'Track',
        action: function() {
          this.route('flightTrack');
        }
      }],
      links: {
        neighbors: ['flightTrack']
      },
    })
    .addRoute(
    'flightTrack', {
      layout: 'Form',
      links: {
        neighbors: ['flightTime','flightMain']
      }, 
    })
    .addRoute(
      'flightTime',{
          layout: 'Detail',
          actions: [{
            label: 'Flight',
            action: function() {
              //recordVoice();
            }
          },
        ],
      links: {
        neighbors: ['flightTime','navMap']
      },    
    })
    .addRoute(
      'navMap', {
        layout: 'MapDetail',
      }      
  );
  
  const getCountdown = () => {
    let countdown = flightTime.getTime() - time.getTime(); //time in milliseconds 
    let timer = setInterval( () => {
      if (countdown > 0) {
        countdown -= 60000;
        //calculate hours and min from milliseconds
        let hr = Math.floor((countdown % 86400000) / 3600000);
        let min = Math.floor((countdown % 3600000) / 60000);
        let minLabel =  min < 10?  `0${min} m` : `${min} m`;

        ngi.state.set('hr', `${hr} hr`);
        ngi.state.set('min', minLabel);
    
       } else {
          clearInterval(timer)
       }
      }, 60000);//update every minute not every second for less updates
    };

    getCountdown();

  const recordVoice = () => {
    let sayFlight = '';
    
    let recordingSession = gm.voice.startSpeechRecSession(beginRecording, 'If you want to head to the airport to catch your flight say flight');
    const beginRecording = () => {
      let recordingConfig = {
        intro: 'If you want to head to the airport to catch your flight  say flight after the tone',
        silenceDetection: true,
        silenceLength: 1000,
        maxRecordingWindow: 30000,
        noiseSuppression: 0
      }
      gm.voice.startRecording(finishedRecording, recordingConfig);
    }
  
    const finishedRecording = (file) => {
      console.log('File saved to:', file);
      gm.voice.stopSpeechRecSession(recordingSession);
    }  
    //need to convert to txt
    //if sayFlight === 'flight' 
    // navigate to the airport  

  }

   const onSuccess = () => {
    console.log("Successful!");
  }

  const onFailure = () => {
      console.log("An error occured.");
  }

  // function getPosition(position){
  //      if (position !== null || position !== undefined ) {
  //         console.log(position.coords.latitude, position.coords.longitude);
  //        let currentLat = position.coords.latitude;
  //        let currentLong = position.coords.longitude;
  //        // ngi.state.set('currentLat', position.coords.latitude);
  //         //ngi.state.set('currentLong', position.coords.longitude);
  //       }
       
  //   };
    
  // //watchPosition
 //  gm.info.getCurrentPosition(onSuccess, onFailure, getPosition, true);


 gm.nav.setDestination(onSuccess, onFailure, flightInfo.coords, true);
  // function tripTime(){
  //   let speed = gm.info.watchVehicleData(getSpeed, onSuccess, onFailure, ['average_speed']);  
  // }

  // function getSpeed(vehicleData){
  //   let speed = vehicleData.speed;
  // };
 
  // function flightAlert(currTime, timeToDest, flightTime) {
  //   let message = 'Leave now to catch flight in time!';
  //   if ((flightTime - currTime - 1 ) <= (timeToDest)) {
  //     /**I am calculating the time remaining catch the flight and the time to travel to the airport.
  //        It is optimal to arrive in the arport between 1-2 hours for check-in and boarding
  //        so I am allocating that time as well.  
  //     */
  //     message = 'You will not make your flight!'
     
  //   }
  //   return ngi.toast.load({
  //       title: message,
  //       timeout: -1,
  //       actions: [
  //         {
  //           label: 'Dismiss',
  //           action: function() { 
  //             this.route('flightTime');
  //           }
  //         }
  //       ]
  //     });    
  // } 

  ngi.cards("flightFlow.flightMain", {
    title: 'Welcome to Flight Tracker!',
    body: 'This app can track your upcoming flight and help you navigate to the airport. Would you like to track a flight?'
  });

  ngi.form("flightFlow.flightTrack", {
    title: 'Welcome to Flight Tracker!',
    onSubmit: function(flightNumber) {
      console.log("Form value", flightNumber);
      ngi.state.set('flightNumber', flightNumber);
      this.route('flightTime');
    },
    onCancel: function() {
      this.route('flightMain');
    },
    fields: [
      {
        type: "input",
        name: "flightNumber",
        label: "Flight Number",
        maxLength: 10
      },
    ]
  });

  ngi.cards('flightFlow.flightTime', {
     title: 'Flight departure countdown',
     body:`<h1>${ngi.state.get('hr')} : ${ngi.state.get('min')}</h1>`,
     refresh: 60000
    },
  );

  ngi.cards('flightFlow.navMap',{
    title: 'Map',
    //location: 
  });
  
// Specify your own entry flow, this will connect to Splash, Terms, and About.
ngi.init('flightFlow');

