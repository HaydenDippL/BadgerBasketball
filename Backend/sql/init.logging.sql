CREATE TABLE sessions(
    session_id VARCHAR(36) PRIMARY KEY,
    IP TEXT,
    num_queries INT,
    date_of_queries DATETIME,
    device VARCHAR(40),
    browser VARCHAR(40)
);

CREATE TABLE queries(
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    date_queried DATE,
    gym VARCHAR(10),
    gym_facility VARCHAR(20),
    session_id VARCHAR(36),
    FOREIGN KEY(session_id) REFERENCES sessions(session_id)
);