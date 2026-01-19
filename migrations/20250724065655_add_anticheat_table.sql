-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';

CREATE TABLE "cheats" (
    "cheat_id" uuid NOT NULL,
    "game_id" BIGSERIAL NOT NULL,
    "ingame_id" BIGSERIAL NOT NULL,
    "challenge_id" BIGSERIAL NOT NULL,
    "team_id" BIGSERIAL NOT NULL,
    "flag_id" BIGSERIAL,
    "judge_id" uuid NOT NULL,
    "submiter_id" uuid NOT NULL,
    "extra_data" jsonb,
    "cheat_time" timestamp NOT NULL,
    PRIMARY KEY (cheat_id),
    CONSTRAINT cheats_game_id_fkey FOREIGN KEY (game_id) 
        REFERENCES games(game_id) ON DELETE CASCADE,
     CONSTRAINT cheats_ingame_id_fkey FOREIGN KEY (ingame_id) 
        REFERENCES game_challenges(ingame_id) ON DELETE CASCADE,
    CONSTRAINT cheats_challenge_id_fkey FOREIGN KEY (challenge_id) 
        REFERENCES challenges(challenge_id) ON DELETE CASCADE,
    CONSTRAINT cheats_team_id_fkey FOREIGN KEY (team_id) 
        REFERENCES teams(team_id) ON DELETE CASCADE,
    CONSTRAINT cheats_flag_id_fkey FOREIGN KEY (flag_id) 
        REFERENCES team_flags(flag_id) ON DELETE CASCADE,
    CONSTRAINT cheats_submiter_id_fkey FOREIGN KEY (submiter_id) 
        REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT cheats_judge_id_fkey FOREIGN KEY (judge_id) 
        REFERENCES judges(judge_id) ON DELETE CASCADE
);

ALTER TABLE "judges" ADD COLUMN "submiter_ip" text;
ALTER TABLE "containers" ADD COLUMN "submiter_ip" text;
ALTER TABLE "cheats" ADD COLUMN "submiter_ip" text;
ALTER TABLE "cheats" ADD COLUMN "cheat_type" jsonb NOT NULL;

-- 建立相应索引
CREATE INDEX idx_judges_submiter_ip ON judges(submiter_ip);
CREATE INDEX idx_containers_submiter_ip ON containers(submiter_ip);
CREATE INDEX idx_cheats_submiter_ip ON cheats(submiter_ip);

CREATE INDEX idx_cheats_cheat_type ON cheats(cheat_type);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
-- +goose StatementEnd
