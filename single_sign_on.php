<?php
/**
 * Initialize the request
 **/
$method = ($_POST['ajax'] ? 'ajax' : 'post');


/**
 * Setup CCB API Credentials
 * (You will typically want to store these securely, but for the purposes
 * of this demo they are hardcoded here)
 **/
$api_username = 'your_api_username';
$api_password = 'your_api_password';
$ccb_domain = 'https://YOURSUBDOMAIN.ccbchurch.com';


/**
* API Example Via AJAX Request
*
* Use the following example if you wish to handle a single signon using AJAX / jQuery event handlers
 **/
if ($method == 'ajax') {
	// initialize variables
	$username = $_POST['username'];
	$password = $_POST['password'];
	$ajax_response = array();

	// Use the CCB API `individual_profile_from_login_password` to validate the user and get profile information
	// crate a curl object
	$curl = curl_init("{$ccb_domain}/api.php?srv=individual_profile_from_login_password&login={$username}&password={$password}");
	// setup basic options like user/password and return the response to a variable
	curl_setopt($curl, CURLOPT_USERPWD, "{$api_username}:{$api_password}");
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

	// get the xml response and close the connection
	$xml_response = curl_exec($curl);
	curl_close($curl);

	// serialize the xml response into an object for convenience
	$response_object = new SimpleXMLElement($xml_response);
	
	// check that the response returned exactly 1 user (a successful login)
	if ($response_object->response->individuals['count'] == 1) {
		$ajax_response['success'] = true;
	}
	else {
		$ajax_response['success'] = false;
	}

	// perform any additional logic in your own application at this point (perhaps
	// refresh profile data if you're storing that locally, call other APIs, etc)
	
	// generate the JSON response
	echo json_encode($ajax_response);
	exit;
}

/**
* API Example Via POST
*
* Use the following example if you wish to handle single signon using a traditional postback
 **/
else {
	// TODO: Implement a way to establish a session for users via postback
}
