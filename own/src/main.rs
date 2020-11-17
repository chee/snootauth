use nix::unistd::{chown, User, Group};
use std::env;
use std::fs::File;
use std::os::unix::fs::PermissionsExt;
use std::path::PathBuf;

fn main() -> std::io::Result<()> {
    let args: Vec<String> = env::args().collect();
    let snoot = args.get(1).expect("own <snoot> <scope>");
    let scope = args.get(2).expect("own <snoot> <scope>");
    let scope_user = User::from_name(scope).expect("no scope").expect("hoohoo");
    let auth_group = Group::from_name("snootauth").expect("there should be a unix group called snootauth").expect("hoohoo");

    let path = PathBuf::from(format!("/snoots/auth/sessions/{}.{}", snoot, scope));
    let file = File::open(&path)?;
    let metadata = file.metadata()?;
    let mut permissions = metadata.permissions();
    permissions.set_mode(0o400);
    chown(&path, Some(scope_user.uid), Some(auth_group.gid)).expect("cloudnt set files permission");

    Ok(())
}
