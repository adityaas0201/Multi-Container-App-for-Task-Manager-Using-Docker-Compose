
CREATE TABLE public.tasks (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT tasks_title_not_blank
        CHECK (char_length(btrim(title)) > 0),

    CONSTRAINT tasks_description_length
        CHECK (char_length(description) <= 1000)
);

CREATE INDEX idx_tasks_created_at
    ON public.tasks (created_at DESC);
