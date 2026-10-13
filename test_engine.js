// CBSE IP MySQL In-Browser Engine Prototype & Test Suite

function tokUpper(tok) {
  return (tok && typeof tok.value === "string") ? tok.value.toUpperCase() : "";
}

function tokIs(tok, str) {
  return tokUpper(tok) === str.toUpperCase();
}

function formatTokensText(tokens) {
  let text = "";
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    const prev = tokens[i - 1];
    if (i > 0 && t.value !== "(" && t.value !== ")" && t.value !== "," && t.value !== "." && prev?.value !== "." && prev?.value !== "(") {
      text += " ";
    }
    text += (t.raw !== undefined ? t.raw : t.value);
  }
  return text;
}

class SQLEngine {
  constructor(storageAdapter = null) {
    this.storage = storageAdapter || new MemoryStorageAdapter();
    this.activeDb = null;
    this.init();
  }

  init() {
    const data = this.storage.load();
    if (!data || !data.databases || Object.keys(data.databases).length === 0) {
      this.resetToDefault();
    } else {
      this.databases = data.databases;
      this.activeDb = data.activeDb || "school_db";
    }
  }

  resetToDefault() {
    this.databases = {
      information_schema: { tables: {} },
      performance_schema: { tables: {} },
      school_db: {
        tables: {
          student: {
            columns: [
              { name: "roll_no", type: "INT", isPrimary: true, notNull: true, default: null },
              { name: "name", type: "VARCHAR(50)", isPrimary: false, notNull: true, default: null },
              { name: "gender", type: "CHAR(1)", isPrimary: false, notNull: false, default: null },
              { name: "stream", type: "VARCHAR(20)", isPrimary: false, notNull: false, default: null },
              { name: "marks", type: "DECIMAL(5,2)", isPrimary: false, notNull: false, default: null },
              { name: "dob", type: "DATE", isPrimary: false, notNull: false, default: null }
            ],
            rows: [
              { roll_no: 1, name: "Rohit Sharma", gender: "M", stream: "Science", marks: 92.50, dob: "2007-04-15" },
              { roll_no: 2, name: "Priya Verma", gender: "F", stream: "Commerce", marks: 88.00, dob: "2006-11-20" },
              { roll_no: 3, name: "Aman Gupta", gender: "M", stream: "Humanities", marks: 76.50, dob: "2007-01-10" },
              { roll_no: 4, name: "Ananya Sen", gender: "F", stream: "Science", marks: 95.00, dob: "2006-08-05" },
              { roll_no: 5, name: "Kavita Rao", gender: "F", stream: "Commerce", marks: 84.00, dob: "2007-09-12" },
              { roll_no: 6, name: "Deepak Kumar", gender: "M", stream: "Science", marks: 67.50, dob: "2006-12-30" },
              { roll_no: 7, name: "Simran Kaur", gender: "F", stream: "Humanities", marks: 91.00, dob: "2007-02-18" },
              { roll_no: 8, name: "Vikas Yadav", gender: "M", stream: "Commerce", marks: null, dob: "2006-07-25" }
            ]
          },
          marks: {
            columns: [
              { name: "roll_no", type: "INT", isPrimary: false, notNull: true, default: null },
              { name: "subject", type: "VARCHAR(30)", isPrimary: false, notNull: true, default: null },
              { name: "theory", type: "INT", isPrimary: false, notNull: false, default: null },
              { name: "practical", type: "INT", isPrimary: false, notNull: false, default: null },
              { name: "grade", type: "CHAR(1)", isPrimary: false, notNull: false, default: null }
            ],
            rows: [
              { roll_no: 1, subject: "Informatics Practices", theory: 65, practical: 29, grade: "A" },
              { roll_no: 1, subject: "Physics", theory: 60, practical: 28, grade: "A" },
              { roll_no: 2, subject: "Informatics Practices", theory: 58, practical: 27, grade: "B" },
              { roll_no: 2, subject: "Accountancy", theory: 62, practical: 29, grade: "A" },
              { roll_no: 3, subject: "History", theory: 55, practical: 20, grade: "B" },
              { roll_no: 4, subject: "Informatics Practices", theory: 68, practical: 30, grade: "A" },
              { roll_no: 4, subject: "Chemistry", theory: 64, practical: 29, grade: "A" },
              { roll_no: 5, subject: "Economics", theory: 59, practical: 26, grade: "B" },
              { roll_no: 6, subject: "Informatics Practices", theory: 45, practical: 22, grade: "C" },
              { roll_no: 7, subject: "Political Science", theory: 63, practical: 28, grade: "A" }
            ]
          },
          employee: {
            columns: [
              { name: "emp_id", type: "INT", isPrimary: true, notNull: true, default: null },
              { name: "emp_name", type: "VARCHAR(50)", isPrimary: false, notNull: true, default: null },
              { name: "department", type: "VARCHAR(30)", isPrimary: false, notNull: false, default: null },
              { name: "salary", type: "DECIMAL(10,2)", isPrimary: false, notNull: false, default: null },
              { name: "commission", type: "DECIMAL(8,2)", isPrimary: false, notNull: false, default: null },
              { name: "hire_date", type: "DATE", isPrimary: false, notNull: false, default: null }
            ],
            rows: [
              { emp_id: 101, emp_name: "Sunil Mehra", department: "Sales", salary: 45000.00, commission: 3000.00, hire_date: "2020-03-15" },
              { emp_id: 102, emp_name: "Pooja Bhatia", department: "IT", salary: 65000.00, commission: 5000.00, hire_date: "2019-07-01" },
              { emp_id: 103, emp_name: "Rajesh Khanna", department: "HR", salary: 38000.00, commission: null, hire_date: "2021-01-10" },
              { emp_id: 104, emp_name: "Meenakshi Iyer", department: "IT", salary: 72000.00, commission: 6000.00, hire_date: "2018-11-20" },
              { emp_id: 105, emp_name: "Arun Nair", department: "Sales", salary: 42000.00, commission: 2500.00, hire_date: "2022-05-14" },
              { emp_id: 106, emp_name: "Divya Patel", department: "Finance", salary: 58000.00, commission: 4000.00, hire_date: "2020-09-08" },
              { emp_id: 107, emp_name: "Sanjay Verma", department: "HR", salary: 36000.00, commission: null, hire_date: "2023-02-01" }
            ]
          }
        }
      },
      company_db: {
        tables: {
          dept: {
            columns: [
              { name: "dept_no", type: "INT", isPrimary: true, notNull: true, default: null },
              { name: "dept_name", type: "VARCHAR(30)", isPrimary: false, notNull: true, default: null },
              { name: "loc", type: "VARCHAR(30)", isPrimary: false, notNull: false, default: null }
            ],
            rows: [
              { dept_no: 10, dept_name: "Accounts", loc: "Delhi" },
              { dept_no: 20, dept_name: "Research", loc: "Mumbai" },
              { dept_no: 30, dept_name: "Sales", loc: "Bengaluru" },
              { dept_no: 40, dept_name: "Operations", loc: "Chennai" }
            ]
          }
        }
      }
    };
    this.activeDb = "school_db";
    this.save();
  }

  save() {
    this.storage.save({
      databases: this.databases,
      activeDb: this.activeDb
    });
  }

  tokenize(sql) {
    const tokens = [];
    let i = 0;
    const len = sql.length;

    while (i < len) {
      const ch = sql[i];

      // Whitespace
      if (/\s/.test(ch)) {
        i++;
        continue;
      }

      // Comments: -- or # or /* */
      if (ch === '-' && sql[i + 1] === '-') {
        i += 2;
        while (i < len && sql[i] !== '\n' && sql[i] !== '\r') i++;
        continue;
      }
      if (ch === '#') {
        i++;
        while (i < len && sql[i] !== '\n' && sql[i] !== '\r') i++;
        continue;
      }
      if (ch === '/' && sql[i + 1] === '*') {
        i += 2;
        while (i < len && !(sql[i] === '*' && sql[i + 1] === '/')) i++;
        i += 2;
        continue;
      }

      // Strings ('...' or "...")
      if (ch === "'" || ch === '"') {
        const quote = ch;
        let str = "";
        i++;
        while (i < len) {
          if (sql[i] === '\\' && i + 1 < len) {
            str += sql[i + 1];
            i += 2;
          } else if (sql[i] === quote) {
            if (sql[i + 1] === quote) {
              str += quote;
              i += 2;
            } else {
              i++;
              break;
            }
          } else {
            str += sql[i];
            i++;
          }
        }
        tokens.push({ type: "STRING", value: str, upper: str.toUpperCase(), raw: quote + str + quote });
        continue;
      }

      // Backtick identifier `name`
      if (ch === '`') {
        let ident = "";
        i++;
        while (i < len && sql[i] !== '`') {
          ident += sql[i];
          i++;
        }
        i++;
        tokens.push({ type: "IDENTIFIER", value: ident, upper: ident.toUpperCase(), raw: '`' + ident + '`' });
        continue;
      }

      // Numbers
      if (/\d/.test(ch) || (ch === '.' && /\d/.test(sql[i + 1] || ''))) {
        let numStr = "";
        let hasDot = false;
        while (i < len && (/\d/.test(sql[i]) || (sql[i] === '.' && !hasDot))) {
          if (sql[i] === '.') hasDot = true;
          numStr += sql[i];
          i++;
        }
        tokens.push({ type: "NUMBER", value: parseFloat(numStr), upper: "", raw: numStr });
        continue;
      }

      // Multi-char operators: <=, >=, <>, !=
      const twoChar = sql.substr(i, 2);
      if (["<=", ">=", "<>", "!="].includes(twoChar)) {
        tokens.push({ type: "OPERATOR", value: twoChar, upper: twoChar, raw: twoChar });
        i += 2;
        continue;
      }

      // Single-char operators and punctuation
      if (["=", "<", ">", "+", "-", "*", "/", "%"].includes(ch)) {
        tokens.push({ type: "OPERATOR", value: ch, upper: ch, raw: ch });
        i++;
        continue;
      }

      if (["(", ")", ",", ".", ";"].includes(ch)) {
        tokens.push({ type: "PUNCTUATION", value: ch, upper: ch, raw: ch });
        i++;
        continue;
      }

      // Identifiers & Keywords
      if (/[a-zA-Z_]/.test(ch)) {
        let word = "";
        while (i < len && /[a-zA-Z0-9_$]/.test(sql[i])) {
          word += sql[i];
          i++;
        }
        const upper = word.toUpperCase();
        if (SQL_KEYWORDS.has(upper)) {
          tokens.push({ type: "KEYWORD", value: upper, upper, raw: word });
        } else {
          tokens.push({ type: "IDENTIFIER", value: word, upper, raw: word });
        }
        continue;
      }

      tokens.push({ type: "UNKNOWN", value: ch, upper: ch, raw: ch });
      i++;
    }

    tokens.push({ type: "EOF", value: "", upper: "", raw: "" });
    return tokens;
  }

