const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const db = require('./db/connection');

db.connect(err => {
    err ? console.log(err) : console.log(`Successfully connected to database`);
    employee_tracker()
})

let employee_tracker = () => {
    
}
