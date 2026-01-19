-- +goose Up
-- +goose StatementBegin
ALTER TABLE users ADD COLUMN register_ip text;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users DROP COLUMN register_ip;
-- +goose StatementEnd
