CREATE TABLE books(id INT,title VARCHAR(200),authorId INT,rating float,ratingCount INT,reviewCount INT,description TEXt,pages INT,dateOfPublication DATE,editionLanguage TEXT,price INT,onlineStores TEXT);

PRAGMA TABLE_INFO(books);

INSERT INTO books(id,title,authorId,rating,ratingCount,reviewCount,description,pages,dateOfPublication,editionLanguage,price,onlineStores)
VALUES (2,'Titanic',2,4.8,400,550,'Good Feel Book',50,'1980-08-10','English',5738,'Amazon.in'),
(3,'Avatar',2,4.9,600,850,'Sci -fi',70,'2021-11-09','English',7649,'flipkart.com'),
(4,'Bhahubali',3,4.9,500,950,'Good Drama',40,'2016-10-20','Telugu',8800,'Amazon.in'),
(5,'The Hobbit',3,4.7,800,650,'Good Action',90,'2022-12-20','Telugu',9840,'Amazon.in');


select * from books;