  splitStatements(sql) {
    const tokens = this.tokenize(sql);
    const statements = [];
    let currentTokens = [];

    for (const tok of tokens) {
      if (tok.type === "EOF") {
        if (currentTokens.length > 0) statements.push(currentTokens);
        break;
      }
      if (tok.type === "PUNCTUATION" && tok.value === ";") {
        if (currentTokens.length > 0) {
          statements.push(currentTokens);
          currentTokens = [];
        }
      } else {
        currentTokens.push(tok);
      }
    }
    return statements;
  }

  execute(rawSql) {
    const trimmed = rawSql.trim();
    if (!trimmed) return [{ type: "EMPTY" }];

    const lower = trimmed.toLowerCase();
    if (lower === "clear" || lower === "cls") {
      return [{ type: "CLEAR" }];
    }
    if (lower === "\\c") {
      return [{ type: "ABORT" }];
    }
    if (lower === "status" || lower === "\\s" || lower === "status;") {
      return [this.handleStatus()];
    }
    if (lower === "help" || lower === "\\h" || lower === "help;" || lower === "?") {
      return [this.handleHelp()];
    }
    if (lower === "reset database" || lower === "reset database;" || lower === "reset;") {
      this.resetToDefault();
      return [{
        type: "MESSAGE",
        message: "Query OK, database reset to default CBSE sample datasets (school_db active)."
      }];
    }

    const statements = this.splitStatements(rawSql);
    if (statements.length === 0) return [{ type: "EMPTY" }];

    const results = [];
    for (const stmtTokens of statements) {
      const startTime = Date.now();
      try {
        const res = this.executeStatement(stmtTokens);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        res.duration = duration;
        results.push(res);
      } catch (err) {
        results.push({
          type: "ERROR",
          message: err.message || String(err)
        });
      }
    }
    this.save();
    return results;
  }

  executeStatement(tokens) {
    if (tokens.length === 0) return { type: "EMPTY" };

    const first = tokens[0];
    const firstUpper = tokUpper(first);

    if (firstUpper === "SHOW") return this.handleShow(tokens);
    if (firstUpper === "USE") return this.handleUse(tokens);
    if (firstUpper === "CREATE") return this.handleCreate(tokens);
    if (firstUpper === "DROP") return this.handleDrop(tokens);
    if (firstUpper === "DESC" || firstUpper === "DESCRIBE" || firstUpper === "EXPLAIN") return this.handleDescribe(tokens);
    if (firstUpper === "ALTER") return this.handleAlter(tokens);
    if (firstUpper === "INSERT") return this.handleInsert(tokens);
    if (firstUpper === "UPDATE") return this.handleUpdate(tokens);
    if (firstUpper === "DELETE") return this.handleDelete(tokens);
    if (firstUpper === "SELECT") return this.handleSelect(tokens);

    throw new Error(`ERROR 1064 (42000): You have an error in your SQL syntax near '${first.value}'`);
  }

  // --- DDL Handlers ---
  handleShow(tokens) {
    if (tokens.length < 2) {
      throw new Error("ERROR 1064 (42000): You have an error in your SQL syntax near 'SHOW'");
    }
    const secondUpper = tokUpper(tokens[1]);
    if (secondUpper === "DATABASES") {
      const dbs = Object.keys(this.databases).sort();
      return {
        type: "TABLE",
        columns: ["Database"],
        rows: dbs.map(d => ({ Database: d }))
      };
    }
    if (secondUpper === "TABLES") {
      let targetDb = this.activeDb;
      if (tokens.length >= 4 && (tokIs(tokens[2], "FROM") || tokIs(tokens[2], "IN"))) {
        targetDb = tokens[3].value;
      }
      if (!targetDb) {
        throw new Error("ERROR 1046 (3D000): No database selected");
      }
      const dbMatch = Object.keys(this.databases).find(d => d.toLowerCase() === targetDb.toLowerCase());
      if (!dbMatch) {
        throw new Error(`ERROR 1049 (42000): Unknown database '${targetDb}'`);
      }
      const colName = `Tables_in_${dbMatch}`;
      const tbls = Object.keys(this.databases[dbMatch].tables).sort();
      return {
        type: "TABLE",
        columns: [colName],
        rows: tbls.map(t => ({ [colName]: t }))
      };
    }
    throw new Error(`ERROR 1064 (42000): You have an error in your SQL syntax near '${tokens[1].value}'`);
  }

  handleUse(tokens) {
    if (tokens.length < 2) {
      throw new Error("ERROR 1064 (42000): You have an error in your SQL syntax near 'USE'");
    }
    const dbName = tokens[1].value;
    const match = Object.keys(this.databases).find(d => d.toLowerCase() === dbName.toLowerCase());
    if (!match) {
      throw new Error(`ERROR 1049 (42000): Unknown database '${dbName}'`);
    }
    this.activeDb = match;
    return {
      type: "MESSAGE",
      message: "Database changed"
    };
  }

  handleCreate(tokens) {
    if (tokens.length < 3) {
      throw new Error("ERROR 1064 (42000): You have an error in your SQL syntax near 'CREATE'");
    }
    let idx = 1;
    const kind = tokUpper(tokens[idx++]);

    if (kind === "DATABASE" || kind === "SCHEMA") {
      let ifNotExists = false;
      if (tokIs(tokens[idx], "IF") && tokIs(tokens[idx + 1], "NOT") && tokIs(tokens[idx + 2], "EXISTS")) {
        ifNotExists = true;
        idx += 3;
      }
      if (!tokens[idx]) throw new Error("ERROR 1064 (42000): Missing database name");
      const dbName = tokens[idx].value;
      const existing = Object.keys(this.databases).find(d => d.toLowerCase() === dbName.toLowerCase());
      if (existing) {
        if (ifNotExists) {
          return { type: "MESSAGE", message: "Query OK, 1 row affected, 1 warning (0.00 sec)" };
        }
        throw new Error(`ERROR 1007 (HY000): Can't create database '${dbName}'; database exists`);
      }
      this.databases[dbName] = { tables: {} };
      return { type: "MESSAGE", message: "Query OK, 1 row affected (0.01 sec)" };
    }

    if (kind === "TABLE") {
      let ifNotExists = false;
      if (tokIs(tokens[idx], "IF") && tokIs(tokens[idx + 1], "NOT") && tokIs(tokens[idx + 2], "EXISTS")) {
        ifNotExists = true;
        idx += 3;
      }
      if (!tokens[idx]) throw new Error("ERROR 1064 (42000): Missing table name");
      let targetDbName = this.activeDb;
      let tableName = tokens[idx++].value;
      if (idx < tokens.length && tokens[idx].value === ".") {
        idx++;
        targetDbName = tableName;
        tableName = tokens[idx++].value;
      }
      if (!targetDbName) throw new Error("ERROR 1046 (3D000): No database selected");
      const dbMatch = Object.keys(this.databases).find(d => d.toLowerCase() === targetDbName.toLowerCase());
      if (!dbMatch) throw new Error(`ERROR 1049 (42000): Unknown database '${targetDbName}'`);
      const db = this.databases[dbMatch];
      const existing = Object.keys(db.tables).find(t => t.toLowerCase() === tableName.toLowerCase());
      if (existing) {
        if (ifNotExists) {
          return { type: "MESSAGE", message: "Query OK, 0 rows affected, 1 warning (0.00 sec)" };
        }
        throw new Error(`ERROR 1050 (42S01): Table '${tableName}' already exists`);
      }

      if (!tokens[idx] || tokens[idx].value !== "(") {
        throw new Error("ERROR 1064 (42000): Expected '(' in CREATE TABLE");
      }
      idx++;

      const columns = [];
      const primaryKeys = [];

      while (idx < tokens.length && tokens[idx].value !== ")") {
        const itemTok = tokens[idx];
        const itemUpper = tokUpper(itemTok);

        if (itemUpper === "PRIMARY" && tokIs(tokens[idx + 1], "KEY")) {
          idx += 2;
          if (tokens[idx]?.value !== "(") throw new Error("ERROR 1064 (42000): Expected '(' after PRIMARY KEY");
          idx++;
          while (idx < tokens.length && tokens[idx].value !== ")") {
            primaryKeys.push(tokens[idx].value);
            idx++;
            if (tokens[idx]?.value === ",") idx++;
          }
          if (tokens[idx]?.value === ")") idx++;
        } else if (itemUpper === "CHECK" || (itemUpper === "UNIQUE" && tokens[idx + 1]?.value === "(")) {
          while (idx < tokens.length && tokens[idx].value !== "," && tokens[idx].value !== ")") idx++;
        } else {
          const colName = tokens[idx++].value;
          let colType = "";
          if (idx < tokens.length && tokens[idx].type !== "PUNCTUATION") {
            colType = tokens[idx++].value;
            if (tokens[idx]?.value === "(") {
              colType += "(";
              idx++;
              while (idx < tokens.length && tokens[idx].value !== ")") {
                colType += tokens[idx++].value;
              }
              if (tokens[idx]?.value === ")") {
                colType += ")";
                idx++;
              }
            }
          }

          let isPrimary = false;
          let notNull = false;
          let defaultVal = null;

          while (idx < tokens.length && tokens[idx].value !== "," && tokens[idx].value !== ")") {
            const cUpper = tokUpper(tokens[idx]);
            if (cUpper === "PRIMARY" && tokIs(tokens[idx + 1], "KEY")) {
              isPrimary = true;
              notNull = true;
              idx += 2;
            } else if (cUpper === "NOT" && tokIs(tokens[idx + 1], "NULL")) {
              notNull = true;
              idx += 2;
            } else if (cUpper === "NULL") {
              notNull = false;
              idx++;
            } else if (cUpper === "UNIQUE") {
              idx++;
            } else if (cUpper === "DEFAULT") {
              idx++;
              if (tokens[idx]) {
                defaultVal = tokens[idx].value;
                idx++;
              }
            } else if (cUpper === "CHECK") {
              idx++;
              if (tokens[idx]?.value === "(") {
                let depth = 1;
                idx++;
                while (idx < tokens.length && depth > 0) {
                  if (tokens[idx].value === "(") depth++;
                  else if (tokens[idx].value === ")") depth--;
                  idx++;
                }
              }
            } else {
              idx++;
            }
          }

          columns.push({
            name: colName,
            type: colType.toUpperCase(),
            isPrimary,
            notNull,
            default: defaultVal
          });
        }

        if (tokens[idx]?.value === ",") idx++;
      }

      for (const pk of primaryKeys) {
        const col = columns.find(c => c.name.toLowerCase() === pk.toLowerCase());
        if (col) {
          col.isPrimary = true;
          col.notNull = true;
        }
      }

      db.tables[tableName] = { columns, rows: [] };
      return { type: "MESSAGE", message: "Query OK, 0 rows affected (0.01 sec)" };
    }

    throw new Error(`ERROR 1064 (42000): You have an error in your SQL syntax near '${kind}'`);
  }

