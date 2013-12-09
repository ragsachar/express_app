var express = require('express');
var app = express();
var http = require('http');

// Constructor that keeps information that is quried with weather-map server
function cityInfo(key_val)
{
   this.key = key_val;
   this.weather_info_present = 0;
   this.weather_info_data = '';
}
// Constructor that keeps is the call-back data to be passed b/w request and response
function callBack_data(response)
{
   this.response = response;
   // Hash Map that contains the data of the cities
   this.weather_city_maps = {};
}

app.get('/', function(req, res){
  //res.send('Hello World');
  //res.send('hello world');
   try {
  // Pass the response to be filled once we get information from weather-map server
  var cb_data = new callBack_data(res);
  fetch_weather_info(cb_data);
  } catch (err) {
	  console.log("Error in handling request:", err);
  }
});

app.listen(3000);
console.log('Server running at http://127.0.0.1:3000/');

function createInfoNode(map_key, rsp_code, data, cb_data)
{
	var rcvdInfo = new cityInfo(map_key);
	//console.log("value of res code:" + r_code);
	//console.log("value of res data:" + data);
	//If the return code is 200 then add the information to be displayed
	if(rsp_code == 200)
	{
	    rcvdInfo.weather_info_present = 1;
	    rcvdInfo.weather_info_data = data;	
	}
	// Add Entry to the HashMap and check if we are ready to send O/P on console
	add_entry_and_verify_output(rcvdInfo, map_key, cb_data);
}

function ne_cbk(rsp_code, data, cb_data)
{
	// Combination of State:City is the key to hashMap
	map_key = "NEOmaha";
	console.log("value of ne_cbk res code:" + rsp_code);
	createInfoNode(map_key, rsp_code, data, cb_data)
}

function ca_cbk(rsp_code, data, cb_data)
{
	// Combination of State:City is the key to hashMap
	map_key = "CACampbell";
	console.log("value of ca_cbk res code:" + rsp_code);
	createInfoNode(map_key, rsp_code, data, cb_data);
}

function tx_cbk(rsp_code, data, cb_data)
{
	// Combination of State:City is the key to hashMap
	map_key = "TXAustin";
	console.log("value of tx_cbk res code:" + rsp_code);
	createInfoNode(map_key, rsp_code, data, cb_data);
}

function md_cbk(rsp_code, data, cb_data)
{
	// Combination of State:City is the key to hashMap
	map_key = "MDTimonium";
	console.log("value of md_cbk res code:" + rsp_code);
	createInfoNode(map_key, rsp_code, data, cb_data);
}

function fetch_weather_info(cb_data)
{
  	// Send request to the weather server to get weather information of the cities
  	send_weather_info_req('CA', 'Campbell.json', ca_cbk, cb_data);
  	send_weather_info_req('NE', 'Omaha.json', ne_cbk, cb_data);
  	send_weather_info_req('TX', 'Austin.json', tx_cbk, cb_data);
	send_weather_info_req('MD', 'Timonium.json', md_cbk, cb_data);
}


// Variable that indicates the no of city info that application is trying to get the information.
var no_city_info_needed = 4;

// Add Entry to the HashMap and check if we are ready to send O/P on console
function add_entry_and_verify_output(rcvdInfo, map_key, cb_data)
{
	console.log("map value is: " + map_key);
	// Add entry into the hashMap
	cb_data.weather_city_maps[map_key] = rcvdInfo;
	var current_size = Object.keys(cb_data.weather_city_maps).length;
	console.log("current size of hashMap is :" + current_size);

	// check if we have received info from all cities
	if( current_size == no_city_info_needed) 
	{
		// all info received
		buf = '';
		for (var i in cb_data.weather_city_maps)
		{
		    obj = cb_data.weather_city_maps[i];
		    //console.log("Val is :" + obj);
		    if(obj.weather_info_present == 1)
		    {
			console.log("val:" + obj.weather_info_data);
   			buf = buf + obj.weather_info_data;
		    }
		}
		// now put it into the browser
	        if(buf == '')
			cb_data.response.end("No data was available to be displayed\n");
		else
			cb_data.response.end(buf);
	}
}

// API that will send request to fetch the weather info from the weather-map server
function send_weather_info_req(state, city, cbk, cb_data)
{
	// create the URL for the city - 96880698faeefdd8c is the key obtained from the weather server to use the API
	data_string = "http://api.wunderground.com/api/96880698faeefd8c/conditions/q/" + state + "/" + city;

	map_key = state + city;

	// Send the request
	var req = http.request(data_string, function(res) {
		var body = '';
  		console.log('STATUS: ' + res.statusCode);
		
  		res.on('data', function (chunk) {
			body = body + chunk;
  			});

		res.on('end', function() {
			// We have received the response, now lets invoke the callback to collect the data
			cbk(res.statusCode, body, cb_data);
        		});
		});

	req.on('error', function(e) {
  		console.log('problem with request: ' + e.message);
		// Error scenario, now lets invoke the callback to collect the data. return value 400 is used to track this case
			cbk(400, '', cb_data);
		});
	req.end();
}


