-- +goose Up
-- +goose StatementBegin
-- 删除现有的唯一约束
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_team_name_unique;

-- 添加新的组合唯一约束
ALTER TABLE teams ADD CONSTRAINT teams_team_name_game_id_unique UNIQUE (team_name, game_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- +goose StatementEnd
