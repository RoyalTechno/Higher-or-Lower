const sqlite3 = require('sqlite3').verbose() //verbose provides more detailed stack trace
const db = new sqlite3.Database('data/projectData')
const clientID = 'a259a2b17ba54760934b12ff8707a0b0'
const clientSecret = '6d2d54157629411bb8ff26f1259b8e94'

function randomQuery(){
  // A list of all characters that can be chosen.
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  // Gets a random character from the characters string.
  const randomCharacter = characters.charAt(Math.floor(Math.random() * characters.length));
  //return query for songs with the random character
  return `%25${randomCharacter}%25`;
}

function randomOffset(){
  return Math.floor(Math.random() * 1000)
}

exports.users = function(request,response){
  let sqlString = `select users.userid, users.password, highscore.score      
                  from users join highscore on users.userid = highscore.userid;`
  // users.html
  db.all(sqlString, function(err, rows){
    response.render('users', {title : 'Users:', userEntries: rows});
  })
}

exports.createUser = function(request,response){
  let receivedData = ''
  //attached event handlers to collect the message data
  request.on('data', function(chunk) {
    receivedData += chunk
  })
  //event handler for the end of the message
  request.on('end', function() {
    //parse data
    let dataObj = JSON.parse(receivedData)
    console.log("User: ", dataObj.username)
    console.log("Password: ", dataObj.password)

    db.serialize(function() {
      //check that there is no user with that name
      let sqlString1 = "SELECT userid FROM users WHERE userid = '"+dataObj.username+"'"
      db.get(sqlString1, function(err,row){
        if (err) console.log(err);
        else {
        let returnOBJ = {} //object client receives back
        if (row===undefined){
          //create new user and log them in
          let sqlString2 = "INSERT INTO users VALUES ('"+dataObj.username+"', '"+dataObj.password+"','guest')";
          db.run(sqlString2)
          //create user's highscore row
          let sqlString3 = "INSERT INTO highscore VALUES ('"+dataObj.username+"', "+0+")";
          db.run(sqlString3)
          returnOBJ.user = dataObj.username
          returnOBJ.result = true
        } else {
          returnOBJ.result = false
        }
        response.end(JSON.stringify(returnOBJ))
      }
      })
    })
  })
}

exports.authenticate = function(request, response) {
  let receivedData = ''
  //attached event handlers to collect the message data
  request.on('data', function(chunk) {
    receivedData += chunk
  })
  request.on('end', function(){
    var dataOBJ = JSON.parse(receivedData)
    console.log("User: ", dataOBJ.username)
    console.log("Password: ", dataOBJ.password)

    var authorized = false
    //check database users table for user
    db.all("SELECT userid, password, role FROM users", function(err, rows) {
      if (err){ console.log(err); return;}
      let userRole = ''
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].userid == dataOBJ.username & rows[i].password == dataOBJ.password){
          authorized = true
          userRole = rows[i].role
        } 
      }
      let returnOBJ = {role: userRole}
      if (authorized == false) {
        //user or password is not valid
        returnOBJ.result = false;
      } else{
        //send username for authorization using cookies
        returnOBJ.user = dataOBJ.username
        returnOBJ.result = true;
      }
      response.end(JSON.stringify(returnOBJ))
    })
  })
}

exports.getHighScore = function(request, response){
  let receivedData = ''
  //attached event handlers to collect the message data
  request.on('data', function(chunk) {
    receivedData += chunk
  })
  request.on('end', function(){
    var dataOBJ = JSON.parse(receivedData)
    //get score from database
    let sqlStr = "SELECT score FROM highscore WHERE userid = '"+dataOBJ.username+"'"
    db.get(sqlStr,function(err,row){
      if(err) console.log(err)
      else if (row!==undefined){
      //send highscore to client
      response.end(JSON.stringify(row))
    }
    })
  })
}

exports.updateHighScore = function(request, response){
  let receivedData = ''
  //attached event handlers to collect the message data
  request.on('data', function(chunk) {
    receivedData += chunk
  })
  request.on('end', function(){
    var dataOBJ = JSON.parse(receivedData)
    //update score in database
    let sqlStr = "UPDATE highscore SET score = "+dataOBJ.score+" WHERE userid = '"+dataOBJ.username+"'"
    db.run(sqlStr)
    response.end()
  })
}

exports.getToken = async function(){
  //request access token from spotify through POST
  result = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `grant_type=client_credentials&client_id=${clientID}&client_secret=${clientSecret}`,
    cache: "no-cache"
  }).then(function(response){
    return response.json();
  }).catch(error => console.log(error))
  if(result.access_token!==undefined){
    //lasts one hour
    return result.access_token;
  } else{ // try again
    return getToken()
  }
}

exports.getSong = async function(token) {
  try {
    let query = randomQuery()
    let offset = randomOffset()
    
    //create get request for a song
    var res = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&offset=${offset}&limit=1`,{
      method: 'GET',
      headers: { 'Authorization': 'Bearer '+token}
      })
      .then(function(response){ 
        return response.json();
      })
      .catch(error => console.log(error))
    //ensure song object has necessary parameters
    let song = res.tracks.items[0]
    if(song.name!==undefined && song.album.images[0].url!==undefined){
      return song;
    }
  } catch (error) { //get new song if error occurs
    console.log(error)
    return getSong(token);
  }
  
}