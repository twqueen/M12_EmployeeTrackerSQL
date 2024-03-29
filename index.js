const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const db = require('./db/connection');

// for connecting to database
db.connect(err => {
    err ? console.log(err) : console.log(`Successfully connected to database`);
    employee_tracker()
})

const employee_tracker = () => {
    inquirer.prompt(
        [{
            type: 'list',
            name: 'main',
            message: 'What would you like to do?',
            choices: ['View all Departments', 'View all Roles', 'View all Employees', 'Add a Department', 'Add a Role', 'Add an Employee', 'Update an Employee Role', 'Exit']
        }]
    ).then((answers) => {
        if (answers.main === "View all Departments") {
            // calling all department from database
            db.query(`SELECT * FROM department`, (err, result) => {
                if(err) throw err;
                console.table(result);
                employee_tracker();
            });
        } else if (answers.main === "View all Roles") {
            // calling all roles from database
            db.query(`SELECT * FROM roles`, (err, result) => {
                if(err) throw err;
                console.table(result);
                employee_tracker();
            });
        } else if (answers.main === "View all Employees") {
            // calling employees table from database
            db.query(`SELECT * FROM employees`, (err, result) => {
                if(err) throw err;
                console.table(result);
                employee_tracker();
            });
        } else if (answers.main === "Add a Department") {
            // just need to ask user what the new department name is
            inquirer.prompt([{
                type: 'input',
                name: 'dept',
                message: 'What is new department name?',
                validate: deptInput => {
                    if (deptInput) {
                        return true;
                    } else {
                        console.log("Please enter a department name.");
                        return false;
                    }
                }
            }]).then((answers) => {
                db.query(`INSERT INTO department (dept_name) VALUES (?)`, [answers.dept], (err, result) => {
                    if (err) throw err;
                    console.log(`Successfully added ${answers.dept} into Department`);
                    employee_tracker();
                });
            })
        } else if (answers.main === "Add a Role") {
            // calling all available information from department
            db.query(`SELECT * FROM department`, (err, response) => {
                if (err) throw err;
                let deptArray = [];
                response.forEach((department) => {deptArray.push(department.dept_name);});
                inquirer.prompt([
                    {
                        type: 'input',
                        name: 'role_title',
                        message: 'What is new role?',
                        validate: roleInput => {
                            if (roleInput) {
                                return true;
                            } else {
                                console.log("Please add a role.");
                                return false;
                            }
                        }
                    },
                    {
                        type: 'input',
                        name: 'salary',
                        message: 'What is the salary?',
                        validate: salaryInput => {
                            if (salaryInput) {
                                return true;
                            } else {
                                console.log('Please include a salary to the role');
                                return false;
                            }
                        } 
                    },
                    {
                        type: 'list',
                        name: 'department',
                        message: 'Which department is this role under?',
                        choices: deptArray
                    }
                ]).then((answers) => {
                    // inserting new role
                    db.query(`INSERT INTO roles (title, salary, department_id) VALUES (?, ?, (SELECT id FROM department WHERE dept_name = ?))`, [answers.role_title, answers.salary, answers.department], (err, result) => {
                        if (err) throw err;
                        console.log(`Successfully added new role`);
                        employee_tracker();
                    });
                });   
            });
        } else if (answers.main === "Add an Employee") {
            // calling all available titles
            db.query(`SELECT title FROM roles`, (err, response) => {
                if (err) throw err;
                let roleArray = [];
                response.forEach((roles) => {roleArray.push(roles.title);});
                inquirer.prompt([
                    {
                        type: 'input',
                        name: 'firstName',
                        message: 'What is their first name?',
                        validate: firstNameInput => {
                            if (firstNameInput) {
                                return true;
                            } else {
                                console.log("Please add a first name.");
                                return false;
                            }
                        }
                    },
                    {
                        type: 'input',
                        name: 'lastName',
                        message: 'What is their last name?',
                        validate: lastNameInput => {
                            if (lastNameInput) {
                                return true;
                            } else {
                                console.log("Please add a last name.");
                                return false;
                            }
                        }
                    },
                    {
                        type: 'list',
                        name: 'role',
                        message: 'What is the employees role?',
                        choices: roleArray
                    }
                ]).then((answers) => {
                    // need another query for adding manager to new employee
                    const newEmp = [answers.firstName, answers.lastName, answers.role];
                    db.query(`SELECT * FROM employees`, (err, data) => {
                        if (err) throw err;
                        const managerList = data.map(({id, first_name, last_name}) => ({name: first_name + " " + last_name, value: id}));
                        inquirer.prompt([
                            {
                                type: 'list',
                                name: 'manager',
                                message: 'Who is their manager?',
                                choices: managerList
                            }
                        ]).then(managerChoice => {
                            newEmp.push(managerChoice.manager);
                            db.query(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, (SELECT id FROM roles WHERE title = ?), ?)`, newEmp, (err, result) => {
                                if (err) throw err;
                                console.log(`Successfully added new employee`);
                                employee_tracker();
                            });
                        });
                    });                    
                });   
            });
        } else if (answers.main === "Update an Employee Role") {
            // calling all employees and roles currently in the system
            let empsql =  `SELECT * FROM employees`;
            db.query(empsql, (err, response) => {
                if (err) throw err;
                let empNameList = [];
                response.forEach((employees) => {empNameList.push(`${employees.first_name}`);});

                let rolesql = `SELECT * FROM roles`;
                db.query(rolesql, (err, response) => {
                    if (err) throw err;
                    let rolesList = [];
                    response.forEach((roles) => {rolesList.push(`${roles.title}`);});

                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'employee',
                            message: 'Which employee do you wish to update?',
                            choices: empNameList
                        },
                        {
                            type: 'list',
                            name: 'newrole',
                            message: 'What is this employees new role?',
                            choices: rolesList
                        }
                    ]).then((answers) => {
                        // need to get the values for sql
                        let newEmpTitle = `SELECT id FROM roles WHERE title = ${answers.newrole}`;
                        let empID = `${answers.employee}`;
                        response.forEach((roles) => {
                            if (answers.newrole === roles.title) {
                                newEmpTitle = roles.id;
                            }
                        });
                        response.forEach((employees) => {
                            if (answers.employee === employees.first_name) {
                                empID = employees.id;
                            }
                        });

                        // update employees table
                        let updatesql = `UPDATE employees SET employees.role_id = ? WHERE employees.first_name = ?`;
                        db.query(updatesql, [newEmpTitle, empID], (err) => {
                            if (err) throw err;
                            console.log("Successfully updated employee role.")
                            employee_tracker();
                        });
                    });
                });
            });
        } else if (answers.main === "Exit") {
            // quit application
            db.end();
            console.log("See you later~");
        }
    });
};
