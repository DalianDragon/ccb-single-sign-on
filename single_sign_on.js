// a simple object to organize the client side code
var singleSignOn = {

	// a convenient way to store options inside the scope of this object
	config : {
		username : '',
		password : '',
		domain : '',
		formId : '',
		individual : {}
	},

	// initialize the app
	initialize : function() {
		var self = this;

		// when you submit the login form with user credentials, call submitLoginForm
		$('.form-signin').on('submit', function(e) {
			// prevent the default behavoir of a form post
			e.preventDefault();
			self.submitLoginForm();
		});

		// just some UI helper functionality not having anything specifically to do with single sign-on
		$('#add-form').on('change', function() {
			$('.iframe-type-wrapper').toggle(200);
		});
	},

	// this function is called when you attempt a login
	submitLoginForm : function() {
		var self = this;

		// store config data for easy usage in other functions
		self.config.domain = $('#domain').val();
		self.config.username = $('#username').val();
		self.config.password = $('#password').val();
		self.config.formId = $('#form-id').val();

		// this is the ajax data to validate the credentials
		var postData = {
			'domain' : self.config.domain,
			'username' : self.config.username,
			'password' : self.config.password,
			'ajax' : 1,
			'action' : 'validate_user'
		};

		// clean out any existing form content from previous calls
		$('.container .form-content').empty();

		// make an ajax call and handle the response
		$.post('single_sign_on.php', postData, function(data) {
			// handle a successful response with a successful login
			if (data.success === '1') {
				// store the validated user in the config for convenience and later use
				self.config.individual = data.response.individuals.individual;

				// now we can do a cross-domain form post to create a valid CCB session on its login page
				// create an object with name/value pairs that will correspond to the names/values of the login form
				var elements = {
					'ax' : 'login',
					'form[login]' : self.config.username,
					'form[password]' : self.config.password
				};
				// where we want to post this data
				var postURL = 'https://' + self.config.domain + '.ccbchurch.com/login.php';

				// send it off!
				self.postCrossDomain(postURL, elements, self.afterLogin);
			}
			// handle a successful response with a bad login
			else {
				// the API call works fine, but the credentials were bad
				$('.templates .alert.alert-error').clone().appendTo('.message');
			}
		}, 'json')
		.error(function() {
			// handle errors (such as 500, 302, etc)
		});

	},

	// a simple function that will create a hidden iframe and inject a
	// form for submission. it's used to simulate an ajax call and allows
	// us to post cross-domain
	postCrossDomain : function(postURL, elements, callbackFunction) {

		// initialize a unique timestamp to name and target the iframe
		var ts = new Date().getTime();

		// build an iframe object and bind a callback function for when it's done loading
		var iframe = $('<iframe></iframe>').attr({
			'name' : ts,
			'id' : ts
		}).load(function() {
			callbackFunction();
		});

		// build a form object and target the iframe
		var form = $('<form></form>').attr({
			'action' : postURL,
			'target' : ts,
			'method' : 'post'
		});

		// inject the cross domain iframe and form into the DOM
		$('.container .cross-domain-content').append(iframe).append(form);

		// loop through the form elements and build/inject them into the form
		if (typeof elements === 'object') {
			$.each(elements, function(index, value) {
				form.append('<input type="text" name="' + index + '" value="' + value + '" />');
			});
		}

		// submit the form
		form.submit();
	},

	// a callback function to execute after a successful login
	afterLogin : function() {
		var self = singleSignOn;

		// use this function to perform any additional logic AFTER the user is logged in
		// show a success message
		$('.templates .alert.success').clone().appendTo('.message');
		$('.message .alert.success').append('<a href="https://' + self.config.domain + '.ccbchurch.com/index.php" target="_blank">directly</a>');

		// clean up the iframe and form (no longer needed in the DOM)
		$('.cross-domain-content').empty();

		// if the user wants to test a form, build it
		if ($('#add-form').is(':checked')) {
			self.createLoggedInForm();
		}
	},

	// a function to render a CCB form after the user is logged in with a session
	// the first option is simple, just inject an iframe to the form
	// the second option will scrape the form using curl and render a copy locally, then we'll use the cross domain trick to post it
	createLoggedInForm : function() {
		var self = this;

		// a traditional iframe
		if ($('.iframe-type:checked').val() == 'traditional') {
			var iframe = $('<iframe></iframe>').attr({
				'src' : 'https://' + self.config.domain + '.ccbchurch.com/w_form_response.php?form_id=' + self.config.formId,
				'width' : '100%',
				'height': '800px'
			});
			$('.container .form-content').append(iframe);
		}
		// scrape the CCB form contents and render it locally
		else {

			// ajax data to get the form html
			var postData = {
				'domain' : self.config.domain,
				'form_id' : self.config.formId,
				'ajax' : 1,
				'action' : 'get_form_html'
			};

			// have curl grab the form html for us so we can use it to copy our own
			$.post('single_sign_on.php', postData, function(data) {
				var form = $(data).find('form');

				// cleanup some native form stuff from CCB that's not needed in this example
				form.find('#sharing').remove();
				form.children('.block').remove();
				form.attr('action', '');
				form.find('#same-as-above').parent().remove();

				// append the form to the container
				$('.container .form-content').append(form);

				// prepopulate profile data based on the individual object we saved from earlier
				// some of these may or may not exist in the form you grab, but no errors should be thrown
				$('#form-response-row-name_first').val(self.config.individual.first_name);
				$('#form-response-row-name_last').val(self.config.individual.last_name);
				$('#form-response-row-email').val(self.config.individual.email);
				if (typeof self.config.individual.addresses.address[0] !== 'undefined') {
					$('#form-response-row-mailing_street').val(self.config.individual.addresses.address[0].street_address);
					$('#form-response-row-mailing_city').val(self.config.individual.addresses.address[0].city);
					$('#form-response-row-mailing_state').val(self.config.individual.addresses.address[0].state);
					$('#form-response-row-mailing_zip').val(self.config.individual.addresses.address[0].zip);
				}

				// when you submit the ccb copy of the form, don't actually post it, but rather, use the cross-domain trick to submit
				form.on('submit', function(e) {
					e.preventDefault();
					self.submitCCBForm();
				});

			}, 'html')

		}
	},

	// a handler to serialize the form elements and submit using a hidden cross-domain iframe
	submitCCBForm : function() {
		var self = this;
		var elements = {};
		var form = $('.container .form-content form');

		// get all the elements we need and loop them, building a simple JSON object of name/value pairs
		form.find("input[type='hidden'], input[type='text'], input[type='radio']:checked, input[type=checkbox]:checked, select, textarea").each(function() {
			var name = $(this).attr('name');
			var value = $(this).val();
			elements[name] = value;
		});

		var postURL = 'https://' + self.config.domain + '.ccbchurch.com/w_form_response.php?form_id=' + self.config.formId;

		self.postCrossDomain(postURL, elements, self.afterCCBFormSubmit);

	},

	// a callback after you submit the CCB form
	afterCCBFormSubmit : function() {
		var self = singleSignOn;

		// clean up the iframe and form (no longer needed in the DOM)
		$('.cross-domain-content').empty();

		// cleanup the rendered form and give a little info
		$('.container .form-content').empty().append('<div class="well">You have successfully submitted the CCB form as a logged in user. However we cannot confirm the success of the actual post (based on required fields, etc) so validation needs to be done on this client side to ensure a good submission. If all went well, you should have a matched response.</div>');
	}

};

$(document).ready(function() {
	singleSignOn.initialize();
});
