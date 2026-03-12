from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime

app = FastAPI(title="Notification Service")

class NotificationEvent(BaseModel):
    event: str
    user_id: str
    order_id: str
    email: str

@app.get("/health")
def health():
    return {"status": "ok", "service": "notification-service"}

@app.post("/notify")
def notify(event: NotificationEvent):
    timestamp = datetime.utcnow().isoformat()
    print(f"[{timestamp}] EVENT: {event.event} | TO: {event.email} | ORDER: {event.order_id}")
    messages = {
        "order_created": f"Hi {event.user_id}, your order {event.order_id} has been placed.",
        "order_shipped": f"Hi {event.user_id}, your order {event.order_id} has shipped.",
        "order_delivered": f"Hi {event.user_id}, your order {event.order_id} was delivered.",
    }
    message = messages.get(event.event, "Unknown event")
    return {"status": "sent", "message": message, "timestamp": timestamp}
