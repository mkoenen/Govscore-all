/* Events -----------------------------------------*/
window.onload = function(){
    //window.setTimeout(beonline, 6000);
    document.addEventListener("online", onOnline, true);                               //limit how fast the online event can fire
    document.addEventListener("deviceready", setbutton, false);
    //document.addEventListener("deviceready", initPushwoosh, true);
    document.addEventListener("deviceready", showResultsButtons, false);
    document.addEventListener("deviceready", calcResults, false);
};

 //listen for click events      
function setbutton() {

    document.getElementById('btnStore').addEventListener('click', validate, false);
    document.getElementById('ag1Store').addEventListener('click', ag1savelocal, false);
    document.getElementById('ag2Store').addEventListener('click', ag2savelocal, false);
    document.getElementById('ag3Store').addEventListener('click', ag3savelocal, false);
    document.getElementById('ag4Store').addEventListener('click', ag4savelocal, false);
    document.getElementById('ag5Store').addEventListener('click', ag5savelocal, false);
    
}

/* Form Validation -------------------------------------*/

function validate() {
    if(gsdata){

        alreadySaved();

    }else{
        if( document.gsForm.username.value === "" ) {

             window.alert( "Please enter your full name!" );
             window.location.hash = "govscore";
        }
        if( document.gsForm.email.value !== document.gsForm.email2.value ) {

             window.alert( "Email entries don't match. Please try again" );
             document.gsForm.email.focus() ;
        }
        if( document.gsForm.email.value === "" ) {

             window.alert( "Please enter your email address!" );
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

         window.alert( "Please enter your organization!" );
         document.gsForm.organization.focus() ;
         return false;

       }

        savelocal();
    }
}


function validateEmail() {

   var emailID = document.gsForm.email.value;
   var atpos = emailID.indexOf("@");
   var dotpos = emailID.lastIndexOf(".");
   if (atpos < 1 || ( dotpos - atpos < 2 )) {

       window.alert("Please enter a correct email address");
       document.gsForm.email.focus() ;
       return false;

   }

   return( true );

}

/* Notifications ----------------------------------*/
var organization;

function messageAfterSaveLocal() {
    window.alert('Your answers have been stored on your device. They will be saved to the server when you are connected to the internet.');
}


function afterSavedServer(form, orgcode) {

    window.alert('Your answers to the questionnaire ' + form + ' have been saved. To see the results for your organization go to our website and enter the organization code  ' + orgcode + '.');
}

function alreadySaved() {
    window.alert('You previously finished this assessment. Please check your results.');
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


/* Functions for processing data -----------------------------------------------*/

Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}

//get answers from form and build json array
function getinputs(answerset,num1,num2,prefix){
    var i, key, value;
    //loop through the entries, grab value and store in array
    for(i=num1; i<=num2; i++) {
        key = "'" + prefix + i +"'";
        value = $('input[name = ' + key + ']:checked').val();
        answerset.answers[i] = value;
    }
    
    return answerset;
}


//save the json data array to the server via ajax call
function saveToServer(address,dataset,datasaved){
            $.ajax({
            type       : "GET",
            url        : address,
            crossDomain: true,
            data       : dataset,
            contentType: 'application/json; charset=utf-8',
            ////dataType   : 'json',
            success    : function(responseData, textStatus, jqXHR) {
                    alert(responseData + ", " + textStatus + ", " + jqXHR);
                        window.location.hash = "govscore-results";
                        afterSavedServer("Govscore", organization);
                        datasaved = true; 
                        showResultsButtons();
                        },
            error      : function(response) {
                        alert(response);                  
                        }  
            });  
        }


/* Initial Govscore -----------------------------------------------*/

var gsdata = localStorage.getObject('gsdata'); 
var ag1data = localStorage.getObject('ag1data');
var ag2data = localStorage.getObject('ag2data');
var ag3data = localStorage.getObject('ag3data');
var ag4data = localStorage.getObject('ag4data');
var ag5data = localStorage.getObject('ag5data');

/* store locally */
function savelocal() {

    var userdata, email, gsdate, username, organization;

    username = document.getElementById("username").value;
    email = document.getElementById("email").value;
    organization = document.getElementById("organization").value;
    gsdate  = formatDate(new Date());

    //construct the json array for user data and add to local storage
    gsdata = {'username': username, 'email': email, 'organization': organization, 'gsdate': gsdate, 'answers':[-1]};
    gsdata = getinputs(gsdata,1,25,"g");
    localStorage.setObject('gsdata', gsdata);
    
    calcResults();

    //now that everything is saved, check the connection
    checkConnection( "cgovscore");
}

