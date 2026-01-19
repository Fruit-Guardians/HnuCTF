-- +goose Up
-- +goose StatementBegin
CREATE TABLE "system_logs" (
    "log_id" BIGSERIAL NOT NULL,
    "log_category" jsonb NOT NULL,
    "user_id" uuid,
    "username" text,
    "action" text NOT NULL,
    "resource_type" text NOT NULL,
    "resource_id" text,
    "details" jsonb,
    "ip_address" text,
    "user_agent" text,
    "status" text NOT NULL,
    "error_message" text,
    "create_time" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "game_id" BIGINT,
    "challenge_id" BIGINT,
    "team_id" BIGINT,
    PRIMARY KEY (log_id),
    CONSTRAINT system_logs_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE SET NULL,
    CONSTRAINT system_logs_game_id_fkey FOREIGN KEY (game_id) 
        REFERENCES games(game_id) ON DELETE SET NULL,
    CONSTRAINT system_logs_challenge_id_fkey FOREIGN KEY (challenge_id) 
        REFERENCES challenges(challenge_id) ON DELETE SET NULL,
    CONSTRAINT system_logs_team_id_fkey FOREIGN KEY (team_id) 
        REFERENCES teams(team_id) ON DELETE SET NULL
);

CREATE INDEX idx_system_logs_user ON system_logs(user_id);
CREATE INDEX idx_system_logs_category ON system_logs USING GIN(log_category);
CREATE INDEX idx_system_logs_action ON system_logs(action);
CREATE INDEX idx_system_logs_resource ON system_logs(resource_type);
CREATE INDEX idx_system_logs_status ON system_logs(status);
CREATE INDEX idx_system_logs_time ON system_logs(create_time);
CREATE INDEX idx_system_logs_ip ON system_logs(ip_address);
CREATE INDEX idx_system_logs_game ON system_logs(game_id);
CREATE INDEX idx_system_logs_challenge ON system_logs(challenge_id);
CREATE INDEX idx_system_logs_team ON system_logs(team_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS "system_logs";
-- +goose StatementEnd
