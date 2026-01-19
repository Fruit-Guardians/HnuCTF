-- +goose Up
-- +goose StatementBegin
CREATE TABLE "users" (
    "user_id" uuid NOT NULL,
    "username" text NOT NULL,
    "password" text NOT NULL,
    "salt" text NOT NULL,
    "role" jsonb NOT NULL,
    "cur_token" text,
    "phone" text,
    "student_number" text,
    "realname" text,
    "slogan" text,
    "avatar" text,
    "sso_data" text,
    "email" text,
    "email_verified" bool DEFAULT false,
    "register_time" timestamp NOT NULL,
    "last_login_time" timestamp,
    "jwt_version" text NOT NULL,
    "last_login_ip" text,
    PRIMARY KEY (user_id)
);

CREATE INDEX idx_users_username ON users(username);

CREATE TABLE "games" (
    "game_id" BIGSERIAL NOT NULL,
    "name" text NOT NULL,
    "summary" text,
    "description" text,
    "poster" text,
    "invite_code" text,
    "start_time" timestamp NOT NULL,
    "end_time" timestamp NOT NULL,
    "practice_mode" bool DEFAULT false NOT NULL,
    "team_number_limit" int4 NOT NULL,
    "container_number_limit" int4 NOT NULL,
    "require_wp" bool DEFAULT false NOT NULL,
    "wp_expire_time" timestamp NOT NULL,
    "stages" jsonb NOT NULL,
    "visible" bool DEFAULT false NOT NULL,
    PRIMARY KEY (game_id)
);

CREATE INDEX idx_games_invite_code ON games(invite_code);
CREATE INDEX idx_games_time_range ON games(start_time, end_time);
CREATE INDEX idx_games_visible ON games(visible);

CREATE TABLE "challenges" (
    "challenge_id" BIGSERIAL NOT NULL,
    "name" text NOT NULL,
    "description" text NOT NULL,
    "category" jsonb NOT NULL,
    "attachments" jsonb NOT NULL,
    "container_type" jsonb NOT NULL,
    "container_config" jsonb,
    "create_time" timestamp NOT NULL,
    "judge_config" jsonb,
    PRIMARY KEY (challenge_id)
);

CREATE INDEX idx_challenges_name ON challenges(name);
CREATE INDEX idx_challenges_category ON challenges USING GIN(category);

CREATE TABLE "game_challenges" (
    "ingame_id" BIGSERIAL NOT NULL,
    "game_id" BIGSERIAL NOT NULL,
    "challenge_id" BIGSERIAL NOT NULL,
    "total_score" double precision DEFAULT 0 NOT NULL,
    "cur_score" double precision DEFAULT 0 NOT NULL,
    "minimal_score" double precision DEFAULT 0 NOT NULL,
    "difficulty" double precision DEFAULT 5 NOT NULL,
    "hints" jsonb DEFAULT '[]'::jsonb,
    "solve_count" int4 DEFAULT 0 NOT NULL,
    "judge_config" jsonb,
    "visible" bool DEFAULT false,
    "belong_stage" text,
    PRIMARY KEY (ingame_id),
    CONSTRAINT game_challenges_game_id_fkey FOREIGN KEY (game_id) 
        REFERENCES games(game_id) ON DELETE CASCADE,
    CONSTRAINT game_challenges_challenge_id_fkey FOREIGN KEY (challenge_id) 
        REFERENCES challenges(challenge_id) ON DELETE CASCADE
);

CREATE INDEX idx_game_challenges_game_challenge ON game_challenges(game_id, challenge_id);
CREATE INDEX idx_game_challenges_belong_stage ON game_challenges(belong_stage);
CREATE INDEX idx_game_challenges_enabled ON game_challenges(visible);

CREATE TABLE "teams" (
    "team_id" BIGSERIAL NOT NULL,
    "game_id" BIGSERIAL NOT NULL,
    "team_name" text NOT NULL,
    "team_avatar" text,
    "team_slogan" text,
    "team_description" text,
    "team_members" uuid[],
    "team_score" double precision DEFAULT 0 NOT NULL,
    "team_hash" text unique NOT NULL,
    "invite_code" text,
    "team_status" jsonb NOT NULL,
    PRIMARY KEY (team_id),
    CONSTRAINT teams_game_id_fkey FOREIGN KEY (game_id) 
        REFERENCES games(game_id) ON DELETE CASCADE
);

CREATE INDEX idx_teams_invite_code ON teams(invite_code);
CREATE INDEX idx_teams_members ON teams USING GIN(team_members);

