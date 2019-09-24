use nix::unistd::Uid;
use std::io::Write;
use std::os::unix::net::UnixStream;

fn main() {
    // this is the user's REAL uid (not the suid uid)
    let uid = Uid::current();
    let path = format!("/snoots/auth/socks/{}.sock", uid);

    if let Ok(mut sock) = UnixStream::connect(&path) {
        if let Ok(_) = sock.write(b"success") {
            println!("Thank-you! You can return to your browser now.");
            std::process::exit(0)
        }
    }

    println!("Couldn't write to socket. Have you started a session on auth.snoot.club?");
    std::process::exit(1);
}
