use std::path::PathBuf;

pub enum ImportParam {
    Everything,
    Identifiers(Vec<String>),
}

pub enum EqualityOperators {
    Equal,
    NotEqual,
}

pub enum Comparator {
    LessThan,
    GreaterThan,
    LessThanEquals,
    GreaterThanEquals,
}

pub enum TermOperator {
    Add,
    Subtract,
}

pub enum FactorOperator {
    Multiply,
    Divide,
}

pub enum UnaryOperator {
    Negate,
    Invert,
}

pub struct MemlProps {
    name: String,
    value: Option<Box<AstNode>>,
}

pub enum AstNode {
    CompDecl {
        name: String,
        props: Vec<String>,
        statement: Box<AstNode>,
    },
    ExportDecl {
        exports: Vec<String>,
    },
    ImportStmt {
        imports: Option<ImportParam>,
        from: PathBuf,
    },
    MemlStmt {
        name: String,
        props: Vec<MemlProps>,
    },
    Equality {
        left: Box<AstNode>,
        operator: EqualityOperators,
        right: Box<AstNode>,
    },
    Comparison {
        left: Box<AstNode>,
        operator: Comparator,
        right: Box<AstNode>,
    },
    Term {
        left: Box<AstNode>,
        operator: TermOperator,
        right: Box<AstNode>,
    },
    Factor {
        left: Box<AstNode>,
        operator: FactorOperator,
        right: Box<AstNode>,
    },
    Unary {
        operator: UnaryOperator,
        right: Box<AstNode>,
    },
    Null,
    Number(f64),
    String(String),
    Boolean(bool),
}
