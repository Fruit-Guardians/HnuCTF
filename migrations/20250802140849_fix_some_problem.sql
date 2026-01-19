-- +goose Up
-- +goose StatementBegin

--- 邮箱地址小写约束，防止重复
ALTER TABLE users DROP CONSTRAINT users_email_unique;
CREATE UNIQUE INDEX users_email_lower_unique ON users (LOWER(email));

--- 比赛容器约束，防止重复
CREATE UNIQUE INDEX idx_containers_unique_running ON containers (team_id, challenge_id)
WHERE container_status IN ('"ContainerRunning"'::jsonb, '"ContainerStarting"'::jsonb, '"ContainerQueueing"'::jsonb);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- +goose StatementEnd