  handleDrop(tokens) {
    if (tokens.length < 3) throw new Error("ERROR 1064 (42000): You have an error in your SQL syntax near 'DROP'");
    let idx = 1;
    const kind = tokUpper(tokens[idx++]);

    if (kind === "DATABASE" || kind === "SCHEMA") {
      let ifExists = false;
      if (tokIs(tokens[idx], "IF") && tokIs(tokens[idx + 1], "EXISTS")) {
        ifExists = true;
        idx += 2;
      }
      if (!tokens[idx]) throw new Error("ERROR 1064 (42000): Missing database name");
      const dbName = tokens[idx].value;
      const match = Object.keys(this.databases).find(d => d.toLowerCase() === dbName.toLowerCase());
      if (!match) {
        if (ifExists) return { type: "MESSAGE", message: "Query OK, 0 rows affected, 1 warning (0.00 sec)" };
        throw new Error(`ERROR 1008 (HY000): Can't drop database '${dbName}'; database doesn't exist`);
      }
      delete this.databases[match];
      if (this.activeDb === match) this.activeDb = null;
      return { type: "MESSAGE", message: "Query OK, 0 rows affected (0.01 sec)" };
    }

    if (kind === "TABLE") {
      let ifExists = false;
      if (tokIs(tokens[idx], "IF") && tokIs(tokens[idx + 1], "EXISTS")) {
        ifExists = true;
        idx += 2;
      }
      if (!tokens[idx]) throw new Error("ERROR 1064 (42000): Missing table name");
      let targetDbName = this.activeDb;
      let tableName = tokens[idx].value;
      if (idx + 2 < tokens.length && tokens[idx + 1].value === ".") {
        targetDbName = tokens[idx].value;
        tableName = tokens[idx + 2].value;
        idx += 2;
      }
      idx++;
      if (!targetDbName) throw new Error("ERROR 1046 (3D000): No database selected");
      const dbMatch = Object.keys(this.databases).find(d => d.toLowerCase() === targetDbName.toLowerCase());
      if (!dbMatch) {
        if (ifExists) return { type: "MESSAGE", message: "Query OK, 0 rows affected, 1 warning (0.00 sec)" };
        throw new Error(`ERROR 1049 (42000): Unknown database '${targetDbName}'`);
      }
      const db = this.databases[dbMatch];
      const match = Object.keys(db.tables).find(t => t.toLowerCase() === tableName.toLowerCase());
      if (!match) {
        if (ifExists) return { type: "MESSAGE", message: "Query OK, 0 rows affected, 1 warning (0.00 sec)" };
        throw new Error(`ERROR 1051 (42S02): Unknown table '${dbMatch}.${tableName}'`);
      }
      delete db.tables[match];
      return { type: "MESSAGE", message: "Query OK, 0 rows affected (0.01 sec)" };
    }

    throw new Error(`ERROR 1064 (42000): You have an error in your SQL syntax near '${kind}'`);
  }

  handleDescribe(tokens) {
    if (tokens.length < 2) throw new Error("ERROR 1064 (42000): Missing table name in DESCRIBE");
    let targetDbName = this.activeDb;
    let tableName = tokens[1].value;
    if (tokens.length >= 4 && tokens[2].value === ".") {
      targetDbName = tokens[1].value;
      tableName = tokens[3].value;
    }
    if (!targetDbName) throw new Error("ERROR 1046 (3D000): No database selected");
    const dbMatch = Object.keys(this.databases).find(d => d.toLowerCase() === targetDbName.toLowerCase());
    if (!dbMatch) throw new Error(`ERROR 1049 (42000): Unknown database '${targetDbName}'`);
    const db = this.databases[dbMatch];
    const match = Object.keys(db.tables).find(t => t.toLowerCase() === tableName.toLowerCase());
    if (!match) throw new Error(`ERROR 1146 (42S02): Table '${dbMatch}.${tableName}' doesn't exist`);
    const table = db.tables[match];
    const rows = table.columns.map(col => ({
      Field: col.name,
      Type: col.type.toLowerCase(),
      Null: col.notNull ? "NO" : "YES",
      Key: col.isPrimary ? "PRI" : "",
      Default: col.default !== null && col.default !== undefined ? String(col.default) : "NULL",
      Extra: col.extra || ""
    }));

    return {
      type: "TABLE",
      columns: ["Field", "Type", "Null", "Key", "Default", "Extra"],
      rows
    };
  }

  handleAlter(tokens) {
    if (tokens.length < 4 || !tokIs(tokens[1], "TABLE")) {
      throw new Error("ERROR 1064 (42000): Syntax error in ALTER TABLE");
    }
    let targetDbName = this.activeDb;
    let tableName = tokens[2].value;
    let idx = 3;
    if (idx < tokens.length && tokens[idx].value === ".") {
      idx++;
      targetDbName = tableName;
      tableName = tokens[idx++].value;
    }
    if (!targetDbName) throw new Error("ERROR 1046 (3D000): No database selected");
    const dbMatch = Object.keys(this.databases).find(d => d.toLowerCase() === targetDbName.toLowerCase());
    if (!dbMatch) throw new Error(`ERROR 1049 (42000): Unknown database '${targetDbName}'`);
    const db = this.databases[dbMatch];
    const match = Object.keys(db.tables).find(t => t.toLowerCase() === tableName.toLowerCase());
    if (!match) throw new Error(`ERROR 1146 (42S02): Table '${dbMatch}.${tableName}' doesn't exist`);
    const table = db.tables[match];

    const action = tokUpper(tokens[idx++]);

    if (action === "ADD") {
      if (tokIs(tokens[idx], "COLUMN")) idx++;
      if (!tokens[idx]) throw new Error("ERROR 1064 (42000): Missing column name in ALTER TABLE ADD");
      const colName = tokens[idx++].value;
      let colType = "";
      if (tokens[idx]) {
        colType = tokens[idx++].value;
        if (tokens[idx]?.value === "(") {
          colType += "(";
          idx++;
          while (idx < tokens.length && tokens[idx].value !== ")") colType += tokens[idx++].value;
          if (tokens[idx]?.value === ")") { colType += ")"; idx++; }
        }
      }
      table.columns.push({
        name: colName,
        type: colType.toUpperCase(),
        isPrimary: false,
        notNull: false,
        default: null
      });
      for (const row of table.rows) row[colName] = null;
      return { type: "MESSAGE", message: "Query OK, 0 rows affected (0.02 sec)\nRecords: 0  Duplicates: 0  Warnings: 0" };
    }

    if (action === "DROP") {
      if (tokIs(tokens[idx], "COLUMN")) idx++;
      if (!tokens[idx]) throw new Error("ERROR 1064 (42000): Missing column name in ALTER TABLE DROP");
      const colName = tokens[idx++].value;
      const cIdx = table.columns.findIndex(c => c.name.toLowerCase() === colName.toLowerCase());
      if (cIdx === -1) throw new Error(`ERROR 1091 (42000): Can't DROP '${colName}'; check that column/key exists`);
      const actualName = table.columns[cIdx].name;
      table.columns.splice(cIdx, 1);
      for (const row of table.rows) delete row[actualName];
      return { type: "MESSAGE", message: "Query OK, 0 rows affected (0.02 sec)\nRecords: 0  Duplicates: 0  Warnings: 0" };
    }

    if (action === "MODIFY") {
      if (tokIs(tokens[idx], "COLUMN")) idx++;
      if (!tokens[idx]) throw new Error("ERROR 1064 (42000): Missing column name in ALTER TABLE MODIFY");
      const colName = tokens[idx++].value;
      const col = table.columns.find(c => c.name.toLowerCase() === colName.toLowerCase());
      if (!col) throw new Error(`ERROR 1054 (42S22): Unknown column '${colName}' in '${tableName}'`);
      let colType = "";
      if (tokens[idx]) {
        colType = tokens[idx++].value;
        if (tokens[idx]?.value === "(") {
          colType += "(";
          idx++;
          while (idx < tokens.length && tokens[idx].value !== ")") colType += tokens[idx++].value;
          if (tokens[idx]?.value === ")") { colType += ")"; idx++; }
        }
      }
      col.type = colType.toUpperCase();
      return { type: "MESSAGE", message: "Query OK, 0 rows affected (0.02 sec)\nRecords: 0  Duplicates: 0  Warnings: 0" };
    }

    if (action === "CHANGE") {
      if (tokIs(tokens[idx], "COLUMN")) idx++;
      const oldColName = tokens[idx++].value;
      const col = table.columns.find(c => c.name.toLowerCase() === oldColName.toLowerCase());
      if (!col) throw new Error(`ERROR 1054 (42S22): Unknown column '${oldColName}' in '${tableName}'`);
      const newColName = tokens[idx++].value;
      let colType = "";
      if (tokens[idx]) {
        colType = tokens[idx++].value;
        if (tokens[idx]?.value === "(") {
          colType += "(";
          idx++;
          while (idx < tokens.length && tokens[idx].value !== ")") colType += tokens[idx++].value;
          if (tokens[idx]?.value === ")") { colType += ")"; idx++; }
        }
      }
      const prevName = col.name;
      col.name = newColName;
      if (colType) col.type = colType.toUpperCase();
      for (const row of table.rows) {
        row[newColName] = row[prevName];
        if (newColName !== prevName) delete row[prevName];
      }
      return { type: "MESSAGE", message: "Query OK, 0 rows affected (0.02 sec)\nRecords: 0  Duplicates: 0  Warnings: 0" };
    }

    throw new Error(`ERROR 1064 (42000): Unsupported ALTER TABLE action '${action}'`);
  }

