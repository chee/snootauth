# snootauth

ssh-based web logins


when you click listen in the browser,
it starts a GET request which makes the server open 
a unix socket that's owned by your user in `/snoot/auth/socks/your-uid.sock`.

there is an ssh server running on port 2424, ([config](https://git.snoot.club/chee/snootauth/-/blob/master/config/sshd))
which has a ForceCommand setting set to a command called [succeed](https://git.snoot.club/chee/snootauth/-/blob/master/succeed/src/main.rs)
that writes the word success to the socket belonging to your user
at which point it immediately exists and says "Thank-you! you can 
return to your browser"

the GET request to listen receives the "success" and returns, 
setting a cookie for you on the snoot you are on

and now there is a file that is [only read-writeable](https://git.snoot.club/chee/snootauth/-/blob/master/own/src/main.rs)
by the snoot whose site the user is trying to log in to
(and the snootauth program, so it can delete or replace them)


so in the snoot's site's server, when you receive a cookie, 
you can check if it matches the cookie in `/snoots/auth/sessions/{their-name}.{my-name}`