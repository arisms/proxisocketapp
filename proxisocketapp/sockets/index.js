module.exports = function (io) { 

	var request = require('request');
	var client = require( 'socket.io-client' );
	// socket = client.connect('localhost', {
 	//    	port: 3000
	// });

	var serverURL = 'http://social.cs.tut.fi:10001/profiles';
	
	// Create a list of profiles to verify  of connected users
	function Profile(id, username, active) {
		this.id = id;
		this.username = username;
		this.active = active;
	}
	var users = {};

	// Get the list of profiles from the database
	users = getUsers();

	// Whenever a device connects to the socket
	io.on('connection', function(socket){
		console.log('a user connected ' + socket.id);

		// Re-load the list of profiles from the database
		users = getUsers();

		socket.on('connect message', function(msg){
			console.log('user connected: ' + msg.toSource());

			// When a client is connected, add the client to the users list,
			if(users[msg.id] == null) {
				console.log("Adding user to the list...");
				users[msg.id] = socket.id;
			}
			else {
				console.log("User is already in the list.");
			}

			// Show the list of connected users in the console
			for(var i in users){
				console.log('user ' + i + ': ' + users[i]);
			}

		});

		socket.on('chat message', function(msg){
			//console.log('chat message: ' + msg.sender);
			console.log('message: ' + msg );
			io.emit('chat message', msg);	

			io.emit('new chat message', msg);	

			// if(msg === 'add user') {

			//     request({url: 'http://localhost:3000/profiles', json: true}, function(err, res, json) {
			//         if (err) {
			//             throw err;
			//         }
			//         console.log(json);
			//     });
			// }

		});

		socket.on('face2face', function(msg){
			console.log('face2face type: ' + msg.type + ' - ' + Date.now());
			console.log('face2face recipient: ' + msg.recipient );

			// Check if the target user is in the list of connected users
			if(users[msg.recipient] == null) {
				console.log('Recipient is not connected...');
				io.emit('userOffline', "offline");
			}
			else {
				console.log('Recipient is connected.');

				if(msg.type == 'f2fInit') {
				console.log('Emitting message: ' + msg.type );
				io.emit('face2face', msg);
				}
				else if(msg.type == 'f2fStart') {
					console.log('Emitting message: ' + msg.type );
					io.emit('face2face', msg);
				}
				else if(msg.type == 'f2fEnd') {
					console.log('Emitting message: ' + msg.type );
					io.emit('face2face', msg);
				}
			}
		});

		socket.on('from server', function(msg){
			console.log('from server: ' + msg);
		});

		socket.on('likeNotification', function(msg){
			console.log('likeNotification from: ' + msg.senderId + " to: " 
				+ msg.recipientId);

			// Check if the target user is in the list of connected users
			if(users[msg.recipient] == null) {
				console.log('Recipient is not connected...');
				//io.emit('userOffline', "offline");
			}
			else {
				io.emit('chatNotification', msg);
			}

		});

		socket.on('disconnect', function(){
			console.log('user disconnected ' + socket.id + ' - ' + Date.now());
			for(var i in users){
				if(users[i] == socket.id) {
					console.log('Removing user from the list of connected users...');
					delete users[i];
					break;
				}
			}

			// Show the list of connected users in the console
			for(var i in users){
				console.log('user ' + i + ': ' + users[i]);
			}
		});
	});

	function getUsers() {
		var tempUsers = {};

		request({url: serverURL, json: true}, function(err, res, json) {
		    if (err)
		        throw err;
		    else {
		    	for(var i in json) {
		    		// Create a new profile object for every profile on the server
		    		// and add it to the list of users
		    		user = json[i];
		    		tempProfile = new Profile(user._id, user.username, user.active);
		    		tempUsers[tempProfile.id] = tempProfile;
		    	}
			}
		});
		return tempUsers;
	}


}