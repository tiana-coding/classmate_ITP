DROP USER IF EXISTS 'classmate'@'localhost';
CREATE USER 'classmate'@'localhost' IDENTIFIED BY 'deinPasswort';
GRANT ALL PRIVILEGES
  ON classmate_db.*
  TO 'classmate'@'localhost';
FLUSH PRIVILEGES;