  handleInsert(tokens) {
    let idx = 1;
    if (tokIs(tokens[idx], "INTO")) idx++;
    if (!tokens[idx]) throw new Error("ERROR 1064 (42000): Missing table name in INSERT");
    let targetDbName = this.activeDb;
    let tableName = tokens[idx++].value;
    if (idx < tokens.length && tokens[idx].value === ".") {
      idx++;
      targetDbName = tableName;
      tableName = tokens[idx++].value;
    }
    if (!targetDbName) throw new Error("ERROR 1046 (3D000): No database selected");
    const dbMatch = Object.keys(this.databases).find(d => d.toLowerCase() === targetDbName.toLowerCase());
    if (!dbMatch) throw new Error(`ERROR 1049 (42000): Unknown database '${targetDbName}'`);
    const db = this.databases[dbMatch];
    const match = Object.keys(db.tables).find(t => t.toLowerCase() === tableName.toLowerCase());
    if (!match) throw new Error(`ERROR 1146 (42S02): Table '${dbMatch}.${tableName}' doesn't exist`);
    const table = db.tables[match];

    let targetCols = null;
    if (tokens[idx]?.value === "(") {
      targetCols = [];
      idx++;
      while (idx < tokens.length && tokens[idx].value !== ")") {
        targetCols.push(tokens[idx].value);
        idx++;
        if (tokens[idx]?.value === ",") idx++;
      }
      if (tokens[idx]?.value === ")") idx++;
    }

    if (!tokIs(tokens[idx], "VALUES")) {
      throw new Error("ERROR 1064 (42000): Expected VALUES in INSERT");
    }
    idx++;

    const rowsToInsert = [];
    while (idx < tokens.length) {
      if (tokens[idx].value !== "(") {
        throw new Error(`ERROR 1064 (42000): Expected '(' before values row near '${tokens[idx].value}'`);
      }
      idx++;
      const valTokens = [];
      let depth = 1;
      while (idx < tokens.length && depth > 0) {
        if (tokens[idx].value === "(") depth++;
        else if (tokens[idx].value === ")") depth--;
        if (depth > 0) {
          valTokens.push(tokens[idx]);
          idx++;
        }
      }
      idx++;

      const expressions = [];
      let cur = [];
      let d = 0;
      for (const t of valTokens) {
        if (t.value === "(") d++;
        else if (t.value === ")") d--;
        if (d === 0 && t.value === ",") {
          expressions.push(cur);
          cur = [];
        } else {
          cur.push(t);
        }
      }
      if (cur.length > 0) expressions.push(cur);

      const rowValues = expressions.map(exprTokens => this.evaluateScalarExpr(exprTokens, null));
      rowsToInsert.push(rowValues);

      if (tokens[idx]?.value === ",") idx++;
      else break;
    }

    let insertedCount = 0;
    for (const values of rowsToInsert) {
      const newRow = {};
      const colsToUse = targetCols || table.columns.map(c => c.name);

      if (values.length !== colsToUse.length) {
        throw new Error(`ERROR 1136 (21S01): Column count doesn't match value count at row ${insertedCount + 1}`);
      }

      for (const col of table.columns) {
        newRow[col.name] = col.default;
      }

      for (let i = 0; i < colsToUse.length; i++) {
        const cName = colsToUse[i];
        const colDef = table.columns.find(c => c.name.toLowerCase() === cName.toLowerCase());
        if (!colDef) {
          throw new Error(`ERROR 1054 (42S22): Unknown column '${cName}' in 'field list'`);
        }
        newRow[colDef.name] = values[i];
      }

      for (const colDef of table.columns) {
        const val = newRow[colDef.name];
        if (colDef.notNull && (val === null || val === undefined)) {
          throw new Error(`ERROR 1048 (23000): Column '${colDef.name}' cannot be null`);
        }
        if (colDef.isPrimary) {
          const duplicate = table.rows.find(r => r[colDef.name] === val);
          if (duplicate) {
            throw new Error(`ERROR 1062 (23000): Duplicate entry '${val}' for key '${match}.PRIMARY'`);
          }
        }
      }

      table.rows.push(newRow);
      insertedCount++;
    }

    return {
      type: "MESSAGE",
      message: `Query OK, ${insertedCount} ${insertedCount === 1 ? "row" : "rows"} affected (0.01 sec)`
    };
  }

  handleUpdate(tokens) {
    let idx = 1;
    let targetDbName = this.activeDb;
    let tableName = tokens[idx++].value;
    if (idx < tokens.length && tokens[idx].value === ".") {
      idx++;
      targetDbName = tableName;
      tableName = tokens[idx++].value;
    }
    if (!targetDbName) throw new Error("ERROR 1046 (3D000): No database selected");
    const dbMatch = Object.keys(this.databases).find(d => d.toLowerCase() === targetDbName.toLowerCase());
    if (!dbMatch) throw new Error(`ERROR 1049 (42000): Unknown database '${targetDbName}'`);
    const db = this.databases[dbMatch];
    const match = Object.keys(db.tables).find(t => t.toLowerCase() === tableName.toLowerCase());
    if (!match) throw new Error(`ERROR 1146 (42S02): Table '${dbMatch}.${tableName}' doesn't exist`);
    const table = db.tables[match];

    if (!tokIs(tokens[idx], "SET")) {
      throw new Error("ERROR 1064 (42000): Expected SET in UPDATE");
    }
    idx++;

    const assignments = [];
    let whereTokens = null;

    while (idx < tokens.length && !tokIs(tokens[idx], "WHERE")) {
      const colName = tokens[idx++].value;
      if (tokens[idx]?.value !== "=") throw new Error("ERROR 1064 (42000): Expected '=' in SET assignment");
      idx++;
      const valExpr = [];
      while (idx < tokens.length && tokens[idx].value !== "," && !tokIs(tokens[idx], "WHERE")) {
        valExpr.push(tokens[idx++]);
      }
      assignments.push({ colName, valExpr });
      if (tokens[idx]?.value === ",") idx++;
    }

    if (tokIs(tokens[idx], "WHERE")) {
      idx++;
      whereTokens = tokens.slice(idx);
    }

    let matched = 0;
    let changed = 0;

    for (const row of table.rows) {
      let satisfies = true;
      if (whereTokens && whereTokens.length > 0) {
        satisfies = Boolean(this.evaluateScalarExpr(whereTokens, row));
      }

      if (satisfies) {
        matched++;
        let rowChanged = false;
        for (const assign of assignments) {
          const colDef = table.columns.find(c => c.name.toLowerCase() === assign.colName.toLowerCase());
          if (!colDef) throw new Error(`ERROR 1054 (42S22): Unknown column '${assign.colName}' in 'field list'`);
          const newVal = this.evaluateScalarExpr(assign.valExpr, row);
          if (row[colDef.name] !== newVal) {
            row[colDef.name] = newVal;
            rowChanged = true;
          }
        }
        if (rowChanged) changed++;
      }
    }

    return {
      type: "MESSAGE",
      message: `Query OK, ${changed} ${changed === 1 ? "row" : "rows"} affected (0.01 sec)\nRows matched: ${matched}  Changed: ${changed}  Warnings: 0`
    };
  }

  handleDelete(tokens) {
    let idx = 1;
    if (tokIs(tokens[idx], "FROM")) idx++;
    let targetDbName = this.activeDb;
    let tableName = tokens[idx++].value;
    if (idx < tokens.length && tokens[idx].value === ".") {
      idx++;
      targetDbName = tableName;
      tableName = tokens[idx++].value;
    }
    if (!targetDbName) throw new Error("ERROR 1046 (3D000): No database selected");
    const dbMatch = Object.keys(this.databases).find(d => d.toLowerCase() === targetDbName.toLowerCase());
    if (!dbMatch) throw new Error(`ERROR 1049 (42000): Unknown database '${targetDbName}'`);
    const db = this.databases[dbMatch];
    const match = Object.keys(db.tables).find(t => t.toLowerCase() === tableName.toLowerCase());
    if (!match) throw new Error(`ERROR 1146 (42S02): Table '${dbMatch}.${tableName}' doesn't exist`);
    const table = db.tables[match];

    let whereTokens = null;
    if (tokIs(tokens[idx], "WHERE")) {
      idx++;
      whereTokens = tokens.slice(idx);
    }

    const initialCount = table.rows.length;
    if (!whereTokens || whereTokens.length === 0) {
      table.rows = [];
      return {
        type: "MESSAGE",
        message: `Query OK, ${initialCount} ${initialCount === 1 ? "row" : "rows"} affected (0.01 sec)`
      };
    }

    table.rows = table.rows.filter(row => {
      const satisfies = Boolean(this.evaluateScalarExpr(whereTokens, row));
      return !satisfies;
    });

    const deleted = initialCount - table.rows.length;
    return {
      type: "MESSAGE",
      message: `Query OK, ${deleted} ${deleted === 1 ? "row" : "rows"} affected (0.01 sec)`
    };
  }

