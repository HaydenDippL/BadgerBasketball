CREATE TABLE schedules(
    id INTEGER PRIMARY KEY,
    date_queried DATE,
    gym VARCHAR(10),
    gym_facility VARCHAR(20),
    json_schedule TEXT
);

CREATE TABLE queries(
    id INTEGER PRIMARY KEY,
    date_queried DATE,
    gym VARCHAR(10),
    gym_facility VARCHAR(20),
    session_id VARCHAR(36),
    FOREIGN KEY(session_id) REFERENCES sessions(session_id)
);

CREATE TABLE sessions(
    session_id VARCHAR(36) PRIMARY KEY,
    IP TEXT,
    num_queries INT,
    date_of_queries DATE,
    device VARCHAR(40),
    browser VARCHAR(40)
);