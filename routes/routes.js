
var async = require('async');
var passwordHash = require('password-hash');

// get login screen
var getLogin = function(req, res) {
	console.log('Rohan Alur (ralur)');
	res.render('login.ejs', {
		user : null,
		message : null,
		result : null
	});
};

// create new user account
var createAccount = function(req, res) {
	var name = req.body.fullName;
	var email = req.body.email;
	var password = req.body.password1;
	var password2 = req.body.password2;
	var affiliation = req.body.affilation;
	var day = req.body.day;
	var month = req.body.month;
	var year = req.body.year;
	var hashedPassword = passwordHash.generate(password);

	db.addUser(email, name, hashedPassword, affiliation, "empty", month + "-" + day + "-" + year, function(error) {
		if (error) {
			log_out(req, res);
		}
		else {
			req.session.email = email;
			getFeed(req, res);
		}
	});

};
// get newsfeed
var getFeed = function(req, res) {
	if (req.session && req.session.email) {
		db.getUserInfo(req.session.email, function(error, response) {
			if (error || !response) {
				log_out(req, res);
			}
			else {
				res.render('feed.ejs', {userEmail: req.session.email, userName: response.name});
			}

		});
	}
	else {
		log_out(req, res);
	}
};

// get newsfeed posts
var getFeedPosts = function(req, res) {
	if (req.session && req.session.email) {
		var userEmail = req.session.email;
		db.updateTimestamp(userEmail);
		var data = {userEmail: userEmail};
		var afterGettingPostsPerFriends = function(err, relatedPosts){
			if(err || relatedPosts == null){
				res.send(err, 200);
			}
			else{
				var posts = [];
				async.each(relatedPosts, function(item, callback) {
					var thisPost = item.attrs;

						// gets the names of the users who wrote/received each post
						// gets comments and commentor names for each post
						db.getUserInfo(thisPost.from, function(error, userInfo) {
							if (userInfo) {
								thisPost.fromName = userInfo.name;
								db.getUserInfo(thisPost.to, function(error, userInfo1) {
									if (userInfo1) {
										thisPost.toName = userInfo1.name;
										db.getRelatedComments(thisPost.key, function(error, response) {
											if (!error && response) {
												thisPost.comments = response;
											}
											posts.push(thisPost);
											callback();
										});

									}
									else {
										callback();
									}
								});
							}
							else{
								callback();
							}
						});
					}, function(err){
						data.posts = posts;
						data.posts.sort(function(post1, post2) {
							var date1 = new Date(post1.createdAt);
							var date2 = new Date(post2.createdAt);
							return -(date1 - date2);
						});
						data.friendsEmails = req.session.friendsEmails;
						for (var i = data.posts.length - 1; i >= 1; i--) {
							var post1 = data.posts[i];
							var post2 = data.posts[i-1];
							if (post1.key == post2.key ) {
								data.posts.splice(i, 1);
							}
							else if (post1.from == post2.to && post1.content == 'friendship' && post2.content == 'friendship') {
								data.posts.splice(i, 1);
							}
						}
						res.send(data, 200);
					});
}
};	
var afterGettingFriends = function(err, emails){
	if(err || emails == null){
		res.send(err, 200);
	}
	else{
		var friendsEmails = {};
		var posts = [];

		async.each(emails, function(email, callback) {
			friendsEmails[email] = email;
			db.getPosts(email, email, 30, function(err, data) {
				data.toPosts.forEach(function(post) {
					posts.push(post);
				});
				data.fromPosts.forEach(function(post1) {
					posts.push(post1);
				});
				callback();
			});
		},
		function(err) {
			req.session.friendsEmails = friendsEmails;
			afterGettingPostsPerFriends(null, posts);
		});

	}
};
db.getFriendEmails(userEmail, afterGettingFriends);	
}
else {
		log_out(req, res); // user is not logged userInfo
	}
};

// ensure password matches username
var checkPass = function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	if (email && password) {
		db.getUserInfo(email, function(error, userInfo) {
			if (error || !userInfo) {
				res.send('the username and password you entered did not match our records', 200);
			}
			else {
				var dbHashedPassword = userInfo.hashedPassword;
				if (passwordHash.verify(password, dbHashedPassword)) {
					req.session.email = email;
					db.logIn(email, function(error, response) {
						if (error || !response) {
							res.send('error logging in', 200);
						}
						else {
							res.send(null, 200);
						}
					});
				}
				else {
					res.send('the username and password you entered did not match our records', 200);
				}
			}
		});
	}
	else {
		res.send('The email and password you entered did not match', 200);
	}
};
// logs out the current user
var log_out = function(req, res) {
	db.logOut(req.session.username, function(error, response) {
		req.session.username = null;
		req.session.friendsEmails = null;
		res.redirect('/');
	});
};
// gets a user profile based on the profileEmail parameter in the get request
var getProfile = function(req, res) {
	if (req.session && req.session.email) {
		var profileEmail;
		if (req.query['email']) {
			profileEmail = req.query['email']
		}
		else {
			profileEmail = req.session.email;
		}
		res.render('profile.ejs', {userEmail: req.session.email, profileEmail: profileEmail});
	}
	else {
		log_out(req, res);
	}
};