  // --- SELECT Execution ---
  handleSelect(tokens) {
    let idx = 1;
    let distinct = false;
    if (tokIs(tokens[idx], "DISTINCT")) {
      distinct = true;
      idx++;
    }

    const projectionTokens = [];
    while (idx < tokens.length && !tokIs(tokens[idx], "FROM")) {
      projectionTokens.push(tokens[idx++]);
    }

    const projections = this.splitTopLevel(projectionTokens, ",");
    const parsedProjections = projections.map(pTokens => this.parseProjection(pTokens));

    let fromSources = [];
    let whereTokens = null;
    let groupByTokens = null;
    let havingTokens = null;
    let orderByTokens = null;

    if (tokIs(tokens[idx], "FROM")) {
      idx++;
      const fromTokens = [];
      while (
        idx < tokens.length &&
        !["WHERE", "GROUP", "HAVING", "ORDER", "LIMIT"].includes(tokUpper(tokens[idx]))
      ) {
        fromTokens.push(tokens[idx++]);
      }
      fromSources = this.parseFromClause(fromTokens);
    }

    if (tokIs(tokens[idx], "WHERE")) {
      idx++;
      const wTokens = [];
      while (
        idx < tokens.length &&
        !["GROUP", "HAVING", "ORDER", "LIMIT"].includes(tokUpper(tokens[idx]))
      ) {
        wTokens.push(tokens[idx++]);
      }
      whereTokens = wTokens;
    }

    if (tokIs(tokens[idx], "GROUP") && tokIs(tokens[idx + 1], "BY")) {
      idx += 2;
      const gTokens = [];
      while (
        idx < tokens.length &&
        !["HAVING", "ORDER", "LIMIT"].includes(tokUpper(tokens[idx]))
      ) {
        gTokens.push(tokens[idx++]);
      }
      groupByTokens = gTokens;
    }

    if (tokIs(tokens[idx], "HAVING")) {
      idx++;
      const hTokens = [];
      while (
        idx < tokens.length &&
        !["ORDER", "LIMIT"].includes(tokUpper(tokens[idx]))
      ) {
        hTokens.push(tokens[idx++]);
      }
      havingTokens = hTokens;
    }

    if (tokIs(tokens[idx], "ORDER") && tokIs(tokens[idx + 1], "BY")) {
      idx += 2;
      const oTokens = [];
      while (idx < tokens.length && !tokIs(tokens[idx], "LIMIT")) {
        oTokens.push(tokens[idx++]);
      }
      orderByTokens = oTokens;
    }

    let rows = [];
    if (fromSources.length === 0) {
      rows = [{}];
    } else {
      rows = this.evaluateFromClause(fromSources);
    }

    if (whereTokens && whereTokens.length > 0) {
      rows = rows.filter(row => {
        const cond = this.evaluateScalarExpr(whereTokens, row);
        return Boolean(cond);
      });
    }

    const hasAggregatesInProj = parsedProjections.some(p => this.containsAggregate(p.tokens));
    const isGrouped = Boolean(groupByTokens) || hasAggregatesInProj;

    let outputRows = [];
    let outputColHeaders = [];

    if (isGrouped) {
      const groups = new Map();
      const groupExprs = groupByTokens ? this.splitTopLevel(groupByTokens, ",") : [];

      if (groupExprs.length === 0) {
        groups.set("__ALL__", rows);
      } else {
        for (const row of rows) {
          const keyParts = groupExprs.map(ge => String(this.evaluateScalarExpr(ge, row)));
          const key = keyParts.join("___###___");
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key).push(row);
        }
      }

      for (const [key, groupRows] of groups.entries()) {
        if (havingTokens && havingTokens.length > 0) {
          const pass = this.evaluateHavingExpr(havingTokens, groupRows);
          if (!pass) continue;
        }

        const outRow = {};
        for (const proj of parsedProjections) {
          const val = this.evaluateGroupProjection(proj.tokens, groupRows);
          outRow[proj.alias] = val;
        }
        outputRows.push(outRow);
      }
      outputColHeaders = parsedProjections.map(p => p.alias);
    } else {
      const finalProjections = [];
      for (const proj of parsedProjections) {
        if (proj.tokens.length === 1 && proj.tokens[0].value === "*") {
          if (fromSources.length === 0) {
            finalProjections.push(proj);
          } else {
            for (const src of fromSources) {
              for (const col of src.table.columns) {
                finalProjections.push({
                  alias: col.name,
                  tokens: [{ type: "IDENTIFIER", value: `${src.alias}.${col.name}` }]
                });
              }
            }
          }
        } else if (
          proj.tokens.length === 3 &&
          proj.tokens[1].value === "." &&
          proj.tokens[2].value === "*"
        ) {
          const tblAlias = proj.tokens[0].value;
          const src = fromSources.find(s => s.alias.toLowerCase() === tblAlias.toLowerCase());
          if (!src) throw new Error(`ERROR 1054 (42S22): Unknown table '${tblAlias}'`);
          for (const col of src.table.columns) {
            finalProjections.push({
              alias: col.name,
              tokens: [{ type: "IDENTIFIER", value: `${src.alias}.${col.name}` }]
            });
          }
        } else {
          finalProjections.push(proj);
        }
      }

      for (const row of rows) {
        const outRow = {};
        for (const proj of finalProjections) {
          const val = this.evaluateScalarExpr(proj.tokens, row);
          outRow[proj.alias] = val;
        }
        outputRows.push(outRow);
      }
      outputColHeaders = finalProjections.map(p => p.alias);
    }

    if (outputColHeaders.length === 0 && outputRows.length > 0) {
      outputColHeaders = Object.keys(outputRows[0]);
    } else if (outputColHeaders.length === 0 && parsedProjections.length > 0) {
      outputColHeaders = parsedProjections.map(p => p.alias);
    }

    if (distinct) {
      const seen = new Set();
      outputRows = outputRows.filter(r => {
        const hash = JSON.stringify(r);
        if (seen.has(hash)) return false;
        seen.add(hash);
        return true;
      });
    }

    if (orderByTokens && orderByTokens.length > 0) {
      const orderItems = this.splitTopLevel(orderByTokens, ",").map(itemTokens => {
        let dir = "ASC";
        let expr = itemTokens;
        const last = itemTokens[itemTokens.length - 1];
        if (last && (tokIs(last, "ASC") || tokIs(last, "DESC"))) {
          dir = tokUpper(last);
          expr = itemTokens.slice(0, -1);
        }
        return { expr, dir };
      });

      outputRows.sort((a, b) => {
        for (const ord of orderItems) {
          const valA = this.evaluateScalarExpr(ord.expr, a);
          const valB = this.evaluateScalarExpr(ord.expr, b);
          if (valA === valB) continue;
          if (valA === null) return ord.dir === "ASC" ? -1 : 1;
          if (valB === null) return ord.dir === "ASC" ? 1 : -1;
          const cmp = valA > valB ? 1 : -1;
          return ord.dir === "ASC" ? cmp : -cmp;
        }
        return 0;
      });
    }

