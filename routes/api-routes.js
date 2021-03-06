var db = require("../models");

module.exports = function(app) {

  app.get("/users/:user", function(req, res) {

    db.user.findAll({
      where:{
        username: req.params.user
      }

    }).then(function(results) {

      res.json(results);
    });

  });

  app.get("/friends/:userid", function(req, res) {

    // find all users that aren't the current user and the current user's friends
    db.user.findAll({
      where: {
        usernameId: {
          $ne: req.params.userid
        }
      }
    }).then(function(results) {

      var userList = results.map( users => users.username );

      // find all friends to render in table
      db.user.findAll({
          where: {
            usernameId: req.params.userid
          }
        })
        .then(function(data) {

      // if user doesn't have any friends, send all user data back
      if (data[0].friends === null) {

        var data = {
          names: userList
        }

            res.json({data})
          
      }
      // else, render user's friends
      else {
        var friendsList = data[0].friends.split(", ");
        var idList = friendsList.map( id => parseInt(id) );

        db.user.findAll({
          where: {
            id: {
              $in: idList
            }
          }
        }).then( function(list){
          
          var friends = list.map( users => users.username );
          var friendsObj = list.map( users => {
            return {
              name: users.username,
              image: users.image,
              loggedIn: users.loggedIn,
              id: users.id
            }

             }
          );

          var nonFriends = userList.filter(function (user) {
            return this.indexOf(user) < 0
          }, friends);

          var data = {
            daty: friends,
            names: nonFriends,
            friendIds: list.map(users => users.id),
            friendsObj: friendsObj
          }
            res.json({data})            

        })
      }


        })

    })
  });



  app.get("/notifications/:userId", function (req ,res) {
    db.notification.findAll({
      where: {
        to: req.params.userId
      }
    }).then(function (results) {
      res.json(results);
    })
  })

   app.post("/notification", function (req ,res) {

    db.notification.create({
      
      user: req.body.user,
      userId: req.body.ids,
      to: req.body.to,
      type: req.body.type,
      groupId: req.body.groupId

      }).then(function (results) {
      res.json(results);
    })
  })

  app.post('/friends/update/:userId', function (req, res) {
    db.user.findAll({
      where: {
        id: req.params.userId
      }
    }).then((results) => {
      // transform string to array
      let data = results[0].dataValues.friends;
      
      if (data && data !== null) {
        let friends = results[0].dataValues.friends.split(', ');
        // add new friend to array
        let newFriend = req.body.friendId.toString();
        if (friends.includes(newFriend)) {
          res.end();
        }
        else {
          friends.push(newFriend);
          // send data back to db as string
          friends = friends.join(', ');

          db.user.update({
            friends: friends
            },
            {
              where: {
                id: req.params.userId
              }
            }).then((data) => {
              res.send('friends updated');
            })
        }
      }
      else {
        let newFriend = req.body.friendId.toString();
        db.user.update({
          friends: newFriend
          },
          {
            where: {
              id: req.params.userId
            }
          }).then((data) => {
            res.send('friends updated');
          })
      }
      
      
      
    })
  })

  app.post('/groups/new/:userid', function (req, res) {
    
    // create new group with group name and owner
    db.group.create({
      user: req.params.userid,
      name: req.body.groupName,
    }).then(results => {
      res.send(results);
    });
  });

  // creates new user-group association record in joined table
  app.post('/groups/members/:userId/:groupId', function (req, res) {

    db.user.findById(req.params.userId).then(user => {
      user.addGroups(req.params.groupId).then(() => {
        res.end();
      })
    });

  })

  app.post('/newgroup/:userId/:groupId', function (req, res) {
    // find user record
    db.user.findAll({
      where: {
        id: req.params.userId
      }
    }).then(results => {
      let data = results[0].groups;
      let newGroup = req.params.groupId.toString();

      // if there are groups, update the string of group ids
      if (data && data !== null) {
        let groups = data.split(', ');
        if (!groups.includes(newGroup)) {
          groups.push(newGroup);
          groups = groups.join(', ');
          db.group.update({
            groups: groups
          }, {
            where: {
              id: req.params.groupId
            }
          }).then(results => {
            res.send('updated groups');
          })
        }
      }
      // else, add first group
      else {
        db.user.update({
          groups: newGroup
        }, {
          where: {
            id: req.params.userId
          }
        }).then(results => {
          res.send('first group added');
        })
      }
    })
  })


  app.delete('/notifications/delete/:id', function (req, res) {
    db.notification.destroy({
      where: {
        id: req.params.id
      }
    }).then((results) => {
      res.send('deleted notification');
    })
  })

   app.put("/delfriend", function(req, res) {


    db.user.findAll({

      where: {

        username: req.body.data.user
      }

    }).then(function(results) {

      var friends = results[0].friends;


      var friendsList = friends.split(", ");


      var number = friendsList.indexOf(req.body.data.friend);

      friendsList.splice(number, 1);

      var newList = friendsList.join(", ");


      db.user.update({

        friends: newList

      }, {
        where: {

          username: req.body.data.user

        }
      })

    });

    res.end();
  });

  app.get("/user/:id", function(req, res) {


    db.user.findOne({
      where:{
        usernameId: req.params.id
      }

    }).then(function(results) {

      res.json(results);
    });

  });

  app.post("/newUser", function(req, res) {


    db.user.create({
      username: req.body.newUser.username,
      usernameId: req.body.newUser.usernameId,
      image: req.body.newUser.image

    }).then(function(results) {


      res.json(results);
    });

  });


      app.get("/chats/:id", function(req, res) {

    db.chat.findAll({

      where:{

        channelId: req.params.id
      }
    }).then(function(results) {

      res.json(results);
    });

  });


        app.post("/addevent", function(req, res) {


    db.event.create({

      name: req.body.data.name,
      type: req.body.data.type,
      person: req.body.data.person,
      groupId: req.body.data.groupId

    }).then(function(results) {

      res.json(results);
    }).catch(function(err){


  });

  });

  // renders all groups for specified user
  app.get("/mygroups/:userId", function(req, res){
    db.user.findById(req.params.userId).then(user => {
      user.getGroups().then((results) => {
        res.send(results);
      })
    });
  });


        app.get('/groupnames/:groupId', function (req, res) {
          db.group.findAll({
            where: {
              id: req.params.groupId
            }
          }).then(results => {
            res.send(results[0].dataValues)
          })
        })

      app.get("/events/:group", function(req, res){


          db.group.findAll({

            where:{

              id: req.params.group
            },
            include:[{model:db.event, include:[db.comment]}]
          }).then(function(results){

            res.json(results)
          })

        });


  app.put("/find/:id", function(req, res) {
    db.user.update({
      loggedIn: true
    }, {
      where: {
        usernameId: req.params.id
      }

    }).then(function(results) {
      res.end();
    });

  });

  app.put("/logout/:id", function(req, res) {
    db.user.update({
      loggedIn: false
    }, {
      where: {
        usernameId: req.params.id
      }

    }).then(function(results) {
      res.end();
    });

  });

  app.post("/comment", function(req, res){

    db.comment.create({

      user: req.body.data.name,
      comment: req.body.data.comment,
      eventId: req.body.data.eventId,

  }).then(function(results){

    res.json(results);
  })
});

  app.get("/comment/:id", function(req, res){

    db.comment.findAll({

      where:{
        eventId: req.params.id
      }
    }).then(function(results){

    res.json(results);
  })
});

  // voting routes
  // upvote route
  app.put('/upvote/:eventId', function (req, res) {
    db.event.findById(req.params.eventId)
            .then(results => {
              let event = results.dataValues;
              // increment votes by 1
              let newVotes = event.votes + 1;
              // store new votes in db
              db.event.update({
                votes: newVotes
              }, {
                where: {
                  id: req.params.eventId
                }
              }).then(data => {
                res.end();
              })
            })
  })
  // downvote route
  app.put('/downvote/:eventId', function (req, res) {
    db.event.findById(req.params.eventId)
            .then(results => {
              let event = results.dataValues;
              // increment votes by 1
              let newVotes = event.votes - 1;
              // store new votes in db
              db.event.update({
                votes: newVotes
              }, {
                where: {
                  id: req.params.eventId
                }
              }).then(data => {
                res.end();
              })
            })
  })


  app.post("/channel", function(req, res){


    db.channel.create({

      name:req.body.daty.name

    }).then(function(results){

      res.json(results);
    })

  })

  app.get("/channels", function(req, res){

    db.channel.findAll({}).then(function(results){

      res.json(results);
    })

  })

  app.get("/image/:id", function(req, res){

    db.user.findAll({
      where:{
        usernameId: req.params.id
      }

    }).then(function(results) {

      res.json(results);
    });

});

  app.put("/deleteMe", function(req, res) {


    db.user.findById(req.body.data.friendId)
    .then(function(results) {

      var friendsList = results.friends.split(", ");

      if(friendsList.length===1){
        newList=null;
      }
      else{     
        var number = friendsList.indexOf(req.body.data.myid);
        friendsList.splice(number, 1);
        var newList = friendsList.join(", ");
      }


      db.user.update({

        friends: newList

      }, {
        where: {

          id: req.body.data.friendId

        }
      }).then(data => {
          res.end();
      });

    });
    

  });

};