-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS score_adjustments (
    adjustment_id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL,
    game_id BIGINT NOT NULL,
    adjustment_type VARCHAR(20) NOT NULL CHECK (adjustment_type IN ('cheat', 'reward', 'other')),
    score_change FLOAT NOT NULL,
    reason TEXT NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY (team_id) REFERENCES teams(team_id) ON DELETE CASCADE,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_score_adjustments_team_game ON score_adjustments(team_id, game_id);
CREATE INDEX idx_score_adjustments_game ON score_adjustments(game_id);
CREATE INDEX idx_score_adjustments_created_at ON score_adjustments(created_at);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS score_adjustments;
-- +goose StatementEnd
