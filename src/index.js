const express = require('express');
const { v4: uuidv4 } = require("uuid")

const app = express();

app.use(express.json());

const customers = [];

function verifyExistsAccountCpf(request, response, next){
    const { cpf } = request.headers;

    const customer = customers.find((customer) => customer.cpf === cpf);


    if(!customer){
        return response.status(400).json({error: "Customer not found!"});
    }

    request.customer = customer;

    return next();
}

/**
 * cpf - string
 * name - string 
 * id - uuid
 * statment []
 */
app.post("/account", (request, response) => {
    const { cpf, name } = request.body;

    const id = uuidv4();

    customers.push({
        cpf,
        name,
        id,
        statment: []
    });
    return response.status(201).send();
});

app.get("/statment", verifyExistsAccountCpf, (request, response) => {
    const { customer } = request;

    return response.json(customer.statment);
});

app.post("/deposit", verifyExistsAccountCpf, (request, response) =>{
     const { description, amount} = request.body;

     const { customer } = request;

     const statmentOperation ={
         description,
         amount,
         create_at: new Date(),
         type: 'credit'
     }

     customer.statment.push(statmentOperation);

     return response.status(201).send();
})

app.listen(8080);