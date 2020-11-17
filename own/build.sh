#!/bin/sh
cargo build --release
mv target/release/own ../bin
sudo chmod 4750 ../bin/own
sudo chown root:snootauth ../bin/own
