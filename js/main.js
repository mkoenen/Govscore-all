

/* Events -----------------------------------------*/

window.onload = function(){
    //window.setTimeout(beonline, 6000);
    document.addEventListener("online", onOnline, true);                               //limit how fast the online event can fire
    document.addEventListener("deviceready", setbutton, false);
    //document.addEventListener("deviceready", resultsButton, false);
    //document.addEventListener("deviceready", initPushwoosh, true);
   // document.addEventListener("deviceready", hideSaveButton, false);
   // document.addEventListener("deviceready", checkResults, false);
}

//check if online according to the above interval
function onOnline() {
   
}




 //listen for click events      
function setbutton() {
   
}

/* Form Validation -------------------------------------*/

function validate() {
    if( document.gsForm.name.value === "" ) {

         navigator.notification.alert( "Please enter your full name!" );
         document.gsForm.name.focus() ;
         return false;
    }

    if( document.gsForm.email.value === "" ) {

         navigator.notification.alert( "Please enter your email address!" );
         document.gsForm.email.focus() ;
         return false;

    }else{

        // Put extra check for data format
        var ret = validateEmail();
        if( ret === false ) {

              return false;

         }
   }

   if( document.gsForm.organization.value === "-1" ) {

     navigator.notification.alert( "Please enter your organization!" );
     document.gsForm.organization.focus() ;
     return false;

   }

   savelocal();

}


function validateEmail() {

   var emailID = document.gsForm.email.value;
   atpos = emailID.indexOf("@");
   dotpos = emailID.lastIndexOf(".");
   if (atpos < 1 || ( dotpos - atpos < 2 )) {

       navigator.notification.alert("Please enter a correct email address");
       document.gsForm.email.focus() ;
       return false;

   }

   return( true );

}

/* Notifications ----------------------------------*/


function messageAfterSaveLocal() {
    navigator.notification.alert(
        'Your answers have been stored on your device. They will be saved to the server when you are connected to the internet.',
        'Info title',
        'Update'
    );
}


function afterSavedServer(form, orgcode) {

    navigator.notification.alert(

        'Your answers to the questionnaire ' + form + ' have been saved. To see the results for your organization go to our website and enter the organization code  ' + orgcode + '.',
        'Info title',
        'Update'
    );
}

function alreadySaved() {
    navigator.notification.alert (
        'Your data has already been saved',
        'Info title',
        'Update'
    );
}

function goPlace() {
    window.location.hash = "#govscore";
}

/* Get Date --------------------------------------------------*/

function formatDate(date) {
    date = date.getUTCFullYear() + '-' +
            ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
            ('00' + date.getUTCDate()).slice(-2) + ' ' +
            ('00' + date.getUTCHours()).slice(-2) + ':' +
            ('00' + date.getUTCMinutes()).slice(-2) + ':' +
            ('00' + date.getUTCSeconds()).slice(-2); 
    return date;   
}

/* Interface changes -----------------------------------------*/ 

function hideSaveButton() {

    
    var gs1 = window.localStorage.getItem("gs1");
    if( gs1 !== null){
        var gsSaveButton = document.getElementById('btnStore');
        gsSaveButton.className = gsSaveButton.className + " hide";
        var resultButton2 = document.getElementById('govscore-results2');
        resultButton2.className = resultButton2.className + " see";
    }
    
    var ag1a = window.localStorage.getItem("ag1a");
    if(ag1a !== null){
       // var ag1SaveButton = document.getElementById('ag1Store');
       // ag1SaveButton.className = ag1SaveButton.className + " hide";
    }
   
    var ag7a = window.localStorage.getItem("ag7a");
    if(ag7a !== null) {
        var ag2SaveButton = document.getElementById('ag2Store');
        ag2SaveButton.className = ag2SaveButton.className + " hide";
    }
    
    var ag13a = window.localStorage.getItem("ag13a");
    if(ag13a !== null){
        var ag3SaveButton = document.getElementById('ag3Store');
        ag3SaveButton.className = ag3SaveButton.className + " hide";
    }
    
    var ag16a = window.localStorage.getItem("ag16a");
    if( ag16a !== null) {
        var ag4SaveButton = document.getElementById('ag4Store');
        ag4SaveButton.className = ag4SaveButton.className + " hide";
    }
   
    var ag22a = window.localStorage.getItem("ag22a");
    if( ag22a !== null){
        var ag5SaveButton = document.getElementById('ag5Store');
        ag5SaveButton.className = ag5SaveButton.className + " hide";
    }

}

/*------------check the connection --------------*/

function checkConnection(whichfunction) {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';

    if( states[networkState] !== 'No network connection'){
        switch(whichfunction) {
            case "cgovscore":
                saveServer();
                break;
            case "cag1":
                ag1saveServer();
                break;
            case "cag2":
                ag2saveServer();
                break;
            case "cag3":
                ag3saveServer();
                break;
            case "cag4":
                ag4saveServer();
                break;
            case "cag5":
                ag5saveServer();
                break;
        }

    }else{

        messageAfterSaveLocal();  
        
    }
}






/* Initial Govscore -------------------------------------------------*/

/*Save locally */


function savelocal() {
 
   

}

/*save to server */


function saveServer() {
    



}