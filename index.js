const mysql = require("mysql");
const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;
app.use(express.static(__dirname));


app.listen(port, () => {
  console.log(`Webbservern körs på port ${port}.`);
});

app.use(express.urlencoded({ extended: true }));

// Connect to the database
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "guest",
});

con.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
  } else {
    console.log("Connected to database");
  }
});

app.get("/", (req, res) => {
  // Fetch all data from the 'users' table
  con.query("SELECT * FROM users", (err, result, fields) => {
    if (err) {
      console.error("Error fetching data from database:", err);
      return res.status(500).send("Internal Server Error");
    }

    fs.readFile("Guest.html", "utf-8", (err, data) => {
      if (err) {
        console.error("Error reading HTML file:", err);
        return res.status(500).send("Internal Server Error");
      }

      let htmlArray = data.split("***NODE***");
      let output = htmlArray[0];

      for (let key in result[0]) {
        output += `<th>${key}</th>`;
      }

      output += htmlArray[1];

      for (let user of result) {
        output += "<tr>";
        for (let key in user) {
          output += `<td>${user[key]}</td>`;
        }
        output += "</tr>";
        
        output += "<tr><td colspan='4'><hr></td></tr>"; // Add <hr> after each set of values
        
    }

      output += htmlArray[2];


      res.send(output);
    });
  });
});

app.post("/index.js", (req, res) => {
  // Extract values from the form
  const name = req.body.name;
  const phone = req.body.phone;
  const email = req.body.email;
  const comment = req.body.comment;

  // Validate the required fields
  if (!name || !phone || !email || !comment) {
    return res.status(400).send("All fields are required");
  }

  // Insert data into the database
  const sql = `INSERT INTO users (name, phone, email, comment) VALUES (?, ?, ?, ?)`;

  con.query(sql, [name, phone, email, comment], (err, result) => {
    if (err) {
      console.error("Error inserting data into database:", err);
      return res.status(500).send("Internal Server Error");
    }

    // Fetch all data from the 'users' table
    con.query("SELECT * FROM users", (err, result, fields) => {
      if (err) {
        console.error("Error fetching data from database:", err);
        return res.status(500).send("Internal Server Error");
      }

      fs.readFile("Guest.html", "utf-8", (err, data) => {
        if (err) {
          console.error("Error reading HTML file:", err);
          return res.status(500).send("Internal Server Error");
        }

        let htmlArray = data.split("***NODE***");
        let output = htmlArray[0];

        for (let key in result[0]) {
          output += `<th>${key}</th>`;
        }

        output += htmlArray[1];

        for (let user of result) {
          output += "<tr>";
          for (let key in user) {
            output += `<td>${user[key]}</td>`;
          }
          output += "</tr>";
          
          output += "<tr><td colspan='4'><hr></td></tr>"; // Add <hr> after each set of values
          
        }
    

        output += htmlArray[2];

        res.send(output);
      });
    });
  });
});

