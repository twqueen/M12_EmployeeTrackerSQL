-- info for department
INSERT INTO department (dept_name)
VALUES ("Engineering"),
    ("Finance"),
    ("Legal"),
    ("Sales"),
    ("Board of Director");

-- info for role
INSERT INTO roles (title, salary, department_id)
VALUES ("Engineer Manager", 120000, 1),
    ("Accountant", 100000, 2),
    ("Paralegal", 140000, 3),
    ("Sales Representative", 95000, 4),
    ("Vice President", 180000, 5);

-- info for employee
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Snow", "White", 1, NULL),
    ("Cinder", "Ella", 2, 5),
    ("Aurora", "Sleeps", 3, 5),
    ("Ariel", "Redsea", 4, 1),
    ("Jasmine", "Sultana", 5, NULL);