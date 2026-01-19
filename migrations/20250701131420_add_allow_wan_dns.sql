-- +goose Up
-- +goose StatementBegin
ALTER TABLE challenges ADD COLUMN allow_wan BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE challenges ADD COLUMN allow_dns BOOLEAN NOT NULL DEFAULT FALSE;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE challenges DROP COLUMN allow_wan;
ALTER TABLE challenges DROP COLUMN allow_dns;
-- +goose StatementEnd
