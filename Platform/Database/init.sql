CREATE TABLE PROCESS(
    ID INT AUTO_INCREMENT PRIMARY KEY,
    CPU_ID INT NOT NULL,
    PID INT NOT NULL,
    NAME VARCHAR(255),
    USER INT NOT NULL,
    STATE INT NOT NULL,
    RAM DECIMAL(10,2) NOT NULL
);

CREATE TABLE RAM(
    ID INT AUTO_INCREMENT PRIMARY KEY,
    TOTAL DECIMAL(10,2) NOT NULL,
    FREE DECIMAL(10,2) NOT NULL,
    USED DECIMAL(10,2) NOT NULL,
    PERCENTAGE DECIMAL(10,2) NOT NULL
);

CREATE TABLE CPU (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    PERCENTAGE FLOAT NOT NULL,
    TIMESTAMP TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
