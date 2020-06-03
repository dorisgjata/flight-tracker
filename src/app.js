// Your code goes here

// ----- PLEASE NOTE -----
// Although your code is bundled, we do not otherwise transform or transpile your
// user code. ES6+ JavaScript is incompatible with the in-vehicle platform and
// will need to be transpiled into ES5!
// -----------------------

// You can require definitions from other JavaScript and JSON files.
// Your code will be bundled together using WebPack during DFF compilation.
var terms = require("./terms.json");
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
        neighbors: ['flightTime']
      }, 

    })
    .addRoute(
      'flightTime',{
          layout: 'Grid',
          options: {
            showContent: true,
            borderless: true
          },
    }
  );
  const clock = () => {
    let time = new Date();
    return `${time.getHours()}: ${time.getMinutes()}`;
  };  
  const interval = () => {
     setInterval(clock, 1000)
  };
 
  interval();
 let currPosition = ngi.vehicle.getPosition()
  .then((coords) => {
    console.log(coords);
  });
  let destination = ngi.vehicle.setDestination(coordinates)


  ngi.cards("flightFlow.flightMain", {
    title: 'Welcome to Flight Tracker!',

    body: `<div> Current time: </>
           <h1> ${clock()} </h1>
            Would you like to track a flight?`, 
  });
  
  ngi.form("flightFlow.flightTrack", {
    onSubmit: function(flightNumber) {
      console.log("Form value", flightNumber);
      ngi.state.set('flightNumber', flightNumber);
      this.route('flightTime');
    },
    onCancel: function() {
      this.back('flightMain');
    },
    fields: [
      {
        type: "input",
        name: "Flight Number",
        label: "Fligt no.",
        maxLength: 10
      },
    ]
  });
  ngi.cards('flightFlow.flightTime', [
    { title: 'Departure time', body: '10:00 pm'},
    { title: 'Time to airport', body: '1 hr'},
    { title: 'Position', body: info},

  ]);
// Specify your own entry flow, this will connect to Splash, Terms, and About.
ngi.init('flightFlow');

