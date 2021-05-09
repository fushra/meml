extern crate pest;
#[macro_use]
extern crate pest_derive;

mod parser;

use parser::MemlFile;

fn main() {
    let meml = MemlFile::from_file("./examples/helloWorld.meml")
        .expect("Error loading meml file into memory");
}
