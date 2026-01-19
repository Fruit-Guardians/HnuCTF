-- +goose Up
-- +goose StatementBegin
-- 为 solves 表添加 solve_status 和 solver_id 组合的唯一约束
ALTER TABLE solves ADD CONSTRAINT unique_solve_status_solver_id UNIQUE (solve_status, solver_id, ingame_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
-- 删除 solve_status 和 solver_id 组合的唯一约束
ALTER TABLE solves DROP CONSTRAINT IF EXISTS unique_solve_status_solver_id;
-- +goose StatementEnd