CREATE TABLE "team_flags" (
    "flag_id" BIGSERIAL NOT NULL,
    "flag_content" text NOT NULL,
    "team_id" BIGSERIAL NOT NULL,
    "game_id" BIGSERIAL NOT NULL,
    "challenge_id" BIGSERIAL NOT NULL,
    PRIMARY KEY (flag_id),
    CONSTRAINT team_flags_team_id_fkey FOREIGN KEY (team_id) 
        REFERENCES teams(team_id) ON DELETE CASCADE,
    CONSTRAINT team_flags_game_id_fkey FOREIGN KEY (game_id) 
        REFERENCES games(game_id) ON DELETE CASCADE,
    CONSTRAINT team_flags_challenge_id_fkey FOREIGN KEY (challenge_id) 
        REFERENCES challenges(challenge_id) ON DELETE CASCADE
);

CREATE INDEX idx_team_flags_content ON team_flags(flag_content);
CREATE INDEX idx_team_flags_team ON team_flags(team_id);
CREATE INDEX idx_team_flags_game ON team_flags(game_id);
CREATE INDEX idx_team_flags_challenge ON team_flags(challenge_id);

CREATE TABLE "containers" (
    "container_id" uuid NOT NULL,
    "game_id" BIGSERIAL NOT NULL,
    "team_id" BIGSERIAL NOT NULL,
    "flag_id" BIGSERIAL NOT NULL,
    "challenge_id" BIGSERIAL NOT NULL,
    "ingame_id" BIGSERIAL NOT NULL,
    "start_time" timestamp NOT NULL,
    "expire_time" timestamp NOT NULL,
    "container_config" jsonb NOT NULL,
    "challenge_name" text NOT NULL,
    "team_hash" text NOT NULL,
    "expose_ports" jsonb NOT NULL,
    "container_status" jsonb NOT NULL,
    PRIMARY KEY (container_id),
    CONSTRAINT containers_game_id_fkey FOREIGN KEY (game_id) 
        REFERENCES games(game_id) ON DELETE CASCADE,
    CONSTRAINT containers_team_id_fkey FOREIGN KEY (team_id) 
        REFERENCES teams(team_id) ON DELETE CASCADE,
    CONSTRAINT containers_flag_id_fkey FOREIGN KEY (flag_id) 
        REFERENCES team_flags(flag_id) ON DELETE CASCADE,
    CONSTRAINT containers_challenge_id_fkey FOREIGN KEY (challenge_id) 
        REFERENCES challenges(challenge_id) ON DELETE CASCADE,
    CONSTRAINT containers_ingame_id_fkey FOREIGN KEY (ingame_id) 
        REFERENCES game_challenges(ingame_id) ON DELETE CASCADE
);

CREATE INDEX idx_containers_game_team ON containers(game_id, team_id);
CREATE INDEX idx_containers_challenge ON containers(challenge_id);
CREATE INDEX idx_containers_time_range ON containers(start_time, expire_time);

