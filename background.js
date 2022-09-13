/*
if (chrome) browser = chrome;

var CLIENT_ID = '132591198195-gu38m8sej7jakqml0ect91rvtltthesi.apps.googleusercontent.com';
var API_KEY = 'AIzaSyASXRfXBTxiIOWwvFH7jhUmz4vaF0wgQXk';

const DISCOVERY_DOCS = ['https://people.googleapis.com/$discovery/rest'];
const SPREADSHEET_ID = '1G_IYlkPrNOtRktNgXn3_MJHSToC_aAuuEreG3l1si-4';
const SPREADSHEET_TAB_NAME = "main";

function onGAPILoad() {
	gapi.client.init({
		// Don't pass client nor scope as these will init auth2, which we don't want
		// clientId: CLIENT_ID,
		// scope: SCOPES,
		apiKey: API_KEY,
		discoveryDocs: DISCOVERY_DOCS,
	}).then(function () {
		console.log('gapi initialized')
	}, function (error) {
		console.log('error', error)
	});
}

chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		// Get token
		chrome.identity.getAuthToken({ interactive: true }, function (token) {
			// Set token in GAPI library
			gapi.auth.setToken({
				'access_token': token,
			});

			const body = {
				values: [[
					new Date(), // Timestamp
					request.title, // Page title
					request.url, // Page URl
				]]
			};

			// Append values
			gapi.client.sheets.spreadsheets.values.append({
				spreadsheetId: SPREADSHEET_ID,
				range: SPREADSHEET_TAB_NAME,
				valueInputOption: 'USER_ENTERED',
				resource: body
			}).then((response) => {
				console.log(`${response.result.updates.updatedCells} cells appended.`)
				sendResponse({ success: true });
			});
		})

		// Wait for response
		return true;
	}
);
*/

let log = [];
chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		console.log(request, sender);
		if (request.command == "print_popup") {
			log.push(request.text);
		}
		if (request.command == "load_log") {
			sendResponse(log.join("\n"));
		}
		return true;
	}
);