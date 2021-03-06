const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

const customers = [];

function verifyExistsAccountCpf(request, response, next) {
  const { cpf } = request.headers;

  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: "Customer not found!" });
  }

  request.customer = customer;

  return next();
}

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);

  return balance;
}

/**
 * cpf - string
 * name - string
 * id - uuid
 * statement []
 */
app.post("/account", (request, response) => {
  const { cpf, name } = request.body;

  const id = uuidv4();

  customers.push({
    cpf,
    name,
    id,
    statement: [],
  });
  return response.status(201).send();
});

app.get("/statement", verifyExistsAccountCpf, (request, response) => {
  const { customer } = request;

  return response.json(customer.statement);
});

app.post("/deposit", verifyExistsAccountCpf, (request, response) => {
  const { description, amount } = request.body;

  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.post("/withdraw", verifyExistsAccountCpf, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalance(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: "Insufficient funds!" });
  } else {
    const statementOperation = {
      amount,
      created_at: new Date(),
      type: "debit",
    };
    customer.statement.push(statementOperation);

    return response.status(201).send();
  }
});

app.get("/statement/date", verifyExistsAccountCpf, (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dataFormat = new Date(date + " 00:00");

  const statement = customer.statement.filter(
    (statement) =>
      statement.created_at.toDateString() ===
      new Date(dataFormat).toDateString()
  );

  return response.json(statement);
});

app.put("/account", verifyExistsAccountCpf, (request, response) =>{

  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(201).send();
})

app.get("/account", verifyExistsAccountCpf, (request, response) => {
  const { customer } = request.body;

  return response.json(customers)
})

app.delete("/account", verifyExistsAccountCpf, (request, response) => {
  const { customer } = request;

  customers.splice(customer, 1);

  return response.status(200).json(customers);

})

app.get("/balance", verifyExistsAccountCpf, (request, response) => {
  const { customer } = request;

  const balance = getBalance(customer.statement);

  return response.json(balance);
})

app.listen(8080);
