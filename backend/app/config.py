from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    bot_token: str
    database_url: str
    redis_url: str = "redis://localhost:6379/3"
    webapp_url: str = "https://loan.botyard.site"
    api_secret: str = "changeme"

    class Config:
        env_file = ".env"


settings = Settings()
