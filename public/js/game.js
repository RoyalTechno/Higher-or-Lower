var highScore = 0
var user = document.cookie

function resetCookie(){
    //remove cookie for future server authentications
    document.cookie = `${user}; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/game`
    console.log('deleted cookie for:',user)
}

async function getHighScore(){
    let sendObj = {username: user}
    //request highscore
    let result = await fetch('/getHighScore',{
        method: 'POST',
        mode: 'cors',
        headers:{
            'Content-type': 'application/json'
        },
        body: JSON.stringify(sendObj),
    }).then(res => res.json())
    .catch(error => console.log(error))
    //change highscore
    document.getElementById('highscore').innerText = result.score
    highScore = result.score
}

async function compareToHighscore(curScore){
    if(curScore>highScore){
      let sendObj = {
        username: user,
        score: curScore
      }
      //update highscore in case page closes on a right answer
      fetch('/newHighScore',{
        method: 'POST',
        mode: 'cors',
        headers:{
            'Content-type': 'application/json'
        },
        body: JSON.stringify(sendObj),
      }).then(res => res.json())
      .catch(error => console.log(error))
      //change highscore
      document.getElementById('highscore').innerText = curScore
    }
}

async function correct(curRating){
    //request new song from server
    let newSong = await fetch('/newSong',{
        method: 'POST',
        mode: 'cors',
        headers:{
            'Content-type': 'application/json'
        }
    }).then((res)=> res.json())
      .catch(error => console.log(error))

    //update left img node with animation
    let curSong = document.createElement('img')
    curSong.id = 'curSong'
    curSong.src = document.getElementById('nextSong').src
    let oldCurSong = document.getElementById('curSong')
    oldCurSong.parentNode.replaceChild(curSong,oldCurSong)
    //update left side content
    document.getElementById('track1').innerHTML = document.getElementById('track2').innerHTML
    document.getElementById('rating').innerHTML = `SPOTIFY RATING: ${curRating}`
    document.getElementById('link1').href = document.getElementById('link2').href

    //update right img node with animation
    let nextSong = document.createElement('img')
    nextSong.id = 'nextSong'
    nextSong.src = newSong.src
    let oldNextSong = document.getElementById('nextSong')
    oldNextSong.parentNode.replaceChild(nextSong,oldNextSong)
    //update right side content
    document.getElementById('nextSong').src = newSong.url
    document.getElementById('track2').innerHTML = `NAME: ${newSong.name}`
    document.getElementById('link2').href = newSong.external_url

    //increase score
    let curScore = parseInt(document.getElementById('score').innerText)
    if(curScore!==NaN){
        document.getElementById('score').innerText = curScore+1
        compareToHighscore(curScore+1);
    }
}

function wrong(){
    alert('WRONG CHOICE! Try again :)')
    //send username when reloading page
    document.cookie = `${user}; path=/game`;
    window.location.assign('./game')
}

async function btnCheck(path){
    let result = await fetch(path,{
        method: 'POST',
        mode: 'cors',
        headers : {
            'Content-Type' : 'application/json'
        }
    })
    .then(res => res.json())
    .catch(error => console.log(error))

    if(result.check){
        correct(result.rating)
        return;
    }
    wrong();
}

document.addEventListener('DOMContentLoaded', function() {
    //add event handler for button click
    document.getElementById('upBTN').addEventListener('click', function(){btnCheck('/higher')})
    document.getElementById('downBTN').addEventListener('click', function(){btnCheck('/lower')})
})

resetCookie()
getHighScore()