// Retrieves a list of wall posts for the email parameter in the post request
var getWall = function(req, res) {
	var email = req.body.email;
	db.updateTimestamp(req.session.email);
	db.getUserInfo(email, function(error, userInfo) {
		if (error || !userInfo) {
			res.send(null, 200);
		}
		else {
			var profileInfo = {name: userInfo.name, affiliation: userInfo.affiliation, email: userInfo.email, birthday: userInfo.birthday, interests: userInfo.interests};
			// gets posts
			db.getPosts(null, email, 30, function(error, posts) {
				if (error || !posts) {
					res.send(null, 200);
				}
				else {
					var data = {profileInfo: profileInfo, postList: [], friendList: [], // requested user data
						friendsEmails: req.session.friendsEmails, loggedInUser: req.session.email}; // logged in user data

						async.each(posts.toPosts, function(item, callback) {
							var thisPost = item.attrs;
							thisPost.toName = profileInfo.name;
						// gets the names of the users who wrote/received each post
						db.getUserInfo(thisPost.from, function(error, userInfo) {

							if (userInfo) {
								thisPost.fromName = userInfo.name;
							}
							db.getRelatedComments(thisPost.key, function(error, response) {
								if (!error && response) {
									thisPost.comments = response;
								}
								data.postList.push(thisPost);
								callback();
							});
						});
					},
					function(err) {
						if (!err) {
							// Gets a list of friends 
							db.getFriendInfo(email, function(error, response) {
								if (error || !response) {
									res.send(null, 200);
								}
								else {
									response.forEach(function(item) {
										delete item.hashedPassword; // do not send friend passwords to client
										data.friendList.push(item);
									});
									data.postList.sort(function(post1, post2) {
										var date1 = new Date(post1.createdAt);
										var date2 = new Date(post2.createdAt);
										return -(date1 - date2);
									});
									// remove duplicates
									for (var i = data.postList.length - 1; i >= 1; i--) {
										var post1 = data.postList[i];
										var post2 = data.postList[i-1];
										if (post1.key == post2.key ) {
											data.postList.splice(i, 1);
										}
										// remove duplicate friendship notifications
										else if (post1.from == post2.to && post1.content == 'friendship' && post2.content == 'friendship') {
											data.postList.splice(i, 1);
										}
									}
									res.send(data, 200);
								}
							});
						}
						else {
							res.send(null, 200);
						}
					}
					);
}
});
}
});

};
// Queries database to return autcomplete suggestions
var getFriendSuggestions = function(req, res) {
	var query = req.query['text'];
	query = query.toLowerCase();
	db.getFriendSugg(query, function(error, data) {
		if (error || !data) {
			res.send([], 200);
		}
		else {
			var names = [];
			data.forEach(function(item) {
				names.push(item.name);
			});
			res.send(names, 200);
		}
	});
};

// Adds a new post to the database
var addPost = function(req, res) {
	var fromEmail = req.body.fromEmail;
	var toEmail = req.body.toEmail;
	var messageContent = req.body.messageContent;
	var fromName;
	var toName;
	db.getUserInfo(fromEmail, function(error, data) {
		if(error || !data)
			res.send(null, 200);
		else {
			db.getUserInfo(toEmail, function(error, data1) {
				if (error || !data1)
					res.send(null, 200);
				else {
					fromName = data.name;
					toName = data1.name;
					res.send({fromName: fromName, toName: toName}, 200);
				}
			})
		}
	});
	db.putPost(fromEmail, toEmail, messageContent, function(error) {
		if (error)
			console.log(error);
	});
};

// creates a new friendship
var createFriendship = function(req, res) {
	var email1 = req.body.email1;
	var email2 = req.body.email2;
	db.makeFriendship(email1, email2, function(error) {
		if (error) {
			res.send(error, 200);
		}
		else {
			db.putPost(email1, email2, "friendship", function(error1){
				if (error1) {
					res.send(error1, 200);
				}
				else {
					db.putPost(email2, email1, "friendship", function(err) {
						if (err) {
							res.send(err, 200);
						}
						else {
							req.session.friendsEmails[email2] = email2;
							res.send(null, 200);
						}
					});	
				}
			});
		}
	});
};

// looks up users for a given search query
var userLookup = function(req, res) {
	var name = req.body.search.toLowerCase();
	var suggestions = [];
	db.getFriendSugg(name, function(error, info) {
		if (error || !info) {
			getFeed(req, res);
		}
		else {
			info.forEach(function(item) {
				suggestions.push({name: item.name, email: item.email});
			});
		}
		res.render('search.ejs', {
			results: suggestions
		});
	});
};

// removes friend from cookie list when friend is removed on client side
var removeFriendFromList = function(req, res) {
	var friend = req.body.friend;
	req.session.friendsEmails[friend] = null;
	res.send(null, 200);
};

