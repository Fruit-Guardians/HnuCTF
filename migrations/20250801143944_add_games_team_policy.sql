-- +goose Up
-- +goose StatementBegin
ALTER TABLE games ADD COLUMN team_policy jsonb NOT NULL DEFAULT '"Manual"'::jsonb;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- +goose StatementEnd
