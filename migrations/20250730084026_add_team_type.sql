-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
ALTER TABLE teams ADD COLUMN team_type jsonb NOT NULL DEFAULT '"Player"'::jsonb;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
