-- +goose Up
-- +goose StatementBegin
-- 添加 users 表的唯一性约束
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);
ALTER TABLE users ADD CONSTRAINT users_user_id_unique UNIQUE (user_id);

-- 添加 teams 唯一性
ALTER TABLE teams ADD CONSTRAINT teams_team_name_unique UNIQUE (team_name);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- +goose StatementEnd