CREATE TABLE "judges" (
    "game_id" BIGSERIAL NOT NULL,
    "ingame_id" BIGSERIAL NOT NULL,
    "challenge_id" BIGSERIAL NOT NULL,
    "team_id" BIGSERIAL NOT NULL,
    "flag_id" BIGSERIAL NOT NULL,
    "judge_type" jsonb NOT NULL,
    "judge_status" jsonb NOT NULL,
    "judge_result" text,
    "submiter_id" uuid NOT NULL,
    "judge_id" uuid NOT NULL,
    "judge_time" timestamp NOT NULL,
    "judge_content" text NOT NULL,
    PRIMARY KEY (judge_id),
    CONSTRAINT judges_game_id_fkey FOREIGN KEY (game_id) 
        REFERENCES games(game_id) ON DELETE CASCADE,
    CONSTRAINT judges_ingame_id_fkey FOREIGN KEY (ingame_id) 
        REFERENCES game_challenges(ingame_id) ON DELETE CASCADE,
    CONSTRAINT judges_challenge_id_fkey FOREIGN KEY (challenge_id) 
        REFERENCES challenges(challenge_id) ON DELETE CASCADE,
    CONSTRAINT judges_team_id_fkey FOREIGN KEY (team_id) 
        REFERENCES teams(team_id) ON DELETE CASCADE,
    CONSTRAINT judges_flag_id_fkey FOREIGN KEY (flag_id) 
        REFERENCES team_flags(flag_id) ON DELETE CASCADE,
    CONSTRAINT judges_submiter_id_fkey FOREIGN KEY (submiter_id) 
        REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_judges_challenge_team ON judges(challenge_id, team_id);
CREATE INDEX idx_judges_status_result ON judges USING GIN(judge_status);
CREATE INDEX idx_judges_ingame_id ON judges(ingame_id);
CREATE INDEX idx_judges_time ON judges(judge_time);

CREATE TABLE "uploads" (
    "file_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,
    "file_name" text NOT NULL,
    "file_path" text NOT NULL,
    "file_hash" text NOT NULL,
    "file_type" text NOT NULL,
    "file_size" int8 NOT NULL,
    "upload_time" timestamp NOT NULL,
    PRIMARY KEY (file_id),
    CONSTRAINT uploads_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_uploads_user ON uploads(user_id);
CREATE INDEX idx_uploads_file_hash ON uploads(file_hash);
CREATE INDEX idx_uploads_time ON uploads(upload_time);

CREATE TABLE "solves" (
    "judge_id" uuid NOT NULL,
    "solve_id" uuid NOT NULL,
    "ingame_id" BIGSERIAL NOT NULL,
    "game_id" BIGSERIAL NOT NULL,
    "challenge_id" BIGSERIAL NOT NULL,
    "team_id" BIGSERIAL NOT NULL,
    "container_id" uuid,
    "solve_status" jsonb NOT NULL,
    "solve_time" timestamp NOT NULL,
    "solver_id" uuid NOT NULL,
    "rank" int4 NOT NULL,
    PRIMARY KEY (solve_id),
    CONSTRAINT solves_judge_id_fkey FOREIGN KEY (judge_id) 
        REFERENCES judges(judge_id) ON DELETE CASCADE,
    CONSTRAINT solves_ingame_id_fkey FOREIGN KEY (ingame_id) 
        REFERENCES game_challenges(ingame_id) ON DELETE CASCADE,
    CONSTRAINT solves_game_id_fkey FOREIGN KEY (game_id) 
        REFERENCES games(game_id) ON DELETE CASCADE,
    CONSTRAINT solves_challenge_id_fkey FOREIGN KEY (challenge_id) 
        REFERENCES challenges(challenge_id) ON DELETE CASCADE,
    CONSTRAINT solves_team_id_fkey FOREIGN KEY (team_id) 
        REFERENCES teams(team_id) ON DELETE CASCADE,
    CONSTRAINT solves_container_id_fkey FOREIGN KEY (container_id) 
        REFERENCES containers(container_id) ON DELETE CASCADE,
    CONSTRAINT solves_solver_id_fkey FOREIGN KEY (solver_id) 
        REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_solves_game_team ON solves(game_id, team_id);
CREATE INDEX idx_solves_challenge ON solves(challenge_id);
CREATE INDEX idx_solves_container ON solves(container_id);
CREATE INDEX idx_solves_status ON solves USING GIN(solve_status);
CREATE INDEX idx_solves_time_rank ON solves(solve_time, rank);
CREATE INDEX idx_solves_time_solver ON solves(solve_time, solver_id);
CREATE INDEX idx_solve_ingame_id ON solves(ingame_id);
CREATE INDEX idx_solve_judge_id ON solves(judge_id);

CREATE TABLE "notices" (
    "notice_id" BIGSERIAL NOT NULL,
    "game_id" BIGSERIAL NOT NULL,
    "notice_category" jsonb NOT NULL,
    "create_time" timestamp NOT NULL,
    "announced" bool DEFAULT false NOT NULL,
    "data" text[] NOT NULL,
    PRIMARY KEY (notice_id),
    CONSTRAINT notices_game_id_fkey FOREIGN KEY (game_id) 
        REFERENCES games(game_id) ON DELETE CASCADE
);

CREATE INDEX idx_notices_game ON notices(game_id);
CREATE INDEX idx_notices_time ON notices(create_time);
CREATE INDEX idx_notices_announced ON notices(announced);
CREATE INDEX idx_notices_category ON notices USING GIN(notice_category);

CREATE TABLE "scoreboard" (
    "score_id" BIGSERIAL NOT NULL,
    "game_id" BIGSERIAL NOT NULL,
    "cur_records" int4 NOT NULL DEFAULT 0,
    "prev_score" jsonb NOT NULL,
    "data" jsonb NOT NULL,
    "generate_time" timestamp NOT NULL,
    PRIMARY KEY (score_id),
    CONSTRAINT scoreboard_game_id_fkey FOREIGN KEY (game_id) 
        REFERENCES games(game_id) ON DELETE CASCADE
);

CREATE INDEX idx_scoreboard_game ON scoreboard(game_id);
CREATE INDEX idx_scoreboard_time ON scoreboard(generate_time);
CREATE INDEX idx_scoreboard_records ON scoreboard(cur_records);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "games" CASCADE;
DROP TABLE IF EXISTS "challenges" CASCADE;
DROP TABLE IF EXISTS "game_challenges" CASCADE;
DROP TABLE IF EXISTS "teams" CASCADE;
DROP TABLE IF EXISTS "team_flags" CASCADE;
DROP TABLE IF EXISTS "containers" CASCADE;
DROP TABLE IF EXISTS "judges" CASCADE;
DROP TABLE IF EXISTS "uploads" CASCADE;
DROP TABLE IF EXISTS "solves" CASCADE;
DROP TABLE IF EXISTS "notices" CASCADE;
DROP TABLE IF EXISTS "scoreboard" CASCADE;
-- +goose StatementEnd