    return {
      type: "TABLE",
      columns: outputColHeaders,
      rows: outputRows
    };
  }

  parseProjection(tokens) {
    let alias = null;
    let exprTokens = tokens;

    if (tokens.length >= 3 && tokIs(tokens[tokens.length - 2], "AS")) {
      alias = tokens[tokens.length - 1].value;
      exprTokens = tokens.slice(0, -2);
    } else if (
      tokens.length >= 2 &&
      (tokens[tokens.length - 1].type === "IDENTIFIER" || tokens[tokens.length - 1].type === "STRING") &&
      tokens[tokens.length - 2].type !== "PUNCTUATION" &&
      tokens[tokens.length - 2].type !== "OPERATOR"
    ) {
      alias = tokens[tokens.length - 1].value;
      exprTokens = tokens.slice(0, -1);
    }

    if (!alias) {
      if (tokens.length === 3 && tokens[0].value === "(" && tokens[2].value === ")") {
        alias = tokens[1].value;
      } else {
        alias = formatTokensText(tokens);
      }
    }

    return { alias, tokens: exprTokens };
  }

  parseFromClause(tokens) {
    if (!this.activeDb) throw new Error("ERROR 1046 (3D000): No database selected");
    const db = this.databases[this.activeDb];

    const sources = [];
    let idx = 0;

    while (idx < tokens.length) {
      if (tokens[idx].value === ",") {
        idx++;
        continue;
      }
      if (tokIs(tokens[idx], "CROSS") && tokIs(tokens[idx + 1], "JOIN")) {
        idx += 2;
        continue;
      }
      if (tokIs(tokens[idx], "INNER") || tokIs(tokens[idx], "JOIN")) {
        if (tokIs(tokens[idx], "INNER")) idx++;
        if (tokIs(tokens[idx], "JOIN")) idx++;
      }

      let targetDbName = this.activeDb;
      let tblName = tokens[idx++].value;
      if (idx < tokens.length && tokens[idx].value === ".") {
        idx++; // skip .
        targetDbName = tblName;
        tblName = tokens[idx++].value;
      }
      if (!targetDbName) throw new Error("ERROR 1046 (3D000): No database selected");
      const dbMatch = Object.keys(this.databases).find(d => d.toLowerCase() === targetDbName.toLowerCase());
      if (!dbMatch) throw new Error(`ERROR 1049 (42000): Unknown database '${targetDbName}'`);
      const targetDbObj = this.databases[dbMatch];
      const match = Object.keys(targetDbObj.tables).find(t => t.toLowerCase() === tblName.toLowerCase());
      if (!match) throw new Error(`ERROR 1146 (42S02): Table '${dbMatch}.${tblName}' doesn't exist`);
      const table = targetDbObj.tables[match];

      let alias = match;
      if (
        idx < tokens.length &&
        tokens[idx].type === "IDENTIFIER" &&
        !["JOIN", "INNER", "CROSS", "ON", "WHERE"].includes(tokUpper(tokens[idx]))
      ) {
        alias = tokens[idx++].value;
      } else if (idx < tokens.length && tokIs(tokens[idx], "AS")) {
        idx++;
        alias = tokens[idx++].value;
      }

      let joinOnTokens = null;
      if (tokIs(tokens[idx], "ON")) {
        idx++;
        joinOnTokens = [];
        while (
          idx < tokens.length &&
          tokens[idx].value !== "," &&
          !["JOIN", "INNER", "CROSS"].includes(tokUpper(tokens[idx]))
        ) {
          joinOnTokens.push(tokens[idx++]);
        }
      }

      sources.push({
        table,
        tableName: match,
        alias,
        joinOn: joinOnTokens
      });
    }

    return sources;
  }

  evaluateFromClause(sources) {
    if (sources.length === 0) return [{}];

    let currentRows = [];
    const first = sources[0];

    for (const r of first.table.rows) {
      const combined = {};
      for (const col of first.table.columns) {
        const val = r[col.name];
        combined[col.name] = val;
        combined[`${first.alias}.${col.name}`] = val;
        combined[`${first.tableName}.${col.name}`] = val;
      }
      currentRows.push(combined);
    }

    for (let i = 1; i < sources.length; i++) {
      const src = sources[i];
      const nextRows = [];

      for (const baseRow of currentRows) {
        for (const r of src.table.rows) {
          const merged = Object.assign({}, baseRow);
          for (const col of src.table.columns) {
            const val = r[col.name];
            if (baseRow[col.name] !== undefined) {
              merged[`__ambiguous_${col.name}`] = true;
            } else {
              merged[col.name] = val;
            }
            merged[`${src.alias}.${col.name}`] = val;
            merged[`${src.tableName}.${col.name}`] = val;
          }

          if (src.joinOn && src.joinOn.length > 0) {
            const onCond = this.evaluateScalarExpr(src.joinOn, merged);
            if (onCond) nextRows.push(merged);
          } else {
            nextRows.push(merged);
          }
        }
      }
      currentRows = nextRows;
    }

    return currentRows;
  }

  evaluateScalarExpr(tokens, row = {}) {
    if (!tokens || tokens.length === 0) return null;
    const parser = new ExpressionParser(tokens, this);
    const ast = parser.parse();
    return this.evaluateAST(ast, row);
  }

  evaluateGroupProjection(tokens, groupRows) {
    const parser = new ExpressionParser(tokens, this);
    const ast = parser.parse();
    return this.evaluateGroupAST(ast, groupRows);
  }

  evaluateHavingExpr(tokens, groupRows) {
    const parser = new ExpressionParser(tokens, this);
    const ast = parser.parse();
    return Boolean(this.evaluateGroupAST(ast, groupRows));
  }

  containsAggregate(tokens) {
    const aggNames = ["COUNT", "SUM", "AVG", "MIN", "MAX"];
    return tokens.some(t => aggNames.includes(tokUpper(t)));
  }

  evaluateAST(node, row) {
    if (!node) return null;

    switch (node.type) {
      case "LITERAL":
        return node.value;

      case "IDENTIFIER": {
        const name = node.value;
        if (row === null) return null;
        if (row[`__ambiguous_${name}`]) {
          throw new Error(`ERROR 1052 (23000): Column '${name}' in field list is ambiguous`);
        }
        if (row[name] !== undefined) return row[name];
        const lower = name.toLowerCase();
        for (const k of Object.keys(row)) {
          if (k.toLowerCase() === lower) return row[k];
        }
        return null;
      }

      case "QUALIFIED_IDENTIFIER": {
        const full = `${node.table}.${node.column}`;
        if (row[full] !== undefined) return row[full];
        const lower = full.toLowerCase();
        for (const k of Object.keys(row)) {
          if (k.toLowerCase() === lower) return row[k];
        }
        return null;
      }

      case "UNARY_OP": {
        const val = this.evaluateAST(node.expr, row);
        if (node.op === "NOT") return !val;
        if (node.op === "-") return val !== null ? -val : null;
        if (node.op === "+") return val !== null ? +val : null;
        return val;
      }

      case "BINARY_OP": {
        const left = this.evaluateAST(node.left, row);
        const right = this.evaluateAST(node.right, row);
        return this.evalBinary(node.op, left, right);
      }

      case "BETWEEN": {
        const val = this.evaluateAST(node.expr, row);
        const low = this.evaluateAST(node.low, row);
        const high = this.evaluateAST(node.high, row);
        if (val === null || low === null || high === null) return null;
        const res = val >= low && val <= high;
        return node.not ? !res : res;
      }

      case "IN": {
        const val = this.evaluateAST(node.expr, row);
        if (val === null) return null;
        let found = false;
        for (const item of node.list) {
          const itemVal = this.evaluateAST(item, row);
          if (val == itemVal) {
            found = true;
            break;
          }
        }
        return node.not ? !found : found;
      }

      case "LIKE": {
        const val = this.evaluateAST(node.expr, row);
        const pattern = this.evaluateAST(node.pattern, row);
        if (val === null || pattern === null) return null;
        const regex = this.likeToRegex(String(pattern));
        const res = regex.test(String(val));
        return node.not ? !res : res;
      }

      case "IS_NULL": {
        const val = this.evaluateAST(node.expr, row);
        const isNull = val === null || val === undefined;
        return node.not ? !isNull : isNull;
      }

      case "FUNCTION_CALL": {
        const args = node.args.map(a => this.evaluateAST(a, row));
        return this.callSQLFunction(node.name, args);
      }

      default:
        return null;
    }
  }

  evaluateGroupAST(node, groupRows) {
    if (!node) return null;

    if (node.type === "FUNCTION_CALL") {
      const fnName = node.name.toUpperCase();
      if (fnName === "COUNT") {
        if (node.isStar) return groupRows.length;
        const argNode = node.args[0];
        let cnt = 0;
        for (const r of groupRows) {
          const val = this.evaluateAST(argNode, r);
          if (val !== null && val !== undefined) cnt++;
        }
        return cnt;
      }
      if (fnName === "SUM") {
        const argNode = node.args[0];
        let sum = null;
        for (const r of groupRows) {
          const val = this.evaluateAST(argNode, r);
          if (val !== null && val !== undefined) {
            sum = (sum === null ? 0 : sum) + Number(val);
          }
        }
        return sum;
      }
      if (fnName === "AVG") {
        const argNode = node.args[0];
        let sum = 0;
        let count = 0;
        for (const r of groupRows) {
          const val = this.evaluateAST(argNode, r);
          if (val !== null && val !== undefined) {
            sum += Number(val);
            count++;
          }
        }
        return count === 0 ? null : +(sum / count).toFixed(4);
      }
      if (fnName === "MIN") {
        const argNode = node.args[0];
        let min = null;
        for (const r of groupRows) {
          const val = this.evaluateAST(argNode, r);
          if (val !== null && val !== undefined) {
            if (min === null || val < min) min = val;
          }
        }
        return min;
      }
      if (fnName === "MAX") {
        const argNode = node.args[0];
        let max = null;
        for (const r of groupRows) {
          const val = this.evaluateAST(argNode, r);
          if (val !== null && val !== undefined) {
            if (max === null || val > max) max = val;
          }
        }
        return max;
      }

      const args = node.args.map(a => this.evaluateGroupAST(a, groupRows));
      return this.callSQLFunction(node.name, args);
    }

    if (node.type === "BINARY_OP") {
      const left = this.evaluateGroupAST(node.left, groupRows);
      const right = this.evaluateGroupAST(node.right, groupRows);
      return this.evalBinary(node.op, left, right);
    }

    if (node.type === "UNARY_OP") {
      const val = this.evaluateGroupAST(node.expr, groupRows);
      if (node.op === "NOT") return !val;
      if (node.op === "-") return -val;
      return +val;
    }

    return this.evaluateAST(node, groupRows[0] || {});
  }

  evalBinary(op, left, right) {
    if (op === "AND") return Boolean(left) && Boolean(right);
    if (op === "OR") return Boolean(left) || Boolean(right);

    if (left === null || right === null) {
      if (op === "=" || op === "!=" || op === "<>") return false;
      return null;
    }

    switch (op) {
      case "=": return left == right;
      case "!=":
      case "<>": return left != right;
      case ">": return left > right;
      case "<": return left < right;
      case ">=": return left >= right;
      case "<=": return left <= right;
      case "+": return Number(left) + Number(right);
      case "-": return Number(left) - Number(right);
      case "*": return Number(left) * Number(right);
      case "/": return right == 0 ? null : Number(left) / Number(right);
      case "%":
      case "MOD": return right == 0 ? null : Number(left) % Number(right);
      default: return null;
    }
  }

  likeToRegex(pattern) {
    let p = pattern.replace(/[.+*?^${}()|[\]\\]/g, "\\$&");
    p = p.replace(/%/g, ".*").replace(/_/g, ".");
    return new RegExp(`^${p}$`, "i");
  }

  callSQLFunction(name, args) {
    const fn = name.toUpperCase();

    // String Functions
    if (fn === "LENGTH" || fn === "CHAR_LENGTH") {
      return args[0] !== null && args[0] !== undefined ? String(args[0]).length : null;
    }
    if (fn === "CONCAT") {
      for (const a of args) {
        if (a === null || a === undefined) return null;
      }
      return args.join("");
    }
    if (fn === "INSTR") {
      if (args[0] === null || args[1] === null) return null;
      const s = String(args[0]).toLowerCase();
      const sub = String(args[1]).toLowerCase();
      const pos = s.indexOf(sub);
      return pos === -1 ? 0 : pos + 1;
    }
    if (fn === "LOWER" || fn === "LCASE") {
      return args[0] !== null && args[0] !== undefined ? String(args[0]).toLowerCase() : null;
    }
    if (fn === "UPPER" || fn === "UCASE") {
      return args[0] !== null && args[0] !== undefined ? String(args[0]).toUpperCase() : null;
    }
    if (fn === "LEFT") {
      if (args[0] === null || args[1] === null) return null;
      const len = Math.max(0, parseInt(args[1]) || 0);
      return String(args[0]).substring(0, len);
    }
    if (fn === "RIGHT") {
      if (args[0] === null || args[1] === null) return null;
      const str = String(args[0]);
      const len = Math.max(0, parseInt(args[1]) || 0);
      return len >= str.length ? str : str.substring(str.length - len);
    }
    if (fn === "MID" || fn === "SUBSTRING" || fn === "SUBSTR") {
      if (args[0] === null || args[1] === null) return null;
      const str = String(args[0]);
      let pos = parseInt(args[1]) || 1;
      let startIdx = pos > 0 ? pos - 1 : str.length + pos;
      if (startIdx < 0) startIdx = 0;
      if (args[2] !== undefined && args[2] !== null) {
        const len = parseInt(args[2]) || 0;
        return str.substring(startIdx, startIdx + len);
      }
      return str.substring(startIdx);
    }
    if (fn === "LTRIM") {
      return args[0] !== null && args[0] !== undefined ? String(args[0]).replace(/^\s+/, "") : null;
    }
    if (fn === "RTRIM") {
      return args[0] !== null && args[0] !== undefined ? String(args[0]).replace(/\s+$/, "") : null;
    }
    if (fn === "TRIM") {
      return args[0] !== null && args[0] !== undefined ? String(args[0]).trim() : null;
    }

    // Numeric Functions
    if (fn === "MOD") {
      if (args[0] === null || args[1] === null || Number(args[1]) === 0) return null;
      return Number(args[0]) % Number(args[1]);
    }
    if (fn === "POWER" || fn === "POW") {
      if (args[0] === null || args[1] === null) return null;
      return Math.pow(Number(args[0]), Number(args[1]));
    }
    if (fn === "ROUND") {
      if (args[0] === null) return null;
      const val = Number(args[0]);
      const dec = args[1] !== undefined && args[1] !== null ? parseInt(args[1]) : 0;
      if (dec >= 0) {
        const factor = Math.pow(10, dec);
        return Math.round(val * factor) / factor;
      } else {
        const factor = Math.pow(10, -dec);
        return Math.round(val / factor) * factor;
      }
    }
    if (fn === "TRUNCATE") {
      if (args[0] === null || args[1] === null) return null;
      const val = Number(args[0]);
      const dec = parseInt(args[1]) || 0;
      if (dec >= 0) {
        const factor = Math.pow(10, dec);
        return (val >= 0 ? Math.floor(val * factor) : Math.ceil(val * factor)) / factor;
      } else {
        const factor = Math.pow(10, -dec);
        return (val >= 0 ? Math.floor(val / factor) : Math.ceil(val / factor)) * factor;
      }
    }
    if (fn === "SQRT") {
      if (args[0] === null || Number(args[0]) < 0) return null;
      return Math.sqrt(Number(args[0]));
    }
    if (fn === "SIGN") {
      if (args[0] === null) return null;
      const val = Number(args[0]);
      return val > 0 ? 1 : val < 0 ? -1 : 0;
    }
    if (fn === "ABS") {
      return args[0] !== null ? Math.abs(Number(args[0])) : null;
    }
    if (fn === "CEIL" || fn === "CEILING") {
      return args[0] !== null ? Math.ceil(Number(args[0])) : null;
    }
    if (fn === "FLOOR") {
      return args[0] !== null ? Math.floor(Number(args[0])) : null;
    }

    // Date & Time Functions
    const now = new Date();
    if (fn === "NOW" || fn === "SYSDATE") {
      return this.formatDateTime(now);
    }
    if (fn === "CURDATE" || fn === "CURRENT_DATE") {
      return this.formatDate(now);
    }
    if (fn === "DATE") {
      if (!args[0]) return null;
      const d = new Date(args[0]);
      return isNaN(d.getTime()) ? null : this.formatDate(d);
    }
    if (fn === "MONTH") {
      const d = args[0] ? new Date(args[0]) : now;
      return isNaN(d.getTime()) ? null : d.getMonth() + 1;
    }
    if (fn === "MONTHNAME") {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const d = args[0] ? new Date(args[0]) : now;
      return isNaN(d.getTime()) ? null : months[d.getMonth()];
    }
    if (fn === "YEAR") {
      const d = args[0] ? new Date(args[0]) : now;
      return isNaN(d.getTime()) ? null : d.getFullYear();
    }
    if (fn === "DAY" || fn === "DAYOFMONTH") {
      const d = args[0] ? new Date(args[0]) : now;
      return isNaN(d.getTime()) ? null : d.getDate();
    }
    if (fn === "DAYNAME") {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const d = args[0] ? new Date(args[0]) : now;
      return isNaN(d.getTime()) ? null : days[d.getDay()];
    }

    // Information & System Functions
    if (fn === "DATABASE" || fn === "SCHEMA") {
      return this.activeDb || null;
    }
    if (fn === "VERSION") {
      return "8.0.35";
    }
    if (fn === "USER" || fn === "CURRENT_USER") {
      return "root@localhost";
    }

    // Null-handling Functions
    if (fn === "IFNULL") {
      return args[0] !== null && args[0] !== undefined ? args[0] : (args[1] !== undefined ? args[1] : null);
    }
    if (fn === "COALESCE") {
      for (const a of args) {
        if (a !== null && a !== undefined) return a;
      }
      return null;
    }

    throw new Error(`ERROR 1305 (42000): FUNCTION ${name} does not exist`);
  }

  formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  formatDateTime(d) {
    const date = this.formatDate(d);
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    return `${date} ${h}:${min}:${s}`;
  }

  handleStatus() {
    return {
      type: "STATUS",
      info: {
        connectionId: 12,
        currentDatabase: this.activeDb || "(none)",
        serverVersion: "8.0.35 - MySQL Community Server (CBSE IP Edition)",
        uptime: "1 day 4 hours",
        threads: 2,
        clientCharset: "utf8mb4",
        serverCharset: "utf8mb4"
      }
    };
  }

  handleHelp() {
    return {
      type: "HELP",
      text: `For information about MySQL products and services, visit:
   http://www.mysql.com/

List of all MySQL commands:
Note that all text commands must be first on line and end with ';'
?         (\\?) Synonym for 'help'.
clear     (cls) Clear the terminal display.
help      (\\h) Display this help.
status    (\\s) Get status information from the server.
reset     Reset all databases to default CBSE sample datasets.
\\c        Clear the current input statement buffer.

CBSE IP Class 11 & 12 SQL Quick Reference:
  * DDL: CREATE DATABASE, SHOW DATABASES, USE, CREATE TABLE, DESC, ALTER TABLE, DROP
  * DML: INSERT INTO, UPDATE, DELETE, SELECT
  * Clauses: WHERE, DISTINCT, ORDER BY, GROUP BY, HAVING, BETWEEN, IN, LIKE, IS NULL
  * Functions: MAX, MIN, AVG, SUM, COUNT, LENGTH, CONCAT, INSTR, SUBSTR, UPPER, LOWER,
               ROUND, TRUNCATE, MOD, POWER, NOW, DATE, MONTH, YEAR, DAYNAME
  * Joins: Cartesian Product, Equi-Join, INNER JOIN ... ON`
    };
  }

  splitTopLevel(tokens, separator) {
    const result = [];
    let cur = [];
    let depth = 0;
    for (const t of tokens) {
      if (t.value === "(") depth++;
      else if (t.value === ")") depth--;

      if (depth === 0 && t.value === separator) {
        if (cur.length > 0) result.push(cur);
        cur = [];
      } else {
        cur.push(t);
      }
    }
    if (cur.length > 0) result.push(cur);
    return result;
  }
}

