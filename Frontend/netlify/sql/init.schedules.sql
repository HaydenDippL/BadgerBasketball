CREATE TABLE schedules(
    id INTEGER PRIMARY KEY,
    date_queried DATE,
    gym VARCHAR(10),
    gym_facility VARCHAR(20),
    json_schedule TEXT
);