// removes friendship from database
var deleteFriendship = function(req, res) {
	var friend1 = req.body.friend1;
	var friend2 = req.body.friend2;
	db.deleteFriendship(friend1, friend2, function(error) {
		if (error) {
			res.send('failed to delete friendship', 200);
		}
		else {
			db.deletePost(friend1, friend2, 'friendship', function(error1) {
				if (error1) {
					res.send('failed to delete friendship', 200);
				}
				else {
					res.send(null, 200);
				}
			});
		}
	});
};

// adds a comment to a post
var addComment = function(req, res) {
	var postKey = req.body.postKey;
	var commentorEmail = req.body.commentorEmail;
	var content = req.body.comment;
	db.getUserInfo(commentorEmail, function(error, response) {
		if (error || !response) {
			res.send(null, 200);
		}
		else {
			db.addComment(postKey, response.name, commentorEmail, content, function(error1) {
				res.send(error1, 200);
			});
		}
	});
	
};

// gets friends of friends for onclick event in visualizer
var getFriends = function(req, res) {
	var friend = req.params.user;
	db.getFriendEmails(friend, function(err, response) {
		if (err || !response) {
			res.send(null);
		}
		else {
			console.log(friend);
			req.body.email = friend;
			friendVisualization(req, res);
		}
	});	
};

// renders the visualizer page
var renderVisualizer = function(req, res) {
	if (req.session.email) {
		res.render('friendvisualizer.ejs', {});
	}
	else {
		log_out(req, res);
	}
};

// gets edges from user to friends and edges between friends of user
var friendVisualization = function(req, res) {
	var user = req.session.email; 
	if (req.body && req.body.email) { // route was called onclick of a friend node
		user = req.body.email;
	}
	// else route was called because the user is looking at their immediate network
	if (user) {
		db.getFriendEmails(user, function(err, response) {
			if (err || !response) {
				res.send(null);
			}
			else {
				// central node
				var object = {id: user, name: user, children: [], data: {}};
				async.each(response, function(item, callback) {
					db.getFriendEmails(item, function(error, response1) {
						if (error || !response) {
							console.log('error: ' + error);	
						}
						else {
							var thisFriend = {id: item, name: item, data: {}, children: []};

							response1.forEach(function(friend) {
								response.forEach(function(friend1) { // check to see if friend of friend is also friend of user
									if (friend1 == friend) {
										var friendOfFriend = {id: friend, name: friend, data: {}, children: []};
										thisFriend.children.push(friendOfFriend);
									}
								});

							});
							object.children.push(thisFriend);
						}
						callback();
					});
				},
				function(err) {
					if (!err) {
						res.send(JSON.stringify(object), 200);
					}
					else {
						res.send(err, 200);
					}
				}
				);
			}
		});
}
else {
	log_out(req, res);
}
};	

// get friend recommendations
var getFriendRecs = function(req, res){
	var user = req.session.email;
	if (user) {
		db.getRecs(user, function(error, response) {
			if (error || !response) {
				res.render('recommendations.ejs', {result: []});
			}
			else if (response.recommendations) {

				var recommendations = JSON.parse(response.recommendations);
				var result = [];
				db.getFriendEmails(user, function(error, friendEmails) {
					if (error || !friendEmails) {
						res.render('recommendations.ejs', {result: []});
					}
					else {
						async.each(recommendations, function(rec, callback) {
							db.getUserInfo(rec, function(err, response1) {
								if (err || ! response1) {
									res.render('recommendations.ejs', {result: []});
								}
								else {
									var alreadyFriends = false; // don't include recommendations for existing friends
									friendEmails.forEach(function(friend) {
										if (friend == response1.email) {
											alreadyFriends = true;
										}
									});
									if (!alreadyFriends && response1.email != req.session.email) {
										var friendRec = {name: response1.name, email: response1.email};
										result.push(friendRec);
									}
								}
								callback();
							});
						},
						function(err) {
							if (err) {
								res.render('recommendations.ejs', {result: []});
							}
							else {
								res.render('recommendations.ejs', {result: result});
							}
						});
					}
				});
			}
			else {
				res.render('recommendations.ejs', {result: []});
			}
		});
			}
			else {
				log_out(req, res);
			}
		}

		var routes = {
			check_pass : checkPass,
			get_login : getLogin,
			get_createaccount : createAccount,
			logout: log_out,
			get_profile: getProfile,
			get_Wall: getWall,
			get_Friend_Suggestions: getFriendSuggestions,
			addPost: addPost,
			getFeed: getFeed,
			getFeedPosts: getFeedPosts,
			createFriendship: createFriendship,
			deleteFriendship: deleteFriendship,
			userLookup: userLookup,
			removeFriendFromList: removeFriendFromList,
			addComment: addComment,
			getFriends: getFriends,
			friendVisualization: friendVisualization,
			renderVisualizer: renderVisualizer,
			getFriendRecs: getFriendRecs
		};

		module.exports = routes;
