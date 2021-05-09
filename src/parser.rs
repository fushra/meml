use std::{error::Error, fs, path::PathBuf};

use pest::{
    iterators::{Pair, Pairs},
    Parser,
};

mod types;
use types::*;

#[derive(Parser)]
#[grammar = "meml.pest"]
struct MemlParser;

pub struct MemlFile {
    // Lets keep a record of the file path
    path: Option<PathBuf>,
    // Optionally store the contents of the file
    contents: Option<String>,
    // Parsed contents
    ast: Vec<AstNode>,
}

impl MemlFile {
    //
    pub fn from_string(to_parse: String) -> Result<Self, Box<dyn Error>> {
        // Create the basic struct
        // let mut structure = MemlFile {
        //     path: None,
        //     contents: Some(to_parse.clone()),
        //     parsed: None,
        // };

        // Parse the string that has been passed into the function
        let tokenized = MemlParser::parse(Rule::page, &to_parse)?;

        println!("{}", tokenized);

        let ast = MemlFile::parse(tokenized);

        // Store the parsed output
        // structure.parsed = Some(parsed);

        // Return structure
        // Ok(structure)
        unreachable!()
    }

    // Load a file into memory, and parses it
    pub fn from_file(file: &str) -> Result<Self, Box<dyn Error>> {
        // Lets make this relative to the system root, to save potential trouble and
        // confusion at a later date
        let file = fs::canonicalize(file)?;

        // Then read the contents of the file to a string
        let file_contents = fs::read_to_string(&file)?;

        // Create the structure using the from_str method as it already does a lot
        // of the work for us
        let mut parsed = MemlFile::from_string(file_contents)?;

        // Add the path to the created structure
        parsed.path = Some(file);

        // Return the parsed struct
        Ok(parsed)
    }

    pub fn parse(pairs: Pairs<Rule>) {
        let mut ast = Vec::new();

        for pair in pairs {
            match pair.as_rule() {
                Rule::declaration => ast.push(MemlFile::build_ast_from_expr(pair)),
                _ => println!("Unexpected pair: {}, skipping", pair),
            }
        }
    }

    fn build_ast_from_expr(pair: pest::iterators::Pair<Rule>) -> AstNode {
        match pair.as_rule() {
            Rule::declaration => MemlFile::build_ast_from_expr(pair.into_inner().next().unwrap()),
            Rule::page => MemlFile::build_ast_from_expr(pair.into_inner().next().unwrap()),
            Rule::statement => MemlFile::build_ast_from_expr(pair.into_inner().next().unwrap()),
            Rule::compDecl => {
                let mut pair = pair.into_inner();
                println!("{:#?}", pair);
                todo!()
            }
            Rule::exportDecl => {
                let mut pair = pair.into_inner();
                println!("{:#?}", pair);
                todo!()
            }
            Rule::importStmt => {
                let mut pair = pair.into_inner();
                let destructure = pair.
                println!("{:#?}", pair);
                todo!()
            }
            Rule::memlStmt => {
                let mut pair = pair.into_inner();
                println!("{:#?}", pair);
                todo!()
            }
            Rule::memlProp => {
                todo!()
            }
            Rule::expression => {
                todo!()
            }
            Rule::equality => {
                todo!()
            }
            Rule::comparison => {
                todo!()
            }
            Rule::term => {
                todo!()
            }
            Rule::factor => {
                todo!()
            }
            Rule::unary => {
                todo!()
            }
            Rule::primary => {
                todo!()
            }
            Rule::identifier => {
                todo!()
            }
            Rule::destructure => {
                todo!()
            }
            Rule::open => {
                todo!()
            }
            Rule::close => {
                todo!()
            }
            Rule::STRING => {
                todo!()
            }
            Rule::IDENTIFIER => {
                todo!()
            }
            Rule::STRING_CHAR => {
                todo!()
            }
            Rule::CHARACTER => {
                todo!()
            }
            Rule::GAP => {
                todo!()
            }
        }
    }
}
