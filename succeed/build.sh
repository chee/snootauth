#!/bin/sh
cargo build --release
mv target/release/succeed ../bin
sudo chmod 6711 ../bin/succeed
sudo chown auth:auth ../bin/succeed
