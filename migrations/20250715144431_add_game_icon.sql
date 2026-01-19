-- +goose Up
-- +goose StatementBegin
ALTER TABLE games ADD COLUMN game_icon_light text;
ALTER TABLE games ADD COLUMN game_icon_dark text;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE games DROP COLUMN game_icon_light;
ALTER TABLE games DROP COLUMN game_icon_dark;
-- +goose StatementEnd
