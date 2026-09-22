"""REST endpoints for tickets."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.ticket import Status, TicketCreate, TicketOut, TicketUpdate
from app.services import ticket_service

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


@router.get("", response_model=list[TicketOut])
def list_tickets(
    status: Status | None = Query(default=None, description="Filter by ticket status"),
    db: Session = Depends(get_db),
):
    return ticket_service.list_tickets(db, status)


@router.post("", response_model=TicketOut, status_code=201)
def create_ticket(payload: TicketCreate, db: Session = Depends(get_db)):
    return ticket_service.create_ticket(db, payload)


@router.get("/{ticket_id}", response_model=TicketOut)
def get_ticket(ticket_id: UUID, db: Session = Depends(get_db)):
    ticket = ticket_service.get_ticket(db, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.patch("/{ticket_id}", response_model=TicketOut)
def update_ticket(ticket_id: UUID, payload: TicketUpdate, db: Session = Depends(get_db)):
    ticket = ticket_service.get_ticket(db, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket_service.update_status(db, ticket, payload.status)
