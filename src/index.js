const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

/**
 * cpf - string
 * name - string
 * id - uuid
 * statment []
 */
app.post("/account", (req, res) => {
  const { cpf, name } = req.body;
  //restorna um boolean
  const customerAlreadyExists = customers.some(
    (customers) => customers.cpf === cpf
  );

  if (customerAlreadyExists) {
    return res.status(400).json({ error: "Customer already exists!" });
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statment: [],
  });
  return res.status(201).send();
});

app.get("/statment", (req, res) => {
  const { cpf } = req.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return res.status(400).json({ error: "Customer not found!" });
  }

  return res.json(customer.statment);
});

app.listen(8080);
