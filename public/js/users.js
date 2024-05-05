var user = document.cookie
function resetCookie(){
    //remove cookie for future server authentications
    document.cookie = `${user}; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/users`
    console.log('deleted cookie for:',user)
}
resetCookie()