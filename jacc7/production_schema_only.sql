--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: achievements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text NOT NULL,
    icon character varying(50) NOT NULL,
    category character varying(50) NOT NULL,
    rarity character varying(20) DEFAULT 'common'::character varying NOT NULL,
    points integer DEFAULT 10 NOT NULL,
    requirement jsonb NOT NULL,
    is_hidden boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.achievements OWNER TO neondb_owner;

--
-- Name: admin_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    setting_key character varying NOT NULL,
    setting_value text,
    description text,
    category character varying DEFAULT 'general'::character varying,
    is_active boolean DEFAULT true,
    updated_by character varying,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.admin_settings OWNER TO neondb_owner;

--
-- Name: admin_settings_legacy; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin_settings_legacy (
    id character varying DEFAULT 'default'::character varying NOT NULL,
    system_prompt text,
    user_instructions text,
    assistant_prompt text,
    temperature text DEFAULT '0.7'::text,
    max_tokens integer DEFAULT 1500,
    top_p text DEFAULT '1.0'::text,
    frequency_penalty text DEFAULT '0.0'::text,
    presence_penalty text DEFAULT '0.0'::text,
    enable_voice boolean DEFAULT true,
    enable_document_search boolean DEFAULT true,
    enable_rate_comparisons boolean DEFAULT true,
    google_drive_folder_id character varying,
    model character varying DEFAULT 'claude-3-7-sonnet-20250219'::character varying,
    enable_prompt_chaining boolean DEFAULT true,
    enable_smart_routing boolean DEFAULT true,
    folder_routing_threshold real DEFAULT 0.7,
    updated_at timestamp without time zone DEFAULT now(),
    updated_by character varying
);


ALTER TABLE public.admin_settings_legacy OWNER TO neondb_owner;

--
-- Name: ai_knowledge_corrections; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ai_knowledge_corrections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    feedback_id uuid,
    incorrect_information text NOT NULL,
    correct_information text NOT NULL,
    source_documents text[],
    category character varying NOT NULL,
    applied_to_system boolean DEFAULT false,
    admin_verified boolean DEFAULT false,
    verified_by character varying,
    verified_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ai_knowledge_corrections OWNER TO neondb_owner;

