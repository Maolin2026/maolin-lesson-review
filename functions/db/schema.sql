-- 评课系统数据库初始化脚本
-- 使用方法: wrangler d1 execute maolin-reviews --remote --file=functions/db/schema.sql

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  topic TEXT NOT NULL,                -- 课题名称
  teacher_id TEXT,                    -- 被评教师ID
  teacher_name TEXT NOT NULL,         -- 被评教师姓名
  grade TEXT NOT NULL,                -- 年级
  class_type TEXT NOT NULL,           -- 班型(强/优)
  type TEXT NOT NULL,                 -- 评课类型(lesson_plan/class_recording)
  subject TEXT DEFAULT '数学',        -- 学科
  reviewer_name TEXT NOT NULL,        -- 评课人
  total_score INTEGER NOT NULL,       -- 总分
  passed INTEGER DEFAULT 0,           -- 是否达标(1/0)
  pass_score INTEGER DEFAULT 85,      -- 达标分数线
  dimensions TEXT DEFAULT '[]',       -- 维度评分(JSON)
  overall_comment TEXT DEFAULT '',    -- 评语
  suggestions TEXT DEFAULT '[]',      -- 改进建议(JSON)
  highlights TEXT DEFAULT '[]',       -- 亮点(JSON)
  dbsheet_synced INTEGER DEFAULT 0,   -- 是否已同步到多维表(1/0)
  created_at TEXT NOT NULL,           -- 创建时间(ISO 8601)
  updated_at TEXT                     -- 更新时间
);

CREATE INDEX IF NOT EXISTS idx_reviews_grade ON reviews(grade);
CREATE INDEX IF NOT EXISTS idx_reviews_teacher ON reviews(teacher_id);
CREATE INDEX IF NOT EXISTS idx_reviews_synced ON reviews(dbsheet_synced);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at);
