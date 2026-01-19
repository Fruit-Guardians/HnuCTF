-- +goose Up
-- +goose StatementBegin
-- 添加比赛分组表
CREATE TABLE IF NOT EXISTS game_groups (
    group_id BIGSERIAL PRIMARY KEY,
    game_id BIGINT NOT NULL,
    group_name VARCHAR(100) NOT NULL,
    group_description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    UNIQUE(game_id, group_name)
);

-- 为teams表添加group_id字段
ALTER TABLE teams ADD COLUMN IF NOT EXISTS group_id BIGINT;
ALTER TABLE teams ADD CONSTRAINT fk_teams_group_id 
    FOREIGN KEY (group_id) REFERENCES game_groups(group_id) ON DELETE SET NULL;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_game_groups_game_id ON game_groups(game_id);
CREATE INDEX IF NOT EXISTS idx_teams_group_id ON teams(group_id);
CREATE INDEX IF NOT EXISTS idx_game_groups_display_order ON game_groups(game_id, display_order);

-- 插入评论
COMMENT ON TABLE game_groups IS '比赛分组表';
COMMENT ON COLUMN game_groups.group_id IS '分组ID';
COMMENT ON COLUMN game_groups.game_id IS '比赛ID';
COMMENT ON COLUMN game_groups.group_name IS '分组名称';
COMMENT ON COLUMN game_groups.group_description IS '分组描述';
COMMENT ON COLUMN game_groups.display_order IS '显示顺序';
COMMENT ON COLUMN teams.group_id IS '所属分组ID'; 
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS "game_groups" CASCADE;
-- +goose StatementEnd
