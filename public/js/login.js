function login(event){
  //get user inputs
  let uNameText = document.getElementById('uName_login').value
  let pswdText = document.getElementById('pswd_login').value
  if(uNameText===''||pswdText==='') return;

  //create post request json string
  let userRequestObj = {username: uNameText, password: pswdText}
  let userRequestJSON = JSON.stringify(userRequestObj)
  //send a post request for user login
  let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function(event) {
      if (this.readyState == 4 && this.status == 200) {
        console.log("data: " + this.responseText)
        console.log("typeof: " + typeof this.responseText)
        document.getElementById('uName_login').value = ''
        document.getElementById('pswd_login').value = ''

        //we are expecting the response text to be a JSON string
        let responseObj = JSON.parse(this.responseText)
        if(responseObj.role==='admin'){
          //save username to request header for server authentication
          document.cookie = `${responseObj.user}; path=/users`;
          window.location.assign('./users')
        } else if(responseObj.result){
          //save username to request header for server authentication
          document.cookie = `${responseObj.user}; path=/game`;
          window.location.assign('./game')
        } else {
          //inform user of incorrect input
          alert("incorrect username or password")
        }
      }
    }
    xhttp.open("POST", "/login") //API .open(METHOD, URL)
    xhttp.send(userRequestJSON) //API .send(BODY)
}

function createUser(event){
  //get user inputs
  let uNameText = document.getElementById('uName_signup').value
  let pswdText = document.getElementById('pswd_signup').value
  if(uNameText===''||pswdText==='') return;

  //create post request json string
  let userRequestObj = {username: uNameText, password: pswdText}
  let userRequestJSON = JSON.stringify(userRequestObj)
  console.log(userRequestJSON)
  //send a post request for user login
  let xhttp = new XMLHttpRequest()
    xhttp.onreadystatechange = function(event) {
      if (this.readyState == 4 && this.status == 200) {
        console.log("data: " + this.responseText)
        console.log("typeof: " + typeof this.responseText)
        document.getElementById('uName_signup').value = ''
        document.getElementById('pswd_signup').value = ''

        //we are expecting the response text to be a JSON string
        let responseObj = JSON.parse(this.responseText)
        if(responseObj.result) {
          //save username to request header for server authentication
          document.cookie = `${responseObj.user}; path=/game`;
          window.location.assign('./game')
        } else {
          //inform user of incorrect input
          alert("user already exists")
        }
      }
    }
    xhttp.open("POST", "/newUser") //API .open(METHOD, URL)
    xhttp.send(userRequestJSON) //API .send(BODY)
}

document.addEventListener('DOMContentLoaded', function() {
  //add event handler for button click
  document.getElementById('login_btn').addEventListener('click', login)
  document.getElementById('signup_btn').addEventListener('click', createUser)
})