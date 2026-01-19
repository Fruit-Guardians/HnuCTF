-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
ALTER TABLE judges
ALTER COLUMN flag_id DROP NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
