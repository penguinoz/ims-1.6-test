var templateName = 'chatScript';

var botName = 'Rose';		// change this to your bot name

// declare timer variables
var alarm = null;
var callback = null;
var loopback = null;

//
Template[templateName].events({
  "submit #frmChat": function(e, t){
    e.preventDefault();  // Prevent the default submit() method

    var name = $('#txtUser').val();
    if (name === '') {
      alert('Please provide your name.');
      document.getElementById('txtUser').focus();
    }
    var chatLog = $('#responseHolder').html();
    var youSaid = '<strong>' + name + ':</strong> ' + $('#txtMessage').val() + "<br>\n";
    update(youSaid);
    var data = $(this).serialize();
    sendMessage(data);
    $('#txtMessage').val('').focus();
  },
  "keypress #txtMessage": function(e, t){
    window.clearInterval(loopback);
    window.clearTimeout(callback);
  }
});

function sendMessage(data){ //Sends inputs to the ChatScript server, and returns the response-  data - a JSON string of input information
  // $.ajax({
  // 	url: 'ui.php',
  // 	dataType: 'text',
  // 	data: data,
  //     type: 'post',
  //     success: function(response){
  // 		processResponse(parseCommands(response));
  //     },
  //     error: function(xhr, status, error){
  // 		alert('oops? Status = ' + status + ', error message = ' + error + "\nResponse = " + xhr.responseText);
  //     }
  // //   });
  // var net = require('net');
  // var port= 1024;
  // var host= "52.78.184.240";
  // var userIp = ($_SERVER['X_FORWARDED_FOR']) ? $_SERVER['X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR'];
  // var bot = "harry";
  // var none = "\x00";
  // var msg = userIp + none + bot + none + message + none;
  //
  // var client = net.connect(port, host, function() {
  //   client.end(msg);
  // });


  Meteor.call('chatscriptTest', data, function(error, result){
    if(error){
      return console.log(error);
    } else {
      console.log('chatscriptTest',result);
      processResponse(parseCommands(response));
    }
  });

}

function parseCommands(response){ // Response is data from CS server. This processes OOB commands sent from the CS server returning the remaining response w/o oob commands

  var len  = response.length;
  var i = -1;
  while (++i < len )
  {
    if (response.charAt(i) == ' ' || response.charAt(i) == '\t') continue; // starting whitespace
    if (response.charAt(i) == '[') break;	// we have an oob starter
    return response;						// there is no oob data
  }
  if ( i == len) return response; // no starter found
  var user = $('#txtUser').val();

  // walk string to find oob data and when ended return rest of string
  var start = 0;
  while (++i < len )
  {
    if (response.charAt(i) == ' ' || response.charAt(i) == ']') // separation
    {
      if (start != 0) // new oob chunk
      {
        var blob = response.slice(start,i);
        start = 0;

        var commandArr = blob.split('=');
        if (commandArr.length == 1) continue;	// failed to split left=right

        var command = commandArr[0]; // left side is command
        var interval = (commandArr.length > 1) ? commandArr[1].trim() : -1; // right side is millisecond count
        if (interval == 0)  /* abort timeout item */
        {
          switch (command){
            case 'alarm':
            window.clearTimeout(alarm);
            alarm = null;
            break;
            case 'callback':
            window.clearTimeout(callback);
            callback = null;
            break;
            case 'loopback':
            window.clearInterval(loopback);
            loopback = null;
            break;
          }
        }
        else if (interval == -1) interval = -1; // do nothing
        else
        {
          var timeoutmsg = {user: user, send: true, message: '[' + command + ' ]'}; // send naked command if timer goes off
          switch (command) {
            case 'alarm':
            alarm = setTimeout(function(){sendMessage(timeoutmsg );}, interval);
            break;
            case 'callback':
            callback = setTimeout(function(){sendMessage(timeoutmsg );}, interval);
            break;
            case 'loopback':
            loopback = setInterval(function(){sendMessage(timeoutmsg );}, interval);
            break;
          }
        }
      } // end new oob chunk
      if (response.charAt(i) == ']') return response.slice(i + 2); // return rest of string, skipping over space after ]
    } // end if
    else if (start == 0) start = i;	// begin new text blob
  } // end while
  return response;	// should never get here
}

function update(text){ // text is  HTML code to append to the 'chat log' div. This appends the input text to the response div
var chatLog = $('#responseHolder').html();
$('#responseHolder').html(chatLog + text);
var rhd = $('#responseHolder');
var h = rhd.get(0).scrollHeight;
rhd.scrollTop(h);
}

function processResponse(response) { // given the final CS text, converts the parsed response from the CS server into HTML code for adding to the response holder div
  var botSaid = '<strong>' + botName + ':</strong> ' + response + "<br>\n";
  update(botSaid);
}

//
//
// // <?php
// /**
//  *
//  * file name: ui.php
//  *
//  * Credits:  This program is derived from a sample client script by Alejandro Gervasio
//  * posted here:  http://www.devshed.com/c/a/PHP/An-Introduction-to-Sockets-in-PHP/
//  * Modified 2012 by R. Wade Schuette
//  * Augmented 2014 by Bruce Wilcox
//  * Refactored 2014 by Dave Morton
//  *
//  * Function -- a working skeleton of a client to the ChatScript Server
//  * NOTES:   Be sure to put in your correct host, port, username, and bot name below!
//  *
//  * LEGAL STUFF:
//  * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal
//  * in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, or sell
//  * copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//  *
//  * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//  *
//  * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
//  * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//  */
// //
// // //  =============  user values ====
// // $host = "ubuntu@ec2-52-78-184-240.ap-northeast-2.compute.amazonaws.com";  //  <<<<<<<<<<<<<<<<< YOUR CHATSCRIPT SERVER IP ADDRESS OR HOST-NAME GOES HERE
// // $port = 1024;          // <<<<<<< your port number if different from 1024
// // $bot  = "harry";       // <<<<<<< desired botname, or "" for default bot
// // //=========================
// //
// // // Please do not change anything below this line.
// // $null = "\x00";
// // $postVars = filter_input_array(INPUT_POST, FILTER_SANITIZE_STRING);
// // extract($postVars);
// //
// // if (isset($send))
// // {
// //     // open client connection to TCP server
// // 	$userip = ($_SERVER['X_FORWARDED_FOR']) ? $_SERVER['X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR']; // get actual ip address of user as his id
// //
// //     $msg = $userip.$null.$bot.$null.$message.$null;
// //
// //     // fifth parameter in fsockopen is timeout in seconds
// //     if(!$fp=fsockopen($host,$port,$errstr,$errno,300))
// //     {
// //         trigger_error('Error opening socket',E_USER_ERROR);
// //     }
// //
// //     // write message to socket server
// //     fputs($fp,$msg);
// //     while (!feof($fp))
// // 	{
// //         $ret .= fgets($fp, 512);
// //     }
// //
// //     // close socket connection
// //     fclose($fp);
// //     exit($ret);
// // }
// //
// //