/* save to server */

function saveServer() {

    var gsdata;

    //get the data from local storage
    gsdata = localStorage.getObject('gsdata');

    saveToServer("http://sensi.wpengine.com/store-gs.php", gsdata, gsSaved);

}

/* AG 1 -------------------------------------------------------*/

/* store locally */

function ag1savelocal() {

    if(ag1data){

        alreadySaved();

    }else{

        var ag1date;

        gsdata = localStorage.getObject('gsdata');

        ag1date = formatDate(new Date());

        ag1data = { 'ag1date':ag1date, 'email': gsdata.email, 'answers': [-1]};
        ag1data = getinputs(ag1data,1,24,"ag");

        localStorage.setObject('ag1data', ag1data);

        calcResults()
        //now that everything is saved check the connection
        checkConnection("cag1");
    }
}

/* Save on Server */

function ag1saveServer() {
          
    ag1data = localStorage.getObject('ag1data');
    saveToServer("http://sensi.wpengine.com/store-ag.php", ag1data, ag1Saved);
        
}

/* AG 2 -------------------------------------------------------*/

/* store locally */

function ag2savelocal() {
    if(ag2data){

        alreadySaved();

    }else{

        var ag2date;

        gsdata = localStorage.getObject('gsdata');

        ag2date = formatDate(new Date());

        ag2data = { 'ag2date':ag2date, 'email': gsdata.email, 'answers': [-1]};
        ag2data = getinputs(ag2data,25,48,"ag");

        localStorage.setObject('ag2data', ag2data);

        calcResults()
        //now that everything is saved check the connection
        checkConnection("cag2");
    }
}

/* Save on Server */

function ag2saveServer() {
 
    ag2data = localStorage.getObject('ag2data');
    saveToServer("http://sensi.wpengine.com/store-ag.php", ag2data, ag2Saved);
        
}

/* AG 3 -------------------------------------------------------*/

/* store locally */

function ag3savelocal() {

    if(ag3data){

        alreadySaved();

    }else{

        var ag3date;

        gsdata = localStorage.getObject('gsdata');

        ag3date = formatDate(new Date());

        ag3data = { 'ag3date':ag3date, 'email': gsdata.email, 'answers': [-1]};
        ag3data = getinputs(ag3data,49,60,"ag");

        localStorage.setObject('ag3data', ag3data);

        calcResults()

        //now that everything is saved check the connection
        checkConnection("cag3");
    }
}

/* Save on Server */

function ag3saveServer() {

    ag3data = localStorage.getObject('ag3data');
    saveToServer("http://sensi.wpengine.com/store-ag.php", ag3data, ag3Saved);

}

/* AG 4 -------------------------------------------------------*/

/* store locally */

function ag4savelocal() {

    if(ag4data){

        alreadySaved();

    }else{

        var ag4date;

        gsdata = localStorage.getObject('gsdata');

        ag4date = formatDate(new Date());

        ag4data = { 'ag4date':ag4date, 'email': gsdata.email, 'answers': [-1]};
        ag4data = getinputs(ag4data,61,84,"ag");

        localStorage.setObject('ag4data', ag4data);

        calcResults()

        //now that everything is saved check the connection
        checkConnection("cag4");
    }
}

/* Save on Server */

function ag4saveServer() {
    
    ag4data = localStorage.getObject('ag4data');
    saveToServer("http://sensi.wpengine.com/store-ag.php", ag4data, ag4Saved);

}

/* AG 5 -------------------------------------------------------*/

/* store locally */

function ag5savelocal() {

    if(ag5data){

        alert("You have already finished this assessment");

    }else{

        var ag5date;

        gsdata = localStorage.getObject('gsdata');

        ag5date = formatDate(new Date());

        ag5data = { 'ag5date':ag5date, 'email': gsdata.email, 'answers': [-1]};
        ag5data = getinputs(ag5data,85,100,"ag");
        
        localStorage.setObject('ag5data', ag5data);

        calcResults()
        //now that everything is saved check the connection
        checkConnection("cag5");
    }
}

/* Save on Server */

function ag5saveServer() {

    ag5data = localStorage.getObject('ag5data');
    saveToServer("http://sensi.wpengine.com/store-ag.php", ag5data, ag5Saved);

    
} 


