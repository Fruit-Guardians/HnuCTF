-- +goose Up
-- +goose StatementBegin
ALTER TABLE solves ADD CONSTRAINT unique_solve_status_team_id_team_id UNIQUE (solve_status, team_id, ingame_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE solves DROP CONSTRAINT IF EXISTS unique_solve_status_team_id_team_id;
-- +goose StatementEnd
