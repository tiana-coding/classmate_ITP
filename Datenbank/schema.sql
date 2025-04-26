-- =============================================================================
-- Erstellung des Datenbankschemas – 07.04.2025
-- =============================================================================

CREATE DATABASE IF NOT EXISTS classmate_db;
USE classmate_db;

-- Tabelle "users" (inkl. Passwort-Hash für Login/Registration)
CREATE TABLE IF NOT EXISTS users (
    id             INT PRIMARY KEY AUTO_INCREMENT,
    username       VARCHAR(255),
    role           VARCHAR(100),
    password_hash  VARCHAR(255),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabelle "points"
CREATE TABLE IF NOT EXISTS points (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    user_id       INT NOT NULL,
    total_points  INT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabelle "badges"
CREATE TABLE IF NOT EXISTS badges (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    name         VARCHAR(255),
    description  TEXT,
    icon         VARCHAR(255)
);

-- Tabelle "student_badges"
CREATE TABLE IF NOT EXISTS student_badges (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    user_id       INT NOT NULL,
    badge_id      INT NOT NULL,
    awarded_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)  REFERENCES users(id),
    FOREIGN KEY (badge_id) REFERENCES badges(id)
);

-- Tabelle "tasks"
CREATE TABLE IF NOT EXISTS tasks (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    title        VARCHAR(255),
    description  TEXT,
    week_number  INT,
    due_date     TIMESTAMP,
    points       INT
);

-- Tabelle "progress"
CREATE TABLE IF NOT EXISTS progress (
    id              INT PRIMARY KEY AUTO_INCREMENT,
    user_id         INT NOT NULL,
    task_id         INT NOT NULL,
    status          VARCHAR(50),
    completion_date TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- Tabelle "weekly_plans"
CREATE TABLE IF NOT EXISTS weekly_plans (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    user_id      INT NOT NULL,
    week_start   DATE,
    week_end     DATE,
    description  TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabelle "contents"
CREATE TABLE IF NOT EXISTS contents (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    title        VARCHAR(255),
    description  TEXT,
    file_path    VARCHAR(255)
);

-- Tabelle "task_contents" (m:n Beziehung)
CREATE TABLE IF NOT EXISTS task_contents (
    task_id    INT NOT NULL,
    content_id INT NOT NULL,
    PRIMARY KEY (task_id, content_id),
    FOREIGN KEY (task_id)    REFERENCES tasks(id),
    FOREIGN KEY (content_id) REFERENCES contents(id)
);

-- Tabelle "forum_threads"
CREATE TABLE IF NOT EXISTS forum_threads (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    user_id      INT NOT NULL,
    title        VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabelle "forum_posts"
CREATE TABLE IF NOT EXISTS forum_posts (
    id           INT PRIMARY KEY AUTO_INCREMENT,
    thread_id    INT NOT NULL,
    user_id      INT NOT NULL,
    content      TEXT,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thread_id) REFERENCES forum_threads(id),
    FOREIGN KEY (user_id)     REFERENCES users(id)
);

-- Tabelle "shared_materials"
CREATE TABLE IF NOT EXISTS shared_materials (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    user_id       INT NOT NULL,
    title         VARCHAR(255),
    description   TEXT,
    file_path     VARCHAR(255),
    created_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabelle "feedback"
CREATE TABLE IF NOT EXISTS feedback (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    user_id       INT NOT NULL,
    teacher_id    INT NOT NULL,
    content       TEXT,
    rating        INT,
    created_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)    REFERENCES users(id),
    FOREIGN KEY (teacher_id) REFERENCES users(id)
);


-- =============================================================================
-- Zusätzliche Tabellen einfügen – 26.04.2025
-- =============================================================================

-- 1. Protokollierung einzelner Punkteänderungen
CREATE TABLE IF NOT EXISTS point_logs (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    user_id       INT NOT NULL,
    task_id       INT,
    points_delta  INT NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (task_id) REFERENCES tasks(id)
);

-- 2. Kommentare zu geteilten Materialien
CREATE TABLE IF NOT EXISTS shared_material_comments (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    material_id   INT NOT NULL,
    user_id       INT NOT NULL,
    comment_text  TEXT,
    created_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES shared_materials(id),
    FOREIGN KEY (user_id)     REFERENCES users(id)
);

-- 3. Bewertungen für geteilte Materialien
CREATE TABLE IF NOT EXISTS shared_material_ratings (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    material_id   INT NOT NULL,
    user_id       INT NOT NULL,
    rating_value  INT,
    created_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES shared_materials(id),
    FOREIGN KEY (user_id)     REFERENCES users(id)
);

-- 4. Individuelle Lernziele der Benutzer
CREATE TABLE IF NOT EXISTS user_goals (
    id            INT PRIMARY KEY AUTO_INCREMENT,
    user_id       INT NOT NULL,
    goal_type     VARCHAR(100),
    target_value  INT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


