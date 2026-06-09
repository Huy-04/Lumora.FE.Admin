-- Harness v0 schema — migration 002
-- Additive: records human gate approvals for stories.
-- Does NOT alter the existing intake/story/decision/backlog/trace tables;
-- it only introduces the story_gate table and bumps schema_version.

----------------------------------------------------------------------
-- Story gate: recorded human approvals guarding lifecycle transitions
----------------------------------------------------------------------
CREATE TABLE story_gate (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    story_id    TEXT NOT NULL REFERENCES story(id),
    gate        TEXT NOT NULL CHECK(gate IN ('plan','accept')),
    approved_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(story_id, gate)            -- at most one approval per (story, gate)
);

INSERT INTO schema_version (version) VALUES (2);  -- makes re-migrate a no-op
