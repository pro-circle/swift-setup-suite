"""Business logic for tickets, kept separate from the HTTP layer."""

from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.ticket import Ticket
from app.schemas.ticket import Priority, Status, TicketCreate


def list_tickets(db: Session, status: Status | None = None) -> list[Ticket]:

    query = db.query(Ticket)
    if status is not None:
        query = query.filter(Ticket.status == status.value)
    return query.order_by(Ticket.created_at.desc()).all()


def get_ticket(db: Session, ticket_id: UUID) -> Ticket | None:
    return db.query(Ticket).filter(Ticket.id == ticket_id).first()


def create_ticket(db: Session, payload: TicketCreate) -> Ticket:
    ticket = Ticket(
        title=payload.title.strip(),
        description=payload.description.strip(),
        priority=payload.priority.value,
        status=Status.open.value,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


def update_ticket(
    db: Session,
    ticket: Ticket,
    *,
    status: Status | None = None,
    priority: Priority | None = None,
) -> Ticket:
    if status is not None:
        ticket.status = status.value
    if priority is not None:
        ticket.priority = priority.value
    if status is not None or priority is not None:
        ticket.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(ticket)
    return ticket