/* App Comes Online ------------------------------------------*/

//check if online according to the above interval
function onOnline() {
    //there must be locally saved data and the saved flag must be false
    if( gsdata && gsSaved == false){
        saveServer();
    }
    if( ag1data && ag1Saved == false){
        ag1saveServer();
    } 
    if( ag2data && ag2Saved == false){
        ag2saveServer();
    }
    if( ag3data && ag3Saved == false){
        ag3saveServer(); 
    }
    if( ag4data && ag4Saved == false) {
        ag4saveServer();
    }
    if( ag5data && ag5Saved == false){
        ag5saveServer();
    } 
}

/* Interface changes -----------------------------------------*/ 

function showResultsButtons() {
    
    if( gsdata){
        /*var gsSaveButton = document.getElementById('btnStore');
        gsSaveButton.className = gsSaveButton.className + " hide";*/
        var resultButton2 = document.getElementById('govscore-results2');
        resultButton2.className = resultButton2.className + " see";
    }
    
    if(ag1data){
      /* var ag1SaveButton = document.getElementById('ag1Store');
       ag1SaveButton.className = ag1SaveButton.className + " hide";*/
       var ag1resultButton = document.getElementById('ag1-results');
        ag1resultButton.className = ag1resultButton.className + " see";
    }
   
    if(ag2data) {
        /*var ag2SaveButton = document.getElementById('ag2Store');
        ag2SaveButton.className = ag2SaveButton.className + " hide";*/
        var ag2resultButton = document.getElementById('ag2-results');
        ag2resultButton.className = ag2resultButton.className + " see";
    }
    
    if(ag3data){
        /*var ag3SaveButton = document.getElementById('ag3Store');
        ag3SaveButton.className = ag3SaveButton.className + " hide";*/
        var ag3resultButton = document.getElementById('ag3-results');
        ag3resultButton.className = ag3resultButton.className + " see";
    }
     
    if( ag4data) {
        /*var ag4SaveButton = document.getElementById('ag4Store');
        ag4SaveButton.className = ag4SaveButton.className + " hide";*/
        var ag4resultButton = document.getElementById('ag4-results');
        ag4resultButton.className = ag4resultButton.className + " see";
    }
   
    if( ag5data){
        /*var ag5SaveButton = document.getElementById('ag5Store');
        ag5SaveButton.className = ag5SaveButton.className + " hide";*/
        var ag5resultButton = document.getElementById('ag5-results');
        ag5resultButton.className = ag5resultButton.className + " see";
    }
}

/* Results -----------------*/

/*Questions 1, 3, 11, 15, 16, and 22 are based on the practice of cultivating accountability.
Questions 6, 12 and 17 are based on the practice of engaging stakeholders.
Questions 2, 5, 9 and 21 are based on the practice of setting shared strategic direction.
Questions 7, 8, 14, 20, 23 and 25 are based on the practice of stewarding resources.
Questions 4, 10, 13, 18, 19 and 24 are based on the practice of continuous governance enhancement.*/

