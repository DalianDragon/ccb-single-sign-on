#CCB Single Sign-On Demo
===
###Overview
*A short proof of concept for implementing single sign-on with your CCB solution*

There may be times when making an API call isn't quite enough. You might need to authenticate a user against the CCB solution. You might also wish to seemlessly integrate your users' CCB logins with your own system (avoiding the hassle of synchronizing credentials or having them login with separate accounts).

Following the patterns in this demo you can build a single sign-on interface for your users. You can:

* **Get complete access to their CCB profile**
* **Generate a valid session established in the CCB solution**
* **Avoid redirecting the user**
* **Do it securely**
* **Avoid knowing / storing any usernames or passwords**
* **Have IE6/7/8/9, Firefox, Safari, and Chrome compatibility**

###Setup

This demo includes just a few hard coded references for you to change:

* A CCB solution URL (your CCB solution domain name)
* An API username
* An API password

In `index.htm` find

	var domain = 'https://YOURSUBDOMAIN.ccbchurch.com/';

In `single_sign_on.php` find

	$api_username = 'your_api_username';
	$api_password = 'your_api_password';
	$ccb_domain = 'https://YOURSUBDOMAIN.ccbchurch.com';

Past that, you should be able to use this code *as is* to try it out for yourself.

**One Warning**: It's poor practice to store your API username / password in your code (as I've done in this demo). You might consider encrypting it in either a config file or database.

###Live Demo
Coming soon… In the mean time, here's a screenshot of the demo application…

![Screenshot](http://i.imgur.com/lnI8ggn.png "Screenshot")

###Final Notes
I was going to also implement a version that uses a traditional postback but ran out of time. If you need help with that implementation let me know and I can give you some pointers. (I assume most people will want the AJAX version anyway).

Licensed under GNU General v2.

Have fun!

~Jared Cobb