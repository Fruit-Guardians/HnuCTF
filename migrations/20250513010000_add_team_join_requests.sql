-- +goose Up
-- +goose StatementBegin
CREATE TABLE "team_join_requests" (
    "request_id" BIGSERIAL NOT NULL,
    "team_id" BIGSERIAL NOT NULL,
    "user_id" uuid NOT NULL,
    "game_id" BIGSERIAL NOT NULL,
    "status" jsonb NOT NULL,
    "create_time" timestamp NOT NULL,
    "handle_time" timestamp,
    "handled_by" uuid,
    "message" text,
    PRIMARY KEY (request_id),
    CONSTRAINT team_join_requests_team_id_fkey FOREIGN KEY (team_id) 
        REFERENCES teams(team_id) ON DELETE CASCADE,
    CONSTRAINT team_join_requests_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT team_join_requests_game_id_fkey FOREIGN KEY (game_id) 
        REFERENCES games(game_id) ON DELETE CASCADE,
    CONSTRAINT team_join_requests_handled_by_fkey FOREIGN KEY (handled_by) 
        REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_team_join_requests_team ON team_join_requests(team_id);
CREATE INDEX idx_team_join_requests_user ON team_join_requests(user_id);
CREATE INDEX idx_team_join_requests_game ON team_join_requests(game_id);
CREATE INDEX idx_team_join_requests_status ON team_join_requests USING GIN(status);
CREATE INDEX idx_team_join_requests_time ON team_join_requests(create_time);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS "team_join_requests" CASCADE;
-- +goose StatementEnd 