class MemoryStorageAdapter {
  constructor() { this.data = null; }
  load() { return this.data; }
  save(d) { this.data = d; }
}

class ExpressionParser {
  constructor(tokens, engine) {
    this.tokens = tokens;
    this.engine = engine;
    this.pos = 0;
  }

  peek() {
    return this.tokens[this.pos] || { type: "EOF", value: "", upper: "" };
  }

  consume() {
    return this.tokens[this.pos++] || { type: "EOF", value: "", upper: "" };
  }

  parse() {
    return this.parseLogicalOr();
  }

  parseLogicalOr() {
    let left = this.parseLogicalAnd();
    while (tokIs(this.peek(), "OR")) {
      this.consume();
      const right = this.parseLogicalAnd();
      left = { type: "BINARY_OP", op: "OR", left, right };
    }
    return left;
  }

  parseLogicalAnd() {
    let left = this.parseLogicalNot();
    while (tokIs(this.peek(), "AND")) {
      this.consume();
      const right = this.parseLogicalNot();
      left = { type: "BINARY_OP", op: "AND", left, right };
    }
    return left;
  }

  parseLogicalNot() {
    if (tokIs(this.peek(), "NOT")) {
      this.consume();
      const expr = this.parseComparison();
      return { type: "UNARY_OP", op: "NOT", expr };
    }
    return this.parseComparison();
  }

  parseComparison() {
    let left = this.parseAdditive();

    while (true) {
      const p = this.peek();

      // IS [NOT] NULL
      if (tokIs(p, "IS")) {
        this.consume();
        let not = false;
        if (tokIs(this.peek(), "NOT")) {
          this.consume();
          not = true;
        }
        if (!tokIs(this.peek(), "NULL")) {
          throw new Error("ERROR 1064 (42000): Expected NULL after IS");
        }
        this.consume();
        left = { type: "IS_NULL", expr: left, not };
        continue;
      }

      // [NOT] BETWEEN x AND y
      if (tokIs(p, "BETWEEN") || (tokIs(p, "NOT") && tokIs(this.tokens[this.pos + 1], "BETWEEN"))) {
        let not = false;
        if (tokIs(p, "NOT")) {
          not = true;
          this.consume();
        }
        this.consume(); // BETWEEN
        const low = this.parseAdditive();
        if (!tokIs(this.peek(), "AND")) {
          throw new Error("ERROR 1064 (42000): Expected AND in BETWEEN clause");
        }
        this.consume(); // AND
        const high = this.parseAdditive();
        left = { type: "BETWEEN", expr: left, low, high, not };
        continue;
      }

      // [NOT] IN (...)
      if (tokIs(p, "IN") || (tokIs(p, "NOT") && tokIs(this.tokens[this.pos + 1], "IN"))) {
        let not = false;
        if (tokIs(p, "NOT")) {
          not = true;
          this.consume();
        }
        this.consume(); // IN
        if (this.consume().value !== "(") throw new Error("ERROR 1064 (42000): Expected '(' after IN");
        const list = [];
        while (this.peek().value !== ")" && this.peek().type !== "EOF") {
          list.push(this.parseAdditive());
          if (this.peek().value === ",") this.consume();
        }
        if (this.consume().value !== ")") throw new Error("ERROR 1064 (42000): Expected ')' after IN list");
        left = { type: "IN", expr: left, list, not };
        continue;
      }

      // [NOT] LIKE 'pattern'
      if (tokIs(p, "LIKE") || (tokIs(p, "NOT") && tokIs(this.tokens[this.pos + 1], "LIKE"))) {
        let not = false;
        if (tokIs(p, "NOT")) {
          not = true;
          this.consume();
        }
        this.consume(); // LIKE
        const pattern = this.parseAdditive();
        left = { type: "LIKE", expr: left, pattern, not };
        continue;
      }

      // Standard relational: =, !=, <>, <, <=, >, >=
      if (["=", "!=", "<>", "<", "<=", ">", ">="].includes(p.value)) {
        const op = this.consume().value;
        const right = this.parseAdditive();
        left = { type: "BINARY_OP", op, left, right };
        continue;
      }

      break;
    }

    return left;
  }

  parseAdditive() {
    let left = this.parseMultiplicative();
    while (["+", "-"].includes(this.peek().value)) {
      const op = this.consume().value;
      const right = this.parseMultiplicative();
      left = { type: "BINARY_OP", op, left, right };
    }
    return left;
  }

  parseMultiplicative() {
    let left = this.parseUnary();
    while (["*", "/", "%"].includes(this.peek().value) || tokIs(this.peek(), "MOD")) {
      const op = tokUpper(this.consume());
      const right = this.parseUnary();
      left = { type: "BINARY_OP", op, left, right };
    }
    return left;
  }

  parseUnary() {
    const p = this.peek();
    if (p.value === "-" || p.value === "+") {
      const op = this.consume().value;
      const expr = this.parsePrimary();
      return { type: "UNARY_OP", op, expr };
    }
    return this.parsePrimary();
  }

  parsePrimary() {
    const p = this.peek();

    if (p.value === "(") {
      this.consume();
      const expr = this.parseLogicalOr();
      if (this.consume().value !== ")") {
        throw new Error("ERROR 1064 (42000): Expected ')'");
      }
      return expr;
    }

    if (tokIs(p, "NULL")) {
      this.consume();
      return { type: "LITERAL", value: null };
    }

    if (tokIs(p, "TRUE")) {
      this.consume();
      return { type: "LITERAL", value: 1 };
    }
    if (tokIs(p, "FALSE")) {
      this.consume();
      return { type: "LITERAL", value: 0 };
    }

    if (p.type === "NUMBER") {
      this.consume();
      return { type: "LITERAL", value: p.value };
    }

    if (p.type === "STRING") {
      this.consume();
      return { type: "LITERAL", value: p.value };
    }

    if (p.type === "IDENTIFIER" || p.type === "KEYWORD") {
      const name = this.consume().value;

      if (this.peek().value === "(") {
        this.consume();
        let isStar = false;
        const args = [];
        if (this.peek().value === "*") {
          isStar = true;
          this.consume();
        } else {
          while (this.peek().value !== ")" && this.peek().type !== "EOF") {
            args.push(this.parseLogicalOr());
            if (this.peek().value === ",") this.consume();
          }
        }
        if (this.consume().value !== ")") {
          throw new Error("ERROR 1064 (42000): Expected ')' after function arguments");
        }
        return { type: "FUNCTION_CALL", name, args, isStar };
      }

      if (this.peek().value === ".") {
        this.consume();
        const colTok = this.consume();
        return { type: "QUALIFIED_IDENTIFIER", table: name, column: colTok.value };
      }

      return { type: "IDENTIFIER", value: name };
    }

    throw new Error(`ERROR 1064 (42000): Unexpected token '${p.value}'`);
  }
}

const SQL_KEYWORDS = new Set([
  "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "INSERT", "INTO", "VALUES",
  "UPDATE", "SET", "DELETE", "CREATE", "TABLE", "DATABASE", "SCHEMA", "DROP",
  "ALTER", "ADD", "MODIFY", "CHANGE", "COLUMN", "SHOW", "DATABASES", "TABLES",
  "DESCRIBE", "DESC", "USE", "JOIN", "INNER", "CROSS", "ON", "AS", "DISTINCT",
  "GROUP", "BY", "HAVING", "ORDER", "ASC", "DESC", "LIMIT", "BETWEEN", "IN",
  "LIKE", "IS", "NULL", "PRIMARY", "KEY", "UNIQUE", "DEFAULT", "CHECK", "IF",
  "EXISTS", "TRUE", "FALSE"
]);

