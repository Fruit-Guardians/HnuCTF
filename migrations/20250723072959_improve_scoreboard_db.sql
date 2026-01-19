-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';

-- 更改 Scoreboard 表的结构
ALTER TABLE "scoreboard"
ADD COLUMN "team_id" BIGSERIAL,
ADD CONSTRAINT scoreboard_team_id_fkey FOREIGN KEY ("team_id") REFERENCES teams(team_id) ON DELETE CASCADE;
CREATE INDEX idx_scoreboard_team ON scoreboard(team_id);

ALTER TABLE "scoreboard" DROP COLUMN IF EXISTS "cur_records";
ALTER TABLE "scoreboard" RENAME COLUMN "prev_score" to "cur_score";
ALTER TABLE "scoreboard" ADD COLUMN "last_update_time" timestamp;

-- 添加 GameChallenge 里的三血加分
ALTER TABLE "challenges" ADD COLUMN "flag_type" jsonb NOT NULL;
ALTER TABLE "game_challenges" ADD COLUMN "enable_blood_reward" bool DEFAULT true;
ALTER TABLE "games" ADD COLUMN "first_blood_reward" int8 DEFAULT 5;
ALTER TABLE "games" ADD COLUMN "second_blood_reward" int8 DEFAULT 3;
ALTER TABLE "games" ADD COLUMN "third_blood_reward" int8 DEFAULT 1;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';

ALTER TABLE "scoreboard" DROP CONSTRAINT IF EXISTS scoreboard_team_id_fkey;
DROP INDEX IF EXISTS idx_scoreboard_team;
ALTER TABLE "scoreboard" DROP COLUMN IF EXISTS "team_id";

ALTER TABLE "scoreboard" DROP COLUMN IF EXISTS "last_update_time";

-- 移除 GameChallenge 里的三血部分
ALTER TABLE "challenges" DROP COLUMN IF EXISTS "flag_type";
ALTER TABLE "game_challenges" DROP COLUMN IF EXISTS "enable_blood_reward";
ALTER TABLE "games" DROP COLUMN IF EXISTS "first_blood_reward";
ALTER TABLE "games" DROP COLUMN IF EXISTS "second_blood_reward";
ALTER TABLE "games" DROP COLUMN IF EXISTS "third_blood_reward";

-- +goose StatementEnd
