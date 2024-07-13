CREATE TABLE users(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,username varchar(200),email varchar(200),password varchar(200),gender text,location text);

PRAGMA TABLE_INFO(users);


ALTER TABLE users RENAME COLUMN name TO email;

select * from users;

delete from users;

Update users set id = 1 where email = 'raja@gmail.com';

drop TABLE users;