//add up the numbers
function calcResults() {

    var ag1results,ag2results,ag3results,ag4results,ag5results,res, resag;

   if(gsdata){

        var percentArray = [], accScore, stakeScore, dirScore, resScore, enhScore, totalScore, mlevel;
        

        accScore = parseInt(gsdata.answers[1]) + parseInt(gsdata.answers[3]) + parseInt(gsdata.answers[11]) + parseInt(gsdata.answers[15]) + parseInt(gsdata.answers[16]) + parseInt(gsdata.answers[22]);
        var accPossible = 24;
        var accPercent = Math.round(accScore/accPossible*100);
        percentArray.push(accPercent);

        stakeScore = parseInt(gsdata.answers[6]) + parseInt(gsdata.answers[12]) + parseInt(gsdata.answers[17]);
        var stakePossible = 12;
        var stakePercent = Math.round(stakeScore/stakePossible*100);
        percentArray.push(stakePercent);

        dirScore = parseInt(gsdata.answers[2]) +parseInt(gsdata.answers[5]) +parseInt(gsdata.answers[9]) +parseInt(gsdata.answers[21]);
        var dirPossible = 16;
        var dirPercent = Math.round(dirScore/dirPossible*100);
        percentArray.push(dirPercent);

        resScore = parseInt(gsdata.answers[7]) +parseInt(gsdata.answers[8]) +parseInt(gsdata.answers[14]) +parseInt(gsdata.answers[20]) +parseInt(gsdata.answers[23]) +parseInt(gsdata.answers[25]);
        var resPossible = 24;
        var resPercent = Math.round(resScore/resPossible*100);
        percentArray.push(resPercent);

        enhScore = parseInt(gsdata.answers[4]) +parseInt(gsdata.answers[10]) +parseInt(gsdata.answers[13]) +parseInt(gsdata.answers[18]) +parseInt(gsdata.answers[19]) +parseInt(gsdata.answers[24]);
        var enhPossible = 24;
        var enhPercent = Math.round(enhScore/enhPossible*100);
        percentArray.push(enhPercent);

        totalScore = accScore+stakeScore+dirScore+resScore+enhScore;
        

        switch(true) {
            case( totalScore < 25 ):
                mlevel = "Clear need of governance development (first level/4)";
                break;
            case( totalScore >= 25 && totalScore < 50 ):
                mlevel = "Basic level of governance (second level/4)";
                break;
            case( totalScore >= 50 && totalScore < 75 ):
                mlevel = "Goal-Driven and dynamic governance (third level/4)";
                break;
            case( totalScore >= 75 ): 
                mlevel = "Transformational governance (highest level/4)";
        }


        //list each area with the score
        res = "<h2>Govscore Assessment</h2><p>You assessed your organization as follows: </p>";
        res += "<div id=\"accountability\"><h3>Cultivating Accountability</h3><p>" + accScore + " out of " + accPossible + " points - " + accPercent + "%.</p></div>";
        res += "<div id=\"stakeholders\"><h3>Engaging Stakeholders</h3><p>" + stakeScore + " out of " + stakePossible + " points - " + stakePercent + "%.</p></div>";
        res += "<div id=\"direction\"><h3>Shared Strategic Direction</h3><p>" + dirScore + " out of " + dirPossible + " points - " + dirPercent + "%.</p></div>";
        res += "<div id=\"resources\"><h3>Stewarding Resources</h3><p>" + resScore + " out of " + resPossible + " points - " + resPercent + "%.</p></div>";
        res += "<div id=\"enhancement\"><h3>Continuous Governance Enhancement</h3><p>" + enhScore + " out of " + enhPossible + " points - " + enhPercent + "%.</p></div>";
        res += "<div id=\"total\"><h3>Total Score</h3><p>" + totalScore +" points out of 100</p><p>This places your organization at:</p><p class=\"level\">" + mlevel + "</p></div>";
        res += "<div id=\"link\"><p>Learn more at <a href=\"#\">our website</a></p><p>Enter the " + gsdata.organization + " to see how your organization was evaluated collectively.</p></div>";
        //document.getElementById('gs-results').innerHTML = res;
        
    }

    if(ag1data || ag2data || ag3data || ag4data || ag5data ){
        res += "<h2>Advanced Govscore</h2>";

        function getAgResults(dataset,resSet,ansnums) {
            var resSet = 0;
            for(i=0; i<(dataset.answers.length - ansnums); i++){
                var ans = ansnums + i;
                resSet += parseInt(dataset.answers[ans]);
            }
            return resSet;
        }

        if(ag1data){ag1results = getAgResults(ag1data,ag1results,0);}
        if(ag2data){ag2results = getAgResults(ag2data,ag2results,25);}
        if(ag3data){ag3results = getAgResults(ag3data,ag3results,49);}
        if(ag4data){ag4results = getAgResults(ag4data,ag4results,61);}
        if(ag5data){ag5results = getAgResults(ag5data,ag5results,85);}
        
        if(ag1results){
            res += "<div id=\"adv-govscore\"><h3>Cultivating Accountability</h3><p>" + ag1results + " out of 24</p></div>";
        }
        if(ag2results){
            res += "<div id=\"adv-govscore\"><h3>Engaging Stakeholders</h3><p>" + ag2results + " out of 24</p></div>";
        }
        if(ag3results){
            res += "<div id=\"adv-govscore\"><h3>Shared Strategic Direction</h3><p>" + ag3results + " out of 12</p></div>";
        }
        if(ag4results){
            res += "<div id=\"adv-govscore\"><h3>Stewarding Resources</h3><p>" + ag4results + " out of 24</p></div>";
        }
        if(ag5results){
            res += "<div id=\"adv-govscore\"><h3>Continuous Governance Enhancement</h3><p>" + ag5results + " out of 16</p></div>";
        }
    }

    document.getElementById('gs-results').innerHTML = res; 
}

