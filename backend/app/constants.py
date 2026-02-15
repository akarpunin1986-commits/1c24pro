"""Named constants — no magic numbers anywhere."""

# OTP
OTP_LENGTH = 6
OTP_TTL_SECONDS = 300
OTP_COOLDOWN_SECONDS = 60
OTP_MAX_ATTEMPTS = 5

# JWT
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 30

# Upload
MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024 * 1024  # 50 GB
CHUNK_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

# Trial
TRIAL_DAYS = 30
READONLY_DAYS = 7
STORAGE_DAYS = 30

# Plans
PLAN_START = "start"
PLAN_BUSINESS = "business"
PLAN_CORPORATION = "corporation"

# User limits per plan
TRIAL_USER_LIMIT = 3
START_MIN_USERS = 1
BUSINESS_MIN_USERS = 5
CORPORATION_MIN_USERS = 15

# Roles
ROLE_OWNER = "owner"
ROLE_USER = "user"
ROLE_ADMIN = "admin"

# Statuses
STATUS_ACTIVE = "active"
STATUS_DISABLED = "disabled"

# Database statuses
DB_STATUS_PREPARING = "preparing"
DB_STATUS_ACTIVE = "active"
DB_STATUS_READONLY = "readonly"
DB_STATUS_BLOCKED = "blocked"
DB_STATUS_DELETED = "deleted"

# Upload statuses
UPLOAD_STATUS_PENDING = "pending"
UPLOAD_STATUS_UPLOADING = "uploading"
UPLOAD_STATUS_UPLOADED = "uploaded"
UPLOAD_STATUS_PROCESSING = "processing"
UPLOAD_STATUS_ERROR = "error"

# Config codes
CONFIG_CODES = {
    "bp30": "Бухгалтерия предприятия 3.0",
    "bp_corp": "Бухгалтерия предприятия КОРП",
    "zup31": "Зарплата и управление персоналом 3.1",
    "zup_corp": "ЗУП КОРП",
    "ut11": "Управление торговлей 11",
    "ka2": "Комплексная автоматизация 2",
    "erp25": "1С:ERP 2.5",
    "unf3": "Управление нашей фирмой 3",
    "do3": "Документооборот 3",
    "roz2": "Розница 2",
    "med": "Медицина",
    "custom": "Нетиповая конфигурация",
}
