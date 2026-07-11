from app.models.audit_log import AuditLog  # noqa: F401
from app.models.collection import Collection, CollectionStatus  # noqa: F401
from app.models.collector_location import CollectorLocation  # noqa: F401
from app.models.collector_profile import CollectorProfile  # noqa: F401
from app.models.device_token import DeviceToken  # noqa: F401
from app.models.notification import Notification, NotificationType  # noqa: F401
from app.models.review import Review  # noqa: F401
from app.models.reward import Reward  # noqa: F401
from app.models.reward_transaction import RewardTransaction, RewardAction  # noqa: F401
from app.models.transaction import PaymentMethod, Transaction, TransactionStatus  # noqa: F401
from app.models.user import User, UserRole  # noqa: F401
from app.models.waste import WasteCategory, LotStatus, WasteLot
from app.models.ai_models import AIModel, Zone, WasteEvent, AIPrediction, Recommendation, EnvironmentalMetric
from app.models.illegal_dump import IllegalDumpReport, ReportStatus