--
-- Name: ai_models; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ai_models (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    provider character varying NOT NULL,
    model_id character varying NOT NULL,
    is_active boolean DEFAULT true,
    max_tokens integer DEFAULT 4000,
    cost_per_token real DEFAULT 0,
    is_default boolean DEFAULT false,
    capabilities jsonb,
    description text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ai_models OWNER TO neondb_owner;

--
-- Name: ai_prompt_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ai_prompt_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    description text,
    category character varying NOT NULL,
    template text NOT NULL,
    variables jsonb,
    is_active boolean DEFAULT true,
    version integer DEFAULT 1,
    temperature real DEFAULT 0.3,
    max_tokens integer DEFAULT 300,
    created_by character varying,
    last_modified_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ai_prompt_templates OWNER TO neondb_owner;

--
-- Name: ai_training_feedback; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ai_training_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id uuid,
    message_id uuid,
    user_query text NOT NULL,
    ai_response text NOT NULL,
    correct_response text,
    feedback_type character varying NOT NULL,
    admin_notes text,
    source_docs jsonb,
    knowledge_gaps text[],
    suggested_prompt_changes text,
    status character varying DEFAULT 'pending'::character varying,
    reviewed_by character varying,
    reviewed_at timestamp without time zone,
    priority integer DEFAULT 1,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ai_training_feedback OWNER TO neondb_owner;

--
-- Name: ai_training_materials; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ai_training_materials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    content text NOT NULL,
    material_type character varying NOT NULL,
    category character varying NOT NULL,
    tags text[],
    priority integer DEFAULT 1,
    is_verified boolean DEFAULT false,
    verified_by character varying,
    source_document character varying,
    last_reviewed timestamp without time zone,
    review_notes text,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.ai_training_materials OWNER TO neondb_owner;

--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.api_keys (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    key_hash character varying NOT NULL,
    user_id character varying NOT NULL,
    permissions text[] DEFAULT '{}'::text[],
    is_active boolean DEFAULT true,
    last_used timestamp without time zone,
    expires_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    key_encrypted jsonb
);


ALTER TABLE public.api_keys OWNER TO neondb_owner;

--
-- Name: api_usage_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.api_usage_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying,
    provider character varying NOT NULL,
    model character varying NOT NULL,
    operation character varying NOT NULL,
    input_tokens integer,
    output_tokens integer,
    total_tokens integer,
    request_count integer DEFAULT 1,
    estimated_cost numeric(10,6),
    request_data jsonb,
    response_time integer,
    success boolean DEFAULT true,
    error_message text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.api_usage_logs OWNER TO neondb_owner;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type character varying NOT NULL,
    user_id character varying,
    user_email character varying,
    ip_address character varying NOT NULL,
    user_agent text,
    resource_id character varying,
    resource_type character varying,
    action character varying NOT NULL,
    details jsonb,
    success boolean NOT NULL,
    error_message text,
    status character varying,
    "timestamp" timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO neondb_owner;

--
-- Name: chat_monitoring; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.chat_monitoring (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id uuid NOT NULL,
    user_id character varying NOT NULL,
    first_message text,
    message_count integer DEFAULT 0,
    session_duration integer DEFAULT 0,
    ai_response_time integer DEFAULT 0,
    documents_referenced integer DEFAULT 0,
    calculator_used boolean DEFAULT false,
    error_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.chat_monitoring OWNER TO neondb_owner;

--
-- Name: chat_ratings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.chat_ratings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id uuid NOT NULL,
    user_id character varying NOT NULL,
    rating integer NOT NULL,
    feedback text,
    session_notes text,
    improvement_areas text[],
    message_count integer DEFAULT 0,
    session_duration_minutes integer,
    was_helpful boolean,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.chat_ratings OWNER TO neondb_owner;

--
-- Name: chat_reviews; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.chat_reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id uuid NOT NULL,
    reviewed_by character varying,
    review_status character varying DEFAULT 'pending'::character varying NOT NULL,
    review_notes text,
    corrections_made integer DEFAULT 0,
    total_messages integer DEFAULT 0,
    last_reviewed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.chat_reviews OWNER TO neondb_owner;

--
-- Name: chats; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.chats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    user_id character varying NOT NULL,
    folder_id uuid,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.chats OWNER TO neondb_owner;

--
-- Name: content_enhancement_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.content_enhancement_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    session_name character varying NOT NULL,
    description text,
    chunks_processed integer DEFAULT 0,
    chunks_enhanced integer DEFAULT 0,
    time_spent_minutes integer DEFAULT 0,
    status character varying DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.content_enhancement_sessions OWNER TO neondb_owner;

--
-- Name: content_filters; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.content_filters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    filter_type character varying NOT NULL,
    pattern text NOT NULL,
    severity character varying DEFAULT 'medium'::character varying,
    action character varying DEFAULT 'flag'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.content_filters OWNER TO neondb_owner;

--
-- Name: content_quality_flags; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.content_quality_flags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chunk_id character varying NOT NULL,
    document_id uuid NOT NULL,
    flag_type character varying NOT NULL,
    flag_reason text NOT NULL,
    priority character varying DEFAULT 'medium'::character varying,
    status character varying DEFAULT 'pending'::character varying,
    assigned_to character varying,
    ai_suggestion text,
    human_notes text,
    original_content text NOT NULL,
    enhanced_content text,
    review_count integer DEFAULT 0,
    last_review_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.content_quality_flags OWNER TO neondb_owner;

--
-- Name: daily_usage; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.daily_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    date timestamp without time zone NOT NULL,
    messages_count integer DEFAULT 0,
    chats_created integer DEFAULT 0,
    time_spent_minutes integer DEFAULT 0,
    features_used text[],
    points_earned integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.daily_usage OWNER TO neondb_owner;

--
-- Name: document_access_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.document_access_logs (
    id integer NOT NULL,
    user_id character varying NOT NULL,
    document_id character varying NOT NULL,
    access_type character varying NOT NULL,
    allowed boolean NOT NULL,
    reason character varying,
    ip_address character varying NOT NULL,
    user_agent text,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.document_access_logs OWNER TO neondb_owner;

--
-- Name: document_access_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.document_access_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.document_access_logs_id_seq OWNER TO neondb_owner;

--
-- Name: document_access_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.document_access_logs_id_seq OWNED BY public.document_access_logs.id;


--
-- Name: document_approval_decisions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.document_approval_decisions (
    id character varying NOT NULL,
    approval_id character varying NOT NULL,
    admin_user_id character varying NOT NULL,
    decision character varying NOT NULL,
    selected_folder character varying,
    permission_level character varying,
    decided_at timestamp without time zone DEFAULT now(),
    notes text
);


ALTER TABLE public.document_approval_decisions OWNER TO neondb_owner;

--
-- Name: document_changes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.document_changes (
    id character varying NOT NULL,
    document_id character varying NOT NULL,
    change_type character varying NOT NULL,
    change_details jsonb,
    detected_at timestamp without time zone DEFAULT now(),
    notified boolean DEFAULT false
);


ALTER TABLE public.document_changes OWNER TO neondb_owner;

--
-- Name: document_chunks; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.document_chunks (
    id character varying NOT NULL,
    document_id uuid NOT NULL,
    content text NOT NULL,
    chunk_index integer NOT NULL,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.document_chunks OWNER TO neondb_owner;

--
-- Name: document_permissions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.document_permissions (
    id integer NOT NULL,
    document_id character varying NOT NULL,
    user_id character varying,
    group_id character varying,
    permission_level character varying NOT NULL,
    granted_by character varying NOT NULL,
    granted_at timestamp without time zone DEFAULT now(),
    expires_at timestamp without time zone
);


ALTER TABLE public.document_permissions OWNER TO neondb_owner;

--
-- Name: document_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.document_permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.document_permissions_id_seq OWNER TO neondb_owner;

--
-- Name: document_permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.document_permissions_id_seq OWNED BY public.document_permissions.id;


--
-- Name: document_processing_jobs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.document_processing_jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_id uuid,
    status character varying DEFAULT 'pending'::character varying,
    job_type character varying NOT NULL,
    priority integer DEFAULT 1,
    attempts integer DEFAULT 0,
    max_attempts integer DEFAULT 3,
    error_message text,
    processing_time_ms integer,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.document_processing_jobs OWNER TO neondb_owner;

--
-- Name: document_tag_relations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.document_tag_relations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.document_tag_relations OWNER TO neondb_owner;

--
-- Name: document_tags; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.document_tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    color character varying NOT NULL,
    description text,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.document_tags OWNER TO neondb_owner;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    mime_type character varying(100) NOT NULL,
    size integer NOT NULL,
    path text NOT NULL,
    user_id character varying NOT NULL,
    folder_id uuid,
    is_favorite boolean DEFAULT false,
    content_hash character varying(64),
    name_hash character varying(32),
    is_public boolean DEFAULT true,
    admin_only boolean DEFAULT false,
    manager_only boolean DEFAULT false,
    tags text[] DEFAULT '{}'::text[],
    category character varying(100),
    subcategory character varying(100),
    processor_type character varying(50),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    training_data boolean DEFAULT false,
    auto_vectorize boolean DEFAULT false
);


ALTER TABLE public.documents OWNER TO neondb_owner;

--
-- Name: faq_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.faq_categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    color character varying(7) DEFAULT '#3B82F6'::character varying,
    icon character varying(50) DEFAULT 'HelpCircle'::character varying,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.faq_categories OWNER TO neondb_owner;

--
-- Name: faq_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.faq_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.faq_categories_id_seq OWNER TO neondb_owner;

--
-- Name: faq_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.faq_categories_id_seq OWNED BY public.faq_categories.id;


--
-- Name: faq_knowledge_base; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.faq_knowledge_base (
    id integer NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    category character varying NOT NULL,
    category_id integer,
    tags text[] DEFAULT '{}'::text[],
    priority integer DEFAULT 1,
    is_active boolean DEFAULT true,
    last_updated timestamp without time zone DEFAULT now(),
    created_at timestamp without time zone DEFAULT now(),
    created_by character varying DEFAULT 'admin'::character varying,
    google_sheet_row_id character varying,
    source_type character varying DEFAULT 'manual'::character varying
);


ALTER TABLE public.faq_knowledge_base OWNER TO neondb_owner;

--
-- Name: faq_knowledge_base_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.faq_knowledge_base_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.faq_knowledge_base_id_seq OWNER TO neondb_owner;

--
-- Name: faq_knowledge_base_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.faq_knowledge_base_id_seq OWNED BY public.faq_knowledge_base.id;


--
-- Name: favorites; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.favorites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    item_type character varying(50) NOT NULL,
    item_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.favorites OWNER TO neondb_owner;

--
-- Name: folders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.folders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    user_id character varying NOT NULL,
    parent_id uuid,
    color character varying(50) DEFAULT 'blue'::character varying,
    vector_namespace character varying(255) NOT NULL,
    folder_type character varying(50) DEFAULT 'custom'::character varying,
    priority integer DEFAULT 50,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.folders OWNER TO neondb_owner;

--
-- Name: google_sheets_sync_config; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.google_sheets_sync_config (
    id integer NOT NULL,
    spreadsheet_id character varying NOT NULL,
    sheet_name character varying DEFAULT 'Sheet1'::character varying,
    question_column character varying DEFAULT 'A'::character varying,
    answer_column character varying DEFAULT 'B'::character varying,
    category_column character varying DEFAULT 'C'::character varying,
    tags_column character varying DEFAULT 'D'::character varying,
    priority_column character varying DEFAULT 'E'::character varying,
    is_active_column character varying DEFAULT 'F'::character varying,
    header_row integer DEFAULT 1,
    sync_enabled boolean DEFAULT true,
    sync_frequency character varying DEFAULT 'manual'::character varying,
    last_sync_at timestamp without time zone,
    last_sync_status character varying,
    last_sync_error text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    created_by character varying
);


ALTER TABLE public.google_sheets_sync_config OWNER TO neondb_owner;

--
-- Name: google_sheets_sync_config_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.google_sheets_sync_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.google_sheets_sync_config_id_seq OWNER TO neondb_owner;

--
-- Name: google_sheets_sync_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.google_sheets_sync_config_id_seq OWNED BY public.google_sheets_sync_config.id;


--
-- Name: google_sheets_sync_log; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.google_sheets_sync_log (
    id integer NOT NULL,
    config_id integer,
    sync_type character varying NOT NULL,
    status character varying NOT NULL,
    items_processed integer DEFAULT 0,
    items_added integer DEFAULT 0,
    items_updated integer DEFAULT 0,
    items_skipped integer DEFAULT 0,
    error_details text,
    duration integer,
    started_at timestamp without time zone NOT NULL,
    completed_at timestamp without time zone,
    triggered_by character varying
);


ALTER TABLE public.google_sheets_sync_log OWNER TO neondb_owner;

--
-- Name: google_sheets_sync_log_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.google_sheets_sync_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.google_sheets_sync_log_id_seq OWNER TO neondb_owner;

--
-- Name: google_sheets_sync_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.google_sheets_sync_log_id_seq OWNED BY public.google_sheets_sync_log.id;


--
-- Name: hardware_options; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.hardware_options (
    id character varying NOT NULL,
    name character varying NOT NULL,
    category character varying NOT NULL,
    manufacturer character varying NOT NULL,
    model character varying NOT NULL,
    purchase_price numeric(8,2) NOT NULL,
    monthly_lease numeric(6,2),
    setup_fee numeric(6,2),
    features jsonb DEFAULT '[]'::jsonb,
    compatible_processors jsonb DEFAULT '[]'::jsonb,
    specifications jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true NOT NULL,
    last_updated timestamp without time zone DEFAULT now(),
    updated_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.hardware_options OWNER TO neondb_owner;

--
-- Name: help_content; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.help_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_route character varying NOT NULL,
    element_selector character varying NOT NULL,
    title character varying NOT NULL,
    content text NOT NULL,
    "position" character varying DEFAULT 'bottom'::character varying,
    is_active boolean DEFAULT true,
    "order" integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.help_content OWNER TO neondb_owner;

--
-- Name: interchange_rates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.interchange_rates (
    id character varying NOT NULL,
    category character varying NOT NULL,
    rate numeric(6,4) NOT NULL,
    effective_date timestamp without time zone NOT NULL,
    network character varying NOT NULL,
    card_type character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.interchange_rates OWNER TO neondb_owner;

--
-- Name: knowledge_base; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.knowledge_base (
    id integer NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    category character varying(100) NOT NULL,
    priority integer DEFAULT 1,
    is_active boolean DEFAULT true,
    tags text[],
    search_count integer DEFAULT 0,
    effectiveness numeric(3,2) DEFAULT 0.00,
    created_by character varying,
    updated_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.knowledge_base OWNER TO neondb_owner;

--
-- Name: knowledge_base_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.knowledge_base_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.knowledge_base_id_seq OWNER TO neondb_owner;

--
-- Name: knowledge_base_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.knowledge_base_id_seq OWNED BY public.knowledge_base.id;


--
-- Name: leaderboards; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.leaderboards (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    period character varying NOT NULL,
    rank integer NOT NULL,
    score integer NOT NULL,
    metric character varying NOT NULL,
    period_start timestamp without time zone NOT NULL,
    period_end timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.leaderboards OWNER TO neondb_owner;

--
-- Name: learning_achievements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.learning_achievements (
    id character varying NOT NULL,
    title character varying NOT NULL,
    description text NOT NULL,
    icon character varying NOT NULL,
    xp_reward integer NOT NULL,
    rarity character varying NOT NULL,
    criteria jsonb NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.learning_achievements OWNER TO neondb_owner;

--
-- Name: learning_modules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.learning_modules (
    id character varying NOT NULL,
    title character varying NOT NULL,
    description text NOT NULL,
    content text NOT NULL,
    category character varying NOT NULL,
    difficulty character varying NOT NULL,
    estimated_time integer NOT NULL,
    xp_reward integer NOT NULL,
    prerequisites jsonb DEFAULT '[]'::jsonb,
    skills jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.learning_modules OWNER TO neondb_owner;

--
-- Name: learning_paths; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.learning_paths (
    id character varying NOT NULL,
    name character varying NOT NULL,
    description text NOT NULL,
    category character varying NOT NULL,
    estimated_duration integer NOT NULL,
    difficulty character varying NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.learning_paths OWNER TO neondb_owner;

--
-- Name: login_attempts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.login_attempts (
    id integer NOT NULL,
    username character varying NOT NULL,
    ip_address character varying NOT NULL,
    user_agent text,
    attempt_time timestamp without time zone DEFAULT now() NOT NULL,
    success boolean DEFAULT false
);


ALTER TABLE public.login_attempts OWNER TO neondb_owner;

--
-- Name: login_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.login_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.login_attempts_id_seq OWNER TO neondb_owner;

--
-- Name: login_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.login_attempts_id_seq OWNED BY public.login_attempts.id;


--
-- Name: merchant_applications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.merchant_applications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    business_name character varying NOT NULL,
    contact_name character varying NOT NULL,
    email character varying NOT NULL,
    phone character varying NOT NULL,
    business_type character varying NOT NULL,
    monthly_volume text NOT NULL,
    average_ticket text NOT NULL,
    status character varying NOT NULL,
    application_data jsonb,
    proposal_data jsonb,
    assigned_agent character varying,
    priority character varying DEFAULT 'medium'::character varying,
    notes text[],
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.merchant_applications OWNER TO neondb_owner;

--
-- Name: message_corrections; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.message_corrections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid NOT NULL,
    chat_id uuid NOT NULL,
    original_content text NOT NULL,
    corrected_content text NOT NULL,
    corrected_by character varying NOT NULL,
    improvement_type character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.message_corrections OWNER TO neondb_owner;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id uuid NOT NULL,
    content text NOT NULL,
    role character varying(20) NOT NULL,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO neondb_owner;

--
-- Name: model_performance; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.model_performance (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    model_id uuid,
    date character varying NOT NULL,
    total_requests integer DEFAULT 0,
    successful_requests integer DEFAULT 0,
    average_response_time real DEFAULT 0,
    average_tokens_used real DEFAULT 0,
    total_cost real DEFAULT 0,
    user_satisfaction_score real DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.model_performance OWNER TO neondb_owner;

--
-- Name: monthly_usage_summary; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.monthly_usage_summary (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying,
    year integer NOT NULL,
    month integer NOT NULL,
    provider character varying NOT NULL,
    model character varying NOT NULL,
    total_requests integer DEFAULT 0,
    total_input_tokens integer DEFAULT 0,
    total_output_tokens integer DEFAULT 0,
    total_tokens integer DEFAULT 0,
    total_cost numeric(10,2),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.monthly_usage_summary OWNER TO neondb_owner;

--
-- Name: path_modules; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.path_modules (
    id character varying NOT NULL,
    path_id character varying NOT NULL,
    module_id character varying NOT NULL,
    order_index integer NOT NULL
);


ALTER TABLE public.path_modules OWNER TO neondb_owner;

--
-- Name: pdf_reports; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pdf_reports (
    id character varying NOT NULL,
    report_type character varying NOT NULL,
    merchant_name character varying NOT NULL,
    processor_name character varying,
    generated_by character varying NOT NULL,
    email_sent boolean DEFAULT false,
    email_recipient character varying,
    report_data jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.pdf_reports OWNER TO neondb_owner;

--
-- Name: pending_document_approvals; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.pending_document_approvals (
    id character varying NOT NULL,
    vendor_id uuid NOT NULL,
    document_title character varying NOT NULL,
    document_url character varying NOT NULL,
    document_type character varying NOT NULL,
    content_preview text,
    ai_recommendation character varying NOT NULL,
    ai_reasoning text,
    suggested_folder character varying,
    news_worthiness integer DEFAULT 0,
    detected_at timestamp without time zone DEFAULT now(),
    status character varying DEFAULT 'pending'::character varying
);


ALTER TABLE public.pending_document_approvals OWNER TO neondb_owner;

--
-- Name: personal_documents; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.personal_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    mime_type character varying(100) NOT NULL,
    size integer NOT NULL,
    path text NOT NULL,
    content text,
    user_id character varying NOT NULL,
    personal_folder_id uuid,
    is_favorite boolean DEFAULT false,
    tags text[] DEFAULT '{}'::text[],
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.personal_documents OWNER TO neondb_owner;

--
-- Name: personal_folders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.personal_folders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    color character varying(7) DEFAULT '#3B82F6'::character varying,
    icon character varying(50) DEFAULT 'Folder'::character varying,
    user_id character varying NOT NULL,
    parent_id uuid,
    sort_order integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.personal_folders OWNER TO neondb_owner;

--
-- Name: processor_markups; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.processor_markups (
    id character varying NOT NULL,
    processor_name character varying NOT NULL,
    merchant_type character varying NOT NULL,
    volume_tier character varying NOT NULL,
    credit_markup numeric(6,4) NOT NULL,
    debit_markup numeric(6,4) NOT NULL,
    auth_fee_markup numeric(6,4) NOT NULL,
    average_effective_rate numeric(6,4) NOT NULL,
    competitive_position character varying NOT NULL,
    data_source character varying NOT NULL,
    confidence_level integer NOT NULL,
    last_updated timestamp without time zone DEFAULT now(),
    updated_by character varying NOT NULL
);


ALTER TABLE public.processor_markups OWNER TO neondb_owner;

--
-- Name: processor_pricing; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.processor_pricing (
    id character varying NOT NULL,
    processor_name character varying NOT NULL,
    pricing_type character varying NOT NULL,
    qualified_rate numeric(6,4) NOT NULL,
    mid_qualified_rate numeric(6,4),
    non_qualified_rate numeric(6,4),
    interchange_plus numeric(6,4),
    auth_fee numeric(6,4) NOT NULL,
    monthly_fee numeric(8,2) NOT NULL,
    statement_fee numeric(6,2) NOT NULL,
    batch_fee numeric(6,4) NOT NULL,
    gateway_fee numeric(6,2),
    pci_fee numeric(6,2),
    setup_fee numeric(8,2),
    early_termination_fee numeric(8,2),
    contract_length integer DEFAULT 12 NOT NULL,
    features jsonb DEFAULT '[]'::jsonb,
    compatible_hardware jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true NOT NULL,
    last_updated timestamp without time zone DEFAULT now(),
    updated_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.processor_pricing OWNER TO neondb_owner;

--
-- Name: prompt_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.prompt_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category character varying(100) NOT NULL,
    template text NOT NULL,
    temperature numeric(3,2) DEFAULT 0.70,
    max_tokens integer DEFAULT 1500,
    is_active boolean DEFAULT true,
    usage_count integer DEFAULT 0,
    success_rate numeric(5,2) DEFAULT 0.00,
    last_used timestamp without time zone,
    created_by character varying,
    updated_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.prompt_templates OWNER TO neondb_owner;

--
-- Name: prompt_usage_log; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.prompt_usage_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    session_id uuid,
    prompt_id character varying,
    prompt_name character varying NOT NULL,
    prompt_category character varying,
    used_at timestamp without time zone DEFAULT now(),
    execution_time_ms integer,
    success boolean DEFAULT true,
    error_message text
);


ALTER TABLE public.prompt_usage_log OWNER TO neondb_owner;

--
-- Name: prompt_versions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.prompt_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id character varying NOT NULL,
    version integer NOT NULL,
    content text NOT NULL,
    changes text,
    performance_score real,
    is_active boolean DEFAULT false,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.prompt_versions OWNER TO neondb_owner;

--
-- Name: qa_knowledge_base; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.qa_knowledge_base (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question text NOT NULL,
    answer text NOT NULL,
    category character varying NOT NULL,
    tags text[],
    is_active boolean DEFAULT true,
    priority integer DEFAULT 0,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.qa_knowledge_base OWNER TO neondb_owner;

--
-- Name: response_quality; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.response_quality (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    chat_id uuid,
    message_id uuid,
    model_used character varying NOT NULL,
    prompt_version character varying,
    relevance_score real,
    accuracy_score real,
    helpfulness_score real,
    response_time_ms integer,
    token_count integer,
    user_feedback character varying,
    admin_review text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.response_quality OWNER TO neondb_owner;

--
-- Name: retrieval_configs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.retrieval_configs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    similarity_threshold real DEFAULT 0.7,
    max_results integer DEFAULT 10,
    chunk_size integer DEFAULT 1000,
    chunk_overlap integer DEFAULT 200,
    search_strategy character varying DEFAULT 'hybrid'::character varying,
    embedding_model character varying DEFAULT 'text-embedding-3-large'::character varying,
    is_default boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.retrieval_configs OWNER TO neondb_owner;

--
-- Name: scheduled_urls; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.scheduled_urls (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    url text NOT NULL,
    type character varying(50) NOT NULL,
    frequency character varying(20) DEFAULT 'weekly'::character varying NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    last_scraped timestamp without time zone,
    next_scheduled timestamp without time zone,
    scrape_count integer DEFAULT 0 NOT NULL,
    last_status character varying(20) DEFAULT 'pending'::character varying,
    last_error text,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.scheduled_urls OWNER TO neondb_owner;

--
-- Name: security_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.security_sessions (
    id character varying NOT NULL,
    user_id character varying NOT NULL,
    ip_address character varying NOT NULL,
    user_agent text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    last_activity timestamp without time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true
);


ALTER TABLE public.security_sessions OWNER TO neondb_owner;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.sessions (
    sid character varying NOT NULL,
    sess jsonb NOT NULL,
    expire timestamp without time zone NOT NULL
);


ALTER TABLE public.sessions OWNER TO neondb_owner;

--
-- Name: system_analytics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.system_analytics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    date character varying NOT NULL,
    metric character varying NOT NULL,
    value real NOT NULL,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.system_analytics OWNER TO neondb_owner;

--
-- Name: training_interactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.training_interactions (
    id character varying NOT NULL,
    query text NOT NULL,
    response text NOT NULL,
    source character varying NOT NULL,
    user_id character varying,
    session_id character varying,
    was_correct boolean,
    corrected_response text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.training_interactions OWNER TO neondb_owner;

--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    achievement_id uuid NOT NULL,
    unlocked_at timestamp without time zone DEFAULT now(),
    progress jsonb
);


ALTER TABLE public.user_achievements OWNER TO neondb_owner;

--
-- Name: user_chat_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_chat_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    session_id character varying,
    first_message text NOT NULL,
    chat_id uuid NOT NULL,
    user_role character varying,
    ip_address character varying,
    user_agent text,
    "timestamp" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_chat_logs OWNER TO neondb_owner;

--
-- Name: user_learning_achievements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_learning_achievements (
    id character varying NOT NULL,
    user_id character varying NOT NULL,
    achievement_id character varying NOT NULL,
    unlocked_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_learning_achievements OWNER TO neondb_owner;

--
-- Name: user_learning_stats; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_learning_stats (
    id character varying NOT NULL,
    user_id character varying NOT NULL,
    total_xp integer DEFAULT 0,
    current_level integer DEFAULT 1,
    modules_completed integer DEFAULT 0,
    achievements_unlocked integer DEFAULT 0,
    total_time_spent integer DEFAULT 0,
    streak integer DEFAULT 0,
    last_activity_date timestamp without time zone,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_learning_stats OWNER TO neondb_owner;

--
-- Name: user_module_progress; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_module_progress (
    id character varying NOT NULL,
    user_id character varying NOT NULL,
    module_id character varying NOT NULL,
    status character varying NOT NULL,
    score integer,
    time_spent integer DEFAULT 0,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_module_progress OWNER TO neondb_owner;

--
-- Name: user_path_progress; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_path_progress (
    id character varying NOT NULL,
    user_id character varying NOT NULL,
    path_id character varying NOT NULL,
    current_module_index integer DEFAULT 0,
    completion_rate integer DEFAULT 0,
    started_at timestamp without time zone DEFAULT now(),
    completed_at timestamp without time zone
);


ALTER TABLE public.user_path_progress OWNER TO neondb_owner;

--
-- Name: user_prompts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_prompts (
    id character varying NOT NULL,
    user_id character varying NOT NULL,
    name character varying NOT NULL,
    content text NOT NULL,
    temperature numeric,
    max_tokens integer,
    is_default boolean DEFAULT false,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    writing_style text,
    system_rules text,
    prompt_template text,
    category character varying
);


ALTER TABLE public.user_prompts OWNER TO neondb_owner;

--
-- Name: user_security_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_security_settings (
    user_id character varying NOT NULL,
    totp_enabled boolean DEFAULT false,
    totp_secret character varying,
    backup_codes text[],
    last_password_change timestamp without time zone DEFAULT now(),
    password_history text[],
    security_questions jsonb,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_security_settings OWNER TO neondb_owner;

--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    session_start timestamp without time zone DEFAULT now(),
    session_end timestamp without time zone,
    first_message text,
    message_count integer DEFAULT 0,
    prompts_used integer DEFAULT 0,
    ip_address character varying,
    user_agent text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_sessions OWNER TO neondb_owner;

--
-- Name: user_skills; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_skills (
    id character varying NOT NULL,
    user_id character varying NOT NULL,
    skill_name character varying NOT NULL,
    category character varying NOT NULL,
    level integer DEFAULT 1,
    xp integer DEFAULT 0,
    last_updated timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_skills OWNER TO neondb_owner;

--
-- Name: user_stats; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_stats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    total_messages integer DEFAULT 0 NOT NULL,
    total_chats integer DEFAULT 0 NOT NULL,
    calculations_performed integer DEFAULT 0 NOT NULL,
    documents_analyzed integer DEFAULT 0 NOT NULL,
    proposals_generated integer DEFAULT 0 NOT NULL,
    current_streak integer DEFAULT 0 NOT NULL,
    longest_streak integer DEFAULT 0 NOT NULL,
    last_active_date timestamp without time zone,
    total_points integer DEFAULT 0 NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    average_rating real DEFAULT 0,
    total_ratings integer DEFAULT 0,
    weekly_messages integer DEFAULT 0,
    monthly_messages integer DEFAULT 0,
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_stats OWNER TO neondb_owner;

--
-- Name: user_stats_extended; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_stats_extended (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    average_rating real DEFAULT 0,
    total_ratings integer DEFAULT 0,
    average_response_time real DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_stats_extended OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying NOT NULL,
    username character varying NOT NULL,
    email character varying NOT NULL,
    password_hash character varying NOT NULL,
    first_name character varying,
    last_name character varying,
    profile_image_url character varying,
    role character varying DEFAULT 'sales-agent'::character varying,
    is_active boolean DEFAULT true,
    iso_hub_id character varying,
    iso_hub_token text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    iso_hub_token_encrypted jsonb
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: vector_indices; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vector_indices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    description text,
    dimensions integer DEFAULT 1536,
    index_type character varying DEFAULT 'cosine'::character varying,
    document_count integer DEFAULT 0,
    last_optimized timestamp without time zone,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vector_indices OWNER TO neondb_owner;

--
-- Name: vendor_comparisons; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vendor_comparisons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying,
    vendor_ids uuid[],
    criteria jsonb,
    results jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vendor_comparisons OWNER TO neondb_owner;

--
-- Name: vendor_documents; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vendor_documents (
    id character varying NOT NULL,
    vendor_id uuid NOT NULL,
    url character varying NOT NULL,
    direct_download_url character varying,
    title character varying NOT NULL,
    content_hash character varying NOT NULL,
    content text,
    document_type character varying,
    category character varying,
    publication_date timestamp without time zone,
    effective_date timestamp without time zone,
    version character varying,
    file_size integer,
    file_format character varying,
    download_count integer DEFAULT 0,
    discovered_at timestamp without time zone DEFAULT now(),
    last_checked timestamp without time zone DEFAULT now(),
    last_modified timestamp without time zone,
    is_active boolean DEFAULT true
);


ALTER TABLE public.vendor_documents OWNER TO neondb_owner;

--
-- Name: vendor_intelligence; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vendor_intelligence (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vendor_id uuid,
    content_type character varying NOT NULL,
    title character varying,
    content text NOT NULL,
    source_url character varying,
    published_at timestamp without time zone,
    impact character varying DEFAULT 'medium'::character varying,
    confidence real DEFAULT 0.5,
    action_required boolean DEFAULT false,
    tags text[],
    ai_analysis jsonb,
    created_at timestamp without time zone DEFAULT now(),
    content_encrypted jsonb,
    ai_analysis_encrypted jsonb
);


ALTER TABLE public.vendor_intelligence OWNER TO neondb_owner;

--
-- Name: vendor_news; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vendor_news (
    id character varying NOT NULL,
    vendor_id uuid NOT NULL,
    title character varying NOT NULL,
    summary text,
    content text,
    url character varying NOT NULL,
    news_type character varying NOT NULL,
    importance integer DEFAULT 5,
    published_at timestamp without time zone,
    detected_at timestamp without time zone DEFAULT now(),
    is_visible boolean DEFAULT true,
    tags jsonb
);


ALTER TABLE public.vendor_news OWNER TO neondb_owner;

--
-- Name: vendor_urls; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vendor_urls (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    vendor_name character varying(100) NOT NULL,
    url_title character varying(200) NOT NULL,
    url text NOT NULL,
    url_type character varying(50) NOT NULL,
    category character varying(100),
    tags text[] DEFAULT '{}'::text[],
    is_active boolean DEFAULT true,
    auto_update boolean DEFAULT false,
    update_frequency character varying(20) DEFAULT 'weekly'::character varying,
    last_scraped timestamp without time zone,
    last_content_hash character varying(64),
    scraping_status character varying(20) DEFAULT 'pending'::character varying,
    error_message text,
    word_count integer DEFAULT 0,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vendor_urls OWNER TO neondb_owner;

--
-- Name: vendors; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.vendors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(50) NOT NULL,
    category character varying(100),
    description text,
    strengths text[] DEFAULT '{}'::text[],
    weaknesses text[] DEFAULT '{}'::text[],
    industries text[] DEFAULT '{}'::text[],
    contact_info text,
    support_number character varying(50),
    website character varying(255),
    integrations text[] DEFAULT '{}'::text[],
    features jsonb,
    pricing jsonb,
    is_active boolean DEFAULT true,
    priority integer DEFAULT 50,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vendors OWNER TO neondb_owner;

--
-- Name: web_search_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.web_search_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying,
    user_query text NOT NULL,
    web_response text NOT NULL,
    reason character varying NOT NULL,
    should_add_to_documents boolean DEFAULT false,
    admin_reviewed boolean DEFAULT false,
    reviewed_by character varying,
    review_notes text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.web_search_logs OWNER TO neondb_owner;

--
-- Name: document_access_logs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_access_logs ALTER COLUMN id SET DEFAULT nextval('public.document_access_logs_id_seq'::regclass);


--
-- Name: document_permissions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_permissions ALTER COLUMN id SET DEFAULT nextval('public.document_permissions_id_seq'::regclass);


--
-- Name: faq_categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.faq_categories ALTER COLUMN id SET DEFAULT nextval('public.faq_categories_id_seq'::regclass);


--
-- Name: faq_knowledge_base id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.faq_knowledge_base ALTER COLUMN id SET DEFAULT nextval('public.faq_knowledge_base_id_seq'::regclass);


--
-- Name: google_sheets_sync_config id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.google_sheets_sync_config ALTER COLUMN id SET DEFAULT nextval('public.google_sheets_sync_config_id_seq'::regclass);


--
-- Name: google_sheets_sync_log id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.google_sheets_sync_log ALTER COLUMN id SET DEFAULT nextval('public.google_sheets_sync_log_id_seq'::regclass);


--
-- Name: knowledge_base id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.knowledge_base ALTER COLUMN id SET DEFAULT nextval('public.knowledge_base_id_seq'::regclass);


--
-- Name: login_attempts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.login_attempts ALTER COLUMN id SET DEFAULT nextval('public.login_attempts_id_seq'::regclass);


--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- Name: admin_settings_legacy admin_settings_legacy_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_settings_legacy
    ADD CONSTRAINT admin_settings_legacy_pkey PRIMARY KEY (id);


--
-- Name: admin_settings admin_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_settings
    ADD CONSTRAINT admin_settings_pkey PRIMARY KEY (id);


--
-- Name: admin_settings admin_settings_setting_key_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_settings
    ADD CONSTRAINT admin_settings_setting_key_unique UNIQUE (setting_key);


--
-- Name: ai_knowledge_corrections ai_knowledge_corrections_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_knowledge_corrections
    ADD CONSTRAINT ai_knowledge_corrections_pkey PRIMARY KEY (id);


--
-- Name: ai_models ai_models_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_models
    ADD CONSTRAINT ai_models_pkey PRIMARY KEY (id);


--
-- Name: ai_prompt_templates ai_prompt_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_prompt_templates
    ADD CONSTRAINT ai_prompt_templates_pkey PRIMARY KEY (id);


--
-- Name: ai_training_feedback ai_training_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_training_feedback
    ADD CONSTRAINT ai_training_feedback_pkey PRIMARY KEY (id);


--
-- Name: ai_training_materials ai_training_materials_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_training_materials
    ADD CONSTRAINT ai_training_materials_pkey PRIMARY KEY (id);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: api_usage_logs api_usage_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.api_usage_logs
    ADD CONSTRAINT api_usage_logs_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: chat_monitoring chat_monitoring_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_monitoring
    ADD CONSTRAINT chat_monitoring_pkey PRIMARY KEY (id);


--
-- Name: chat_ratings chat_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_ratings
    ADD CONSTRAINT chat_ratings_pkey PRIMARY KEY (id);


--
-- Name: chat_reviews chat_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_reviews
    ADD CONSTRAINT chat_reviews_pkey PRIMARY KEY (id);


--
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id);


--
-- Name: content_enhancement_sessions content_enhancement_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.content_enhancement_sessions
    ADD CONSTRAINT content_enhancement_sessions_pkey PRIMARY KEY (id);


--
-- Name: content_filters content_filters_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.content_filters
    ADD CONSTRAINT content_filters_pkey PRIMARY KEY (id);


--
-- Name: content_quality_flags content_quality_flags_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.content_quality_flags
    ADD CONSTRAINT content_quality_flags_pkey PRIMARY KEY (id);


--
-- Name: daily_usage daily_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.daily_usage
    ADD CONSTRAINT daily_usage_pkey PRIMARY KEY (id);


--
-- Name: document_access_logs document_access_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_access_logs
    ADD CONSTRAINT document_access_logs_pkey PRIMARY KEY (id);


--
-- Name: document_approval_decisions document_approval_decisions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_approval_decisions
    ADD CONSTRAINT document_approval_decisions_pkey PRIMARY KEY (id);


--
-- Name: document_changes document_changes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_changes
    ADD CONSTRAINT document_changes_pkey PRIMARY KEY (id);


--
-- Name: document_chunks document_chunks_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_chunks
    ADD CONSTRAINT document_chunks_pkey PRIMARY KEY (id);


--
-- Name: document_permissions document_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_permissions
    ADD CONSTRAINT document_permissions_pkey PRIMARY KEY (id);


--
-- Name: document_processing_jobs document_processing_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_processing_jobs
    ADD CONSTRAINT document_processing_jobs_pkey PRIMARY KEY (id);


--
-- Name: document_tag_relations document_tag_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_tag_relations
    ADD CONSTRAINT document_tag_relations_pkey PRIMARY KEY (id);


--
-- Name: document_tags document_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_tags
    ADD CONSTRAINT document_tags_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: faq_categories faq_categories_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.faq_categories
    ADD CONSTRAINT faq_categories_name_unique UNIQUE (name);


--
-- Name: faq_categories faq_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.faq_categories
    ADD CONSTRAINT faq_categories_pkey PRIMARY KEY (id);


--
-- Name: faq_knowledge_base faq_knowledge_base_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.faq_knowledge_base
    ADD CONSTRAINT faq_knowledge_base_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: folders folders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_pkey PRIMARY KEY (id);


--
-- Name: google_sheets_sync_config google_sheets_sync_config_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.google_sheets_sync_config
    ADD CONSTRAINT google_sheets_sync_config_pkey PRIMARY KEY (id);


--
-- Name: google_sheets_sync_log google_sheets_sync_log_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.google_sheets_sync_log
    ADD CONSTRAINT google_sheets_sync_log_pkey PRIMARY KEY (id);


--
-- Name: hardware_options hardware_options_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.hardware_options
    ADD CONSTRAINT hardware_options_pkey PRIMARY KEY (id);


--
-- Name: help_content help_content_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.help_content
    ADD CONSTRAINT help_content_pkey PRIMARY KEY (id);


--
-- Name: interchange_rates interchange_rates_category_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interchange_rates
    ADD CONSTRAINT interchange_rates_category_unique UNIQUE (category);


--
-- Name: interchange_rates interchange_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.interchange_rates
    ADD CONSTRAINT interchange_rates_pkey PRIMARY KEY (id);


--
-- Name: knowledge_base knowledge_base_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.knowledge_base
    ADD CONSTRAINT knowledge_base_pkey PRIMARY KEY (id);


--
-- Name: leaderboards leaderboards_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leaderboards
    ADD CONSTRAINT leaderboards_pkey PRIMARY KEY (id);


--
-- Name: learning_achievements learning_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.learning_achievements
    ADD CONSTRAINT learning_achievements_pkey PRIMARY KEY (id);


--
-- Name: learning_modules learning_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.learning_modules
    ADD CONSTRAINT learning_modules_pkey PRIMARY KEY (id);


--
-- Name: learning_paths learning_paths_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.learning_paths
    ADD CONSTRAINT learning_paths_pkey PRIMARY KEY (id);


--
-- Name: login_attempts login_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.login_attempts
    ADD CONSTRAINT login_attempts_pkey PRIMARY KEY (id);


--
-- Name: merchant_applications merchant_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.merchant_applications
    ADD CONSTRAINT merchant_applications_pkey PRIMARY KEY (id);


--
-- Name: message_corrections message_corrections_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.message_corrections
    ADD CONSTRAINT message_corrections_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: model_performance model_performance_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.model_performance
    ADD CONSTRAINT model_performance_pkey PRIMARY KEY (id);


--
-- Name: monthly_usage_summary monthly_usage_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.monthly_usage_summary
    ADD CONSTRAINT monthly_usage_summary_pkey PRIMARY KEY (id);


--
-- Name: path_modules path_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.path_modules
    ADD CONSTRAINT path_modules_pkey PRIMARY KEY (id);


--
-- Name: pdf_reports pdf_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pdf_reports
    ADD CONSTRAINT pdf_reports_pkey PRIMARY KEY (id);


--
-- Name: pending_document_approvals pending_document_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pending_document_approvals
    ADD CONSTRAINT pending_document_approvals_pkey PRIMARY KEY (id);


--
-- Name: personal_documents personal_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.personal_documents
    ADD CONSTRAINT personal_documents_pkey PRIMARY KEY (id);


--
-- Name: personal_folders personal_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.personal_folders
    ADD CONSTRAINT personal_folders_pkey PRIMARY KEY (id);


--
-- Name: processor_markups processor_markups_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.processor_markups
    ADD CONSTRAINT processor_markups_pkey PRIMARY KEY (id);


--
-- Name: processor_pricing processor_pricing_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.processor_pricing
    ADD CONSTRAINT processor_pricing_pkey PRIMARY KEY (id);


--
-- Name: processor_pricing processor_pricing_processor_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.processor_pricing
    ADD CONSTRAINT processor_pricing_processor_name_unique UNIQUE (processor_name);


--
-- Name: prompt_templates prompt_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prompt_templates
    ADD CONSTRAINT prompt_templates_pkey PRIMARY KEY (id);


--
-- Name: prompt_usage_log prompt_usage_log_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prompt_usage_log
    ADD CONSTRAINT prompt_usage_log_pkey PRIMARY KEY (id);


--
-- Name: prompt_versions prompt_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prompt_versions
    ADD CONSTRAINT prompt_versions_pkey PRIMARY KEY (id);


--
-- Name: qa_knowledge_base qa_knowledge_base_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.qa_knowledge_base
    ADD CONSTRAINT qa_knowledge_base_pkey PRIMARY KEY (id);


--
-- Name: response_quality response_quality_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.response_quality
    ADD CONSTRAINT response_quality_pkey PRIMARY KEY (id);


--
-- Name: retrieval_configs retrieval_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.retrieval_configs
    ADD CONSTRAINT retrieval_configs_pkey PRIMARY KEY (id);


--
-- Name: scheduled_urls scheduled_urls_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.scheduled_urls
    ADD CONSTRAINT scheduled_urls_pkey PRIMARY KEY (id);


--
-- Name: security_sessions security_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_sessions
    ADD CONSTRAINT security_sessions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: system_analytics system_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_analytics
    ADD CONSTRAINT system_analytics_pkey PRIMARY KEY (id);


--
-- Name: training_interactions training_interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_interactions
    ADD CONSTRAINT training_interactions_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: user_chat_logs user_chat_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_chat_logs
    ADD CONSTRAINT user_chat_logs_pkey PRIMARY KEY (id);


--
-- Name: user_learning_achievements user_learning_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_learning_achievements
    ADD CONSTRAINT user_learning_achievements_pkey PRIMARY KEY (id);


--
-- Name: user_learning_stats user_learning_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_learning_stats
    ADD CONSTRAINT user_learning_stats_pkey PRIMARY KEY (id);


--
-- Name: user_learning_stats user_learning_stats_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_learning_stats
    ADD CONSTRAINT user_learning_stats_user_id_unique UNIQUE (user_id);


--
-- Name: user_module_progress user_module_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_module_progress
    ADD CONSTRAINT user_module_progress_pkey PRIMARY KEY (id);


--
-- Name: user_path_progress user_path_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_path_progress
    ADD CONSTRAINT user_path_progress_pkey PRIMARY KEY (id);


--
-- Name: user_prompts user_prompts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_prompts
    ADD CONSTRAINT user_prompts_pkey PRIMARY KEY (id);


--
-- Name: user_security_settings user_security_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_security_settings
    ADD CONSTRAINT user_security_settings_pkey PRIMARY KEY (user_id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_skills user_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_pkey PRIMARY KEY (id);


--
-- Name: user_stats_extended user_stats_extended_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_stats_extended
    ADD CONSTRAINT user_stats_extended_pkey PRIMARY KEY (id);


--
-- Name: user_stats user_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: vector_indices vector_indices_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vector_indices
    ADD CONSTRAINT vector_indices_pkey PRIMARY KEY (id);


--
-- Name: vendor_comparisons vendor_comparisons_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_comparisons
    ADD CONSTRAINT vendor_comparisons_pkey PRIMARY KEY (id);


--
-- Name: vendor_documents vendor_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_documents
    ADD CONSTRAINT vendor_documents_pkey PRIMARY KEY (id);


--
-- Name: vendor_intelligence vendor_intelligence_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_intelligence
    ADD CONSTRAINT vendor_intelligence_pkey PRIMARY KEY (id);


--
-- Name: vendor_news vendor_news_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_news
    ADD CONSTRAINT vendor_news_pkey PRIMARY KEY (id);


--
-- Name: vendor_urls vendor_urls_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_urls
    ADD CONSTRAINT vendor_urls_pkey PRIMARY KEY (id);


--
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- Name: web_search_logs web_search_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.web_search_logs
    ADD CONSTRAINT web_search_logs_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.sessions USING btree (expire);


--
-- Name: idx_doc_access_doc; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_doc_access_doc ON public.document_access_logs USING btree (document_id);


--
-- Name: idx_doc_access_time; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_doc_access_time ON public.document_access_logs USING btree ("timestamp");


--
-- Name: idx_doc_access_user; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_doc_access_user ON public.document_access_logs USING btree (user_id);


--
-- Name: idx_doc_perm_doc; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_doc_perm_doc ON public.document_permissions USING btree (document_id);


--
-- Name: idx_doc_perm_group; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_doc_perm_group ON public.document_permissions USING btree (group_id);


--
-- Name: idx_doc_perm_user; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_doc_perm_user ON public.document_permissions USING btree (user_id);


--
-- Name: idx_login_ip; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_login_ip ON public.login_attempts USING btree (ip_address);


--
-- Name: idx_login_time; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_login_time ON public.login_attempts USING btree (attempt_time);


--
-- Name: idx_login_username; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_login_username ON public.login_attempts USING btree (username);


--
-- Name: idx_monthly_usage_provider; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_monthly_usage_provider ON public.monthly_usage_summary USING btree (provider, model);


--
-- Name: idx_monthly_usage_user_date; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_monthly_usage_user_date ON public.monthly_usage_summary USING btree (user_id, year, month);


--
-- Name: idx_security_session_active; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_security_session_active ON public.security_sessions USING btree (is_active);


--
-- Name: idx_security_session_expires; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_security_session_expires ON public.security_sessions USING btree (expires_at);


--
-- Name: idx_security_session_user; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_security_session_user ON public.security_sessions USING btree (user_id);


--
-- Name: admin_settings admin_settings_updated_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_settings
    ADD CONSTRAINT admin_settings_updated_by_users_id_fk FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: ai_knowledge_corrections ai_knowledge_corrections_feedback_id_ai_training_feedback_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_knowledge_corrections
    ADD CONSTRAINT ai_knowledge_corrections_feedback_id_ai_training_feedback_id_fk FOREIGN KEY (feedback_id) REFERENCES public.ai_training_feedback(id) ON DELETE CASCADE;


--
-- Name: ai_knowledge_corrections ai_knowledge_corrections_verified_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_knowledge_corrections
    ADD CONSTRAINT ai_knowledge_corrections_verified_by_users_id_fk FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- Name: ai_prompt_templates ai_prompt_templates_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_prompt_templates
    ADD CONSTRAINT ai_prompt_templates_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: ai_prompt_templates ai_prompt_templates_last_modified_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_prompt_templates
    ADD CONSTRAINT ai_prompt_templates_last_modified_by_users_id_fk FOREIGN KEY (last_modified_by) REFERENCES public.users(id);


--
-- Name: ai_training_feedback ai_training_feedback_chat_id_chats_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_training_feedback
    ADD CONSTRAINT ai_training_feedback_chat_id_chats_id_fk FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: ai_training_feedback ai_training_feedback_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_training_feedback
    ADD CONSTRAINT ai_training_feedback_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: ai_training_feedback ai_training_feedback_message_id_messages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_training_feedback
    ADD CONSTRAINT ai_training_feedback_message_id_messages_id_fk FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: ai_training_feedback ai_training_feedback_reviewed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_training_feedback
    ADD CONSTRAINT ai_training_feedback_reviewed_by_users_id_fk FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: ai_training_materials ai_training_materials_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_training_materials
    ADD CONSTRAINT ai_training_materials_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: ai_training_materials ai_training_materials_verified_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_training_materials
    ADD CONSTRAINT ai_training_materials_verified_by_users_id_fk FOREIGN KEY (verified_by) REFERENCES public.users(id);


--
-- Name: api_keys api_keys_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: api_usage_logs api_usage_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.api_usage_logs
    ADD CONSTRAINT api_usage_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: chat_monitoring chat_monitoring_chat_id_chats_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_monitoring
    ADD CONSTRAINT chat_monitoring_chat_id_chats_id_fk FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: chat_monitoring chat_monitoring_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_monitoring
    ADD CONSTRAINT chat_monitoring_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chat_ratings chat_ratings_chat_id_chats_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_ratings
    ADD CONSTRAINT chat_ratings_chat_id_chats_id_fk FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: chat_ratings chat_ratings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_ratings
    ADD CONSTRAINT chat_ratings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: chat_reviews chat_reviews_chat_id_chats_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_reviews
    ADD CONSTRAINT chat_reviews_chat_id_chats_id_fk FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: chat_reviews chat_reviews_reviewed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chat_reviews
    ADD CONSTRAINT chat_reviews_reviewed_by_users_id_fk FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: chats chats_folder_id_folders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_folder_id_folders_id_fk FOREIGN KEY (folder_id) REFERENCES public.folders(id) ON DELETE SET NULL;


--
-- Name: chats chats_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: content_enhancement_sessions content_enhancement_sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.content_enhancement_sessions
    ADD CONSTRAINT content_enhancement_sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: content_quality_flags content_quality_flags_assigned_to_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.content_quality_flags
    ADD CONSTRAINT content_quality_flags_assigned_to_users_id_fk FOREIGN KEY (assigned_to) REFERENCES public.users(id);


--
-- Name: content_quality_flags content_quality_flags_chunk_id_document_chunks_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.content_quality_flags
    ADD CONSTRAINT content_quality_flags_chunk_id_document_chunks_id_fk FOREIGN KEY (chunk_id) REFERENCES public.document_chunks(id) ON DELETE CASCADE;


--
-- Name: content_quality_flags content_quality_flags_document_id_documents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.content_quality_flags
    ADD CONSTRAINT content_quality_flags_document_id_documents_id_fk FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: daily_usage daily_usage_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.daily_usage
    ADD CONSTRAINT daily_usage_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: document_approval_decisions document_approval_decisions_approval_id_pending_document_approv; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_approval_decisions
    ADD CONSTRAINT document_approval_decisions_approval_id_pending_document_approv FOREIGN KEY (approval_id) REFERENCES public.pending_document_approvals(id);


--
-- Name: document_changes document_changes_document_id_vendor_documents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_changes
    ADD CONSTRAINT document_changes_document_id_vendor_documents_id_fk FOREIGN KEY (document_id) REFERENCES public.vendor_documents(id);


--
-- Name: document_chunks document_chunks_document_id_documents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_chunks
    ADD CONSTRAINT document_chunks_document_id_documents_id_fk FOREIGN KEY (document_id) REFERENCES public.documents(id) ON DELETE CASCADE;


--
-- Name: document_processing_jobs document_processing_jobs_document_id_documents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_processing_jobs
    ADD CONSTRAINT document_processing_jobs_document_id_documents_id_fk FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: document_tag_relations document_tag_relations_document_id_documents_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_tag_relations
    ADD CONSTRAINT document_tag_relations_document_id_documents_id_fk FOREIGN KEY (document_id) REFERENCES public.documents(id);


--
-- Name: document_tag_relations document_tag_relations_tag_id_document_tags_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_tag_relations
    ADD CONSTRAINT document_tag_relations_tag_id_document_tags_id_fk FOREIGN KEY (tag_id) REFERENCES public.document_tags(id);


--
-- Name: document_tags document_tags_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.document_tags
    ADD CONSTRAINT document_tags_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: documents documents_folder_id_folders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_folder_id_folders_id_fk FOREIGN KEY (folder_id) REFERENCES public.folders(id) ON DELETE SET NULL;


--
-- Name: documents documents_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: faq_knowledge_base faq_knowledge_base_category_id_faq_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.faq_knowledge_base
    ADD CONSTRAINT faq_knowledge_base_category_id_faq_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.faq_categories(id) ON DELETE SET NULL;


--
-- Name: favorites favorites_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: folders folders_parent_id_folders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_parent_id_folders_id_fk FOREIGN KEY (parent_id) REFERENCES public.folders(id) ON DELETE CASCADE;


--
-- Name: folders folders_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: google_sheets_sync_config google_sheets_sync_config_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.google_sheets_sync_config
    ADD CONSTRAINT google_sheets_sync_config_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: google_sheets_sync_log google_sheets_sync_log_config_id_google_sheets_sync_config_id_f; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.google_sheets_sync_log
    ADD CONSTRAINT google_sheets_sync_log_config_id_google_sheets_sync_config_id_f FOREIGN KEY (config_id) REFERENCES public.google_sheets_sync_config(id);


--
-- Name: google_sheets_sync_log google_sheets_sync_log_triggered_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.google_sheets_sync_log
    ADD CONSTRAINT google_sheets_sync_log_triggered_by_users_id_fk FOREIGN KEY (triggered_by) REFERENCES public.users(id);


--
-- Name: knowledge_base knowledge_base_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.knowledge_base
    ADD CONSTRAINT knowledge_base_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: knowledge_base knowledge_base_updated_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.knowledge_base
    ADD CONSTRAINT knowledge_base_updated_by_users_id_fk FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: leaderboards leaderboards_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.leaderboards
    ADD CONSTRAINT leaderboards_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: merchant_applications merchant_applications_assigned_agent_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.merchant_applications
    ADD CONSTRAINT merchant_applications_assigned_agent_users_id_fk FOREIGN KEY (assigned_agent) REFERENCES public.users(id);


--
-- Name: message_corrections message_corrections_chat_id_chats_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.message_corrections
    ADD CONSTRAINT message_corrections_chat_id_chats_id_fk FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: message_corrections message_corrections_corrected_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.message_corrections
    ADD CONSTRAINT message_corrections_corrected_by_users_id_fk FOREIGN KEY (corrected_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: message_corrections message_corrections_message_id_messages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.message_corrections
    ADD CONSTRAINT message_corrections_message_id_messages_id_fk FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: messages messages_chat_id_chats_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_chat_id_chats_id_fk FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: model_performance model_performance_model_id_ai_models_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.model_performance
    ADD CONSTRAINT model_performance_model_id_ai_models_id_fk FOREIGN KEY (model_id) REFERENCES public.ai_models(id);


--
-- Name: monthly_usage_summary monthly_usage_summary_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.monthly_usage_summary
    ADD CONSTRAINT monthly_usage_summary_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: path_modules path_modules_module_id_learning_modules_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.path_modules
    ADD CONSTRAINT path_modules_module_id_learning_modules_id_fk FOREIGN KEY (module_id) REFERENCES public.learning_modules(id);


--
-- Name: path_modules path_modules_path_id_learning_paths_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.path_modules
    ADD CONSTRAINT path_modules_path_id_learning_paths_id_fk FOREIGN KEY (path_id) REFERENCES public.learning_paths(id);


--
-- Name: pending_document_approvals pending_document_approvals_vendor_id_vendors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.pending_document_approvals
    ADD CONSTRAINT pending_document_approvals_vendor_id_vendors_id_fk FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: personal_documents personal_documents_personal_folder_id_personal_folders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.personal_documents
    ADD CONSTRAINT personal_documents_personal_folder_id_personal_folders_id_fk FOREIGN KEY (personal_folder_id) REFERENCES public.personal_folders(id) ON DELETE SET NULL;


--
-- Name: personal_documents personal_documents_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.personal_documents
    ADD CONSTRAINT personal_documents_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: personal_folders personal_folders_parent_id_personal_folders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.personal_folders
    ADD CONSTRAINT personal_folders_parent_id_personal_folders_id_fk FOREIGN KEY (parent_id) REFERENCES public.personal_folders(id) ON DELETE CASCADE;


--
-- Name: personal_folders personal_folders_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.personal_folders
    ADD CONSTRAINT personal_folders_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: prompt_templates prompt_templates_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prompt_templates
    ADD CONSTRAINT prompt_templates_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: prompt_templates prompt_templates_updated_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prompt_templates
    ADD CONSTRAINT prompt_templates_updated_by_users_id_fk FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: prompt_usage_log prompt_usage_log_prompt_id_user_prompts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prompt_usage_log
    ADD CONSTRAINT prompt_usage_log_prompt_id_user_prompts_id_fk FOREIGN KEY (prompt_id) REFERENCES public.user_prompts(id) ON DELETE SET NULL;


--
-- Name: prompt_usage_log prompt_usage_log_session_id_user_sessions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prompt_usage_log
    ADD CONSTRAINT prompt_usage_log_session_id_user_sessions_id_fk FOREIGN KEY (session_id) REFERENCES public.user_sessions(id) ON DELETE CASCADE;


--
-- Name: prompt_usage_log prompt_usage_log_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prompt_usage_log
    ADD CONSTRAINT prompt_usage_log_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: qa_knowledge_base qa_knowledge_base_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.qa_knowledge_base
    ADD CONSTRAINT qa_knowledge_base_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: response_quality response_quality_chat_id_chats_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.response_quality
    ADD CONSTRAINT response_quality_chat_id_chats_id_fk FOREIGN KEY (chat_id) REFERENCES public.chats(id);


--
-- Name: response_quality response_quality_message_id_messages_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.response_quality
    ADD CONSTRAINT response_quality_message_id_messages_id_fk FOREIGN KEY (message_id) REFERENCES public.messages(id);


--
-- Name: scheduled_urls scheduled_urls_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.scheduled_urls
    ADD CONSTRAINT scheduled_urls_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: security_sessions security_sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_sessions
    ADD CONSTRAINT security_sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: training_interactions training_interactions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.training_interactions
    ADD CONSTRAINT training_interactions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_achievements user_achievements_achievement_id_achievements_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_achievement_id_achievements_id_fk FOREIGN KEY (achievement_id) REFERENCES public.achievements(id) ON DELETE CASCADE;


--
-- Name: user_achievements user_achievements_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_chat_logs user_chat_logs_chat_id_chats_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_chat_logs
    ADD CONSTRAINT user_chat_logs_chat_id_chats_id_fk FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;


--
-- Name: user_chat_logs user_chat_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_chat_logs
    ADD CONSTRAINT user_chat_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_learning_achievements user_learning_achievements_achievement_id_learning_achievements; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_learning_achievements
    ADD CONSTRAINT user_learning_achievements_achievement_id_learning_achievements FOREIGN KEY (achievement_id) REFERENCES public.learning_achievements(id);


--
-- Name: user_learning_achievements user_learning_achievements_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_learning_achievements
    ADD CONSTRAINT user_learning_achievements_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_learning_stats user_learning_stats_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_learning_stats
    ADD CONSTRAINT user_learning_stats_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_module_progress user_module_progress_module_id_learning_modules_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_module_progress
    ADD CONSTRAINT user_module_progress_module_id_learning_modules_id_fk FOREIGN KEY (module_id) REFERENCES public.learning_modules(id);


--
-- Name: user_module_progress user_module_progress_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_module_progress
    ADD CONSTRAINT user_module_progress_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_path_progress user_path_progress_path_id_learning_paths_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_path_progress
    ADD CONSTRAINT user_path_progress_path_id_learning_paths_id_fk FOREIGN KEY (path_id) REFERENCES public.learning_paths(id);


--
-- Name: user_path_progress user_path_progress_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_path_progress
    ADD CONSTRAINT user_path_progress_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_prompts user_prompts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_prompts
    ADD CONSTRAINT user_prompts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_security_settings user_security_settings_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_security_settings
    ADD CONSTRAINT user_security_settings_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_sessions user_sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_skills user_skills_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_stats_extended user_stats_extended_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_stats_extended
    ADD CONSTRAINT user_stats_extended_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_stats user_stats_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: vendor_comparisons vendor_comparisons_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_comparisons
    ADD CONSTRAINT vendor_comparisons_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: vendor_documents vendor_documents_vendor_id_vendors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_documents
    ADD CONSTRAINT vendor_documents_vendor_id_vendors_id_fk FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: vendor_intelligence vendor_intelligence_vendor_id_vendors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_intelligence
    ADD CONSTRAINT vendor_intelligence_vendor_id_vendors_id_fk FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: vendor_news vendor_news_vendor_id_vendors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_news
    ADD CONSTRAINT vendor_news_vendor_id_vendors_id_fk FOREIGN KEY (vendor_id) REFERENCES public.vendors(id);


--
-- Name: vendor_urls vendor_urls_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.vendor_urls
    ADD CONSTRAINT vendor_urls_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: web_search_logs web_search_logs_reviewed_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.web_search_logs
    ADD CONSTRAINT web_search_logs_reviewed_by_users_id_fk FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: web_search_logs web_search_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.web_search_logs
    ADD CONSTRAINT web_search_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

