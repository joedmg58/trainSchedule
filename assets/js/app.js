/*
** Train Schedule App
** Application for Homework Week 7
** Joseph Ragno, Jose De Las Salas, Raul and Joed Machado. 2018 UM Coding Boot Camp.
*/

//some global variables
addButtonId = '#submitBtn'; //The ID name for the button designated to add train schedule
bodyTableId ='#tableBody'; //The ID of the table body where the train schedule is shown
trainNameInput = '#trainName'; //ID of the input text to collect the train name
trainDestinationInput = '#destination'; // id of the destination input text
trainFirstTimeInput = '#firstTrain'; // id of the first time input
trainFrequencyInput = '#frequency'; // id of the frequency input


//It will start when the document will finish to load
$(document).ready( function() {

    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDX0UgJb4JP6UIfW9wl2VQtb7lJ18OgpCY",
        authDomain: "trainschedule-991ea.firebaseapp.com",
        databaseURL: "https://trainschedule-991ea.firebaseio.com",
        projectId: "trainschedule-991ea",
        storageBucket: "trainschedule-991ea.appspot.com",
        messagingSenderId: "769362498777"
    };
    
    firebase.initializeApp(config);

    //Reference to the train schedule database
    var fbTrainSchedule = firebase.database();

    //Registering onclick event for adding train
    $( addButtonId ).click( addTrain );

    //Function for adding a train to the database
    function addTrain( event ) {
        event.preventDefault();
    
        var trainName = $( trainNameInput ).val().trim();
        var trainDestination = $( trainDestinationInput ).val().trim();
        var trainFirstTime = $( trainFirstTimeInput ).val().trim();
        var trainFrequency = $( trainFrequencyInput ).val().trim();
    
        fbTrainSchedule.ref().push( {
            name: trainName,
            destination: trainDestination,
            first: trainFirstTime,
            frequency: trainFrequency,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        } );
    
        clearInputs();
    }

    //clear all the text inputs of the form
    function clearInputs() {
        $( trainNameInput ).val('');
        $( trainDestinationInput ).val('');
        $( trainFirstTimeInput ).val('');
        $( trainFrequencyInput ).val('');
    }

    //Its triggers when a new child (element) to the database is added
    fbTrainSchedule.ref().on( "child_added", function( snapshot ) {

        //get values from snapshot
        var id = snapshot.key;
        console.log(id);
        var name = snapshot.val().name;
        var dest = snapshot.val().destination;
        var first = snapshot.val().first;
        var freq = parseInt( snapshot.val().frequency );

        //calculated values
        var departureTimes = Math.abs( Math.ceil( moment( first, 'HH:mm').diff( moment(), 'minutes' ) / freq ) );
        var na = moment( first, 'HH:mm').add( ((departureTimes+1) * freq), 'minutes' );
        var nextArr = moment( na, 'HH:mm' ).format('hh:mm a');
        var minAway = moment( na, 'HH:mm' ).diff( moment(), 'minutes') + 1;

        //add data to the table
        var row = $('<tr train-Id="'+snapshot.key+'">').appendTo( $( bodyTableId ) );
        $('<td>').text( name ).appendTo( row );
        $('<td>').text( dest ).appendTo( row );
        $('<td>').text( freq ).appendTo( row );
        $('<td>').text( nextArr ).appendTo( row );
        $('<td>').html( '<span>' + minAway + '</span> <i class="fas fa-trash" data-key="'+snapshot.key+'"></i>' )
                               .appendTo( row );
        $('.fas').css({"visibility":"visible", "float":"right", "cursor":"pointer"});

        //register an event handler for deleting items
        $('.fa-trash').on('click', delBtnClicked);

    } );

    

    function delBtnClicked(e) {
        e.stopPropagation();

        const trainId = e.target.getAttribute('data-key');

        //console.log('Del button clicked on data ' + trainId);

        //const trainRef = fbTrainSchedule.ref().child( trainId );
        const trainRef = fbTrainSchedule.ref( trainId );

        trainRef.remove();

        trainRef.on("value", function(snapshot) {
            $('tr[train-Id="'+snapshot.key+'"]').remove();
        });

    }

} );
 
