import pytest
from unittest.mock import AsyncMock, MagicMock
from uuid import uuid4
from fastapi import HTTPException

from app.models.illegal_dump import IllegalDumpReport, ReportStatus
from app.models.user import User, UserRole
from app.schemas.report_schema import IllegalDumpValidationStatus
from app.controllers.report_controller import validate_report

pytestmark = pytest.mark.asyncio

async def test_validate_report_double_reward_prevention():
    """Verify that validating an already processed report raises an error and prevents double rewards."""
    # Mock admin user
    admin_user = User(id=uuid4(), role=UserRole.ADMIN)
    
    # Mock an already verified report
    report_id = uuid4()
    mock_report = IllegalDumpReport(
        id=report_id,
        reporter_id=uuid4(),
        status=ReportStatus.VERIFIED,
        reward_awarded=50
    )
    
    # Mock DB session
    mock_db = AsyncMock()
    mock_db.get.return_value = mock_report
    
    # Payload for validation
    payload = IllegalDumpValidationStatus(status="VERIFIED", reward_points=50)
    
    # Executing validate_report should raise a 400 Bad Request
    with pytest.raises(HTTPException) as exc_info:
        await validate_report(mock_db, report_id, payload, admin_user)
    
    assert exc_info.value.status_code == 400
    assert "déjà traité" in exc_info.value.detail

async def test_validate_report_success():
    """Verify that validating a pending report updates status and awards points."""
    # Mock admin user
    admin_user = User(id=uuid4(), role=UserRole.ADMIN)
    
    # Mock a pending report
    report_id = uuid4()
    mock_report = IllegalDumpReport(
        id=report_id,
        reporter_id=uuid4(),
        status=ReportStatus.PENDING,
        reward_awarded=0
    )
    
    # Mock DB session
    mock_db = AsyncMock()
    mock_db.get.return_value = mock_report
    
    # Mock the execute result for finding the user's Reward balance
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None  # No existing reward
    mock_db.execute.return_value = mock_result
    
    # Payload for validation
    payload = IllegalDumpValidationStatus(status="VERIFIED", reward_points=100)
    
    # Execute validation
    result_report = await validate_report(mock_db, report_id, payload, admin_user)
    
    # Check that the report was updated
    assert result_report.status == ReportStatus.VERIFIED
    assert result_report.reward_awarded == 100
    
    # Check that db.add was called for the new Reward and the RewardTransaction
    assert mock_db.add.call_count == 2
    mock_db.commit.assert_awaited_once()