function formatAsciiTable(colHeaders, rows) {
  if (!rows || rows.length === 0) {
    return "Empty set (0.00 sec)";
  }

  const colWidths = {};
  for (const h of colHeaders) {
    colWidths[h] = Math.max(h.length, 4);
  }

  for (const row of rows) {
    for (const h of colHeaders) {
      const val = row[h] !== null && row[h] !== undefined ? String(row[h]) : "NULL";
      if (val.length > colWidths[h]) {
        colWidths[h] = val.length;
      }
    }
  }

  let border = "+";
  for (const h of colHeaders) {
    border += "-".repeat(colWidths[h] + 2) + "+";
  }

  let headerLine = "|";
  for (const h of colHeaders) {
    headerLine += " " + h.padEnd(colWidths[h]) + " |";
  }

  const lines = [border, headerLine, border];

  for (const row of rows) {
    let rowLine = "|";
    for (const h of colHeaders) {
      const isNull = row[h] === null || row[h] === undefined;
      const isNum = typeof row[h] === "number";
      const val = isNull ? "NULL" : String(row[h]);
      if (isNum) {
        rowLine += " " + val.padStart(colWidths[h]) + " |";
      } else {
        rowLine += " " + val.padEnd(colWidths[h]) + " |";
      }
    }
    lines.push(rowLine);
  }
  lines.push(border);

  const count = rows.length;
  lines.push(`${count} ${count === 1 ? "row" : "rows"} in set (0.00 sec)`);

  return lines.join("\n");
}

function formatVertical(colHeaders, rows) {
  if (!rows || rows.length === 0) return "Empty set (0.00 sec)";

  const maxHeaderLen = Math.max(...colHeaders.map(h => h.length), 1);
  const lines = [];

  for (let i = 0; i < rows.length; i++) {
    lines.push(`*************************** ${i + 1}. row ***************************`);
    const row = rows[i];
    for (const h of colHeaders) {
      const val = row[h] === null || row[h] === undefined ? "NULL" : String(row[h]);
      lines.push(`${h.padStart(maxHeaderLen)}: ${val}`);
    }
  }
  const count = rows.length;
  lines.push(`${count} ${count === 1 ? "row" : "rows"} in set (0.00 sec)`);
  return lines.join("\n");
}

function runTests() {
  console.log("=== Running Comprehensive SQL Engine Tests ===");
  const engine = new SQLEngine();

  // 1. Run all 28 commands from CBSE Class XI SQL Practical Worksheet (Suncity School)
  console.log("\n--- Testing Suncity School Class XI SQL Practical Worksheet ---");
  const worksheetCommands = [
    // 1. Create and select the database
    "CREATE DATABASE school;",
    "USE school;",
    "SHOW DATABASES;",
    "SELECT DATABASE();",
    // 2. Create the student table
    `CREATE TABLE student (
 sid INT PRIMARY KEY,
 class INT,
 section CHAR(1),
 gender VARCHAR(10),
 name VARCHAR(30),
 dob DATE,
 marks INT
);`,
    "DESC student;",
    // 3. Insert all 10 records
    "INSERT INTO student VALUES (101, 11, 'A', 'Female', 'Aanya', '2009-01-15', 92);",
    "INSERT INTO student VALUES (102, 11, 'A', 'Male', 'Aarav', '2008-07-20', 78);",
    "INSERT INTO student VALUES (103, 11, 'B', 'Female', 'Diya', '2009-03-12', 45);",
    "INSERT INTO student VALUES (104, 11, 'B', 'Male', 'Kabir', '2008-11-05', 88);",
    "INSERT INTO student VALUES (105, 11, 'A', 'Female', 'Meera', '2009-08-22', 67);",
    "INSERT INTO student VALUES (106, 11, 'B', 'Male', 'Arjun', '2008-04-18', 35);",
    "INSERT INTO student VALUES (107, 11, 'A', 'Female', 'Riya', '2009-12-02', 96);",
    "INSERT INTO student VALUES (108, 11, 'B', 'Male', 'Vivaan', '2008-09-09', 54);",
    "INSERT INTO student VALUES (109, 11, 'A', 'Female', 'Anaya', '2009-05-25', 81);",
    "INSERT INTO student VALUES (110, 11, 'B', 'Male', 'Reyansh', '2008-02-14', 60);",
    "SELECT * FROM student;",
    // 4. Display records and selected columns
    "SELECT * FROM student;",
    "SELECT sid, name, marks FROM student;",
    "SELECT name, dob FROM student;",
    "SELECT * FROM student ORDER BY sid DESC;",
    // 5. Relational operators
    "SELECT * FROM student WHERE marks > 80;",
    "SELECT name, marks FROM student WHERE marks < 50;",
    "SELECT * FROM student WHERE marks = 60;",
    "SELECT name, marks FROM student WHERE marks >= 75;",
    "SELECT * FROM student WHERE marks < 80;",
    "SELECT * FROM student WHERE marks <= 60;",
    "SELECT * FROM student WHERE marks <> 60;",
    // 6. BETWEEN
    "SELECT name, marks FROM student WHERE marks BETWEEN 50 AND 80;",
    "SELECT sid, name, dob FROM student WHERE dob BETWEEN '2009-01-01' AND '2009-12-31';",
    // 7. Logical operators
    "SELECT name, section, marks FROM student WHERE section = 'A' AND marks > 80;",
    "SELECT * FROM student WHERE section = 'A' OR marks > 90;",
    "SELECT * FROM student WHERE NOT section = 'A';",
    // 8. NULL values
    "ALTER TABLE student ADD city VARCHAR(25);",
    "SELECT name, city FROM student WHERE city IS NULL;",
    "UPDATE student SET city = 'Gurugram' WHERE sid = 101;",
    "SELECT name, city FROM student WHERE city IS NOT NULL;",
    "UPDATE student SET city = 'Delhi' WHERE sid = 102;",
    "SELECT * FROM student WHERE sid = 101;",
    "SELECT * FROM student;",
    // 9. UPDATE, DELETE, INSERT
    "UPDATE student SET marks = 55 WHERE sid = 103;",
    "UPDATE student SET section = 'A' WHERE sid = 108;",
    "SELECT * FROM student WHERE sid = 103 OR sid = 108;",
    "DELETE FROM student WHERE sid = 110;",
    "SELECT * FROM student WHERE sid = 110;",
    "INSERT INTO student VALUES (111, 11, 'B', 'Female', 'Tanya', '2009-06-10', 85, NULL);",
    "SELECT * FROM student;",
    // 10. ALTER TABLE
    "ALTER TABLE student ADD email VARCHAR(50);",
    "ALTER TABLE student MODIFY city VARCHAR(40);",
    "DESC student;",
    "SELECT * FROM student;",
    // 11. DROP TABLE
    `CREATE TABLE test_student (
 sid INT,
 name VARCHAR(30)
);`,
    "DESC test_student;",
    "DROP TABLE test_student;",
    "SHOW TABLES;",
    // 12. Additional practice
    "SHOW DATABASES;",
    "USE school;",
    "SELECT DATABASE();",
    "SHOW TABLES;",
    "DESC student;",
    "SELECT * FROM student;",
    "SELECT DISTINCT section FROM student;"
  ];

  let wsPassed = 0;
  for (const cmd of worksheetCommands) {
    const res = engine.execute(cmd);
    for (const r of res) {
      if (r.type === "ERROR") {
        console.error("WORKSHEET ERROR: " + cmd + " => " + r.message);
        failed++;
      } else {
        wsPassed++;
      }
    }
  }
  console.log(`Worksheet Commands: ${wsPassed} statements passed cleanly!\n`);

  const testQueries = [
    "SHOW DATABASES;",
    "USE school_db;",
    "SHOW TABLES;",
    "DESCRIBE student;",
    "SELECT * FROM student;",
    "SELECT roll_no, name, marks * 0.1 AS bonus FROM student WHERE marks >= 80;",
    "SELECT DISTINCT stream FROM student;",
    "SELECT * FROM student WHERE marks BETWEEN 70 AND 90;",
    "SELECT * FROM student WHERE stream IN ('Commerce', 'Humanities');",
    "SELECT * FROM student WHERE name LIKE 'A%';",
    "SELECT * FROM student WHERE marks IS NULL;",
    "SELECT * FROM student ORDER BY marks DESC, name ASC;",
    "SELECT stream, COUNT(*), AVG(marks), MAX(marks), MIN(marks) FROM student GROUP BY stream;",
    "SELECT stream, COUNT(*) FROM student GROUP BY stream HAVING COUNT(*) > 2;",
    "SELECT POWER(2, 3), MOD(11, 4), ROUND(15.678, 2), TRUNCATE(15.678, 1), SQRT(25), SIGN(-20);",
    "SELECT CONCAT('CBSE', ' ', 'IP'), LENGTH('Database'), INSTR('Informatics', 'format'), UPPER('class 12');",
    "SELECT SUBSTR('Computer Science', 1, 8), LEFT('Informatics', 4), RIGHT('Practices', 3);",
    "SELECT NOW(), MONTHNAME(NOW()), YEAR(NOW()), DAYNAME(NOW());",
    "SELECT student.name, marks.subject, marks.theory FROM student, marks WHERE student.roll_no = marks.roll_no;",
    "SELECT S.name, M.subject, M.theory + M.practical AS total FROM student S JOIN marks M ON S.roll_no = M.roll_no WHERE S.stream = 'Science';",
    "INSERT INTO student VALUES (9, 'Test User', 'M', 'Science', 82.0, '2007-05-01');",
    "UPDATE student SET marks = marks + 5 WHERE roll_no = 9;",
    "SELECT * FROM student WHERE roll_no = 9;",
    "DELETE FROM student WHERE roll_no = 9;",
    "SELECT COUNT(*) FROM student;"
  ];

  let passed = 0;
  let failed = 0;

  for (const q of testQueries) {
    console.log("\n>>> " + q);
    const results = engine.execute(q);
    for (const r of results) {
      if (r.type === "TABLE") {
        console.log(formatAsciiTable(r.columns, r.rows));
        passed++;
      } else if (r.type === "MESSAGE") {
        console.log(r.message);
        passed++;
      } else if (r.type === "ERROR") {
        console.error("ERROR: " + r.message);
        failed++;
      }
    }
  }
  console.log(`\n=== Test Results: ${passed} passed, ${failed} failed ===`);
}

if (typeof module !== "undefined") {
  module.exports = { SQLEngine, formatAsciiTable, formatVertical };
}

if (typeof require !== "undefined" && require.main === module) {
  runTests();
}
