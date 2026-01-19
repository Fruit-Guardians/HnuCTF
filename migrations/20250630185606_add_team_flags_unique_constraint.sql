-- +goose Up
-- +goose StatementBegin
-- 为 team_flags 表添加唯一约束，防止同一游戏同一题目生成重复的 flag
ALTER TABLE team_flags ADD CONSTRAINT unique_flag_per_game_challenge UNIQUE (flag_content, game_id, challenge_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- 移除唯一约束
ALTER TABLE team_flags DROP CONSTRAINT unique_flag_per_game_challenge;
-- +goose StatementEnd 