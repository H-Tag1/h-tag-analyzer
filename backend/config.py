from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    azure_openai_key: str = ""
    azure_openai_endpoint: str = ""
    azure_openai_deployment: str = "gpt-4o"
    azure_openai_api_version: str = "2024-02-01"
    log_level: str = "INFO"

    screenshot_dir: str = "static/screenshots"
    dismissed_issues_file: str = "data/dismissed_issues.json"
    scan_history_dir: str = "data/scan_history/records"
    scan_history_index_file: str = "data/scan_history/index.json"
    max_scan_history: int = 50
    ga4common_templates_dir: str = "templates/ga4common"
    rag_persist_dir: str = "data/rag/chroma"
    rag_collection_name: str = "ga4common_handlers"
    azure_openai_embedding_deployment: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
